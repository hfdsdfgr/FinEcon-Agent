from app.tools.econometric_tools import execute_tool


def analyze(tool, request):
    return execute_tool(tool, request.model_dump())
