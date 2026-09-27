# Development Rules

1. 所有统计结果必须由 Python 实际计算。
2. 禁止 LLM 生成或修改统计数字。
3. Agent 与 Econometrics Engine 解耦。
4. Econometrics Engine 不依赖 LLM。
5. 每个计量工具必须可以独立测试。
6. 所有核心函数尽量返回 Pydantic Model 或结构化对象。
7. 不允许 API 直接暴露第三方库内部对象。
8. 所有异常必须转换为项目统一 FinEconError；API 边界统一错误格式。
9. Agent Tool 必须通过 Tool Registry 注册，并验证参数。
10. 第一阶段优先正确性与可维护性，不追求 UI。
11. 不提前加入交易执行、自动下单等功能。
12. 金融计量函数必须写清楚 docstring，注明输入、输出及模型含义。
13. 明确缺失值、截距、样本对齐和方差约定；未经用户指定不静默删除或填补数据。
14. 未实现接口返回明确的 not_implemented；报告区分已运行与未运行的检验。
15. 新实现配套真实数值、边界输入和 API 测试；凭据不提交到版本控制。
