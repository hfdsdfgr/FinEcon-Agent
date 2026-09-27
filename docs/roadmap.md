# Roadmap

| Phase | 范围 | 当前状态 |
|---|---|---|
| 0 Project Foundation | 目录、FastAPI、配置、日志、统一异常、SQLite、测试 | 已实现 |
| 1 Econometrics Core | 描述统计、OLS、ADF、AR、ARIMA、AIC/BIC | 描述统计及 OLS 已实现，OLS 返回 AIC/BIC；其余保留接口 |
| 2 Diagnostics | 残差分析、DW、Ljung-Box、JB、模型比较 | 待实现 |
| 3 Data Pipeline | CSV、Excel、验证、收益率、对数收益率、差分、滞后和溯源 | 内联数值验证已实现，其余保留接口 |
| 4 Agent Foundation | Problem、Planner、Registry、执行状态和报告 | 最小同步规则式骨架已实现，完整研究规划待扩展 |
| 5 LLM Integration | DeepSeek/OpenAI、Tool Calling、规划和解释 | 待实现 |

下一步先补完 ADF、AR、ARIMA 的真实计算和确定性测试，再实现残差诊断及可比较样本约束。随后加入文件加载、时间排序、缺失值策略和变换溯源。LLM 集成保持白名单、schema 和确定性结果边界。Breusch-Pagan、White、VIF 属于后续诊断扩展。
