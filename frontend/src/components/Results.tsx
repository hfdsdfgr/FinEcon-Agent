import type { ReactNode } from "react";
export function formatNumber(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value !== "number") return String(value);
  if (!Number.isFinite(value)) return "—";
  if (value !== 0 && Math.abs(value) < 0.0001) return value.toExponential(4);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(
    value,
  );
}
export function Table({
  label,
  headers,
  rows,
}: {
  label: string;
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="table-scroll" role="region" aria-label={label} tabIndex={0}>
      <table>
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) =>
                j === 0 ? (
                  <th key={j} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={j}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="section">
      <div className="section-heading">
        <h2>{title}</h2>
        {note && <span className="subtle">{note}</span>}
      </div>
      {children}
    </section>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty-mark" aria-hidden="true">
        —
      </span>
      <p>{children}</p>
    </div>
  );
}
export function Reserved({
  name,
  description,
}: {
  name: string;
  description?: string;
}) {
  return (
    <div className="reserved">
      <div>
        <h3>{name}</h3>
        {description && <p>{description}</p>}
      </div>
      <span className="status warning">Not implemented yet</span>
    </div>
  );
}
export function Warnings({ items }: { items: string[] }) {
  return items.length ? (
    <div className="notice">
      <strong>Research notes</strong>
      <ul>
        {[...new Set(items)].map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  ) : null;
}
