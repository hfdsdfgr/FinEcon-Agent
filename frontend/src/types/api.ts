// Matches app/schemas/{analysis,dataset,agent,report}.py. Null means undefined, never zero.
export type NumericData = Record<string, number[]>;
export type NumericMap = Record<string, number | null>;
export interface DescriptiveRequest {
  data: NumericData;
}
export interface OLSRequest {
  y: number[];
  X: NumericData;
  add_intercept?: boolean;
}
export interface DescriptiveResult {
  statistics: Record<string, NumericMap>;
  correlation: Record<string, NumericMap>;
  n_obs: number;
  warnings: string[];
}
export interface OLSResult {
  coefficients: NumericMap;
  standard_errors: NumericMap;
  t_statistics: NumericMap;
  p_values: NumericMap;
  r_squared: number | null;
  adjusted_r_squared: number | null;
  aic: number | null;
  bic: number | null;
  log_likelihood: number | null;
  n_obs: number;
  residuals: number[];
  warnings: string[];
}
export interface DatasetMetadata {
  rows: number;
  columns: string[];
  date_column: string | null;
  numeric_columns: string[];
  missing_values: Record<string, number>;
  transformations: Record<string, string>[];
}
export interface ResearchRequest {
  research_question: string;
  data: NumericData;
  dependent_variable: string;
  independent_variables: string[];
}
export interface ToolResult {
  tool: string;
  status: "completed" | "failed";
  result: Record<string, unknown> | null;
  error: Record<string, string> | null;
}
export interface TaskState {
  task_id: string;
  status: "created" | "planning" | "running" | "completed" | "failed";
  current_step: number;
  steps: ToolResult[];
  dataset: Partial<DatasetMetadata>;
  results: {
    descriptive_statistics?: DescriptiveResult;
    ols?: OLSResult;
    [key: string]: unknown;
  };
  warnings: string[];
}
export interface ResearchReport {
  research_question: string;
  dataset_summary: Partial<DatasetMetadata>;
  methodology: string[];
  models: Record<string, unknown>[];
  diagnostics: Record<string, unknown>;
  interpretation: string;
  limitations: string[];
  warnings: string[];
}
export type Method = "agent" | "ols" | "descriptive";
export type StepStatus =
  "pending" | "running" | "completed" | "warning" | "failed";
export interface WorkflowStep {
  name: string;
  status: StepStatus;
  detail: string;
}
