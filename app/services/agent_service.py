import logging
from uuid import uuid4
from app.core.exceptions import FinEconError
from app.schemas.agent import TaskState
from app.agents.problem_agent import identify_problem
from app.agents.planner_agent import create_plan
from app.agents.analysis_agent import execute_step
from app.agents.report_agent import build_report


def run_research(request, db):
    # ponytail: synchronous execution; add a durable worker when long jobs require it.
    state = TaskState(task_id=str(uuid4()))
    db.save(state)
    try:
        state.status = "planning"
        db.save(state)
        problem = identify_problem(request)
        plan = create_plan(problem, request.data)
        state.status = "running"
        db.save(state)
        for step in plan:
            state.current_step = step.step
            db.save(state)
            result = execute_step(step)
            state.steps.append(result)
            if result.status == "failed":
                raise FinEconError(result.error["message"], result.error["code"])
            state.results[step.tool] = result.result
            if step.tool == "validate_data":
                state.dataset = result.result
            state.warnings.extend(result.result.get("warnings", []))
            db.save(state)
        state.warnings.append("Diagnostics and stationarity tests have not been run")
        report = build_report(problem, state)
        state.status = "completed"
        db.save(state, report)
    except Exception as exc:
        logging.getLogger(__name__).exception("Research task failed: %s", state.task_id)
        state.status = "failed"
        state.warnings.append(str(exc) if isinstance(exc, FinEconError) else "Internal research error")
        db.save(state)
    return state
