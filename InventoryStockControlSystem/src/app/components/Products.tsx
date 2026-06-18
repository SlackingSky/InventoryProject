import { useState } from "react";
import { DataTable, Badge, MonoValue } from "./DataTable";
import { Modal, Field, Input, Textarea, Select, FormGrid } from "./Modal";
import { useData } from "../context/DataContext";
import type { Product } from "../data/mockData";
import { Plus, Pencil, Trash2 } from "lucide-react";

type ProductForm = Omit<Product, "productID" | "categoryName" | "supplierName">;
const blank = (): ProductForm => ({ categoryID: 0, supplierID: 0, productName: "", description: "", price: 0, leadTime: 7, reorderLevel: 20, minimumStockQuantity: 10 });

export function Products({ canAdd = true, canModify = true }: { canAdd?: boolean; canModify?: boolean }) {
  const { products, categories, suppliers, inventory, addProduct, updateProduct, deleteProduct } = useData();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [confirmAction, setConfirmAction] = useState<"add" | "edit" | "delete" | null>(null);
  const [form, setForm] = useState<ProductForm>(blank());
  const [selected, setSelected] = useState<Product | null>(null);
  const [error, setError] = useState("");

  const openCreate = () => { setForm({ ...blank(), categoryID: categories[0]?.categoryID ?? 0, supplierID: suppliers[0]?.supplierID ?? 0 }); setError(""); setModal("create"); };
  const openEdit = (p: Product) => { setSelected(p); setForm({ categoryID: p.categoryID, supplierID: p.supplierID, productName: p.productName, description: p.description, price: p.price, leadTime: p.leadTime, reorderLevel: p.reorderLevel, minimumStockQuantity: p.minimumStockQuantity }); setError(""); setModal("edit"); };
  const openDelete = (p: Product) => { setSelected(p); setConfirmAction("delete"); };

  const handlePreSave = () => {
    if (!form.productName.trim()) return setError("Product name is required.");
    if (!form.categoryID) return setError("Category is required.");
    if (!form.supplierID) return setError("Supplier is required.");
    if (form.price <= 0) return setError("Price must be greater than 0.");
    setConfirmAction(modal === "create" ? "add" : "edit");
  };

  const executeAction = () => {
    if (confirmAction === "add") addProduct(form);
    else if (confirmAction === "edit" && selected) updateProduct({ ...selected, ...form });
    else if (confirmAction === "delete" && selected) deleteProduct(selected.productID);
    setConfirmAction(null);
    setModal(null);
  };

  const set = <K extends keyof ProductForm>(k: K, v: ProductForm[K]) => setForm((p) => ({ ...p, [k]: v }));

  const getTotalQty = (id: number) => inventory.filter((i) => i.productID === id).reduce((s, i) => s + i.productQuantity, 0);

  const columns = [
    { key: "productID", label: "ID", sortable: true, width: "90px", render: (row: Product) => <MonoValue value={row.productID} /> },
    { key: "productName", label: "Product Name", sortable: true, align: "left" as const },
    { key: "categoryName", label: "Category", sortable: true, align: "left" as const, render: (row: Product) => <Badge label={row.categoryName} color="#3b82f6" /> },
    { key: "price", label: "Price", sortable: true, render: (row: Product) => <MonoValue value={`Php ${row.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} /> },
    { key: "stock", label: "Total Stock", render: (row: Product) => {
      const qty = getTotalQty(row.productID);
      const critical = qty <= row.minimumStockQuantity;
      const low = qty <= row.reorderLevel && !critical;
      return <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: critical ? "#ef4444" : low ? "#f59e0b" : "var(--foreground)", fontWeight: critical || low ? 600 : 400 }}>{qty}{critical && " ⚠"}{!critical && low && " ↓"}</span>;
    }},
    { key: "reorderLevel", label: "Reorder Level", render: (row: Product) => <MonoValue value={row.reorderLevel} /> },
    { key: "supplierName", label: "Supplier", align: "left" as const, render: (row: Product) => <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{row.supplierName}</span> },
    ...(canModify ? [{ key: "actions", label: "", width: "80px", render: (row: Product) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors" style={{ color: "var(--muted-foreground)" }}><Pencil size={13} /></button>
        <button onClick={() => openDelete(row)} className="p-1.5 rounded-lg hover:bg-[#ef444418] transition-colors" style={{ color: "#ef4444" }}><Trash2 size={13} /></button>
      </div>
    )}] : []),
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 style={{ color: "var(--foreground)", marginBottom: 4 }}>Products</h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Master catalog of all electronics products.</p>
      </div>
      <DataTable title="Product Catalog" subtitle={`${products.length} products`} columns={columns} data={products} searchFields={["productName", "productID"]} rowKey={(r) => r.productID}
        actions={canAdd ? <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500 }}><Plus size={14} />Add Product</button> : undefined}
      />

      <Modal title={modal === "create" ? "Add Product" : "Edit Product"} open={modal === "create" || modal === "edit"} onClose={() => setModal(null)} onSubmit={handlePreSave} submitLabel={modal === "create" ? "Create Product" : "Save Changes"} size="lg">
        {error && <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: "#ef444418", color: "#ef4444", fontSize: 12 }}>{error}</div>}
        <Field label="Product Name" required><Input placeholder="e.g. iPhone 16 Pro Max" value={form.productName} onChange={(e) => set("productName", e.target.value)} /></Field>
        <Field label="Description"><Textarea placeholder="Describe the product..." value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} /></Field>
        <FormGrid>
          <Field label="Category" required>
            <Select value={form.categoryID.toString()} onChange={(e) => set("categoryID", parseInt(e.target.value) || 0)}>
              <option value="0">Select category...</option>
              {categories.map((c) => <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>)}
            </Select>
          </Field>
          <Field label="Supplier" required>
            <Select value={form.supplierID.toString()} onChange={(e) => set("supplierID", parseInt(e.target.value) || 0)}>
              <option value="0">Select supplier...</option>
              {suppliers.map((s) => <option key={s.supplierID} value={s.supplierID}>{s.supplierName}</option>)}
            </Select>
          </Field>
          <Field label="Price (Php)" required><Input type="number" value={form.price || ""} onChange={(e) => set("price", parseFloat(e.target.value) || 0)} /></Field>
          <Field label="Lead Time (Days)"><Input type="number" min={0} value={form.leadTime} onChange={(e) => set("leadTime", parseInt(e.target.value) || 0)} /></Field>
          <Field label="Reorder Level"><Input type="number" min={0} value={form.reorderLevel} onChange={(e) => set("reorderLevel", parseInt(e.target.value) || 0)} /></Field>
          <Field label="Minimum Stock Qty"><Input type="number" min={0} value={form.minimumStockQuantity} onChange={(e) => set("minimumStockQuantity", parseInt(e.target.value) || 0)} /></Field>
        </FormGrid>
      </Modal>

      <Modal title="Confirm Action" open={!!confirmAction} onClose={() => setConfirmAction(null)} onSubmit={executeAction} submitLabel="Yes, Proceed" size="sm">
        <div className="p-2 text-sm" style={{ color: "var(--foreground)" }}>
          Are you sure you want to <strong>{confirmAction === "add" ? "add this new" : confirmAction === "edit" ? "save changes to this" : "delete this"}</strong> product?
          {confirmAction === "delete" && <div className="mt-2 text-xs text-red-500">Warning: Deleting a product will affect inventory logs and purchase orders.</div>}
        </div>
      </Modal>
    </div>
  );
}