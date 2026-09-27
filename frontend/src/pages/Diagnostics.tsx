import { DiagnosticResults } from "../features/diagnostics/DiagnosticResults";
import { Section } from "../components/Results";
export function Diagnostics() {
  return (
    <>
      <header className="page-heading">
        <div>
          <p className="breadcrumb">Research / Model checks</p>
          <h1>Diagnostics</h1>
          <p>模型估计之后，检验假设与适用边界。</p>
        </div>
      </header>
      <div className="notice">
        当前后端尚未实现诊断与模型比较。此页面展示预留模块，不表示模型已通过检验。
      </div>
      <Section title="Residual & model diagnostics">
        <DiagnosticResults />
      </Section>
    </>
  );
}
