import type { DescriptiveResult, OLSResult } from "../../types/api";
import {
  Section,
  Table,
  Empty,
  Warnings,
  formatNumber as fmt,
} from "../../components/Results";
export function DescriptiveTable({ result }: { result?: DescriptiveResult }) {
  const stats = [
    "mean",
    "median",
    "standard_deviation",
    "variance",
    "min",
    "max",
    "skewness",
    "kurtosis",
  ];
  return (
    <Section
      title="Descriptive Statistics"
      note={result ? `${result.n_obs} observations` : "样本描述"}
    >
      {result ? (
        <>
          <Table
            label="Descriptive statistics"
            headers={[
              "Variable",
              "Mean",
              "Median",
              "Std. dev.",
              "Variance",
              "Min",
              "Max",
              "Skewness",
              "Kurtosis",
            ]}
            rows={Object.entries(result.statistics).map(([key, row]) => [
              key,
              ...stats.map((stat) => fmt(row[stat])),
            ])}
          />
          <p className="footnote">
            样本方差 / 标准差：ddof = 1；Kurtosis 为超额峰度。未定义结果显示为
            —。
          </p>
          <Warnings items={result.warnings} />
        </>
      ) : (
        <Empty>
          在 Workspace 运行描述统计或 Agent 研究后，查看样本统计结果。
        </Empty>
      )}
    </Section>
  );
}
export function CorrelationTable({ result }: { result?: DescriptiveResult }) {
  const columns = Object.keys(result?.correlation || {});
  return (
    <Section title="Correlation" note="Pearson correlation">
      {result ? (
        <Table
          label="Correlation matrix"
          headers={["Variable", ...columns]}
          rows={columns.map((column) => [
            column,
            ...columns.map((other) => fmt(result.correlation[column][other])),
          ])}
        />
      ) : (
        <Empty>相关矩阵随描述统计一起由后端计算。</Empty>
      )}
    </Section>
  );
}
export function OLSTable({ result }: { result?: OLSResult }) {
  return (
    <Section title="OLS" note="Ordinary least squares">
      {result ? (
        <>
          <div className="metrics">
            {[
              ["Observations", result.n_obs],
              ["R²", result.r_squared],
              ["Adjusted R²", result.adjusted_r_squared],
              ["AIC", result.aic],
              ["BIC", result.bic],
              ["Log likelihood", result.log_likelihood],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <span>{label}</span>
                <strong>{fmt(value)}</strong>
              </div>
            ))}
          </div>
          <Table
            label="OLS coefficients"
            headers={[
              "Variable",
              "Coefficient",
              "Std. error",
              "t statistic",
              "p value",
            ]}
            rows={Object.keys(result.coefficients).map((key) => [
              key,
              fmt(result.coefficients[key]),
              fmt(result.standard_errors[key]),
              fmt(result.t_statistics[key]),
              fmt(result.p_values[key]),
            ])}
          />
          <Warnings items={result.warnings} />
          <details>
            <summary>
              Residuals · {result.residuals.length} observations
            </summary>
            <div className="residuals">
              <Table
                label="OLS residuals"
                headers={["Observation", "Residual"]}
                rows={result.residuals.map((value, i) => [i + 1, fmt(value)])}
              />
            </div>
          </details>
        </>
      ) : (
        <Empty>选择因变量和自变量，运行 OLS 后查看系数与模型拟合指标。</Empty>
      )}
    </Section>
  );
}
