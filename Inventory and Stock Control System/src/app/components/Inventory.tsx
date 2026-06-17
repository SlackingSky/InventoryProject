import { useState } from "react";
import { DataTable, Badge, MonoValue } from "./DataTable";
import { Modal, Field, Select, Input, FormGrid, ConfirmDialog } from "./Modal";
import { useData } from "../context/DataContext";
import type { Inventory as InventoryType } from "../data/mockData";
import { Plus, Pencil, Trash2 } from "lucide-react";

type InventoryForm = Omit<InventoryType, "inventoryID">;
const blank = (): InventoryForm => ({ productID: "", warehouseID: "", productQuantity: 0 });

export function Inventory({ canAdd = true, canModify = true }: { canAdd?: boolean; canModify?: boolean }) {
  const { inventory, products, warehouses, addInventory, updateInventory, deleteInventory } = useData();
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [form, setForm] = useState<InventoryForm>(blank());
  const [selected, setSelected] = useState<InventoryType | null>(null);
  const [error, setError] = useState("");

  const openCreate = () => { setForm({ ...blank(), productID: products[0]?.productID ?? "", warehouseID: warehouses[0]?.warehouseID ?? "" }); setError(""); setModal("create"); };
  const openEdit = (i: InventoryType) => { setSelected(i); setForm({ productID: i.productID, warehouseID: i.warehouseID, productQuantity: i.productQuantity }); setError(""); setModal("edit"); };
  const openDelete = (i: InventoryType) => { setSelected(i); setModal("delete"); };

  const handleSave = () => {
    if (!form.productID) { setError("Product is required."); return; }
    if (!form.warehouseID) { setError("Warehouse is required."); return; }
    if (form.productQuantity < 0) { setError("Quantity cannot be negative."); return; }
    if (modal === "create") {
      const exists = inventory.find((i) => i.productID === form.productID && i.warehouseID === form.warehouseID);
      if (exists) { setError("An inventory record already exists for this product and warehouse."); return; }
      addInventory(form);
    } else if (selected) {
      updateInventory({ ...selected, ...form });
    }
    setModal(null);
  };

  const handleDelete = () => { if (selected) deleteInventory(selected.inventoryID); setModal(null); };
  const set = <K extends keyof InventoryForm>(k: K, v: InventoryForm[K]) => setForm((p) => ({ ...p, [k]: v }));

  const enriched = inventory.map((i) => ({ ...i, _product: products.find((p) => p.productID === i.productID), _warehouse: warehouses.find((w) => w.warehouseID === i.warehouseID) }));
  type Row = typeof enriched[0];

  const columns = [
    { key: "inventoryID", label: "ID", width: "100px", render: (row: Row) => <MonoValue value={row.inventoryID} /> },
    { key: "productID", label: "Product", sortable: true, align: "left" as const, render: (row: Row) => (
      <div><div style={{ fontWeight: 500, fontSize: 13 }}>{row._product?.productName ?? row.productID}</div><div style={{ color: "var(--muted-foreground)", fontSize: 11 }}><MonoValue value={row.productID} /></div></div>
    )},
    { key: "warehouseID", label: "Warehouse", sortable: true, render: (row: Row) => <Badge label={row._warehouse?.warehouseName.split(" ").slice(0, 3).join(" ") ?? row.warehouseID} color="#8b5cf6" /> },
    { key: "productQuantity", label: "Quantity", sortable: true, render: (row: Row) => {
      const p = row._product;
      const qty = row.productQuantity;
      const critical = p && qty <= p.minimumStockQuantity;
      const low = p && qty <= p.reorderLevel && !critical;
      return <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: critical ? "#ef4444" : low ? "#f59e0b" : "#10b981" }}>{qty.toLocaleString()}</span>;
    }},
    { key: "status", label: "Status", render: (row: Row) => {
      const p = row._product;
      if (!p) return null;
      const qty = row.productQuantity;
      if (qty <= p.minimumStockQuantity) return <Badge label="Critical" color="#ef4444" />;
      if (qty <= p.reorderLevel) return <Badge label="Low Stock" color="#f59e0b" />;
      return <Badge label="In Stock" color="#10b981" />;
    }},
    { key: "reorderLevel", label: "Reorder Lvl", render: (row: Row) => <MonoValue value={row._product?.reorderLevel ?? "—"} /> },
    { key: "estValue", label: "Est. Value", render: (row: Row) => <MonoValue value={`Php ${((row._product?.price ?? 0) * row.productQuantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} /> },
    ...(canModify ? [{ key: "actions", label: "", width: "80px", render: (row: Row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors" style={{ color: "var(--muted-foreground)" }}><Pencil size={13} /></button>
        <button onClick={() => openDelete(row)} className="p-1.5 rounded-lg hover:bg-[#ef444418] transition-colors" style={{ color: "#ef4444" }}><Trash2 size={13} /></button>
      </div>
    )}] : []),
  ];

  return (
    <div className="space-y-4">
      <div><h1 style={{ color: "var(--foreground)", marginBottom: 4 }}>Inventory</h1><p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Live stock quantities per product per warehouse.</p></div>
      <DataTable title="Inventory Records" subtitle={`${inventory.length} records across ${warehouses.length} warehouses`} columns={columns} data={enriched} searchFields={["productID", "warehouseID"]} rowKey={(r) => r.inventoryID}
        actions={canAdd ? <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500 }}><Plus size={14} />Add Record</button> : undefined}
      />

      <Modal title={modal === "create" ? "Add Inventory Record" : "Edit Inventory Record"} open={modal === "create" || modal === "edit"} onClose={() => setModal(null)} onSubmit={handleSave} submitLabel={modal === "create" ? "Create" : "Save Changes"} size="sm">
        {error && <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: "#ef444418", color: "#ef4444", fontSize: 12 }}>{error}</div>}
        <Field label="Product" required>
          <Select value={form.productID} onChange={(e) => set("productID", e.target.value)} disabled={modal === "edit"}>
            <option value="">Select product...</option>
            {products.map((p) => <option key={p.productID} value={p.productID}>{p.productName}</option>)}
          </Select>
        </Field>
        <Field label="Warehouse" required>
          <Select value={form.warehouseID} onChange={(e) => set("warehouseID", e.target.value)} disabled={modal === "edit"}>
            <option value="">Select warehouse...</option>
            {warehouses.map((w) => <option key={w.warehouseID} value={w.warehouseID}>{w.warehouseName}</option>)}
          </Select>
        </Field>
        <Field label="Quantity" required hint="Current stock count at this location">
          <Input type="number" min={0} value={form.productQuantity} onChange={(e) => set("productQuantity", parseInt(e.target.value) || 0)} />
        </Field>
      </Modal>

      <ConfirmDialog open={modal === "delete"} onClose={() => setModal(null)} onConfirm={handleDelete} label={`${enriched.find((i) => i.inventoryID === selected?.inventoryID)?._product?.productName ?? selected?.inventoryID}`} />
    </div>
  );
}
