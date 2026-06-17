import { useState } from "react";
import { DataTable, MonoValue } from "./DataTable";
import { Modal, Field, Input, FormGrid, ConfirmDialog } from "./Modal";
import { useData } from "../context/DataContext";
import type { Supplier } from "../data/mockData";
import { Plus, Pencil, Trash2, Mail, Phone, MapPin } from "lucide-react";

const blank = (): Omit<Supplier, "supplierID"> => ({ supplierName: "", contactNumber: "", emailAddress: "", supplierAddress: "" });

export function Suppliers({ canAdd = true, canModify = true }: { canAdd?: boolean; canModify?: boolean }) {
  const { suppliers, products, addSupplier, updateSupplier, deleteSupplier } = useData();
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [form, setForm] = useState(blank());
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [error, setError] = useState("");

  const openCreate = () => { setForm(blank()); setError(""); setModal("create"); };
  const openEdit = (s: Supplier) => { setSelected(s); setForm({ supplierName: s.supplierName, contactNumber: s.contactNumber, emailAddress: s.emailAddress, supplierAddress: s.supplierAddress }); setError(""); setModal("edit"); };
  const openDelete = (s: Supplier) => { setSelected(s); setModal("delete"); };

  const handleSave = () => {
    if (!form.supplierName.trim()) { setError("Supplier name is required."); return; }
    if (!form.emailAddress.trim()) { setError("Email address is required."); return; }
    if (modal === "create") addSupplier(form);
    else if (selected) updateSupplier({ ...selected, ...form });
    setModal(null);
  };

  const handleDelete = () => { if (selected) deleteSupplier(selected.supplierID); setModal(null); };
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const columns = [
    { key: "supplierID", label: "ID", sortable: true, width: "100px", render: (row: Supplier) => <MonoValue value={row.supplierID} /> },
    { key: "supplierName", label: "Supplier Name", sortable: true, align: "left" as const },
    { key: "contactNumber", label: "Phone", align: "left" as const, render: (row: Supplier) => <span className="flex items-center gap-1" style={{ fontSize: 12, color: "var(--muted-foreground)" }}><Phone size={12} />{row.contactNumber}</span> },
    { key: "emailAddress", label: "Email", align: "left" as const, render: (row: Supplier) => <span className="flex items-center gap-1" style={{ fontSize: 12, color: "#3b82f6" }}><Mail size={12} />{row.emailAddress}</span> },
    { key: "supplierAddress", label: "Address", align: "left" as const, render: (row: Supplier) => <span className="flex items-center gap-1" style={{ fontSize: 12, color: "var(--muted-foreground)" }}><MapPin size={12} />{row.supplierAddress}</span> },
    { key: "productCount", label: "Products", render: (row: Supplier) => <MonoValue value={products.filter((p) => p.supplierID === row.supplierID).length} /> },
    ...(canModify ? [{ key: "actions", label: "", width: "80px", render: (row: Supplier) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors" style={{ color: "var(--muted-foreground)" }}><Pencil size={13} /></button>
        <button onClick={() => openDelete(row)} className="p-1.5 rounded-lg hover:bg-[#ef444418] transition-colors" style={{ color: "#ef4444" }}><Trash2 size={13} /></button>
      </div>
    )}] : []),
  ];

  return (
    <div className="space-y-4">
      <div><h1 style={{ color: "var(--foreground)", marginBottom: 4 }}>Suppliers</h1><p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Vendor directory for all electronics suppliers.</p></div>
      <DataTable title="Supplier Directory" subtitle={`${suppliers.length} registered suppliers`} columns={columns} data={suppliers} searchFields={["supplierName", "emailAddress"]} rowKey={(r) => r.supplierID}
        actions={canAdd ? <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500 }}><Plus size={14} />Add Supplier</button> : undefined}
      />
      <Modal title={modal === "create" ? "Add Supplier" : "Edit Supplier"} open={modal === "create" || modal === "edit"} onClose={() => setModal(null)} onSubmit={handleSave} submitLabel={modal === "create" ? "Create" : "Save Changes"}>
        {error && <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: "#ef444418", color: "#ef4444", fontSize: 12 }}>{error}</div>}
        <Field label="Supplier Name" required><Input placeholder="e.g. TechCore Distributors" value={form.supplierName} onChange={(e) => set("supplierName", e.target.value)} /></Field>
        <FormGrid>
          <Field label="Contact Number"><Input placeholder="(+63) 912-345-6789" value={form.contactNumber} onChange={(e) => set("contactNumber", e.target.value)} /></Field>
          <Field label="Email Address" required><Input type="email" placeholder="orders@supplier.com" value={form.emailAddress} onChange={(e) => set("emailAddress", e.target.value)} /></Field>
        </FormGrid>
        <Field label="Address"><Input placeholder="123 Main St, City, State ZIP" value={form.supplierAddress} onChange={(e) => set("supplierAddress", e.target.value)} /></Field>
      </Modal>
      <ConfirmDialog open={modal === "delete"} onClose={() => setModal(null)} onConfirm={handleDelete} label={selected?.supplierName ?? ""} />
    </div>
  );
}
