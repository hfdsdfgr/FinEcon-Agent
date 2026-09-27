import { useRef, useState } from "react";
import type { Method } from "../types/api";
import { parseCsv } from "../features/dataset/parseCsv";
import type { LocalDataset } from "../features/dataset/parseCsv";
import { DatasetPreview } from "../features/dataset/DatasetPreview";
import { Empty, Section } from "../components/Results";
import type { ResearchState } from "../hooks/useResearch";
export interface WorkspaceForm {
  question: string;
  dataset?: LocalDataset;
  dependent: string;
  independent: string[];
  method: Method;
}
export function Workspace({
  form,
  update,
  research,
  openResults,
}: {
  form: WorkspaceForm;
  update: (value: Partial<WorkspaceForm>) => void;
  research: ResearchState;
  openResults: () => void;
}) {
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const sequence = useRef(0);
  const numeric = form.dataset?.metadata.numeric_columns || [];
  async function load(file?: File) {
    if (!file) return;
    const current = ++sequence.current;
    update({ dataset: undefined, dependent: "", independent: [] });
    setFileError("");
    setLoading(true);
    try {
      if (/\.xlsx?$/i.test(file.name))
        throw new Error(
          "Excel: Not implemented yet。请另存为 UTF-8 CSV 后导入。",
        );
      if (!/\.csv$/i.test(file.name))
        throw new Error("请选择 CSV 文件。Excel: Not implemented yet。");
      if (file.size > 5 * 1024 * 1024)
        throw new Error("文件超过 5 MB，请缩小数据集。");
      const dataset = parseCsv(await file.text(), file.name);
      if (current !== sequence.current) return;
      update({
        dataset,
        dependent: dataset.metadata.numeric_columns[0] || "",
        independent: dataset.metadata.numeric_columns.slice(1, 2),
      });
    } catch (error) {
      if (current === sequence.current)
        setFileError(error instanceof Error ? error.message : "导入失败。");
    } finally {
      if (current === sequence.current) setLoading(false);
    }
  }
  const canRun =
    !!form.dataset &&
    !loading &&
    !research.busy &&
    (form.method === "descriptive"
      ? numeric.length > 0
      : !!form.dependent && form.independent.length > 0) &&
    (form.method !== "agent" || !!form.question.trim());
  return (
    <>
      <header className="page-heading">
        <div>
          <p className="breadcrumb">Research / Workspace</p>
          <h1>Research Workspace</h1>
          <p>从一个研究问题开始，让数据与模型给出证据。</p>
        </div>
        <span className="phase-label">Econometrics workbench</span>
      </header>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (canRun && form.dataset) {
            await research.run(
              form.dataset,
              form.question,
              form.dependent,
              form.independent,
              form.method,
            );
            openResults();
          }
        }}
      >
        <fieldset disabled={research.busy}>
          <Section title="Research question" note="研究目标">
            <label htmlFor="question" className="sr-only">
              Research question
            </label>
            <textarea
              id="question"
              value={form.question}
              onChange={(event) => update({ question: event.target.value })}
              placeholder="例如：人民币汇率变化与沪深300收益率之间是否存在线性关联？"
              rows={3}
            />
            <p className="footnote">
              当前使用规则式研究规划。请在下方显式选择变量。
            </p>
          </Section>
          <Section title="Dataset" note="CSV / Excel">
            <div className="import-row">
              <label className="file-control" htmlFor="dataset-file">
                <strong>
                  {loading ? "正在解析文件…" : "选择本地数据文件"}
                </strong>
                <span>CSV · UTF-8 · 最大 5 MB</span>
                <input
                  id="dataset-file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  disabled={research.busy || loading}
                  onChange={(event) => {
                    void load(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
              <a
                href="/sample.csv"
                download="finecon-synthetic-sample.csv"
                className="text-link"
              >
                下载合成示例 CSV
              </a>
            </div>
            <p className="footnote">
              CSV 在浏览器中解析；分析时将数值数据提交后端。Excel /
              服务端文件上传：<strong>Not implemented yet</strong>。
            </p>
            {fileError && (
              <p className="error" role="alert">
                {fileError}
              </p>
            )}
            {form.dataset ? (
              <DatasetPreview dataset={form.dataset} />
            ) : (
              <Empty>
                选择 CSV 后查看数据结构、预览和可用变量。尚无统计结果。
              </Empty>
            )}
          </Section>
          <Section title="Model specification" note="模型设定">
            <div className="form-grid">
              <div>
                <label htmlFor="dependent">
                  Dependent variable <span>因变量</span>
                </label>
                <select
                  id="dependent"
                  value={form.dependent}
                  disabled={!numeric.length || form.method === "descriptive"}
                  onChange={(event) =>
                    update({
                      dependent: event.target.value,
                      independent: form.independent.filter(
                        (name) => name !== event.target.value,
                      ),
                    })
                  }
                >
                  <option value="">选择因变量</option>
                  {numeric.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="method">
                  Analysis method <span>分析方法</span>
                </label>
                <select
                  id="method"
                  value={form.method}
                  onChange={(event) =>
                    update({ method: event.target.value as Method })
                  }
                >
                  <option value="agent">
                    Agent research · Descriptive + OLS + Report
                  </option>
                  <option value="descriptive">
                    Descriptive Statistics + Correlation
                  </option>
                  <option value="ols">OLS · with intercept</option>
                  <option disabled>ADF — Not implemented yet</option>
                  <option disabled>AR — Not implemented yet</option>
                  <option disabled>ARIMA — Not implemented yet</option>
                </select>
              </div>
            </div>
            <div className="variables">
              <span className="field-label">
                Independent variables <span>自变量</span>
              </span>
              {numeric.length ? (
                <div className="checkbox-list">
                  {numeric
                    .filter((name) => name !== form.dependent)
                    .map((name) => (
                      <label key={name}>
                        <input
                          type="checkbox"
                          checked={form.independent.includes(name)}
                          disabled={form.method === "descriptive"}
                          onChange={(event) =>
                            update({
                              independent: event.target.checked
                                ? [...form.independent, name]
                                : form.independent.filter(
                                    (item) => item !== name,
                                  ),
                            })
                          }
                        />
                        {name}
                      </label>
                    ))}
                </div>
              ) : (
                <p className="subtle">导入数据后选择数值列。</p>
              )}
            </div>
            <p className="footnote">
              {form.method === "descriptive"
                ? "描述统计使用全部数值列。"
                : "OLS 默认包含截距；Agent 研究使用所选变量。"}{" "}
              缺失值不会自动填补或删除。
            </p>
          </Section>
          <div className="run-bar">
            <p>
              {research.busy
                ? "正在等待后端返回结果…"
                : "统计结果由 Python 计量引擎实际计算。"}
            </p>
            <button className="primary" type="submit" disabled={!canRun}>
              {research.busy ? "Analysis running…" : "启动分析"}
            </button>
          </div>
        </fieldset>
      </form>
    </>
  );
}
