import { useState } from "react";
import { DataTable, MonoValue } from "./DataTable";
import { Modal, Field, Input, ConfirmDialog } from "./Modal";
import { useData } from "../context/DataContext";
import type { Warehouse } from "../data/mockData";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";

const blank = (): Omit<Warehouse, "warehouseID"> => ({ warehouseName: "", warehouseLocation: "" });

export function Warehouses({ canAdd = true, canModify = true }: { canAdd?: boolean; canModify?: boolean }) {
  const { warehouses, inventory, products, addWarehouse, updateWarehouse, deleteWarehouse } = useData();
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [form, setForm] = useState(blank());
  const [selected, setSelected] = useState<Warehouse | null>(null);
  const [error, setError] = useState("");

  const openCreate = () => { setForm(blank()); setError(""); setModal("create"); };
  const openEdit = (w: Warehouse) => { setSelected(w); setForm({ warehouseName: w.warehouseName, warehouseLocation: w.warehouseLocation }); setError(""); setModal("edit"); };
  const openDelete = (w: Warehouse) => { setSelected(w); setModal("delete"); };

  const handleSave = () => {
    if (!form.warehouseName.trim()) { setError("Warehouse name is required."); return; }
    if (!form.warehouseLocation.trim()) { setError("Location is required."); return; }
    if (modal === "create") addWarehouse(form);
    else if (selected) updateWarehouse({ ...selected, ...form });
    setModal(null);
  };

  const handleDelete = () => { if (selected) deleteWarehouse(selected.warehouseID); setModal(null); };
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const columns = [
    { key: "warehouseID", label: "ID", sortable: true, width: "100px", render: (row: Warehouse) => <MonoValue value={row.warehouseID} /> },
    { key: "warehouseName", label: "Warehouse Name", sortable: true, align: "left" as const },
    { key: "warehouseLocation", label: "Location", align: "left" as const, render: (row: Warehouse) => <span className="flex items-center gap-1" style={{ fontSize: 12, color: "var(--muted-foreground)" }}><MapPin size={12} />{row.warehouseLocation}</span> },
    { key: "uniqueProducts", label: "Unique Products", render: (row: Warehouse) => <MonoValue value={inventory.filter((i) => i.warehouseID === row.warehouseID).length} /> },
    { key: "totalUnits", label: "Total Units", render: (row: Warehouse) => <MonoValue value={inventory.filter((i) => i.warehouseID === row.warehouseID).reduce((s, i) => s + i.productQuantity, 0).toLocaleString()} /> },
    { key: "totalValue", label: "Est. Stock Value", render: (row: Warehouse) => {
      const val = inventory.filter((i) => i.warehouseID === row.warehouseID).reduce((s, i) => {
        const p = products.find((p) => p.productID === i.productID);
        return s + (p ? p.price * i.productQuantity : 0);
      }, 0);
      return <MonoValue value={`Php ${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />;
    }},
    ...(canModify ? [{ key: "actions", label: "", width: "80px", render: (row: Warehouse) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors" style={{ color: "var(--muted-foreground)" }}><Pencil size={13} /></button>
        <button onClick={() => openDelete(row)} className="p-1.5 rounded-lg hover:bg-[#ef444418] transition-colors" style={{ color: "#ef4444" }}><Trash2 size={13} /></button>
      </div>
    )}] : []),
  ];

  return (
    <div className="space-y-4">
      <div><h1 style={{ color: "var(--foreground)", marginBottom: 4 }}>Warehouses</h1><p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Storage locations where inventory is held.</p></div>
      <DataTable title="Warehouse Locations" subtitle={`${warehouses.length} active warehouses`} columns={columns} data={warehouses} searchFields={["warehouseName", "warehouseLocation"]} rowKey={(r) => r.warehouseID}
        actions={canAdd ? <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500 }}><Plus size={14} />Add Warehouse</button> : undefined}
      />
      <Modal title={modal === "create" ? "Add Warehouse" : "Edit Warehouse"} open={modal === "create" || modal === "edit"} onClose={() => setModal(null)} onSubmit={handleSave} submitLabel={modal === "create" ? "Create" : "Save Changes"} size="sm">
        {error && <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: "#ef444418", color: "#ef4444", fontSize: 12 }}>{error}</div>}
        <Field label="Warehouse Name" required><Input placeholder="e.g. North Distribution Center" value={form.warehouseName} onChange={(e) => set("warehouseName", e.target.value)} /></Field>
        <Field label="Location" required><Input placeholder="e.g. 123 Logistics Blvd, Chicago, IL" value={form.warehouseLocation} onChange={(e) => set("warehouseLocation", e.target.value)} /></Field>
      </Modal>
      <ConfirmDialog open={modal === "delete"} onClose={() => setModal(null)} onConfirm={handleDelete} label={selected?.warehouseName ?? ""} />
    </div>
  );
}
