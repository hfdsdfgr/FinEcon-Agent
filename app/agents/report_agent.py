from app.agents.diagnostic_agent import diagnose
from app.agents.interpretation_agent import interpret
from app.schemas.report import ResearchReport


def build_report(problem, state):
    return ResearchReport(research_question=problem.research_question,
        dataset_summary=state.dataset, methodology=["Descriptive Statistics", "OLS"],
        models=[state.results["ols"]], diagnostics=diagnose(state.results),
        interpretation=interpret(problem, state.results),
        limitations=["规则式规划，需要显式指定变量", "未执行平稳性检验、残差诊断或模型比较", "关联不等于因果"],
        warnings=state.warnings)
