import { useState } from "react";
import type { ResearchState } from "../hooks/useResearch";
import { ReportContent } from "../features/report/ReportContent";
import { Empty, Section } from "../components/Results";
export function Report({ research }: { research: ResearchState }) {
  const [taskId, setTaskId] = useState("");
  function download() {
    if (!research.report) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(research.report, null, 2)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `finecon-${research.task?.task_id || "report"}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <header className="page-heading">
        <div>
          <p className="breadcrumb">Research / Deliverable</p>
          <h1>Research Report</h1>
          <p>基于后端真实结果生成的结构化研究记录。</p>
        </div>
        <button disabled={!research.report || research.busy} onClick={download}>
          导出 JSON
        </button>
      </header>
      <Section title="Saved research" note="读取已有任务">
        <form
          className="restore-form"
          onSubmit={(event) => {
            event.preventDefault();
            void research.restore(taskId);
          }}
        >
          <label htmlFor="task-id" className="sr-only">
            Task ID
          </label>
          <input
            id="task-id"
            value={taskId}
            onChange={(event) => setTaskId(event.target.value)}
            placeholder="输入 Task ID"
            disabled={research.busy}
          />
          <button disabled={!taskId.trim() || research.busy}>
            读取任务与报告
          </button>
        </form>
        {research.task && (
          <p className="footnote">
            Task: {research.task.task_id} · {research.task.status}
            {research.task.status !== "completed" &&
            research.task.status !== "failed"
              ? " · 再次点击读取以刷新状态"
              : ""}
          </p>
        )}
      </Section>
      {research.report ? (
        <ReportContent report={research.report} />
      ) : (
        <Empty>
          在 Workspace 运行 Agent research，或输入已有 Task ID
          读取报告。直接工具分析不会生成研究报告。
        </Empty>
      )}
    </>
  );
}
