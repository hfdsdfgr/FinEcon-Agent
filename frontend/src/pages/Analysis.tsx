import type { ResearchState } from "../hooks/useResearch";
import {
  CorrelationTable,
  DescriptiveTable,
  OLSTable,
} from "../features/analysis/AnalysisResults";
import { Reserved, Section } from "../components/Results";
export function Analysis({ research }: { research: ResearchState }) {
  return (
    <>
      <header className="page-heading">
        <div>
          <p className="breadcrumb">Research / Results</p>
          <h1>Analysis</h1>
          <p>可追溯的样本统计、变量关系与模型估计。</p>
        </div>
        <span className="phase-label">Python computed</span>
      </header>
      {research.runLabel && (
        <p className="result-source">Current run: {research.runLabel}</p>
      )}
      <DescriptiveTable result={research.descriptive} />
      <CorrelationTable result={research.descriptive} />
      <OLSTable result={research.ols} />
      <Section title="Time series" note="扩展方法">
        <Reserved
          name="ADF"
          description="Augmented Dickey-Fuller stationarity test"
        />
        <Reserved name="AR" description="Autoregressive model" />
        <Reserved
          name="ARIMA"
          description="Autoregressive integrated moving average"
        />
      </Section>
    </>
  );
}
