import { useState } from "react";
import { DataTable, MonoValue } from "./DataTable";
import { Modal, Field, Input, Textarea } from "./Modal";
import { useData } from "../context/DataContext";
import type { Category } from "../data/mockData";
import { Plus, Pencil, Trash2 } from "lucide-react";

type CategoryForm = Omit<Category, "categoryID">;
const blank = (): CategoryForm => ({ categoryName: "", categoryDescription: "" });

export function Categories({ canAdd = true, canModify = true }: { canAdd?: boolean; canModify?: boolean }) {
  const { categories, addCategory, updateCategory, deleteCategory } = useData();
  
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [confirmAction, setConfirmAction] = useState<"add" | "edit" | "delete" | null>(null);
  
  const [form, setForm] = useState<CategoryForm>(blank());
  const [selected, setSelected] = useState<Category | null>(null);
  const [error, setError] = useState("");

  const openCreate = () => { setForm(blank()); setError(""); setModal("create"); };
  const openEdit = (c: Category) => { setSelected(c); setForm({ categoryName: c.categoryName, categoryDescription: c.categoryDescription }); setError(""); setModal("edit"); };
  const openDelete = (c: Category) => { setSelected(c); setConfirmAction("delete"); };

  const handlePreSave = () => {
    if (!form.categoryName.trim()) {
      setError("Category name is required.");
      return;
    }
    setConfirmAction(modal === "create" ? "add" : "edit");
  };

  const executeAction = () => {
    if (confirmAction === "add") addCategory(form);
    else if (confirmAction === "edit" && selected) updateCategory({ ...selected, ...form });
    else if (confirmAction === "delete" && selected) deleteCategory(selected.categoryID);
    
    setConfirmAction(null);
    setModal(null);
  };

  const set = <K extends keyof CategoryForm>(k: K, v: CategoryForm[K]) => setForm((p) => ({ ...p, [k]: v }));

  const columns = [
    { key: "categoryID", label: "ID", sortable: true, width: "100px", render: (r: Category) => <MonoValue value={r.categoryID} /> },
    { key: "categoryName", label: "Category Name", sortable: true, align: "left" as const, render: (r: Category) => <span style={{ fontWeight: 500 }}>{r.categoryName}</span> },
    { key: "categoryDescription", label: "Description", align: "left" as const, render: (r: Category) => <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>{r.categoryDescription}</span> },
    ...(canModify ? [{ key: "actions", label: "", width: "80px", render: (r: Category) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors" style={{ color: "var(--muted-foreground)" }}><Pencil size={13} /></button>
        <button onClick={() => openDelete(r)} className="p-1.5 rounded-lg hover:bg-[#ef444418] transition-colors" style={{ color: "#ef4444" }}><Trash2 size={13} /></button>
      </div>
    )}] : [])
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 style={{ color: "var(--foreground)", marginBottom: 4 }}>Product Categories</h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Organize your inventory into classifications.</p>
      </div>

      <DataTable 
        title="Categories List" subtitle={`${categories.length} categories`} columns={columns} data={categories} searchFields={["categoryName"]} rowKey={(r) => r.categoryID}
        actions={canAdd ? <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500 }}><Plus size={14} /> Add Category</button> : undefined}
      />

      {/* Form Modal */}
      <Modal title={modal === "create" ? "Add Category" : "Edit Category"} open={modal === "create" || modal === "edit"} onClose={() => setModal(null)} onSubmit={handlePreSave} submitLabel={modal === "create" ? "Create Category" : "Save Changes"} size="sm">
        {error && <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: "#ef444418", color: "#ef4444", fontSize: 12 }}>{error}</div>}
        <Field label="Category Name" required><Input placeholder="e.g. Smartphones" value={form.categoryName} onChange={(e) => set("categoryName", e.target.value)} /></Field>
        <Field label="Description"><Textarea placeholder="Describe this category..." value={form.categoryDescription} onChange={(e) => set("categoryDescription", e.target.value)} rows={3} /></Field>
      </Modal>

      {/* Universal Confirmation Modal */}
      <Modal title="Confirm Action" open={!!confirmAction} onClose={() => setConfirmAction(null)} onSubmit={executeAction} submitLabel="Yes, Proceed" size="sm">
        <div className="p-2 text-sm" style={{ color: "var(--foreground)" }}>
          Are you sure you want to <strong>{confirmAction === "add" ? "add this new" : confirmAction === "edit" ? "save changes to this" : "delete this"}</strong> category?
          {confirmAction === "delete" && <div className="mt-2 text-xs text-red-500">Warning: This action cannot be undone and may affect associated products.</div>}
        </div>
      </Modal>
    </div>
  );
}