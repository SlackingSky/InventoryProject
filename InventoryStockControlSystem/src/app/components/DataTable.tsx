import { useState } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center";
}

interface DataTableProps<T> {
  title: string;
  subtitle?: string;
  columns: Column<T>[];
  data: T[];
  searchFields?: (keyof T)[];
  actions?: React.ReactNode;
  rowKey: (row: T) => string;
}

export function DataTable<T>({ title, subtitle, columns, data, searchFields, actions, rowKey }: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = searchFields
    ? data.filter((row) =>
        searchFields.some((field) =>
          String(row[field] ?? "").toLowerCase().includes(search.toLowerCase())
        )
      )
    : data;

  const sorted = sortCol
    ? [...filtered].sort((a, b) => {
        const aVal = String((a as Record<string, unknown>)[sortCol] ?? "");
        const bVal = String((b as Record<string, unknown>)[sortCol] ?? "");
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      })
    : filtered;

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <h2 style={{ color: "var(--foreground)", marginBottom: 2 }}>{title}</h2>
          {subtitle && <p style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {searchFields && (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  fontSize: 13,
                  outline: "none",
                  width: 200,
                }}
              />
            </div>
          )}
          {actions}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--muted)" }}>
              {columns.map((col) => {
                const align = col.align ?? "center";
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && toggleSort(col.key)}
                    className="px-4 py-3"
                    style={{
                      textAlign: align,
                      color: "var(--muted-foreground)",
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      cursor: col.sortable ? "pointer" : "default",
                      width: col.width,
                      userSelect: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        justifyContent: align === "left" ? "flex-start" : "center",
                      }}
                    >
                      {col.label}
                      {col.sortable && (
                        <span style={{ color: sortCol === col.key ? "var(--primary)" : "var(--border)" }}>
                          {sortDir === "asc" || sortCol !== col.key ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center" style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
                  No records found.
                </td>
              </tr>
            ) : (
              sorted.map((row, idx) => (
                <tr
                  key={rowKey(row)}
                  style={{ borderBottom: idx < sorted.length - 1 ? "1px solid var(--border)" : "none" }}
                  className="transition-colors hover:bg-[var(--muted)]"
                >
                  {columns.map((col) => {
                    const align = col.align ?? "center";
                    return (
                      <td
                        key={col.key}
                        className="px-4 py-3"
                        style={{ textAlign: align, color: "var(--foreground)", verticalAlign: "middle" }}
                      >
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
        <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
          {sorted.length} of {data.length} record{data.length !== 1 ? "s" : ""}
          {search && ` matching "${search}"`}
        </span>
      </div>
    </div>
  );
}

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full"
      style={{ background: color + "18", color, fontSize: 11, fontWeight: 600 }}
    >
      {label}
    </span>
  );
}

export function MonoValue({ value }: { value: string | number }) {
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{value}</span>
  );
}
