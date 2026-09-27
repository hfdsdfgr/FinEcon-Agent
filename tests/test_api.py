import pytest
from fastapi.testclient import TestClient
from app.main import create_app
from examples.basic_research import PAYLOAD


@pytest.fixture
def client(tmp_path):
    with TestClient(create_app(tmp_path / "test.sqlite3")) as value:
        yield value


def test_health_swagger_and_routes(client):
    assert client.get("/health").json()["status"] == "ok"
    assert client.get("/docs").status_code == 200
    paths = client.get("/openapi.json").json()["paths"]
    assert set(["/data/upload", "/analysis/ols", "/analysis/adf", "/analysis/arima", "/analysis/diagnostics", "/agent/research", "/report/{task_id}"]).issubset(paths)
    assert client.post("/analysis/descriptive", json={"data":{"x":[1,2,3]}}).json()["statistics"]["x"]["mean"] == 2
    assert client.post("/analysis/ols", json={"y":[1,2.1,2.9,4.2],"X":{"x":[1,2,3,4]}}).status_code == 200


def test_research_report_and_persistence(tmp_path):
    path = tmp_path / "persistent.sqlite3"
    with TestClient(create_app(path)) as client:
        response = client.post("/agent/research", json=PAYLOAD)
        assert response.status_code == 200
        task = response.json()
        assert task["status"] == "completed"
        assert [step["tool"] for step in task["steps"]] == ["validate_data", "descriptive_statistics", "ols"]
        task_id = task["task_id"]
    with TestClient(create_app(path)) as client:
        assert client.get(f"/agent/task/{task_id}").json() == task
        report = client.get(f"/report/{task_id}").json()
        assert report["models"][0] == task["results"]["ols"]
        assert report["diagnostics"]["status"] == "not_implemented"


def test_failure_is_persisted(client):
    payload = {**PAYLOAD, "data":{"y":[1,2,3],"x":[1,1,1]}, "dependent_variable":"y", "independent_variables":["x"]}
    task = client.post("/agent/research", json=payload).json()
    assert task["status"] == "failed"
    assert task["steps"][-1]["status"] == "failed"
    assert client.get(f"/agent/task/{task['task_id']}").json()["status"] == "failed"
    assert client.get(f"/report/{task['task_id']}").status_code == 409


def test_errors_and_reserved_endpoints(client):
    assert client.get("/agent/task/missing").status_code == 404
    assert client.post("/analysis/ols", json={"y":[1,2,3],"X":{"x":[1,1,1]}}).status_code == 422
    response = client.post("/analysis/descriptive", json={"data":{"x":[None]}})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
    assert client.post("/analysis/adf", json={"series":[1,2,3]}).status_code == 501
    assert client.post("/analysis/arima", json={"series":[1,2,3]}).status_code == 501
    assert client.post("/data/upload", files={"file":("sample.csv", b"x\n1\n")}).status_code == 501
