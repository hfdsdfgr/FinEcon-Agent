from app.tools.econometric_tools import invoke_tool


def test_reserved_diagnostics_and_registry_validation():
    result = invoke_tool("diagnostics", {"residuals":[1,2,3]})
    assert result.status == "failed"
    assert result.error["code"] == "not_implemented"
    assert invoke_tool("eval", {"code":"1+1"}).error["code"] == "unknown_tool"
    assert invoke_tool("ols", {"y":[1,2,3], "X":{"x":[1,2,3]}, "extra":1}).error["code"] == "validation_error"
