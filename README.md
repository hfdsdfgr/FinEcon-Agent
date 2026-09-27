# FinEcon Agent

Financial Econometrics Research Agent

> FinEcon Agent is a tool-using financial econometrics research agent that combines deterministic statistical computation with AI-assisted research planning and interpretation.

当前版本为 **Phase 0 + 基础 Phase 1 Skeleton**。Agent 使用规则式规划与模板解释，尚未接入 LLM。

## Features

- FastAPI REST API / Swagger、Pydantic 输入输出、统一错误、标准日志和 SQLite 持久化。
- 实际计算描述统计、相关系数、OLS、经典标准误、检验统计量和 AIC/BIC。
- 白名单 Tool Registry：参数验证、结构化结果及执行状态。
- 显式变量映射 → 规则计划 → 数据验证 → 描述统计 → OLS → 模板报告。
- ADF、AR、ARIMA、诊断、文件上传、清洗和变换目前仅预留接口；调用返回 501，未伪造计算结果。

## Architecture

API → Services → Agent Pipeline → Tool Registry → Data / Econometrics Engine。
SQLite 持久化任务与报告；引擎可独立测试，不依赖 LLM。详见 [架构](docs/architecture.md) 与 [统计约定](docs/econometrics.md)。

## Quick Start

需要 Python 3.11+，本次验证使用 Python 3.13。Windows 上避免误用系统遗留 Python 2。

```powershell
py -3.13 -m venv .venv
.venv/Scripts/python -m pip install --no-cache-dir -r requirements.txt
.venv/Scripts/python -m uvicorn app.main:app --reload
```

macOS/Linux 使用 `python3 -m venv .venv`，将命令中的 `.venv/Scripts/python` 替换为 `.venv/bin/python`。在项目根目录启动。

- 健康检查：[http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- Swagger：[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- OpenAPI：[http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

默认数据库 `data/finecon.sqlite3` 启动时自动创建。通过环境变量 FINECON_DB_PATH、FINECON_LOG_LEVEL 配置；`.env.example` 仅作参考，不自动读取。PowerShell 示例：`$env:FINECON_DB_PATH = "data/local.sqlite3"`。

## Example

启动 API 后运行：

```powershell
.venv/Scripts/python -m examples.basic_research
```

示例使用合成收益率数据。也可以在 Swagger 的 POST /analysis/ols 输入：

```json
{"y":[1.1,1.9,3.2,3.8,5.1],"X":{"market_return":[1,2,3,4,5]},"add_intercept":true}
```

POST /agent/research 请求包含 research_question、data、dependent_variable、independent_variables，完整样例见 `examples/basic_research.py`。同步返回 task_id 和最终 status；用 GET /agent/task/{task_id} 与 GET /report/{task_id} 查询。请检查任务 status，执行失败会保存 failed 状态。当前不能仅凭任意自然语言自动识别变量。

| API | 状态 |
|---|---|
| GET /health | 可用 |
| POST /analysis/descriptive、/analysis/ols | 可用 |
| POST /agent/research | 可用，最小规则式流程 |
| GET /agent/task/{task_id}、/report/{task_id} | 可用 |
| POST /data/upload | 预留，501 |
| POST /analysis/adf、/analysis/ar、/analysis/arima、/analysis/diagnostics | 预留，501 |

## Tests

```powershell
.venv/Scripts/python -m pytest -q
```

测试覆盖真实 OLS 与独立最小二乘结果、描述统计、非法输入、白名单工具、预留接口、Swagger、研究报告和 SQLite 跨应用实例持久化。测试数据库在 pytest 临时目录中。

## Project Structure

```text
app/
  main.py
  api/           # data / analysis / agent / report routes
  agents/        # problem / planner / analysis / diagnostic / interpretation / report
  econometrics/  # descriptive / regression / stationarity / timeseries / diagnostics / model_selection
  data/          # loader / cleaner / transformer / validator
  tools/         # econometric_tools / data_tools
  schemas/       # analysis / dataset / agent / report
  services/      # analysis / agent / report services
  database/      # db / models
  core/          # config / exceptions / logging
tests/
examples/basic_research.py
data/sample/returns.csv
docs/architecture.md
docs/econometrics.md
docs/roadmap.md
.env.example
requirements.txt
DEVELOPMENT_RULES.md
README.md
```

## Roadmap

优先完成 ADF/AR/ARIMA，再做诊断和模型比较、CSV/Excel 数据管线、Agent 扩展及 LLM 集成。完整范围见 [Roadmap](docs/roadmap.md)。当前未加入 UI、交易、RAG 或复杂多 Agent 框架。

## Disclaimer

仅供研究和教学，不构成投资建议。统计关联不能证明因果关系；当前尚未执行金融时间序列平稳性和残差诊断。示例数据为合成数据。当前服务面向本地开发。
