import type {
  DescriptiveRequest,
  DescriptiveResult,
  OLSRequest,
  OLSResult,
  ResearchRequest,
  ResearchReport,
  TaskState,
} from "../types/api";
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "/api"
).replace(/\/$/, "");
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
async function request<T>(
  path: string,
  body?: unknown,
  timeout = 120_000,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError")
      throw new ApiError(
        "请求超时。研究任务可能仍在后端执行；确认状态后再重试。",
        0,
      );
    throw new ApiError(
      "无法连接研究服务。请检查后端是否启动，以及 API 地址和代理配置。",
      0,
    );
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      response.status === 501
        ? "Not implemented yet"
        : payload?.error?.message || `服务返回 HTTP ${response.status}`,
      response.status,
    );
  if (payload === null)
    throw new ApiError("服务返回了无法识别的结果。", response.status);
  return payload as T;
}
export const api = {
  health: () =>
    request<{ status: string; service: string }>("/health", undefined, 5000),
  descriptive: (body: DescriptiveRequest) =>
    request<DescriptiveResult>("/analysis/descriptive", body),
  ols: (body: OLSRequest) => request<OLSResult>("/analysis/ols", body),
  research: (body: ResearchRequest) =>
    request<TaskState>("/agent/research", body),
  task: (id: string) =>
    request<TaskState>(`/agent/task/${encodeURIComponent(id)}`),
  report: (id: string) =>
    request<ResearchReport>(`/report/${encodeURIComponent(id)}`),
};
