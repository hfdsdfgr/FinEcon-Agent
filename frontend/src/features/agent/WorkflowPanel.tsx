import type { WorkflowStep } from "../../types/api";
export function WorkflowPanel({
  steps,
  busy,
  taskId,
}: {
  steps: WorkflowStep[];
  busy: boolean;
  taskId?: string;
}) {
  return (
    <aside className="workflow" aria-label="Agent Workflow Panel">
      <div className="workflow-heading">
        <h2>Agent Workflow</h2>
        <span className="subtle">Research pipeline</span>
      </div>
      <ol>
        {steps.map((step, i) => (
          <li key={step.name} className={`step ${step.status}`}>
            <span className="step-index" aria-hidden="true">
              {step.status === "completed"
                ? "✓"
                : String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>{step.name}</h3>
              <span className={`status ${step.status}`}>{step.status}</span>
              <p>{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="workflow-note" aria-live="polite">
        {busy
          ? "正在等待服务响应。同步研究接口不提供实时步骤进度。"
          : "步骤状态来自请求结果。预留检验不会标记为已完成。"}
      </div>
      {taskId && (
        <p className="task-id">
          Task ID
          <br />
          <code>{taskId}</code>
        </p>
      )}
    </aside>
  );
}
