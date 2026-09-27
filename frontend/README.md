# FinEcon Research Workbench

轻量 React + Vite + TypeScript 前端，接入现有 FastAPI。后端代码与业务逻辑保持原样。

## 启动

需要 Node.js 22（本次验证为 22.14）及已安装依赖的 Python 后端。

终端一，在项目根目录启动后端：

```powershell
.venv/Scripts/python -m uvicorn app.main:app --reload
```

终端二：

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

打开 http://127.0.0.1:5173 。依赖已在当前工作区安装，直接执行 `npm run dev` 即可。
如果环境限制 npm 默认缓存目录，可使用 `npm ci --cache .npm-cache`。
macOS/Linux 使用 `.venv/bin/python` 和 `cp .env.example .env.local`。

## 配置与代理

```dotenv
VITE_API_BASE_URL=/api
API_PROXY_TARGET=http://127.0.0.1:8000
```

浏览器使用 `VITE_API_BASE_URL`；Vite 将 `/api/*` 代理至 `API_PROXY_TARGET`，去掉 `/api` 前缀。默认值与示例相同，无需修改后端 CORS。环境变量变更后重启 Vite；VITE_ 变量会进入前端构建，请仅配置公开地址。

```powershell
npm run build
npm run preview
```

预览地址为 http://127.0.0.1:4173 ，同样配置了开发用途的代理。生产部署将 `dist/` 交给静态服务器，并配置 `/api` 同源反向代理指向 FastAPI；静态构建本身不包含代理服务器。当前后端不支持跨域访问，直接把浏览器地址改成另一端口不能替代代理。

代理行为依据 [Vite 官方文档](https://vite.dev/config/server-options#server-proxy)。

## 目录

```text
frontend/
  src/
    api/client.ts              # API Base URL、fetch、统一错误、超时
    types/api.ts               # 与后端 schemas 对齐的类型
    hooks/useResearch.ts       # 请求、结果与研究状态
    layouts/WorkbenchLayout.tsx
    components/Results.tsx     # 表格、空态、警告、数值格式
    pages/
      Workspace.tsx
      Analysis.tsx
      Diagnostics.tsx
      Report.tsx
    features/
      dataset/                 # CSV 解析、元数据与预览
      analysis/                # 描述统计、相关矩阵、OLS 表格
      diagnostics/             # 未实现诊断模块
      agent/                   # Workflow 与真实结果映射
      report/                  # 结构化报告
    App.tsx
    main.tsx
    styles.css
  public/sample.csv            # 合成输入数据，不是预计算结果
  tests/unit.test.ts
  tests/workbench.spec.ts
  playwright.config.ts
  vite.config.ts
  .env.example
  package.json
  package-lock.json
```

## 页面与可用交互

- **Research Workspace**：输入研究问题、选择 CSV、查看行列数/数值列/缺失值/ISO 日期列及前六行数据、选择因变量与自变量、选择分析方法并运行。
- **Analysis**：展示后端描述统计、Pearson 相关矩阵、OLS 系数/标准误/t/p、R²、调整 R²、AIC/BIC、对数似然及可展开残差。ADF / AR / ARIMA 显示 Not implemented yet。
- **Diagnostics**：Durbin-Watson、Ljung-Box、Jarque-Bera、Breusch-Pagan、White Test、VIF、Model Comparison 均显示 Not implemented yet。
- **Research Report**：研究问题、数据摘要、方法、模型结果、诊断状态、解释与限制；支持导出后端原始 JSON，并通过 Task ID 读取持久化任务/报告。
- **Agent Workflow Panel**：Research Question → Data Validation → Descriptive Statistics → Stationarity Test → Model Estimation → Diagnostics → Report；支持 pending/running/completed/warning/failed。

导航使用原生 hash，支持刷新、直接链接和浏览器前进/后退。设计以桌面为主：灰白底、深蓝交互、紧凑数值表、少边框与小圆角；小屏导航横向滚动，流程面板移动至底部。

## 已接入 API

| API | 用途 |
|---|---|
| GET /health | 连接状态与手动重试 |
| POST /analysis/descriptive | 描述统计及相关矩阵 |
| POST /analysis/ols | 独立 OLS，默认含截距 |
| POST /agent/research | 规则式研究、持久化任务及报告生成 |
| GET /agent/task/{task_id} | 读取任务状态及已有结果 |
| GET /report/{task_id} | 获取真实结构化报告 |

当前上传接口和诊断接口返回 501，因此 UI 明确预留，未伪装为可用。通用 API 客户端也处理 501、422、404、500、网络错误及请求超时。

## 数据和统计边界

CSV 使用 [Papa Parse](https://www.papaparse.com/docs) 在浏览器中读取 UTF-8、逗号分隔、带列名的数据。支持 BOM、引号及科学计数法。限制 5 MB、10,000 行、100 列、100,000 单元格。所有元数据明确标为本地解析；文件没有上传到服务器保存。Excel 显示 **Not implemented yet**，可先另存为 CSV。

识别有限数值列与 ISO 日期格式列，不自动排序、删行、填补或生成收益率。选中含空值的数值列会阻止分析并提示处理。文本、Infinity、NaN 和包含文字的列不作为可分析数值列；可展开 Column information 核对。描述统计使用全部数值列，OLS/Agent 仅提交所选变量，非数值日期或标签不会传入计量工具。

CSV 导入只做输入格式和元数据检查。均值、方差、相关性、回归等统计量全部来自 Python API。界面仅格式化数值；null 显示为 —，极小值使用科学计数法。导出 JSON 保留后端原始精度。修改研究输入会清除旧结果。

Agent 接口同步返回完整结果，没有 SSE/轮询进度或任务启动前的 task_id。等待期间不模拟步骤执行；收到响应后按真实 ToolResult 更新。平稳性与诊断保持 warning；只有成功读取报告后 Report 才完成。请求超时/断连不代表服务器取消研究，UI 会提示确认后再重试。

当前表单与直接分析结果只保存在浏览器内存，刷新会清空。Agent 任务由后端持久化，保留 Task ID 可重新读取；直接工具调用没有任务 ID 或报告。不保存 CSV 原文到 localStorage。

## 验证

```powershell
npm test
npm run build
npm run test:e2e
```

单元测试覆盖 CSV 引号/BOM/单列数据/缺失值/无效列名、数值格式和流程状态。Playwright 自动启动真实后端（8010）及 Vite（5175），使用本机 Microsoft Edge，测试研究、独立工具、报告恢复、错误路径和 390px 小屏。测试数据库位于 `.test-data/`，截图位于 `test-results/`，均不提交。

无 Edge 的环境可安装 Playwright Chromium，并将配置中的 `channel: 'msedge'` 移除。受限 Windows 环境若测试已完成但进程清理挂起，可关闭本轮启动的测试服务后退出；应用运行不受影响。

## 下一步

后端实现 CSV/Excel 数据集接口后接入服务端导入与 dataset_id；随后接入 ADF、AR/ARIMA 和真实诊断结果。待后端提供异步任务状态/事件流，再实现持续进度更新与取消。保持统计计算与报告来源可追溯。
