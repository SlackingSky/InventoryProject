import { useState } from "react";
import { DataTable, Badge, MonoValue } from "./DataTable";
import { Modal, Field, Input, Select, FormGrid, ConfirmDialog } from "./Modal";
import { useData } from "../context/DataContext";
import type { User, UserRole } from "../data/mockData";
import { Plus, Pencil, Trash2 } from "lucide-react";

const roleColors: Record<string, string> = {
  Admin: "#ef4444", Manager: "#8b5cf6", Staff: "#3b82f6",
};
const roles: UserRole[] = ["Admin", "Manager", "Staff"];

const blank = (): Omit<User, "userID"> => ({ username: "", fullName: "", userRole: "Staff" });

export function Users() {
  const { users, addUser, updateUser, deleteUser } = useData();
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [form, setForm] = useState<Omit<User, "userID">>(blank());
  const [selected, setSelected] = useState<User | null>(null);
  const [error, setError] = useState("");

  const openCreate = () => { setForm(blank()); setError(""); setModal("create"); };
  const openEdit = (u: User) => { setSelected(u); setForm({ username: u.username, fullName: u.fullName, userRole: u.userRole }); setError(""); setModal("edit"); };
  const openDelete = (u: User) => { setSelected(u); setModal("delete"); };

  const validate = () => {
    if (!form.username.trim()) return "Username is required.";
    if (!form.fullName.trim()) return "Full name is required.";
    return "";
  };

  const handleSave = () => {
    const err = validate();
    if (err) { setError(err); return; }
    if (modal === "create") addUser(form);
    else if (modal === "edit" && selected) updateUser({ ...selected, ...form });
    setModal(null);
  };

  const handleDelete = () => { if (selected) deleteUser(selected.userID); setModal(null); };

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const columns = [
    { key: "userID", label: "User ID", sortable: true, width: "100px", render: (row: User) => <MonoValue value={row.userID} /> },
    { key: "username", label: "Username", sortable: true, align: "left" as const, render: (row: User) => <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>@{row.username}</span> },
    { key: "fullName", label: "Full Name", sortable: true, align: "left" as const, render: (row: User) => (
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center rounded-full" style={{ width: 28, height: 28, background: roleColors[row.userRole] + "22", color: roleColors[row.userRole], fontSize: 11, fontWeight: 700 }}>
          {row.fullName.split(" ").map((n) => n[0]).join("")}
        </div>
        <span style={{ fontWeight: 500 }}>{row.fullName}</span>
      </div>
    )},
    { key: "userRole", label: "Role", sortable: true, render: (row: User) => <Badge label={row.userRole} color={roleColors[row.userRole]} /> },
    { key: "permissions", label: "Permissions", render: (row: User) => {
      const perms: Record<string, string[]> = { Admin: ["Read","Write","Delete","Admin"], Manager: ["Read","Write","Delete"], Staff: ["Read","Write"] };
      return <div className="flex gap-1 flex-wrap">{(perms[row.userRole] ?? []).map((p) => <span key={p} className="px-1.5 py-0.5 rounded" style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}>{p}</span>)}</div>;
    }},
    { key: "actions", label: "", width: "80px", render: (row: User) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors" style={{ color: "var(--muted-foreground)" }}><Pencil size={13} /></button>
        <button onClick={() => openDelete(row)} className="p-1.5 rounded-lg hover:bg-[#ef444418] transition-colors" style={{ color: "#ef4444" }}><Trash2 size={13} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div><h1 style={{ color: "var(--foreground)", marginBottom: 4 }}>Users</h1><p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>System users and their access roles.</p></div>
      <DataTable title="User Management" subtitle={`${users.length} registered users`} columns={columns} data={users} searchFields={["username", "fullName", "userRole"]} rowKey={(r) => r.userID}
        actions={<button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500 }}><Plus size={14} />Add User</button>}
      />

      <Modal title={modal === "create" ? "Add User" : "Edit User"} open={modal === "create" || modal === "edit"} onClose={() => setModal(null)} onSubmit={handleSave} submitLabel={modal === "create" ? "Create User" : "Save Changes"}>
        {error && <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: "#ef444418", color: "#ef4444", fontSize: 12 }}>{error}</div>}
        <FormGrid>
          <Field label="Full Name" required><Input placeholder="e.g. Jane Doe" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} /></Field>
          <Field label="Username" required><Input placeholder="e.g. jane.doe" value={form.username} onChange={(e) => set("username", e.target.value)} /></Field>
        </FormGrid>
        <Field label="Role" required>
          <Select value={form.userRole} onChange={(e) => set("userRole", e.target.value)}>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
        <Field label="Password" hint="Leave blank when editing to keep the existing password.">
          <Input type="password" placeholder="••••••••" />
        </Field>
      </Modal>

      <ConfirmDialog open={modal === "delete"} onClose={() => setModal(null)} onConfirm={handleDelete} label={selected?.fullName ?? ""} />
    </div>
  );
}
