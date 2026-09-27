import type { ReactNode } from "react";
import type { ResearchState } from "../hooks/useResearch";
import { WorkflowPanel } from "../features/agent/WorkflowPanel";
export const pages = [
  "workspace",
  "analysis",
  "diagnostics",
  "report",
] as const;
export type Page = (typeof pages)[number];
const labels: Record<Page, string> = {
  workspace: "Research Workspace",
  analysis: "Analysis",
  diagnostics: "Diagnostics",
  report: "Research Report",
};
export function WorkbenchLayout({
  page,
  children,
  research,
  health,
  checkHealth,
}: {
  page: Page;
  children: ReactNode;
  research: ResearchState;
  health: string;
  checkHealth: () => void;
}) {
  return (
    <div className="workbench">
      <a className="skip-link" href="#main">
        跳至主要内容
      </a>
      <aside className="sidebar">
        <a className="brand" href="#workspace">
          <span className="brand-symbol" aria-hidden="true">
            F<span>∑</span>
          </span>
          <div>
            FinEcon<span>Research workbench</span>
          </div>
        </a>
        <div className="nav-label">Research tools</div>
        <nav aria-label="Main navigation">
          {pages.map((item, index) => (
            <a
              key={item}
              href={`#${item}`}
              aria-current={page === item ? "page" : undefined}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                aria-hidden="true"
              >
                {index === 0 ? (
                  <>
                    <rect x="3" y="3" width="14" height="14" />
                    <path d="M3 8h14M8 8v9" />
                  </>
                ) : index === 1 ? (
                  <>
                    <path d="M3 3v14h14M7 13V9m4 4V5m4 8V7" />
                  </>
                ) : index === 2 ? (
                  <>
                    <path d="M10 2 3 5v5c0 4 7 8 7 8s7-4 7-8V5Z" />
                    <path d="m6 10 3 3 5-6" />
                  </>
                ) : (
                  <>
                    <path d="M5 2h7l4 4v12H5ZM12 2v5h4M8 11h5M8 14h5" />
                  </>
                )}
              </svg>
              {labels[item]}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="version">Phase 0 / 1</span>
          <p>
            Deterministic computation.
            <br />
            Evidence-led research.
          </p>
          <span className="subtle">Local research session</span>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span>
            Financial Econometrics <span className="topbar-separator">/</span>{" "}
            <strong>{labels[page]}</strong>
          </span>
          <button
            className={`health ${health === "Connected" ? "connected" : ""}`}
            onClick={checkHealth}
            disabled={health === "Checking"}
            title="重新检查研究服务"
          >
            <span aria-hidden="true" />
            {health === "Connected"
              ? "API connected"
              : health === "Checking"
                ? "Checking API…"
                : "API offline · Retry"}
          </button>
        </header>
        <div className="content-grid">
          <main id="main" tabIndex={-1}>
            {research.error && (
              <div className="error" role="alert">
                <strong>分析未完成</strong>
                <p>{research.error}</p>
              </div>
            )}
            {children}
            <footer className="page-footer">
              <span>FinEcon Agent</span>
              <span>Research only · Not investment advice</span>
            </footer>
          </main>
          <WorkflowPanel
            steps={research.steps}
            busy={research.busy}
            taskId={research.task?.task_id}
          />
        </div>
      </div>
    </div>
  );
}
