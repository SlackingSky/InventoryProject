import { useState } from "react";
import { DataTable, MonoValue } from "./DataTable";
import { Modal, Field, Input, Textarea, ConfirmDialog } from "./Modal";
import { useData } from "../context/DataContext";
import type { Category } from "../data/mockData";
import { Plus, Pencil, Trash2 } from "lucide-react";

const blank = (): Omit<Category, "categoryID"> => ({ categoryName: "", categoryDescription: "" });

export function Categories({ canAdd = true, canModify = true }: { canAdd?: boolean; canModify?: boolean }) {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useData();
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [form, setForm] = useState(blank());
  const [selected, setSelected] = useState<Category | null>(null);
  const [error, setError] = useState("");

  const openCreate = () => { setForm(blank()); setError(""); setModal("create"); };
  const openEdit = (c: Category) => { setSelected(c); setForm({ categoryName: c.categoryName, categoryDescription: c.categoryDescription }); setError(""); setModal("edit"); };
  const openDelete = (c: Category) => { setSelected(c); setModal("delete"); };

  const handleSave = () => {
    if (!form.categoryName.trim()) { setError("Category name is required."); return; }
    if (modal === "create") addCategory(form);
    else if (selected) updateCategory({ ...selected, ...form });
    setModal(null);
  };

  const handleDelete = () => { if (selected) deleteCategory(selected.categoryID); setModal(null); };
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const columns = [
    { key: "categoryID", label: "ID", sortable: true, width: "100px", render: (row: Category) => <MonoValue value={row.categoryID} /> },
    { key: "categoryName", label: "Category Name", sortable: true, align: "left" as const },
    { key: "categoryDescription", label: "Description", align: "left" as const, render: (row: Category) => <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{row.categoryDescription}</span> },
    { key: "productCount", label: "Products", render: (row: Category) => <MonoValue value={products.filter((p) => p.categoryID === row.categoryID).length} /> },
    ...(canModify ? [{ key: "actions", label: "", width: "80px", render: (row: Category) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors" style={{ color: "var(--muted-foreground)" }}><Pencil size={13} /></button>
        <button onClick={() => openDelete(row)} className="p-1.5 rounded-lg hover:bg-[#ef444418] transition-colors" style={{ color: "#ef4444" }}><Trash2 size={13} /></button>
      </div>
    )}] : []),
  ];

  return (
    <div className="space-y-4">
      <div><h1 style={{ color: "var(--foreground)", marginBottom: 4 }}>Categories</h1><p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Product groupings for the electronics catalog.</p></div>
      <DataTable title="Category List" subtitle={`${categories.length} categories`} columns={columns} data={categories} searchFields={["categoryName"]} rowKey={(r) => r.categoryID}
        actions={canAdd ? <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500 }}><Plus size={14} />Add Category</button> : undefined}
      />
      <Modal title={modal === "create" ? "Add Category" : "Edit Category"} open={modal === "create" || modal === "edit"} onClose={() => setModal(null)} onSubmit={handleSave} submitLabel={modal === "create" ? "Create" : "Save Changes"} size="sm">
        {error && <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: "#ef444418", color: "#ef4444", fontSize: 12 }}>{error}</div>}
        <Field label="Category Name" required><Input placeholder="e.g. Smartphones" value={form.categoryName} onChange={(e) => set("categoryName", e.target.value)} /></Field>
        <Field label="Description"><Textarea placeholder="Describe this category..." value={form.categoryDescription} onChange={(e) => set("categoryDescription", e.target.value)} /></Field>
      </Modal>
      <ConfirmDialog open={modal === "delete"} onClose={() => setModal(null)} onConfirm={handleDelete} label={selected?.categoryName ?? ""} />
    </div>
  );
}
