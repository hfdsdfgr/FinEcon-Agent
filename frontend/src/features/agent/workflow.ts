import type { Method, TaskState, WorkflowStep } from "../../types/api";
export const initialWorkflow = (): WorkflowStep[] => [
  { name: "Research Question", status: "pending", detail: "定义问题与变量" },
  { name: "Data Validation", status: "pending", detail: "等待数据校验" },
  {
    name: "Descriptive Statistics",
    status: "pending",
    detail: "样本统计与相关性",
  },
  {
    name: "Stationarity Test",
    status: "warning",
    detail: "Not implemented yet",
  },
  { name: "Model Estimation", status: "pending", detail: "OLS estimation" },
  { name: "Diagnostics", status: "warning", detail: "Not implemented yet" },
  { name: "Report", status: "pending", detail: "Agent 研究后生成" },
];
export function workflowFromTask(task: TaskState): WorkflowStep[] {
  const steps = initialWorkflow();
  steps[0] = {
    ...steps[0],
    status:
      task.status === "failed" && !task.steps.length
        ? "failed"
        : task.status === "created" || task.status === "planning"
          ? "pending"
          : "completed",
    detail: "显式变量映射",
  };
  const mapping: Record<string, number> = {
    validate_data: 1,
    descriptive_statistics: 2,
    ols: 4,
  };
  task.steps.forEach((step) => {
    const index = mapping[step.tool];
    if (index !== undefined)
      steps[index] = {
        ...steps[index],
        status: step.status,
        detail: step.error?.message || "后端执行完成",
      };
  });
  steps[6] = {
    ...steps[6],
    status: task.status === "failed" ? "failed" : "pending",
    detail: task.status === "failed" ? "研究失败，未生成报告" : "等待读取报告",
  };
  return steps;
}
export function activeStep(method: Method) {
  return method === "ols" ? 4 : method === "descriptive" ? 2 : 0;
}
