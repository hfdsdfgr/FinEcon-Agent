import type { OLSResult, ResearchReport } from "../../types/api";
import {
  Section,
  Table,
  Warnings,
  formatNumber,
} from "../../components/Results";
import { OLSTable } from "../analysis/AnalysisResults";

function isOLS(model: Record<string, unknown>): boolean {
  return (
    ["coefficients", "standard_errors", "t_statistics", "p_values"].every(
      (key) => typeof model[key] === "object" && model[key] !== null,
    ) &&
    Array.isArray(model.residuals) &&
    Array.isArray(model.warnings)
  );
}
export function ReportContent({ report }: { report: ResearchReport }) {
  return (
    <article className="report">
      <Section title="Research Question">
        <p className="report-question">{report.research_question}</p>
      </Section>
      <Section title="Dataset Summary">
        <Table
          label="Report dataset summary"
          headers={["Property", "Value"]}
          rows={Object.entries(report.dataset_summary).map(([key, value]) => [
            key,
            Array.isArray(value)
              ? value.join(", ") || "—"
              : typeof value === "object" && value !== null
                ? Object.entries(value)
                    .map(([name, count]) => `${name}: ${count}`)
                    .join("; ")
                : value === null
                  ? "—"
                  : String(value),
          ])}
        />
      </Section>
      <Section title="Methodology">
        <ol>
          {report.methodology.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </Section>
      <div className="report-models">
        <h2>Model Results</h2>
        {report.models.map((model, index) =>
          isOLS(model) ? (
            <OLSTable key={index} result={model as unknown as OLSResult} />
          ) : (
            <Section key={index} title={`Model ${index + 1}`}>
              <Table
                label={`Report model ${index + 1}`}
                headers={["Metric", "Value"]}
                rows={Object.entries(model).map(([key, value]) => [
                  key,
                  typeof value === "object" && value !== null
                    ? JSON.stringify(value)
                    : formatNumber(value),
                ])}
              />
            </Section>
          ),
        )}
      </div>
      <Section title="Diagnostics">
        {report.diagnostics.status === "not_implemented" ? (
          <p className="status warning">Not implemented yet</p>
        ) : (
          <pre>{JSON.stringify(report.diagnostics, null, 2)}</pre>
        )}
      </Section>
      <Section title="Interpretation">
        <p>{report.interpretation}</p>
      </Section>
      <Section title="Limitations">
        <ul>
          {report.limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>
      <Warnings items={report.warnings} />
    </article>
  );
}
