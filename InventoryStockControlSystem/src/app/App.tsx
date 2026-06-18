import { useState } from "react";
import { DataProvider, useData } from "./context/DataContext";
import { SignIn } from "./components/SignIn";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Products } from "./components/Products";
import { Categories } from "./components/Categories";
import { Suppliers } from "./components/Suppliers";
import { Warehouses } from "./components/Warehouses";
import { Inventory } from "./components/Inventory";
import { StockMovements } from "./components/StockMovements";
import { PurchaseOrders } from "./components/PurchaseOrders";
import { Users } from "./components/Users";

type Page = "dashboard" | "products" | "categories" | "suppliers" | "warehouses" | "inventory" | "stock-movements" | "purchase-orders" | "users";

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard", products: "Products", categories: "Categories",
  suppliers: "Suppliers", warehouses: "Warehouses", inventory: "Inventory",
  "stock-movements": "Stock Movements", "purchase-orders": "Purchase Orders", users: "Users",
};

function AppInner({ onLogout }: { onLogout: () => void }) {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const { currentUserID, users } = useData();
  const currentUser = users.find((u) => u.userID === currentUserID);
  const role = currentUser?.userRole ?? "Staff";

  const canViewUsers = role === "Admin";
  const canAdd = true;
  const canModify = role === "Admin" || role === "Manager";

  const handleNavigate = (page: Page) => {
    if (page === "users" && !canViewUsers) return;
    setActivePage(page);
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard />;
      case "products": return <Products canAdd={canAdd} canModify={canModify} />;
      case "categories": return <Categories canAdd={canAdd} canModify={canModify} />;
      case "suppliers": return <Suppliers canAdd={canAdd} canModify={canModify} />;
      case "warehouses": return <Warehouses canAdd={canAdd} canModify={canModify} />;
      case "inventory": return <Inventory canAdd={canAdd} canModify={canModify} />;
      case "stock-movements": return <StockMovements canAdd={canAdd} canModify={canModify} />;
      case "purchase-orders": return <PurchaseOrders canAdd={canAdd} canModify={canModify} canEdit={role === "Admin"} />;
      case "users": return canViewUsers ? <Users /> : <Dashboard />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)", fontFamily: "var(--font-sans)" }}>
      <Sidebar activePage={activePage} onNavigate={handleNavigate} userRole={role} userName={currentUser?.fullName ?? ""} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3" style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            <span>Electronics Corp</span><span>/</span><span style={{ color: "var(--foreground)", fontWeight: 500 }}>{pageTitles[activePage]}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg px-3 py-1.5" style={{ background: "#10b98118", color: "#10b981", fontSize: 11, fontWeight: 600 }}>● System Online</div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>June 17, 2026</div>
            {currentUser && (
              <div className="flex items-center gap-2 pl-3" style={{ borderLeft: "1px solid var(--border)" }}>
                <div className="flex items-center justify-center rounded-full" style={{ width: 26, height: 26, background: "var(--primary)", color: "#fff", fontSize: 10, fontWeight: 700 }}>
                  {currentUser.fullName.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", lineHeight: 1.2 }}>{currentUser.fullName}</div>
                  <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{currentUser.userRole}</div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="p-6">{renderPage()}</div>
      </main>
    </div>
  );
}

export default function App() {
  const [currentUserID, setCurrentUserID] = useState<number | null>(null);

  if (!currentUserID) {
    return <SignIn onLogin={(userID) => setCurrentUserID(userID)} />;
  }

  return (
    <DataProvider currentUserID={currentUserID}>
      <AppInner onLogout={() => setCurrentUserID(null)} />
    </DataProvider>
  );
}