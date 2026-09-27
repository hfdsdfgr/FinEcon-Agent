import { useState } from "react";
import { api } from "../api/client";
import {
  activeStep,
  initialWorkflow,
  workflowFromTask,
} from "../features/agent/workflow";
import { selectedData } from "../features/dataset/parseCsv";
import type { LocalDataset } from "../features/dataset/parseCsv";
import type {
  DescriptiveResult,
  Method,
  OLSResult,
  ResearchReport,
  TaskState,
  WorkflowStep,
} from "../types/api";
export function useResearch() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [descriptive, setDescriptive] = useState<DescriptiveResult>();
  const [ols, setOls] = useState<OLSResult>();
  const [report, setReport] = useState<ResearchReport>();
  const [task, setTask] = useState<TaskState>();
  const [steps, setSteps] = useState(initialWorkflow);
  const [runLabel, setRunLabel] = useState("");
  const changeStep = (
    index: number,
    status: WorkflowStep["status"],
    detail: string,
  ) =>
    setSteps((previous) =>
      previous.map((step, i) =>
        i === index ? { ...step, status, detail } : step,
      ),
    );
  function reset() {
    setError("");
    setDescriptive(undefined);
    setOls(undefined);
    setReport(undefined);
    setTask(undefined);
    setSteps(initialWorkflow());
    setRunLabel("");
  }
  async function acceptTask(value: TaskState) {
    setTask(value);
    setSteps(workflowFromTask(value));
    setDescriptive(value.results.descriptive_statistics);
    setOls(value.results.ols);
    if (value.status === "failed")
      throw new Error(value.warnings.at(-1) || "研究失败，请检查输入数据。");
    if (value.status !== "completed") return;
    changeStep(6, "running", "正在读取后端报告");
    try {
      setReport(await api.report(value.task_id));
      changeStep(6, "completed", "报告已读取");
    } catch (error) {
      changeStep(6, "failed", "读取失败，可按 Task ID 重试");
      throw error;
    }
  }
  async function run(
    dataset: LocalDataset,
    question: string,
    dependent: string,
    independent: string[],
    method: Method,
  ) {
    reset();
    setBusy(true);
    setRunLabel(
      `${dataset.name} / ${method === "agent" ? "Agent research" : method.toUpperCase()}`,
    );
    let stage = 1;
    try {
      changeStep(
        0,
        "completed",
        method === "agent" ? "问题与变量已提交" : "直接工具分析",
      );
      changeStep(1, "running", "检查所选数据");
      const columns =
        method === "descriptive"
          ? dataset.metadata.numeric_columns
          : [dependent, ...independent];
      if (method !== "descriptive" && (!dependent || !independent.length))
        throw new Error("请选择因变量及至少一个自变量。");
      const data = selectedData(dataset, columns);
      if (method === "agent" && !question.trim())
        throw new Error("请输入研究问题。");
      changeStep(1, "completed", "客户端格式校验完成；后端将再次校验");
      stage = activeStep(method);
      changeStep(
        stage,
        "running",
        method === "agent" ? "研究请求处理中，等待完整响应" : "请求后端计算",
      );
      if (method === "agent") {
        const value = await api.research({
          research_question: question.trim(),
          data,
          dependent_variable: dependent,
          independent_variables: independent,
        });
        stage = -1;
        await acceptTask(value);
      } else if (method === "descriptive") {
        setDescriptive(await api.descriptive({ data }));
        changeStep(2, "completed", "后端计算完成");
      } else {
        setOls(
          await api.ols({
            y: data[dependent],
            X: Object.fromEntries(
              independent.map((name) => [name, data[name]]),
            ),
            add_intercept: true,
          }),
        );
        changeStep(4, "completed", "后端计算完成");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "请求失败。");
      if (stage >= 0) changeStep(stage, "failed", "请查看错误信息");
    } finally {
      setBusy(false);
    }
  }
  async function restore(id: string) {
    if (!id.trim()) {
      setError("请输入 Task ID。");
      return;
    }
    reset();
    setBusy(true);
    setRunLabel(`Saved task / ${id.trim()}`);
    try {
      await acceptTask(await api.task(id.trim()));
    } catch (error) {
      setError(error instanceof Error ? error.message : "任务读取失败。");
    } finally {
      setBusy(false);
    }
  }
  return {
    busy,
    error,
    descriptive,
    ols,
    report,
    task,
    steps,
    runLabel,
    reset,
    run,
    restore,
  };
}
export type ResearchState = ReturnType<typeof useResearch>;
