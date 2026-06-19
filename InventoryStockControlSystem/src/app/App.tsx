import { useState } from "react";
import { Loader2 } from "lucide-react";
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

const validPages: Page[] = ["dashboard", "products", "categories", "suppliers", "warehouses", "inventory", "stock-movements", "purchase-orders", "users"];

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard", products: "Products", categories: "Categories",
  suppliers: "Suppliers", warehouses: "Warehouses", inventory: "Inventory",
  "stock-movements": "Stock Movements", "purchase-orders": "Purchase Orders", users: "Users",
};

function AppInner({ onLogout }: { onLogout: () => void }) {
  const [activePage, setActivePage] = useState<Page>(() => {
    const savedPage = localStorage.getItem("inventory_active_page");
    return (savedPage && validPages.includes(savedPage as Page)) ? (savedPage as Page) : "dashboard";
  });
  
  const { currentUserID, users, isLoading } = useData();

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[var(--background)] space-y-4">
        <Loader2 size={40} className="animate-spin text-blue-500" />
        <div className="text-center">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Connecting to Database...</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Fetching live inventory and system data</p>
        </div>
      </div>
    );
  }

  const currentUser = users.find((u: any) => (u.userID || u.userId) === currentUserID);
  const role = currentUser?.userRole ?? "Staff";

  const canViewUsers = role === "Admin";
  const canAdd = true;
  const canModify = role === "Admin" || role === "Manager";

  const handleNavigate = (page: Page) => {
    if (page === "users" && !canViewUsers) return;
    localStorage.setItem("inventory_active_page", page);
    setActivePage(page);
  };

  const safeActivePage = (activePage === "users" && !canViewUsers) ? "dashboard" : activePage;

  const renderPage = () => {
    switch (safeActivePage) {
      case "dashboard": return <Dashboard />;
      case "products": return <Products canAdd={canAdd} canModify={canModify} />;
      case "categories": return <Categories canAdd={canAdd} canModify={canModify} />;
      case "suppliers": return <Suppliers canAdd={canAdd} canModify={canModify} />;
      case "warehouses": return <Warehouses canAdd={canAdd} canModify={canModify} />;
      case "inventory": return <Inventory canAdd={canAdd} />;
      case "stock-movements": return <StockMovements canAdd={canAdd} canModify={canModify} />;
      case "purchase-orders": return <PurchaseOrders canAdd={canAdd} canModify={canModify} canEdit={role === "Admin"} />;
      case "users": return <Users />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)", fontFamily: "var(--font-sans)" }}>
      <Sidebar activePage={safeActivePage} onNavigate={handleNavigate} userRole={role} userName={currentUser?.fullName ?? ""} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3" style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            <span>Inventory and Stock Control System</span><span>/</span><span style={{ color: "var(--foreground)", fontWeight: 500 }}>{pageTitles[safeActivePage]}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg px-3 py-1.5" style={{ background: "#10b98118", color: "#10b981", fontSize: 11, fontWeight: 600 }}>System Online</div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            {currentUser && (
              <div className="flex items-center gap-2 pl-3" style={{ borderLeft: "1px solid var(--border)" }}>
                <div className="flex items-center justify-center rounded-full" style={{ width: 26, height: 26, background: "var(--primary)", color: "#fff", fontSize: 10, fontWeight: 700 }}>
                  {currentUser.fullName.split(" ").map((n: string) => n[0]).join("")}
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
  const [currentUserID, setCurrentUserID] = useState<number | null>(() => {
    const savedID = localStorage.getItem("inventory_user_id");
    return savedID ? parseInt(savedID, 10) : null;
  });

  const handleLogin = (userID: number) => {
    localStorage.setItem("inventory_user_id", userID.toString());
    setCurrentUserID(userID);
  };

  const handleLogout = () => {
    localStorage.removeItem("inventory_user_id");
    localStorage.removeItem("inventory_active_page");
    setCurrentUserID(null);
  };

  if (!currentUserID) {
    return <SignIn onLogin={handleLogin} />;
  }

  return (
    <DataProvider currentUserID={currentUserID}>
      <AppInner onLogout={handleLogout} />
    </DataProvider>
  );
}