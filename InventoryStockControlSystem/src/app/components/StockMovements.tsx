import { useState } from "react";
import { DataTable, Badge, MonoValue } from "./DataTable";
import { Modal, Field, Input, Select, FormGrid } from "./Modal";
import { useData } from "../context/DataContext";
import type { MovementType } from "../data/mockData";
import { Plus, Trash2 } from "lucide-react";

type MovementForm = { warehouseID: number; productID: number; movementType: MovementType; movementQuantity: number; movementReference: string; };
const blank = (): MovementForm => ({ warehouseID: 0, productID: 0, movementType: "Stock In", movementQuantity: 1, movementReference: "" });
const typeColors: Record<MovementType, string> = { "Stock In": "#10b981", "Stock Out": "#3b82f6", Transfer: "#8b5cf6", Adjustment: "#f59e0b", Return: "#ec4899" };

const getUnit = (productName: string, products: any[]) => {
  const product = products.find((p: any) => (p.productName || p.ProductName) === productName);
  if (!product) return "pcs";
  const cat = (product.categoryName || product.CategoryName || "").toLowerCase();
  if (cat.includes("audio")) return "sets";
  if (cat.includes("laptop") || cat.includes("network")) return "units";
  if (cat.includes("peripheral")) return "boxes";
  return "pcs"; 
};

export function StockMovements({ canAdd = true, canModify = true }: { canAdd?: boolean; canModify?: boolean }) {
  const { stockMovements, products, warehouses, currentUserID, addStockMovement, deleteStockMovement } = useData();
  const [modal, setModal] = useState<"create" | null>(null);
  const [confirmAction, setConfirmAction] = useState<"add" | "delete" | null>(null);
  const [form, setForm] = useState<MovementForm>(blank());
  const [selected, setSelected] = useState<any | null>(null);
  const [error, setError] = useState("");

  const openCreate = () => { 
    setForm({ 
      ...blank(), 
      warehouseID: (warehouses[0] as any)?.warehouseID ?? (warehouses[0] as any)?.warehouseId ?? 0, 
      productID: (products[0] as any)?.productID ?? (products[0] as any)?.productId ?? 0 
    }); 
    setError(""); 
    setModal("create"); 
  };
  
  const openDelete = (r: any) => { setSelected(r); setConfirmAction("delete"); };

  const handlePreSave = () => {
    if (!form.warehouseID) return setError("Please select a warehouse.");
    if (!form.productID) return setError("Please select a product.");
    if (form.movementQuantity === 0) return setError("Quantity cannot be zero.");
    if (!form.movementReference.trim()) return setError("A reference code or reason is required.");
    
    setError("");
    setConfirmAction("add");
  };

  const executeAction = async () => {
    setError("");
    try {
        if (confirmAction === "add") await addStockMovement({ ...form, processedBy: currentUserID });
        else if (confirmAction === "delete" && selected) await deleteStockMovement(selected.stockMovementID ?? selected.stockMovementId);
        setConfirmAction(null);
        setModal(null);
    } catch { setError("Database transaction failed. Please check your inputs or stock levels."); }
  };

  const set = <K extends keyof MovementForm>(k: K, v: MovementForm[K]) => setForm((p) => ({ ...p, [k]: v }));

  const columns = [
    { key: "stockMovementID", label: "ID", sortable: true, width: "100px", render: (r: any) => <MonoValue value={r.stockMovementID ?? r.stockMovementId} /> },
    { key: "movementDate", label: "Date", sortable: true, render: (r: any) => <span className="text-xs text-gray-500">{new Date(r.movementDate).toLocaleString()}</span> },
    { key: "movementType", label: "Type", render: (r: any) => <Badge label={r.movementType} color={typeColors[r.movementType as MovementType]} /> },
    { key: "productName", label: "Product", align: "left" as const, render: (r: any) => <span className="font-medium">{r.productName}</span> },
    { key: "warehouseName", label: "Warehouse", align: "left" as const, render: (r: any) => <span className="text-sm text-gray-500">{r.warehouseName}</span> },
    { key: "movementQuantity", label: "Qty", render: (r: any) => {
        const isPos = ["Stock In", "Return"].includes(r.movementType) || (r.movementType === "Adjustment" && r.movementQuantity > 0);
        return <span className={`font-mono text-sm font-semibold ${isPos ? "text-emerald-500" : "text-red-500"}`}>{isPos ? "+" : ""}{r.movementQuantity} {getUnit(r.productName, products)}</span>;
    }},
    { key: "movementReference", label: "Ref", render: (r: any) => <MonoValue value={r.movementReference} /> },
    ...(canModify ? [{ key: "actions", label: "Actions", width: "50px", render: (r: any) => (
      <button onClick={() => openDelete(r)}><Trash2 size={16} className="text-red-500 hover:opacity-80" /></button>
    )}] : [])
  ];

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold mb-1">Stock Movements</h1><p className="text-sm text-gray-500">Audit log of inventory changes.</p></div>
      <DataTable title="History" subtitle={`${stockMovements.length} records`} columns={columns} data={stockMovements} searchFields={["movementReference", "productName"]} rowKey={(r: any) => r.stockMovementID ?? r.stockMovementId}
        actions={canAdd ? <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"><Plus size={16} /> Record Movement</button> : undefined}
      />
      
      <Modal title="Record Stock Movement" open={modal === "create"} onClose={() => setModal(null)} onSubmit={handlePreSave} submitLabel="Record Movement" size="md">
        {error && <div className="mb-4 px-4 py-3 rounded-lg border bg-red-50 border-red-200 text-red-600 text-sm font-medium sticky top-0 z-10 shadow-sm">{error}</div>}
        
        <FormGrid>
          <Field label="Warehouse" required><Select value={form.warehouseID.toString()} onChange={(e) => set("warehouseID", parseInt(e.target.value) || 0)}><option value="0">Select...</option>{warehouses.map((w:any) => <option key={w.warehouseID??w.warehouseId} value={w.warehouseID??w.warehouseId}>{w.warehouseName}</option>)}</Select></Field>
          <Field label="Product" required><Select value={form.productID.toString()} onChange={(e) => set("productID", parseInt(e.target.value) || 0)}><option value="0">Select...</option>{products.map((p:any) => <option key={p.productID??p.productId} value={p.productID??p.productId}>{p.productName}</option>)}</Select></Field>
          <Field label="Type" required><Select value={form.movementType} onChange={(e) => set("movementType", e.target.value as MovementType)}>{Object.keys(typeColors).map(t => <option key={t} value={t}>{t}</option>)}</Select></Field>
          <Field label="Quantity" required><Input type="number" value={form.movementQuantity} onChange={(e) => set("movementQuantity", parseInt(e.target.value) || 0)} /></Field>
        </FormGrid>
        <div className="mt-4">
          <Field label="Reference" required hint="e.g. PO-123 or Adjustment Reason"><Input placeholder="e.g. PO-123" value={form.movementReference} onChange={(e) => set("movementReference", e.target.value)} /></Field>
        </div>
      </Modal>

      <Modal title="Confirm Action" open={!!confirmAction} onClose={() => setConfirmAction(null)} onSubmit={executeAction} submitLabel="Yes, Proceed" size="sm">
        {error && <div className="mb-4 px-4 py-3 rounded-lg border bg-red-50 border-red-200 text-red-600 text-sm font-medium sticky top-0 z-10 shadow-sm">{error}</div>}
        <div className="p-2 text-sm text-gray-800">Are you sure you want to <strong>{confirmAction === "add" ? "record this movement" : "delete this movement log"}</strong>?</div>
      </Modal>
    </div>
  );
}