import { useState } from "react";
import { DataTable, MonoValue } from "./DataTable";
import { Modal, Field, Input } from "./Modal";
import { useData } from "../context/DataContext";
import type { Warehouse } from "../data/mockData";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";

type WarehouseForm = Omit<Warehouse, "warehouseID">;
const blank = (): WarehouseForm => ({ warehouseName: "", warehouseLocation: "" });

export function Warehouses({ canAdd = true, canModify = true }: { canAdd?: boolean; canModify?: boolean }) {
  const { warehouses, inventory, products, addWarehouse, updateWarehouse, deleteWarehouse } = useData();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [confirmAction, setConfirmAction] = useState<"add" | "edit" | "delete" | null>(null);
  const [form, setForm] = useState<WarehouseForm>(blank());
  const [selected, setSelected] = useState<Warehouse | null>(null);
  const [error, setError] = useState("");

  const openCreate = () => { setForm(blank()); setError(""); setModal("create"); };
  const openEdit = (w: Warehouse) => { setSelected(w); setForm({ warehouseName: w.warehouseName, warehouseLocation: w.warehouseLocation }); setError(""); setModal("edit"); };
  const openDelete = (w: Warehouse) => { setSelected(w); setConfirmAction("delete"); };

  const handlePreSave = () => {
    if (!form.warehouseName.trim()) return setError("Warehouse name is required.");
    if (!form.warehouseLocation.trim()) return setError("Warehouse location is required.");
    setConfirmAction(modal === "create" ? "add" : "edit");
  };

  const executeAction = () => {
    if (confirmAction === "add") addWarehouse(form);
    else if (confirmAction === "edit" && selected) updateWarehouse({ ...selected, ...form });
    else if (confirmAction === "delete" && selected) deleteWarehouse(selected.warehouseID);
    setConfirmAction(null);
    setModal(null);
  };

  const set = <K extends keyof WarehouseForm>(k: K, v: WarehouseForm[K]) => setForm((p) => ({ ...p, [k]: v }));

  const getMetrics = (id: number) => {
    const items = inventory.filter((i) => i.warehouseID === id);
    const units = items.reduce((sum, i) => sum + i.productQuantity, 0);
    const val = items.reduce((sum, i) => {
      const p = products.find((prod) => prod.productID === i.productID);
      return sum + (p ? p.price * i.productQuantity : 0);
    }, 0);
    return { units, val };
  };

  const columns = [
    { key: "warehouseID", label: "ID", sortable: true, width: "100px", render: (r: Warehouse) => <MonoValue value={r.warehouseID} /> },
    { key: "warehouseName", label: "Facility Name", sortable: true, align: "left" as const, render: (r: Warehouse) => <span style={{ fontWeight: 500 }}>{r.warehouseName}</span> },
    { key: "warehouseLocation", label: "Location", align: "left" as const, render: (r: Warehouse) => (
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <MapPin size={13} /> {r.warehouseLocation}
      </div>
    )},
    { key: "units", label: "Total Units", align: "right" as const, render: (r: Warehouse) => <MonoValue value={getMetrics(r.warehouseID).units.toLocaleString()} /> },
    { key: "value", label: "Est. Stock Value", align: "right" as const, render: (r: Warehouse) => <MonoValue value={`Php ${getMetrics(r.warehouseID).val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} /> },
    ...(canModify ? [{ key: "actions", label: "Actions", width: "100px", render: (r: Warehouse) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openEdit(r)}><Pencil size={16} className="text-blue-500 hover:opacity-80" /></button>
        <button onClick={() => openDelete(r)}><Trash2 size={16} className="text-red-500 hover:opacity-80" /></button>
      </div>
    )}] : [])
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold mb-1">Warehouses</h1>
        <p className="text-sm text-gray-500">Manage storage facilities and distribution centers.</p>
      </div>

      <DataTable 
        title="Facilities Overview" subtitle={`${warehouses.length} locations`} columns={columns} data={warehouses} searchFields={["warehouseName", "warehouseLocation"]} rowKey={(r) => r.warehouseID}
        actions={canAdd ? <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"><Plus size={16} /> Add Facility</button> : undefined}
      />

      <Modal title={modal === "create" ? "Add Facility" : "Edit Facility"} open={modal === "create" || modal === "edit"} onClose={() => setModal(null)} onSubmit={handlePreSave} submitLabel={modal === "create" ? "Create Facility" : "Save Changes"} size="sm">
        {error && <div className="mb-4 px-4 py-3 rounded bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>}
        <Field label="Facility Name" required><Input placeholder="e.g. West Coast Hub" value={form.warehouseName} onChange={(e) => set("warehouseName", e.target.value)} /></Field>
        <Field label="Location / Address" required><Input placeholder="123 Industrial Pkwy, City, State" value={form.warehouseLocation} onChange={(e) => set("warehouseLocation", e.target.value)} /></Field>
      </Modal>

      <Modal title="Confirm Action" open={!!confirmAction} onClose={() => setConfirmAction(null)} onSubmit={executeAction} submitLabel="Yes, Proceed" size="sm">
        <div className="p-2 text-sm text-gray-800">
          Are you sure you want to <strong>{confirmAction === "add" ? "add this new" : confirmAction === "edit" ? "save changes to this" : "delete this"}</strong> facility?
          {confirmAction === "delete" && <div className="mt-2 text-xs text-red-500 font-medium">Warning: Deleting a warehouse will orphan all associated inventory records.</div>}
        </div>
      </Modal>
    </div>
  );
}