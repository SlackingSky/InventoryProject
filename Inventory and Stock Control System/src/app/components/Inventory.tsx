import { useState } from "react";
import { DataTable, MonoValue } from "./DataTable";
import { Modal, Field, Input, Select, FormGrid } from "./Modal";
import { useData } from "../context/DataContext";
import type { Inventory as InventoryType } from "../data/mockData";
import { Plus } from "lucide-react";

type InvForm = {
  warehouseID: number;
  productID: number;
  productQuantity: number;
};

const blank = (): InvForm => ({ warehouseID: 0, productID: 0, productQuantity: 1 });

export function Inventory({ canAdd = true }: { canAdd?: boolean; }) {
  const { inventory, products, warehouses, addInventory } = useData();
  const [modal, setModal] = useState<"create" | null>(null);
  const [confirmAction, setConfirmAction] = useState<"add" | null>(null);
  const [form, setForm] = useState<InvForm>(blank());
  const [error, setError] = useState("");

  const openCreate = () => {
    setForm({ ...blank(), warehouseID: warehouses[0]?.warehouseID || 0, productID: products[0]?.productID || 0 });
    setError("");
    setModal("create");
  };

  const handlePreSave = () => {
    if (!form.warehouseID) return setError("Please select a warehouse.");
    if (!form.productID) return setError("Please select a product.");
    if (form.productQuantity <= 0) return setError("Quantity must be greater than zero.");
    setConfirmAction("add");
  };

  const executeAction = () => {
    if (confirmAction === "add") addInventory(form);
    setConfirmAction(null);
    setModal(null);
  };

  const set = <K extends keyof InvForm>(k: K, v: InvForm[K]) => setForm((p) => ({ ...p, [k]: v }));

  const columns = [
    { key: "inventoryID", label: "ID", sortable: true, width: "100px", render: (r: InventoryType) => <MonoValue value={r.inventoryID} /> },
    { key: "productName", label: "Product", sortable: true, align: "left" as const, render: (r: InventoryType) => <span style={{ fontWeight: 500 }}>{r.productName}</span> },
    { key: "warehouseName", label: "Warehouse", sortable: true, align: "left" as const, render: (r: InventoryType) => <span className="text-sm text-gray-500">{r.warehouseName}</span> },
    { key: "productQuantity", label: "Quantity", sortable: true, render: (r: InventoryType) => <MonoValue value={r.productQuantity} /> }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold mb-1">Live Inventory</h1>
        <p className="text-sm text-gray-500">Real-time stock levels across all locations.</p>
      </div>

      <DataTable 
        title="Current Stock" subtitle={`${inventory.length} records`} columns={columns} data={inventory} searchFields={["productName", "warehouseName"]} rowKey={(r) => r.inventoryID}
        actions={canAdd ? <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"><Plus size={16} /> Manual Override</button> : undefined}
      />

      <Modal title="Manual Inventory Override" open={modal === "create"} onClose={() => setModal(null)} onSubmit={handlePreSave} submitLabel="Save Override" size="md">
        <div className="mb-4 p-3 rounded-lg bg-amber-50 text-amber-700 text-sm border border-amber-100">
          <strong>Warning:</strong> This overrides standard workflow. Use for system seeding or urgent corrections only.
        </div>
        {error && <div className="mb-4 px-4 py-3 rounded bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>}
        <FormGrid>
          <Field label="Warehouse" required>
            <Select value={form.warehouseID.toString()} onChange={(e) => set("warehouseID", parseInt(e.target.value) || 0)}>
              <option value="0">Select warehouse...</option>
              {warehouses.map((w) => <option key={w.warehouseID} value={w.warehouseID}>{w.warehouseName}</option>)}
            </Select>
          </Field>
          <Field label="Product" required>
            <Select value={form.productID.toString()} onChange={(e) => set("productID", parseInt(e.target.value) || 0)}>
              <option value="0">Select product...</option>
              {products.map((p) => <option key={p.productID} value={p.productID}>{p.productName}</option>)}
            </Select>
          </Field>
          <Field label="Quantity to Add" required>
            <Input type="number" min={1} value={form.productQuantity} onChange={(e) => set("productQuantity", parseInt(e.target.value) || 0)} />
          </Field>
        </FormGrid>
      </Modal>

      <Modal title="Confirm Override" open={!!confirmAction} onClose={() => setConfirmAction(null)} onSubmit={executeAction} submitLabel="Yes, Apply" size="sm">
        <div className="p-2 text-sm text-gray-800">
          Are you sure you want to apply this manual inventory adjustment?
        </div>
      </Modal>
    </div>
  );
}