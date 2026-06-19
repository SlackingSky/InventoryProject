import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";

export function MonoValue({ value }: { value: string | number }) {
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--foreground)" }}>
      {value}
    </span>
  );
}

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      backgroundColor: `${color}22`,
      color: color,
      padding: "2px 8px",
      borderRadius: "9999px",
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: "nowrap"
    }}>
      {label}
    </span>
  );
}

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  title: string;
  subtitle?: string;
  columns: Column<T>[];
  data: T[];
  searchFields?: (keyof T)[];
  actions?: React.ReactNode;
  rowKey: (row: T) => string | number;
}

export function DataTable<T>({ title, subtitle, columns, data, searchFields, actions, rowKey }: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    if (!searchFields || !search) return data;
    const lowerSearch = search.toLowerCase();
    return data.filter((row) =>
      searchFields.some((field) =>
        String(row[field] ?? "").toLowerCase().includes(lowerSearch)
      )
    );
  }, [data, search, searchFields]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const aRaw = (a as any)[sortCol];
      const bRaw = (b as any)[sortCol];

      if (typeof aRaw === "number" && typeof bRaw === "number") {
        return sortDir === "asc" ? aRaw - bRaw : bRaw - aRaw;
      }

      const aVal = String(aRaw ?? "").toLowerCase();
      const bVal = String(bRaw ?? "").toLowerCase();
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }, [filtered, sortCol, sortDir]);

  const toggleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between gap-4 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <h2 className="font-bold text-lg" style={{ color: "var(--foreground)", marginBottom: 2 }}>{title}</h2>
          {subtitle && <p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>{subtitle}</p>}
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
                className="pl-8 pr-4 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
            </div>
          )}
          {actions}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3 font-semibold text-xs tracking-wider uppercase ${col.sortable ? "cursor-pointer hover:bg-black/5 transition-colors select-none" : ""}`}
                  style={{ color: "var(--muted-foreground)", width: col.width, textAlign: col.align || "left" }}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  <div className={`flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    {col.label}
                    {col.sortable && (
                      <div className="flex flex-col opacity-50">
                        <ChevronUp size={10} className={sortCol === col.key && sortDir === "asc" ? "opacity-100 text-blue-500" : "-mb-1"} />
                        <ChevronDown size={10} className={sortCol === col.key && sortDir === "desc" ? "opacity-100 text-blue-500" : ""} />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length > 0 ? (
              sorted.map((row) => (
                <tr key={rowKey(row)} className="transition-colors hover:bg-black/[0.02]" style={{ borderBottom: "1px solid var(--border)" }}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3" style={{ color: "var(--foreground)", textAlign: col.align || "left" }}>
                      {col.render ? col.render(row) : String((row as any)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center" style={{ color: "var(--muted-foreground)" }}>
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}