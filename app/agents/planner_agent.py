from app.schemas.agent import PlanStep


def create_plan(problem, data):
    return [PlanStep(step=1, tool="validate_data", parameters={"data": data}),
            PlanStep(step=2, tool="descriptive_statistics", parameters={"data": data}),
            PlanStep(step=3, tool="ols", parameters={"y": data[problem.dependent_variable],
                     "X": {name: data[name] for name in problem.independent_variables}})]
