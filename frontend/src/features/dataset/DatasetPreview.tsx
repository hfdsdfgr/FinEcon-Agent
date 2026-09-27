import type { LocalDataset } from "./parseCsv";
import { Table } from "../../components/Results";
export function DatasetPreview({ dataset }: { dataset: LocalDataset }) {
  const { metadata } = dataset;
  const missing = Object.values(metadata.missing_values).reduce(
    (sum, n) => sum + n,
    0,
  );
  return (
    <div>
      <div className="dataset-title">
        <strong>{dataset.name}</strong>
        <span className="status completed">Local CSV</span>
      </div>
      <div className="metrics">
        <div>
          <span>Rows</span>
          <strong>{metadata.rows}</strong>
        </div>
        <div>
          <span>Columns</span>
          <strong>{metadata.columns.length}</strong>
        </div>
        <div>
          <span>Numeric</span>
          <strong>{metadata.numeric_columns.length}</strong>
        </div>
        <div>
          <span>Missing cells</span>
          <strong>{missing}</strong>
        </div>
      </div>
      <p className="footnote">
        Date column: {metadata.date_column || "未识别"} ·
        元数据由本地解析获得；尚未上传保存。
      </p>
      <Table
        label="Dataset preview"
        headers={metadata.columns}
        rows={dataset.rows.slice(0, 6)}
      />
      <p className="footnote">
        预览前 {Math.min(6, metadata.rows)} 行 / 共 {metadata.rows}{" "}
        行。分析按原始行顺序执行。
      </p>
      <details>
        <summary>Column information</summary>
        <Table
          label="Dataset columns"
          headers={["Column", "Type", "Missing"]}
          rows={metadata.columns.map((name) => [
            name,
            metadata.numeric_columns.includes(name)
              ? "Numeric"
              : name === metadata.date_column
                ? "Date"
                : "Text",
            metadata.missing_values[name],
          ])}
        />
      </details>
    </div>
  );
}
