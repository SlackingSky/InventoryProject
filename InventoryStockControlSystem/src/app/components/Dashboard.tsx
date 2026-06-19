import { Package, AlertTriangle, ShoppingCart, Warehouse, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useData } from "../context/DataContext";

function StatCard({ label, value, sub, icon, color, trend }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode;
  color: string; trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="rounded-xl p-5 flex items-start gap-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="rounded-lg flex items-center justify-center" style={{ width: 44, height: 44, background: color + "18" }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{label}</div>
        <div style={{ color: "var(--foreground)", fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
        {sub && <div style={{ color: "var(--muted-foreground)", fontSize: 12, marginTop: 4 }}>{sub}</div>}
      </div>
      {trend && (
        <span style={{ color: trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : "var(--muted-foreground)" }}>
          {trend === "up" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </span>
      )}
    </div>
  );
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export function Dashboard() {
  const { products, inventory, purchaseOrders, warehouses, stockMovements, categories } = useData();
  const totalProducts = products.length;
  const totalStock = inventory.reduce((s, i) => s + i.productQuantity, 0);
  const pendingOrders = purchaseOrders.filter((o) => o.deliveryStatus !== "Delivered" && o.deliveryStatus !== "Cancelled").length;

  const lowStockProducts = products.filter((p) => {
    const qty = inventory.filter((i) => i.productID === p.productID).reduce((s, i) => s + i.productQuantity, 0);
    return qty <= p.reorderLevel;
  });

  const warehouseStock = warehouses.map((w) => ({
    name: w.warehouseName.split(" ").slice(0, 2).join(" "),
    units: inventory.filter((i) => i.warehouseID === w.warehouseID).reduce((s, i) => s + i.productQuantity, 0),
  }));

  const categoryStock = categories.map((c, idx) => {
    const catProducts = products.filter((p) => p.categoryID === c.categoryID);
    const qty = catProducts.reduce((sum, p) => {
      return sum + inventory.filter((i) => i.productID === p.productID).reduce((s, i) => s + i.productQuantity, 0);
    }, 0);
    return { name: c.categoryName, value: qty, fill: COLORS[idx % COLORS.length] };
  }).filter((c) => c.value > 0);

  const recentMovements = [...stockMovements].sort((a, b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()).slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ color: "var(--foreground)", marginBottom: 4 }}>Dashboard</h1>
              <p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Overview of your electronics inventory system — {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <StatCard label="Total Products" value={totalProducts} sub="Unique SKUs" icon={<Package size={20} />} color="#3b82f6" trend="up" />
        <StatCard label="Total Stock Units" value={totalStock.toLocaleString()} sub="Across all warehouses" icon={<Warehouse size={20} />} color="#10b981" trend="up" />
        <StatCard label="Low / Reorder Alert" value={lowStockProducts.length} sub="Items below reorder level" icon={<AlertTriangle size={20} />} color="#f59e0b" />
        <StatCard label="Open Purchase Orders" value={pendingOrders} sub="Pending or in transit" icon={<ShoppingCart size={20} />} color="#8b5cf6" />
      </div>

      {/* Charts */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 380px" }}>
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 style={{ color: "var(--foreground)", marginBottom: 16 }}>Stock by Warehouse</h3>
          <ResponsiveContainer width="100%" height={200} id="rc-warehouse">
            <BarChart data={warehouseStock} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="units" fill="#3b82f6" radius={[4, 4, 0, 0]} isAnimationActive={false} background={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 style={{ color: "var(--foreground)", marginBottom: 16 }}>Stock by Category</h3>
          <ResponsiveContainer width="100%" height={160} id="rc-category">
            <PieChart>
              <Pie data={categoryStock} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" isAnimationActive={false}>
                {categoryStock.map((entry, index) => (
                  <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          {/* Custom legend — avoids recharts internal duplicate-key bug */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {categoryStock.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center gap-1.5">
                <div className="rounded-full flex-shrink-0" style={{ width: 8, height: 8, background: entry.fill }} />
                <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alert + Recent Movements */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} color="#f59e0b" />
            <h3 style={{ color: "var(--foreground)" }}>Low Stock Alerts</h3>
          </div>
          <div className="space-y-2">
            {lowStockProducts.map((p) => {
              const qty = inventory.filter((i) => i.productID === p.productID).reduce((s, i) => s + i.productQuantity, 0);
              const pct = Math.min(100, Math.round((qty / p.reorderLevel) * 100));
              return (
                <div key={p.productID} className="flex flex-col gap-1">
                  <div className="flex justify-between" style={{ fontSize: 12 }}>
                    <span style={{ color: "var(--foreground)" }}>{p.productName}</span>
                    <span style={{ color: qty <= p.minimumStockQuantity ? "#ef4444" : "#f59e0b", fontFamily: "var(--font-mono)", fontWeight: 500 }}>
                      {qty} / {p.reorderLevel}
                    </span>
                  </div>
                  <div className="rounded-full overflow-hidden" style={{ height: 4, background: "var(--muted)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: qty <= p.minimumStockQuantity ? "#ef4444" : "#f59e0b" }} />
                  </div>
                </div>
              );
            })}
            {lowStockProducts.length === 0 && (
              <div style={{ color: "var(--muted-foreground)", fontSize: 13, textAlign: "center", padding: "16px 0" }}>All products are well-stocked.</div>
            )}
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <ArrowLeftRight size={16} color="#3b82f6" />
            <h3 style={{ color: "var(--foreground)" }}>Recent Movements</h3>
          </div>
          <div className="space-y-2">
            {recentMovements.map((m) => {
              const product = products.find((p) => p.productID === m.productID);
              const typeColors: Record<string, string> = { "Stock In": "#10b981", "Stock Out": "#ef4444", "Transfer": "#3b82f6", "Adjustment": "#f59e0b", "Return": "#8b5cf6" };
              return (
                <div key={m.stockMovementID} className="flex items-center justify-between py-1" style={{ borderBottom: "1px solid var(--border)", fontSize: 12 }}>
                  <div>
                    <div style={{ color: "var(--foreground)", fontWeight: 500 }}>{product?.productName.split(" ").slice(0, 3).join(" ")}</div>
                    <div style={{ color: "var(--muted-foreground)", fontSize: 11 }}>{new Date(m.movementDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full" style={{ background: typeColors[m.movementType] + "18", color: typeColors[m.movementType], fontSize: 10, fontWeight: 600 }}>
                      {m.movementType}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: m.movementQuantity < 0 ? "#ef4444" : "var(--foreground)", minWidth: 32, textAlign: "right" }}>
                      {m.movementQuantity > 0 ? "+" : ""}{m.movementQuantity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
