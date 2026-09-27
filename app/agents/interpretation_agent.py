def interpret(problem, results):
    """Template only; statistical numbers remain exclusively in tool results."""
    return (f"已使用 OLS 分析 {problem.dependent_variable} 与 "
            f"{', '.join(problem.independent_variables)} 的线性关联。"
            "系数及统计检验见模型结果；尚未执行平稳性或残差诊断，不能据此推断因果关系。")
