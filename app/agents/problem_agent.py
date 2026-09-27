from app.core.exceptions import FinEconError
from app.schemas.agent import ResearchProblem


def identify_problem(request):
    """Rule-based skeleton: require explicit column mapping instead of guessing causality."""
    names = [request.dependent_variable, *request.independent_variables]
    if len(set(names)) != len(names) or any(name not in request.data for name in names):
        raise FinEconError("Variables must be distinct existing column names")
    return ResearchProblem(research_question=request.research_question,
                           dependent_variable=request.dependent_variable,
                           independent_variables=request.independent_variables)
