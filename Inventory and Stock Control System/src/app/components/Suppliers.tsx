import { useState } from "react";
import { DataTable, MonoValue } from "./DataTable";
import { Modal, Field, Input, FormGrid } from "./Modal";
import { useData } from "../context/DataContext";
import type { Supplier } from "../data/mockData";
import { Plus, Pencil, Trash2 } from "lucide-react";

type SupplierForm = Omit<Supplier, "supplierID">;
const blank = (): SupplierForm => ({ supplierName: "", contactNumber: "", emailAddress: "", supplierAddress: "" });

export function Suppliers({ canAdd = true, canModify = true }: { canAdd?: boolean; canModify?: boolean }) {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [confirmAction, setConfirmAction] = useState<"add" | "edit" | "delete" | null>(null);
  const [form, setForm] = useState<SupplierForm>(blank());
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [error, setError] = useState("");

  const openCreate = () => { setForm(blank()); setError(""); setModal("create"); };
  const openEdit = (s: Supplier) => { setSelected(s); setForm({ supplierName: s.supplierName, contactNumber: s.contactNumber, emailAddress: s.emailAddress, supplierAddress: s.supplierAddress }); setError(""); setModal("edit"); };
  const openDelete = (s: Supplier) => { setSelected(s); setConfirmAction("delete"); };

  const handlePreSave = () => {
    if (!form.supplierName.trim()) return setError("Supplier name is required.");
    if (!form.contactNumber.trim()) return setError("Contact number is required.");
    if (!form.emailAddress.trim()) return setError("Email address is required.");
    if (!form.emailAddress.includes("@")) return setError("Please enter a valid email address.");
    if (!form.supplierAddress.trim()) return setError("Address is required.");
    setConfirmAction(modal === "create" ? "add" : "edit");
  };

  const executeAction = () => {
    if (confirmAction === "add") addSupplier(form);
    else if (confirmAction === "edit" && selected) updateSupplier({ ...selected, ...form });
    else if (confirmAction === "delete" && selected) deleteSupplier(selected.supplierID);
    setConfirmAction(null);
    setModal(null);
  };

  const set = <K extends keyof SupplierForm>(k: K, v: SupplierForm[K]) => setForm((p) => ({ ...p, [k]: v }));

  const columns = [
    { key: "supplierID", label: "ID", sortable: true, width: "100px", render: (r: Supplier) => <MonoValue value={r.supplierID} /> },
    { key: "supplierName", label: "Supplier Name", sortable: true, align: "left" as const, render: (r: Supplier) => <span style={{ fontWeight: 500 }}>{r.supplierName}</span> },
    { key: "contactNumber", label: "Phone", align: "left" as const, render: (r: Supplier) => <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>{r.contactNumber}</span> },
    { key: "emailAddress", label: "Email", align: "left" as const, render: (r: Supplier) => <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>{r.emailAddress}</span> },
    { key: "supplierAddress", label: "Address", align: "left" as const, render: (r: Supplier) => <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>{r.supplierAddress}</span> },
    ...(canModify ? [{ key: "actions", label: "", width: "80px", render: (r: Supplier) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors" style={{ color: "var(--muted-foreground)" }}><Pencil size={13} /></button>
        <button onClick={() => openDelete(r)} className="p-1.5 rounded-lg hover:bg-[#ef444418] transition-colors" style={{ color: "#ef4444" }}><Trash2 size={13} /></button>
      </div>
    )}] : [])
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 style={{ color: "var(--foreground)", marginBottom: 4 }}>Vendors & Suppliers</h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Manage contact information for your supply chain.</p>
      </div>

      <DataTable 
        title="Supplier Directory" subtitle={`${suppliers.length} active suppliers`} columns={columns} data={suppliers} searchFields={["supplierName", "emailAddress"]} rowKey={(r) => r.supplierID}
        actions={canAdd ? <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500 }}><Plus size={14} /> Add Supplier</button> : undefined}
      />

      <Modal title={modal === "create" ? "Add Supplier" : "Edit Supplier"} open={modal === "create" || modal === "edit"} onClose={() => setModal(null)} onSubmit={handlePreSave} submitLabel={modal === "create" ? "Create Supplier" : "Save Changes"} size="md">
        {error && <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: "#ef444418", color: "#ef4444", fontSize: 12 }}>{error}</div>}
        <Field label="Supplier Name" required><Input placeholder="e.g. Apple Inc." value={form.supplierName} onChange={(e) => set("supplierName", e.target.value)} /></Field>
        <FormGrid>
          <Field label="Phone Number" required><Input placeholder="+1 (555) 000-0000" value={form.contactNumber} onChange={(e) => set("contactNumber", e.target.value)} /></Field>
          <Field label="Email Address" required><Input type="email" placeholder="vendor@example.com" value={form.emailAddress} onChange={(e) => set("emailAddress", e.target.value)} /></Field>
        </FormGrid>
        <Field label="Physical Address" required><Input placeholder="123 Corporate Way, City, State, Zip" value={form.supplierAddress} onChange={(e) => set("supplierAddress", e.target.value)} /></Field>
      </Modal>

      <Modal title="Confirm Action" open={!!confirmAction} onClose={() => setConfirmAction(null)} onSubmit={executeAction} submitLabel="Yes, Proceed" size="sm">
        <div className="p-2 text-sm" style={{ color: "var(--foreground)" }}>
          Are you sure you want to <strong>{confirmAction === "add" ? "add this new" : confirmAction === "edit" ? "save changes to this" : "delete this"}</strong> supplier?
          {confirmAction === "delete" && <div className="mt-2 text-xs text-red-500">Warning: Deleting a supplier will affect all associated purchase orders.</div>}
        </div>
      </Modal>
    </div>
  );
}