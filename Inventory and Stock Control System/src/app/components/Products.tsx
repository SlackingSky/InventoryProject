import { useState } from "react";
import { DataTable, Badge, MonoValue } from "./DataTable";
import { Modal, Field, Input, Textarea, Select, FormGrid, ConfirmDialog } from "./Modal";
import { useData } from "../context/DataContext";
import type { Product } from "../data/mockData";
import { Plus, Pencil, Trash2 } from "lucide-react";

type ProductForm = Omit<Product, "productID">;
const blank = (): ProductForm => ({ categoryID: "", supplierID: "", productName: "", description: "", price: 0, reorderLevel: 20, minimumStockQuantity: 10 });

export function Products({ canAdd = true, canModify = true }: { canAdd?: boolean; canModify?: boolean }) {
  const { products, categories, suppliers, inventory, addProduct, updateProduct, deleteProduct } = useData();
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [form, setForm] = useState<ProductForm>(blank());
  const [selected, setSelected] = useState<Product | null>(null);
  const [error, setError] = useState("");

  const openCreate = () => { setForm({ ...blank(), categoryID: categories[0]?.categoryID ?? "", supplierID: suppliers[0]?.supplierID ?? "" }); setError(""); setModal("create"); };
  const openEdit = (p: Product) => { setSelected(p); setForm({ categoryID: p.categoryID, supplierID: p.supplierID, productName: p.productName, description: p.description, price: p.price, reorderLevel: p.reorderLevel, minimumStockQuantity: p.minimumStockQuantity }); setError(""); setModal("edit"); };
  const openDelete = (p: Product) => { setSelected(p); setModal("delete"); };

  const handleSave = () => {
    if (!form.productName.trim()) { setError("Product name is required."); return; }
    if (!form.categoryID) { setError("Category is required."); return; }
    if (!form.supplierID) { setError("Supplier is required."); return; }
    if (form.price <= 0) { setError("Price must be greater than 0."); return; }
    if (modal === "create") addProduct(form);
    else if (selected) updateProduct({ ...selected, ...form });
    setModal(null);
  };

  const handleDelete = () => { if (selected) deleteProduct(selected.productID); setModal(null); };
  const set = <K extends keyof ProductForm>(k: K, v: ProductForm[K]) => setForm((p) => ({ ...p, [k]: v }));

  const getTotalQty = (id: string) => inventory.filter((i) => i.productID === id).reduce((s, i) => s + i.productQuantity, 0);

  const columns = [
    { key: "productID", label: "ID", sortable: true, width: "90px", render: (row: Product) => <MonoValue value={row.productID} /> },
    { key: "productName", label: "Product Name", sortable: true, align: "left" as const },
    { key: "categoryID", label: "Category", sortable: true, align: "left" as const, render: (row: Product) => <Badge label={categories.find((c) => c.categoryID === row.categoryID)?.categoryName ?? row.categoryID} color="#3b82f6" /> },
    { key: "price", label: "Price", sortable: true, render: (row: Product) => <MonoValue value={`Php ${row.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} /> },
    { key: "stock", label: "Total Stock", render: (row: Product) => {
      const qty = getTotalQty(row.productID);
      const critical = qty <= row.minimumStockQuantity;
      const low = qty <= row.reorderLevel && !critical;
      return <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: critical ? "#ef4444" : low ? "#f59e0b" : "var(--foreground)", fontWeight: critical || low ? 600 : 400 }}>{qty}{critical && " ⚠"}{!critical && low && " ↓"}</span>;
    }},
    { key: "reorderLevel", label: "Reorder Level", render: (row: Product) => <MonoValue value={row.reorderLevel} /> },
    { key: "supplierID", label: "Supplier", align: "left" as const, render: (row: Product) => <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{suppliers.find((s) => s.supplierID === row.supplierID)?.supplierName ?? row.supplierID}</span> },
    ...(canModify ? [{ key: "actions", label: "", width: "80px", render: (row: Product) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors" style={{ color: "var(--muted-foreground)" }}><Pencil size={13} /></button>
        <button onClick={() => openDelete(row)} className="p-1.5 rounded-lg hover:bg-[#ef444418] transition-colors" style={{ color: "#ef4444" }}><Trash2 size={13} /></button>
      </div>
    )}] : []),
  ];

  return (
    <div className="space-y-4">
      <div><h1 style={{ color: "var(--foreground)", marginBottom: 4 }}>Products</h1><p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Master catalog of all electronics products.</p></div>
      <DataTable title="Product Catalog" subtitle={`${products.length} products`} columns={columns} data={products} searchFields={["productName", "productID"]} rowKey={(r) => r.productID}
        actions={canAdd ? <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500 }}><Plus size={14} />Add Product</button> : undefined}
      />

      <Modal title={modal === "create" ? "Add Product" : "Edit Product"} open={modal === "create" || modal === "edit"} onClose={() => setModal(null)} onSubmit={handleSave} submitLabel={modal === "create" ? "Create Product" : "Save Changes"} size="lg">
        {error && <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: "#ef444418", color: "#ef4444", fontSize: 12 }}>{error}</div>}
        <Field label="Product Name" required><Input placeholder="e.g. iPhone 16 Pro Max 256GB" value={form.productName} onChange={(e) => set("productName", e.target.value)} /></Field>
        <Field label="Description"><Textarea placeholder="Describe the product's features and specifications..." value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} /></Field>
        <FormGrid>
          <Field label="Category" required>
            <Select value={form.categoryID} onChange={(e) => set("categoryID", e.target.value)}>
              <option value="">Select category...</option>
              {categories.map((c) => <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>)}
            </Select>
          </Field>
          <Field label="Supplier" required>
            <Select value={form.supplierID} onChange={(e) => set("supplierID", e.target.value)}>
              <option value="">Select supplier...</option>
              {suppliers.map((s) => <option key={s.supplierID} value={s.supplierID}>{s.supplierName}</option>)}
            </Select>
          </Field>
          <Field label="Price (Php)" required><Input type="text" inputMode="decimal" placeholder="0.00" value={form.price || ""} onChange={(e) => set("price", parseFloat(e.target.value) || 0)} style={{ MozAppearance: "textfield" } as React.CSSProperties} /></Field>
          <Field label="Reorder Level" hint="Triggers a low-stock alert"><Input type="number" min={0} value={form.reorderLevel} onChange={(e) => set("reorderLevel", parseInt(e.target.value) || 0)} /></Field>
          <Field label="Minimum Stock Qty" hint="Absolute safety buffer"><Input type="number" min={0} value={form.minimumStockQuantity} onChange={(e) => set("minimumStockQuantity", parseInt(e.target.value) || 0)} /></Field>
        </FormGrid>
      </Modal>

      <ConfirmDialog open={modal === "delete"} onClose={() => setModal(null)} onConfirm={handleDelete} label={selected?.productName ?? ""} />
    </div>
  );
}
