from app.tools.econometric_tools import invoke_tool


def execute_step(step):
    return invoke_tool(step.tool, step.parameters)
