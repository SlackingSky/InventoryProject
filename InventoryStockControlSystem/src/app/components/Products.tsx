import { useState } from "react";
import { DataTable, Badge, MonoValue } from "./DataTable";
import { Modal, Field, Input, Textarea, Select, FormGrid } from "./Modal";
import { useData } from "../context/DataContext";
import { Plus, Pencil, Trash2 } from "lucide-react";

const blank = () => ({ categoryID: 0, supplierID: 0, productName: "", description: "", price: 0, leadTime: 7, reorderLevel: 20, minimumStockQuantity: 10 });

const getUnit = (productName: string, products: any[]) => {
  const product = products.find((p: any) => p.productName === productName);
  if (!product) return "pcs";
  const cat = (product.categoryName || "").toLowerCase();
  if (cat.includes("audio")) return "sets";
  if (cat.includes("laptop") || cat.includes("network")) return "units";
  if (cat.includes("peripheral")) return "boxes";
  return "pcs"; 
};

export function Products({ canAdd = true, canModify = true }: { canAdd?: boolean; canModify?: boolean }) {
  const { products, categories, suppliers, inventory, addProduct, updateProduct, deleteProduct } = useData();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [confirmAction, setConfirmAction] = useState<"add" | "edit" | "delete" | null>(null);
  const [form, setForm] = useState<any>(blank());
  const [selected, setSelected] = useState<any | null>(null);
  const [error, setError] = useState("");

  const openCreate = () => { setForm({ ...blank(), categoryID: (categories[0] as any)?.categoryID ?? 0, supplierID: (suppliers[0] as any)?.supplierID ?? 0 }); setError(""); setModal("create"); };
  const openEdit = (p: any) => { setSelected(p); setForm({ categoryID: p.categoryID || p.categoryId, supplierID: p.supplierID || p.supplierId, productName: p.productName, description: p.description, price: p.price, leadTime: p.leadTime, reorderLevel: p.reorderLevel, minimumStockQuantity: p.minimumStockQuantity }); setError(""); setModal("edit"); };
  const openDelete = (p: any) => { setSelected(p); setConfirmAction("delete"); };

  const handlePreSave = () => {
    if (!form.productName.trim()) return setError("Product name is required.");
    if (!form.categoryID) return setError("Category is required.");
    if (!form.supplierID) return setError("Supplier is required.");
    if (form.price <= 0) return setError("Price must be greater than 0.");
    setConfirmAction(modal === "create" ? "add" : "edit");
  };

  const executeAction = async () => {
    try {
      if (confirmAction === "add") await addProduct(form);
      else if (confirmAction === "edit" && selected) await updateProduct({ ...selected, ...form });
      else if (confirmAction === "delete" && selected) await deleteProduct(selected.productID || selected.productId);
      setConfirmAction(null);
      setModal(null);
    } catch { setError("Database transaction failed"); }
  };

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const getTotalQty = (id: number) => inventory.filter((i: any) => (i.productID || i.productId) === id).reduce((s: number, i: any) => s + (i.productQuantity || 0), 0);

  const columns = [
    { key: "productID", label: "ID", sortable: true, width: "90px", render: (row: any) => <MonoValue value={row.productID || row.productId} /> },
    { key: "productName", label: "Product Name", sortable: true, align: "left" as const, render: (row: any) => <span className="font-medium text-[var(--foreground)]">{row.productName}</span> },
    { key: "categoryName", label: "Category", sortable: true, align: "left" as const, render: (row: any) => <Badge label={row.categoryName} color="#3b82f6" /> },
    { key: "price", label: "Price", sortable: true, render: (row: any) => <MonoValue value={`Php ${row.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} /> },
    { key: "stock", label: "Total Stock", render: (row: any) => {
      const qty = getTotalQty(row.productID || row.productId);
      const critical = qty <= (row.minimumStockQuantity || 0);
      const low = qty <= (row.reorderLevel || 0) && !critical;
      return <span className={`font-mono text-sm ${critical ? "text-red-500 font-bold" : low ? "text-amber-500 font-semibold" : "text-[var(--foreground)]"}`}>
        {qty} {getUnit(row.productName, products)}{critical && " ⚠"}{!critical && low && " ↓"}
      </span>;
    }},
    { key: "reorderLevel", label: "Reorder Level", render: (row: any) => <MonoValue value={`${row.reorderLevel} ${getUnit(row.productName, products)}`} /> },
    { key: "supplierName", label: "Supplier", align: "left" as const, render: (row: any) => <span className="text-xs text-[var(--muted-foreground)]">{row.supplierName}</span> },
    ...(canModify ? [{ key: "actions", label: "Actions", width: "100px", render: (row: any) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openEdit(row)}><Pencil size={16} className="text-blue-500 hover:opacity-80" /></button>
        <button onClick={() => openDelete(row)}><Trash2 size={16} className="text-red-500 hover:opacity-80" /></button>
      </div>
    )}] : []),
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)] mb-1">Products</h1>
        <p className="text-[13px] text-[var(--muted-foreground)]">Master catalog of all electronics products.</p>
      </div>
      <DataTable title="Product Catalog" subtitle={`${products.length} products`} columns={columns} data={products} searchFields={["productName", "productID"]} rowKey={(r: any) => r.productID || r.productId}
        actions={canAdd ? <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"><Plus size={16} />Add Product</button> : undefined}
      />

      <Modal title={modal === "create" ? "Add Product" : "Edit Product"} open={modal === "create" || modal === "edit"} onClose={() => setModal(null)} onSubmit={handlePreSave} submitLabel={modal === "create" ? "Create Product" : "Save Changes"} size="lg">
        <Field label="Product Name" required><Input placeholder="e.g. iPhone 16 Pro Max" value={form.productName} onChange={(e) => set("productName", e.target.value)} /></Field>
        <Field label="Description"><Textarea placeholder="Describe the product..." value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} /></Field>
        <FormGrid>
          <Field label="Category" required><Select value={form.categoryID.toString()} onChange={(e) => set("categoryID", parseInt(e.target.value) || 0)}><option value="0">Select category...</option>{categories.map((c: any) => <option key={c.categoryID || c.categoryId} value={c.categoryID || c.categoryId}>{c.categoryName}</option>)}</Select></Field>
          <Field label="Supplier" required><Select value={form.supplierID.toString()} onChange={(e) => set("supplierID", parseInt(e.target.value) || 0)}><option value="0">Select supplier...</option>{suppliers.map((s: any) => <option key={s.supplierID || s.supplierId} value={s.supplierID || s.supplierId}>{s.supplierName}</option>)}</Select></Field>
          <Field label="Price (Php)" required><Input type="number" value={form.price || ""} onChange={(e) => set("price", parseFloat(e.target.value) || 0)} /></Field>
          <Field label="Lead Time (Days)"><Input type="number" min={0} value={form.leadTime} onChange={(e) => set("leadTime", parseInt(e.target.value) || 0)} /></Field>
          <Field label="Reorder Level"><Input type="number" min={0} value={form.reorderLevel} onChange={(e) => set("reorderLevel", parseInt(e.target.value) || 0)} /></Field>
          <Field label="Minimum Stock Qty"><Input type="number" min={0} value={form.minimumStockQuantity} onChange={(e) => set("minimumStockQuantity", parseInt(e.target.value) || 0)} /></Field>
        </FormGrid>
      </Modal>

      <Modal title="Confirm Action" open={!!confirmAction} onClose={() => setConfirmAction(null)} onSubmit={executeAction} submitLabel="Yes, Proceed" size="sm">
        {error && <div className="mb-4 px-4 py-3 rounded bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>}
        <div className="p-2 text-sm text-[var(--foreground)]">
          Are you sure you want to <strong>{confirmAction === "add" ? "add this new" : confirmAction === "edit" ? "save changes to this" : "delete this"}</strong> product?
        </div>
      </Modal>
    </div>
  );
}