import { useState } from "react";
import { DataTable, Badge, MonoValue } from "./DataTable";
import { Modal, Field, Select, Input, Textarea, FormGrid, ConfirmDialog } from "./Modal";
import { useData } from "../context/DataContext";
import type { StockMovement, MovementType } from "../data/mockData";
import { Plus, Pencil, Trash2 } from "lucide-react";

const typeColors: Record<string, string> = { "Stock In": "#10b981", "Stock Out": "#ef4444", "Transfer": "#3b82f6", "Adjustment": "#f59e0b", "Return": "#8b5cf6" };
const movementTypes: MovementType[] = ["Stock In", "Stock Out", "Transfer", "Adjustment", "Return"];

type MovForm = Omit<StockMovement, "stockMovementID">;
const blank = (): MovForm => ({ warehouseID: "", productID: "", movementType: "Stock In", movementDate: new Date().toISOString().slice(0, 16), movementQuantity: 1, movementReference: "", processedBy: "" });

export function StockMovements({ canAdd = true, canModify = true }: { canAdd?: boolean; canModify?: boolean }) {
  const { currentUserID, stockMovements, products, warehouses, users, addStockMovement, updateStockMovement, deleteStockMovement } = useData();
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [form, setForm] = useState<MovForm>(blank());
  const [selected, setSelected] = useState<StockMovement | null>(null);
  const [error, setError] = useState("");

  const openCreate = () => { setForm({ ...blank(), warehouseID: warehouses[0]?.warehouseID ?? "", productID: products[0]?.productID ?? "", processedBy: currentUserID }); setError(""); setModal("create"); };
  const openEdit = (m: StockMovement) => { setSelected(m); setForm({ warehouseID: m.warehouseID, productID: m.productID, movementType: m.movementType, movementDate: m.movementDate.slice(0, 16), movementQuantity: m.movementQuantity, movementReference: m.movementReference, processedBy: m.processedBy }); setError(""); setModal("edit"); };
  const openDelete = (m: StockMovement) => { setSelected(m); setModal("delete"); };

  const handleSave = () => {
    if (!form.productID) { setError("Product is required."); return; }
    if (!form.warehouseID) { setError("Warehouse is required."); return; }
    if (!form.movementQuantity) { setError("Quantity is required."); return; }
    if (modal === "create") addStockMovement({ ...form, movementDate: new Date(form.movementDate).toISOString() });
    else if (selected) updateStockMovement({ ...selected, ...form, movementDate: new Date(form.movementDate).toISOString() });
    setModal(null);
  };

  const handleDelete = () => { if (selected) deleteStockMovement(selected.stockMovementID); setModal(null); };
  const set = <K extends keyof MovForm>(k: K, v: MovForm[K]) => setForm((p) => ({ ...p, [k]: v }));

  const sorted = [...stockMovements].sort((a, b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime());

  const columns = [
    { key: "stockMovementID", label: "ID", width: "100px", render: (row: StockMovement) => <MonoValue value={row.stockMovementID} /> },
    { key: "movementDate", label: "Date", sortable: true, render: (row: StockMovement) => (
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
        <div>{new Date(row.movementDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</div>
        <div style={{ color: "var(--muted-foreground)" }}>{new Date(row.movementDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
      </div>
    )},
    { key: "movementType", label: "Type", sortable: true, render: (row: StockMovement) => <Badge label={row.movementType} color={typeColors[row.movementType] ?? "#6b7280"} /> },
    { key: "productID", label: "Product", sortable: true, align: "left" as const, render: (row: StockMovement) => (
      <div><div style={{ fontWeight: 500, fontSize: 13 }}>{products.find((p) => p.productID === row.productID)?.productName.split(" ").slice(0, 4).join(" ")}</div><div style={{ color: "var(--muted-foreground)", fontSize: 11 }}><MonoValue value={row.productID} /></div></div>
    )},
    { key: "warehouseID", label: "Warehouse", align: "left" as const, render: (row: StockMovement) => <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{warehouses.find((w) => w.warehouseID === row.warehouseID)?.warehouseName.split(" ").slice(0, 2).join(" ") ?? row.warehouseID}</span> },
    { key: "movementQuantity", label: "Quantity", sortable: true, render: (row: StockMovement) => (
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, color: row.movementQuantity < 0 ? "#ef4444" : row.movementType === "Stock In" || row.movementType === "Return" ? "#10b981" : "var(--foreground)" }}>
        {row.movementQuantity > 0 && row.movementType === "Stock In" ? "+" : ""}{row.movementQuantity}
      </span>
    )},
    { key: "movementReference", label: "Reference", align: "left" as const, render: (row: StockMovement) => <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{row.movementReference}</span> },
    { key: "processedBy", label: "Processed By", align: "left" as const, render: (row: StockMovement) => <span style={{ fontSize: 12 }}>{users.find((u) => u.userID === row.processedBy)?.fullName ?? row.processedBy}</span> },
    ...(canModify ? [{ key: "actions", label: "", width: "80px", render: (row: StockMovement) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors" style={{ color: "var(--muted-foreground)" }}><Pencil size={13} /></button>
        <button onClick={() => openDelete(row)} className="p-1.5 rounded-lg hover:bg-[#ef444418] transition-colors" style={{ color: "#ef4444" }}><Trash2 size={13} /></button>
      </div>
    )}] : []),
  ];

  return (
    <div className="space-y-4">
      <div><h1 style={{ color: "var(--foreground)", marginBottom: 4 }}>Stock Movements</h1><p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Audit trail of every inventory change.</p></div>
      <DataTable title="Movement Log" subtitle={`${stockMovements.length} records`} columns={columns} data={sorted} searchFields={["productID", "movementReference", "movementType"]} rowKey={(r) => r.stockMovementID}
        actions={canAdd ? <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500 }}><Plus size={14} />Log Movement</button> : undefined}
      />

      <Modal title={modal === "create" ? "Log Stock Movement" : "Edit Movement"} open={modal === "create" || modal === "edit"} onClose={() => setModal(null)} onSubmit={handleSave} submitLabel={modal === "create" ? "Log Movement" : "Save Changes"} size="md">
        {error && <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: "#ef444418", color: "#ef4444", fontSize: 12 }}>{error}</div>}
        <FormGrid>
          <Field label="Product" required>
            <Select value={form.productID} onChange={(e) => set("productID", e.target.value)}>
              <option value="">Select product...</option>
              {products.map((p) => <option key={p.productID} value={p.productID}>{p.productName}</option>)}
            </Select>
          </Field>
          <Field label="Warehouse" required>
            <Select value={form.warehouseID} onChange={(e) => set("warehouseID", e.target.value)}>
              <option value="">Select warehouse...</option>
              {warehouses.map((w) => <option key={w.warehouseID} value={w.warehouseID}>{w.warehouseName}</option>)}
            </Select>
          </Field>
          <Field label="Movement Type" required>
            <Select value={form.movementType} onChange={(e) => set("movementType", e.target.value as MovementType)}>
              {movementTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Quantity" required hint="Use negative for manual adjustments">
            <Input type="number" value={form.movementQuantity} onChange={(e) => set("movementQuantity", parseInt(e.target.value) || 0)} />
          </Field>
          <Field label="Date & Time" required>
            <Input type="datetime-local" value={form.movementDate} onChange={(e) => set("movementDate", e.target.value)} />
          </Field>
          <Field label="Processed By">
            <div style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--muted)", color: "var(--muted-foreground)", fontSize: 13 }}>
              {users.find((u) => u.userID === currentUserID)?.fullName ?? currentUserID}
            </div>
          </Field>
        </FormGrid>
        <Field label="Reference / Reason">
          <Input placeholder="e.g. PO-2026-0041 or Sales Order SO-5521" value={form.movementReference} onChange={(e) => set("movementReference", e.target.value)} />
        </Field>
      </Modal>

      <ConfirmDialog open={modal === "delete"} onClose={() => setModal(null)} onConfirm={handleDelete} label={`movement ${selected?.stockMovementID}`} />
    </div>
  );
}
