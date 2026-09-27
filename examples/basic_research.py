"""Run with python -m examples.basic_research against a running API."""
import json
from urllib.request import Request, urlopen

PAYLOAD = {
    "research_question": "研究汇率变化与指数收益的线性关联（合成示例）",
    "data": {"CSI300_return": [0.01, -0.02, 0.015, 0.005, -0.01, 0.025],
             "USDCNY_return": [0.002, -0.003, 0.001, 0.004, -0.002, 0.005]},
    "dependent_variable": "CSI300_return",
    "independent_variables": ["USDCNY_return"],
}


def main():
    request = Request("http://127.0.0.1:8000/agent/research", data=json.dumps(PAYLOAD).encode(),
                      headers={"Content-Type": "application/json"})
    with urlopen(request, timeout=30) as response:
        task = json.load(response)
    if task["status"] != "completed":
        raise RuntimeError(task)
    with urlopen(f"http://127.0.0.1:8000/report/{task['task_id']}", timeout=30) as response:
        print(json.dumps(json.load(response), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
