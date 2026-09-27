import Papa from "papaparse";
import type { DatasetMetadata, NumericData } from "../../types/api";
export interface LocalDataset {
  name: string;
  metadata: DatasetMetadata;
  rows: string[][];
  numeric: Record<string, (number | null)[]>;
}
const numberPattern = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;
export function parseCsv(text: string, name: string): LocalDataset {
  const parsed = Papa.parse<string[]>(text.replace(/^\uFEFF/, ""), {
    delimiter: ",",
    skipEmptyLines: "greedy",
  });
  if (parsed.errors.length)
    throw new Error(`CSV 解析失败：${parsed.errors[0].message}`);
  const [header, ...rows] = parsed.data;
  const columns = header?.map((value) => value.trim());
  if (!columns?.length || !rows.length)
    throw new Error("CSV 需要列名和至少一行数据。");
  if (columns.some((c) => !c) || new Set(columns).size !== columns.length)
    throw new Error("列名必须非空且唯一。");
  if (
    rows.length > 10000 ||
    columns.length > 100 ||
    rows.length * columns.length > 100000
  )
    throw new Error(
      "轻量工作台限制为 10,000 行、100 列、100,000 个单元格。请缩小数据集。",
    );
  if (rows.some((row) => row.length !== columns.length))
    throw new Error("各行列数不一致，请检查 CSV 分隔符和引号。");
  const missing: Record<string, number> = Object.create(null);
  const numeric: LocalDataset["numeric"] = Object.create(null);
  let dateColumn: string | null = null;
  columns.forEach((column, index) => {
    const values = rows.map((row) => row[index].trim());
    const present = values.filter(Boolean);
    missing[column] = values.length - present.length;
    if (
      present.length &&
      present.every(
        (value) => numberPattern.test(value) && Number.isFinite(Number(value)),
      )
    )
      numeric[column] = values.map((value) =>
        value === "" ? null : Number(value),
      );
    if (
      !dateColumn &&
      present.length &&
      present.every(
        (value) =>
          /^\d{4}-\d{2}-\d{2}(?:[T ].*)?$/.test(value) &&
          Number.isFinite(Date.parse(value)),
      )
    )
      dateColumn = column;
  });
  return {
    name,
    rows,
    numeric,
    metadata: {
      rows: rows.length,
      columns,
      date_column: dateColumn,
      numeric_columns: Object.keys(numeric),
      missing_values: missing,
      transformations: [],
    },
  };
}
export function selectedData(
  dataset: LocalDataset,
  columns: string[],
): NumericData {
  if (!columns.length) throw new Error("请至少选择一个数值变量。");
  return Object.fromEntries(
    columns.map((column) => {
      const values = dataset.numeric[column];
      if (!values) throw new Error(`${column} 不是可分析的数值列。`);
      if (values.some((value) => value === null))
        throw new Error(
          `${column} 含缺失值。请在原文件中处理后重新导入；不会自动删行或填补。`,
        );
      return [column, values as number[]];
    }),
  );
}
