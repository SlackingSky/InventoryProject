import {
  LayoutDashboard,
  Package,
  Tag,
  Truck,
  Warehouse,
  BarChart3,
  ArrowLeftRight,
  ShoppingCart,
  Users,
  ChevronRight,
  Zap,
  LogOut,
} from "lucide-react";

type Page =
  | "dashboard"
  | "products"
  | "categories"
  | "suppliers"
  | "warehouses"
  | "inventory"
  | "stock-movements"
  | "purchase-orders"
  | "users";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  group?: string;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} />, group: "Overview" },
  { id: "products", label: "Products", icon: <Package size={16} />, group: "Catalog" },
  { id: "categories", label: "Categories", icon: <Tag size={16} />, group: "Catalog" },
  { id: "suppliers", label: "Suppliers", icon: <Truck size={16} />, group: "Catalog" },
  { id: "warehouses", label: "Warehouses", icon: <Warehouse size={16} />, group: "Stock" },
  { id: "inventory", label: "Inventory", icon: <BarChart3 size={16} />, group: "Stock" },
  { id: "stock-movements", label: "Stock Movements", icon: <ArrowLeftRight size={16} />, group: "Stock" },
  { id: "purchase-orders", label: "Purchase Orders", icon: <ShoppingCart size={16} />, group: "Procurement" },
  { id: "users", label: "Users", icon: <Users size={16} />, group: "Administration" },
];

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  userRole: string;
  userName: string;
  onLogout: () => void;
}

export function Sidebar({ activePage, onNavigate, userRole, userName, onLogout }: SidebarProps) {
  const visibleItems = navItems.filter((item) => item.id !== "users" || userRole === "Admin");
  const groups = Array.from(new Set(visibleItems.map((i) => i.group)));

  return (
    <aside
      className="flex flex-col h-full"
      style={{ background: "var(--sidebar)", color: "var(--sidebar-foreground)", width: 240, minWidth: 240 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 32, height: 32, background: "var(--sidebar-primary)" }}
        >
          <Zap size={16} color="#fff" />
        </div>
        <div>
          <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>CARBS Technologies</div>
          <div style={{ color: "#64748b", fontSize: 11 }}>Inventory System</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {groups.map((group) => (
          <div key={group} className="mb-4">
            <div
              className="px-2 mb-1"
              style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569" }}
            >
              {group}
            </div>
            {visibleItems
              .filter((item) => item.group === group)
              .map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md mb-0.5 transition-colors text-left"
                    style={{
                      background: isActive ? "var(--sidebar-accent)" : "transparent",
                      color: isActive ? "var(--sidebar-accent-foreground)" : "var(--sidebar-foreground)",
                      fontSize: 13,
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    <span style={{ color: isActive ? "var(--sidebar-primary)" : "#64748b" }}>{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={12} style={{ color: "#64748b" }} />}
                  </button>
                );
              })}
          </div>
        ))}
      </nav>

      {/* Footer — Log Out */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
          style={{ color: "#94a3b8", fontSize: 13, background: "transparent" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sidebar-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <LogOut size={15} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
