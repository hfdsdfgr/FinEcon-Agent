# Econometrics conventions

## Descriptive Statistics

对有限数值矩形表计算 mean、median、standard_deviation、variance、min、max、skewness、kurtosis 和 Pearson correlation。标准差/方差采用 ddof=1；偏度为样本校正，峰度为无偏超额峰度。常数序列的相关系数和样本不足的统计量返回 null 并给出 warning。拒绝缺失值及无穷值。

## OLS

run_ols(y, X, add_intercept=True) 使用 statsmodels 实际估计；默认显式加入 const。返回系数、标准误、t 统计量、p 值、R²、调整 R²、AIC、BIC、log likelihood、样本量和残差。标准误为经典 nonrobust 形式。没有截距时 statsmodels 使用非中心化 R²，不应与含截距模型直接比较。设计矩阵必须满秩且样本量大于参数量；因变量必须有变异；不静默删除观测。

完全拟合或数值退化可能产生未定义推断值，统一转为 null 并标记 warning。病态矩阵给出重缩放建议。当前不执行平稳性和残差检验，不做因果推断、模型优劣或交易建议。

## Reserved interfaces

run_adf(series)、run_ar(series, lags=1)、run_arima(series, order=(1,0,0))、run_diagnostics(residuals)、compare_models(models) 当前抛出 FinEconError，code=not_implemented。后续比较模型时必须注明相同因变量、样本、变换及估计似然是否可比；引擎输出指标，Agent 解释选择。

实现依据：[statsmodels OLS 官方文档](https://www.statsmodels.org/stable/generated/statsmodels.regression.linear_model.OLS.html)。API 异常边界参考 [FastAPI 官方文档](https://fastapi.tiangolo.com/tutorial/handling-errors/)。
