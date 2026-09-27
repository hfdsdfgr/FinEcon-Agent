import { describe, it, expect } from "vitest";
import { parseCsv, selectedData } from "../src/features/dataset/parseCsv";
import { formatNumber } from "../src/components/Results";
import {
  initialWorkflow,
  workflowFromTask,
} from "../src/features/agent/workflow";
import type { TaskState } from "../src/types/api";

describe("CSV input boundary", () => {
  it("supports a single numeric column", () => {
    const dataset = parseCsv("return\n0.1\n0.2\n0.3", "single.csv");
    expect(selectedData(dataset, ["return"])).toEqual({ return: [0.1, 0.2, 0.3] });
  });
  it("keeps quoted fields, dates, missing cells and original order", () => {
    const data = parseCsv(
      'Date,y,x,Note\r\n2026-01-02,1,2,"a,b"\r\n2026-01-01,3,,c',
      "test.csv",
    );
    expect(data.metadata.date_column).toBe("Date");
    expect(data.metadata.numeric_columns).toEqual(["y", "x"]);
    expect(data.rows[0][3]).toBe("a,b");
    expect(data.metadata.missing_values.x).toBe(1);
    expect(() => selectedData(data, ["x"])).toThrow("缺失值");
    expect(selectedData(data, ["y"])).toEqual({ y: [1, 3] });
  });
  it.each(["y,y\n1,2", ",x\n1,2", "y,x\n1,2,3", "y,x", ""])(
    "rejects ambiguous or empty CSV %s",
    (value) => {
      expect(() => parseCsv(value, "test.csv")).toThrow();
    },
  );
  it("does not coerce text, infinity or blanks into numerical observations", () => {
    const data = parseCsv("x,y,z\nInfinity,12abc,\n2,3,", "test.csv");
    expect(data.metadata.numeric_columns).toEqual([]);
    expect(() => selectedData(data, ["x"])).toThrow();
  });
  it("accepts BOM, exponents and special property names safely", () => {
    const data = parseCsv("\ufeff__proto__,x\n1,2e-4\n3,4", "test.csv");
    expect(selectedData(data, ["__proto__", "x"])).toEqual(
      JSON.parse('{"__proto__":[1,3],"x":[0.0002,4]}'),
    );
  });
  it("distinguishes zero, null, and very small p values", () => {
    expect(formatNumber(null)).toBe("—");
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(0.0000002)).toBe("2.0000e-7");
  });
});

describe("honest workflow states", () => {
  it("never completes unavailable tests", () => {
    expect(initialWorkflow()[3].status).toBe("warning");
    const task: TaskState = {
      task_id: "test",
      status: "failed",
      current_step: 3,
      steps: [
        { tool: "validate_data", status: "completed", result: {}, error: null },
        {
          tool: "ols",
          status: "failed",
          result: null,
          error: { message: "rank deficient" },
        },
      ],
      dataset: {},
      results: {},
      warnings: [],
    };
    const steps = workflowFromTask(task);
    expect(steps[1].status).toBe("completed");
    expect(steps[2].status).toBe("pending");
    expect(steps[3].status).toBe("warning");
    expect(steps[4].status).toBe("failed");
    expect(steps[5].status).toBe("warning");
    expect(steps[6].status).toBe("failed");
  });
});
