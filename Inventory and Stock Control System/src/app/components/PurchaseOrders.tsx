import React, { useState } from "react";
import { Badge, MonoValue } from "./DataTable";
import { Modal, Field, Select, Input, ConfirmDialog } from "./Modal";
import { useData } from "../context/DataContext";
import type { PurchaseOrder, PurchaseOrderDetail, DeliveryStatus } from "../data/mockData";
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, X, PackageCheck } from "lucide-react";
import { Search } from "lucide-react";

const statusColors: Record<string, string> = { "Pending": "#f59e0b", "In Transit": "#3b82f6", "Delivered": "#10b981", "Cancelled": "#ef4444" };
const statuses: DeliveryStatus[] = ["Pending", "In Transit", "Delivered", "Cancelled"];

const readonlyFieldStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--muted)",
  color: "var(--muted-foreground)",
  fontSize: 13,
};

interface POForm {
  supplierID: string;
  purchaseDate: string;
  receivedDate: string;
  deliveryStatus: DeliveryStatus;
  createdBy: string;
  receivedBy: string;
  details: Array<{ productID: string; purchaseQuantity: number; unitCost: number }>;
}

function OrderDetail({ details, products }: { details: PurchaseOrderDetail[]; products: { productID: string; productName: string }[] }) {
  return (
    <div className="mx-4 mb-3 rounded-lg overflow-hidden" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
      <table className="w-full" style={{ fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["Detail ID", "Product", "Qty", "Unit Cost", "Total"].map((h) => (
              <th key={h} className="px-3 py-2 text-center" style={{ color: "var(--muted-foreground)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {details.map((d, i) => (
            <tr key={d.purchaseOrderDetailID} style={{ borderBottom: i < details.length - 1 ? "1px solid var(--border)" : "none" }}>
              <td className="px-3 py-2 text-center"><MonoValue value={d.purchaseOrderDetailID} /></td>
              <td className="px-3 py-2 text-center" style={{ color: "var(--foreground)" }}>{products.find((p) => p.productID === d.productID)?.productName ?? d.productID}</td>
              <td className="px-3 py-2 text-center"><MonoValue value={d.purchaseQuantity} /></td>
              <td className="px-3 py-2 text-center"><MonoValue value={`Php ${d.unitCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} /></td>
              <td className="px-3 py-2 text-center" style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>Php {d.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PurchaseOrders({ canAdd = true, canModify = true, canEdit = true }: { canAdd?: boolean; canModify?: boolean; canEdit?: boolean }) {
  const { currentUserID, purchaseOrders, suppliers, products, users, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } = useData();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [form, setForm] = useState<POForm>({ supplierID: "", purchaseDate: new Date().toISOString().slice(0, 10), receivedDate: "", deliveryStatus: "Pending", createdBy: currentUserID, receivedBy: "", details: [{ productID: "", purchaseQuantity: 1, unitCost: 0 }] });
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const toggle = (id: string) => setExpanded((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const openCreate = () => {
    setForm({ supplierID: suppliers[0]?.supplierID ?? "", purchaseDate: new Date().toISOString().slice(0, 10), receivedDate: "", deliveryStatus: "Pending", createdBy: currentUserID, receivedBy: "", details: [{ productID: "", purchaseQuantity: 1, unitCost: 0 }] });
    setError(""); setModal("create");
  };

  const openEdit = (po: PurchaseOrder) => {
    setSelected(po);
    setForm({ supplierID: po.supplierID, purchaseDate: po.purchaseDate, receivedDate: po.receivedDate ?? "", deliveryStatus: po.deliveryStatus, createdBy: po.createdBy, receivedBy: po.receivedBy ?? "", details: po.details.map((d) => ({ productID: d.productID, purchaseQuantity: d.purchaseQuantity, unitCost: d.unitCost })) });
    setError(""); setModal("edit");
  };

  const openDelete = (po: PurchaseOrder) => { setSelected(po); setModal("delete"); };

  const handleReceive = (po: PurchaseOrder) => {
    updatePurchaseOrder({
      ...po,
      deliveryStatus: "Delivered",
      receivedDate: new Date().toISOString().slice(0, 10),
      receivedBy: currentUserID,
    });
  };

  const setF = <K extends keyof POForm>(k: K, v: POForm[K]) => setForm((p) => ({ ...p, [k]: v }));
  const addDetailLine = () => setForm((p) => ({ ...p, details: [...p.details, { productID: products[0]?.productID ?? "", purchaseQuantity: 1, unitCost: 0 }] }));
  const removeDetailLine = (idx: number) => setForm((p) => ({ ...p, details: p.details.filter((_, i) => i !== idx) }));
  const setDetail = (idx: number, k: string, v: string | number) => setForm((p) => ({ ...p, details: p.details.map((d, i) => i === idx ? { ...d, [k]: v } : d) }));

  const handleSave = () => {
    if (!form.supplierID) { setError("Supplier is required."); return; }
    if (!form.purchaseDate) { setError("Purchase date is required."); return; }
    if (form.details.some((d) => !d.productID)) { setError("All line items must have a product selected."); return; }
    if (form.details.some((d) => d.purchaseQuantity < 1)) { setError("Quantity must be at least 1 for all line items."); return; }

    const details: PurchaseOrderDetail[] = form.details.map((d, i) => ({
      purchaseOrderDetailID: `POD${String(Date.now()).slice(-4)}${i}`,
      purchaseOrderID: selected?.purchaseOrderID ?? "",
      productID: d.productID,
      purchaseQuantity: d.purchaseQuantity,
      unitCost: d.unitCost,
      totalAmount: d.purchaseQuantity * d.unitCost,
    }));

    const po: Omit<PurchaseOrder, "purchaseOrderID"> = {
      supplierID: form.supplierID,
      purchaseDate: form.purchaseDate,
      receivedDate: form.receivedDate || null,
      // Status is always Pending on create; preserved from existing record on edit
      deliveryStatus: modal === "create" ? "Pending" : form.deliveryStatus,
      createdBy: form.createdBy,
      receivedBy: form.receivedBy || null,
      details,
    };

    if (modal === "create") addPurchaseOrder(po);
    else if (selected) updatePurchaseOrder({ ...po, purchaseOrderID: selected.purchaseOrderID });
    setModal(null);
  };

  const handleDelete = () => { if (selected) deletePurchaseOrder(selected.purchaseOrderID); setModal(null); };

  const sorted = [...purchaseOrders]
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .filter((po) => {
      const s = search.toLowerCase();
      return !s || po.purchaseOrderID.toLowerCase().includes(s) || (suppliers.find((x) => x.supplierID === po.supplierID)?.supplierName.toLowerCase().includes(s) ?? false) || po.deliveryStatus.toLowerCase().includes(s);
    });

  const cols = [
    { key: "expand",          label: "",            width: 36,  align: "center" },
    { key: "purchaseOrderID", label: "PO Number",               align: "center" },
    { key: "supplierID",      label: "Supplier",                align: "left"   },
    { key: "purchaseDate",    label: "Order Date",              align: "center" },
    { key: "receivedDate",    label: "Received",                align: "center" },
    { key: "deliveryStatus",  label: "Status",                  align: "center" },
    { key: "total",           label: "Order Total",             align: "center" },
    { key: "items",           label: "Lines",                   align: "center" },
    { key: "createdBy",       label: "Created By",              align: "left"   },
    { key: "actions",         label: "",                        align: "center" },
  ] as const;

  const currentUserName = users.find((u) => u.userID === currentUserID)?.fullName ?? currentUserID;

  return (
    <div className="space-y-4">
      <div><h1 style={{ color: "var(--foreground)", marginBottom: 4 }}>Purchase Orders</h1><p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Procurement transactions sent to suppliers. Click the arrow to expand line items.</p></div>

      <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between gap-4 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 style={{ color: "var(--foreground)", marginBottom: 2 }}>Purchase Order List</h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{purchaseOrders.length} orders — expand to view line items</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
              <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 pr-3 py-1.5 rounded-lg" style={{ background: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 13, outline: "none", width: 200 }} />
            </div>
            {canAdd && <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500 }}><Plus size={14} />New Order</button>}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {cols.map((col) => (
                  <th key={col.key} className="px-4 py-3" style={{ textAlign: col.align, color: "var(--muted-foreground)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", width: col.width }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, idx) => (
                <React.Fragment key={row.purchaseOrderID}>
                  <tr style={{ borderBottom: !expanded.has(row.purchaseOrderID) && idx < sorted.length - 1 ? "1px solid var(--border)" : "none" }} className="transition-colors hover:bg-[var(--muted)]">
                    <td className="px-4 py-3" style={{ textAlign: "center" }}>
                      <button onClick={() => toggle(row.purchaseOrderID)} style={{ color: "var(--muted-foreground)", display: "flex", alignItems: "center" }}>
                        {expanded.has(row.purchaseOrderID) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </td>
                    <td className="px-4 py-3" style={{ textAlign: "center" }}><MonoValue value={row.purchaseOrderID} /></td>
                    <td className="px-4 py-3" style={{ textAlign: "left", fontWeight: 500 }}>{suppliers.find((s) => s.supplierID === row.supplierID)?.supplierName ?? row.supplierID}</td>
                    <td className="px-4 py-3" style={{ textAlign: "center" }}><MonoValue value={new Date(row.purchaseDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })} /></td>
                    <td className="px-4 py-3" style={{ textAlign: "center" }}><MonoValue value={row.receivedDate ? new Date(row.receivedDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }) : "—"} /></td>
                    <td className="px-4 py-3" style={{ textAlign: "center" }}><Badge label={row.deliveryStatus} color={statusColors[row.deliveryStatus]} /></td>
                    <td className="px-4 py-3" style={{ textAlign: "center" }}><MonoValue value={`Php ${row.details.reduce((s, d) => s + d.totalAmount, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} /></td>
                    <td className="px-4 py-3" style={{ textAlign: "center" }}><MonoValue value={row.details.length} /></td>
                    <td className="px-4 py-3" style={{ textAlign: "left", fontSize: 12, color: "var(--muted-foreground)" }}>{users.find((u) => u.userID === row.createdBy)?.fullName ?? row.createdBy}</td>
                    <td className="px-4 py-3" style={{ textAlign: "center" }}>
                      {canEdit ? (
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors" style={{ color: "var(--muted-foreground)" }}><Pencil size={13} /></button>
                          <button onClick={() => openDelete(row)} className="p-1.5 rounded-lg hover:bg-[#ef444418] transition-colors" style={{ color: "#ef4444" }}><Trash2 size={13} /></button>
                        </div>
                      ) : (row.deliveryStatus !== "Delivered" && row.deliveryStatus !== "Cancelled") ? (
                        <button
                          onClick={() => handleReceive(row)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors hover:opacity-90"
                          style={{ background: "#10b98118", color: "#10b981", fontSize: 11, fontWeight: 600 }}
                          title="Mark as received"
                        >
                          <PackageCheck size={12} />
                          Receive
                        </button>
                      ) : null}
                    </td>
                  </tr>
                  {expanded.has(row.purchaseOrderID) && (
                    <tr style={{ borderBottom: idx < sorted.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <td colSpan={cols.length}>
                        <OrderDetail details={row.details} products={products} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {sorted.length === 0 && (
                <tr><td colSpan={cols.length} className="py-10 text-center" style={{ color: "var(--muted-foreground)", fontSize: 13 }}>No purchase orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{sorted.length} of {purchaseOrders.length} orders</span>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal title={modal === "create" ? "New Purchase Order" : "Edit Purchase Order"} open={modal === "create" || modal === "edit"} onClose={() => setModal(null)} onSubmit={handleSave} submitLabel={modal === "create" ? "Create Order" : "Save Changes"} size="lg">
        {error && <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: "#ef444418", color: "#ef4444", fontSize: 12 }}>{error}</div>}

        <div className="grid gap-x-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Field label="Supplier" required>
            <Select value={form.supplierID} onChange={(e) => setF("supplierID", e.target.value)}>
              <option value="">Select supplier...</option>
              {suppliers.map((s) => <option key={s.supplierID} value={s.supplierID}>{s.supplierName}</option>)}
            </Select>
          </Field>
          {/* Delivery Status — system-controlled (Pending on create, Delivered on receive) */}
          <Field label="Delivery Status">
            <div style={readonlyFieldStyle}>
              <span style={{ color: statusColors[form.deliveryStatus], fontWeight: 600 }}>● </span>
              {form.deliveryStatus}
            </div>
          </Field>
          {/* Purchase Date — auto-set to today when created */}
          <Field label="Order Date">
            <div style={readonlyFieldStyle}>{new Date(form.purchaseDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" })}</div>
          </Field>
          {/* Received Date — auto-set by Receive button */}
          <Field label="Received Date">
            <div style={readonlyFieldStyle}>
              {form.receivedDate ? new Date(form.receivedDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" }) : "— Not yet received —"}
            </div>
          </Field>
          {/* Created By — locked to the logged-in user */}
          <Field label="Created By">
            <div style={readonlyFieldStyle}>{currentUserName}</div>
          </Field>
          {/* Received By — auto-set via Receive button */}
          <Field label="Received By">
            <div style={readonlyFieldStyle}>
              {form.receivedBy ? (users.find((u) => u.userID === form.receivedBy)?.fullName ?? form.receivedBy) : "— Not yet received —"}
            </div>
          </Field>
        </div>

        {/* Line items */}
        <div className="mt-2 mb-4">
          <div className="flex items-center justify-between mb-2">
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>Line Items <span style={{ color: "#ef4444" }}>*</span></label>
            <button onClick={addDetailLine} className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[var(--muted)] transition-colors" style={{ fontSize: 12, color: "var(--primary)" }}><Plus size={12} />Add Line</button>
          </div>
          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <table className="w-full" style={{ fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                  {["Product", "Qty", "Unit Cost (Php)", "Total", ""].map((h) => (
                    <th key={h} className="px-3 py-2 text-center" style={{ color: "var(--muted-foreground)", fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.details.map((d, i) => (
                  <tr key={i} style={{ borderBottom: i < form.details.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-2 py-1.5">
                      <select value={d.productID} onChange={(e) => setDetail(i, "productID", e.target.value)} style={{ width: "100%", padding: "4px 6px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--input-background)", color: "var(--foreground)", fontSize: 12 }}>
                        <option value="">Select...</option>
                        {products.map((p) => <option key={p.productID} value={p.productID}>{p.productName}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5"><input type="number" min={1} value={d.purchaseQuantity} onChange={(e) => setDetail(i, "purchaseQuantity", parseInt(e.target.value) || 1)} style={{ width: 64, padding: "4px 6px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--input-background)", color: "var(--foreground)", fontSize: 12 }} /></td>
                    <td className="px-2 py-1.5"><input type="number" min={0} step={0.01} value={d.unitCost} onChange={(e) => setDetail(i, "unitCost", parseFloat(e.target.value) || 0)} style={{ width: 90, padding: "4px 6px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--input-background)", color: "var(--foreground)", fontSize: 12 }} /></td>
                    <td className="px-3 py-1.5" style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--foreground)" }}>Php {(d.purchaseQuantity * d.unitCost).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    <td className="px-2 py-1.5">
                      {form.details.length > 1 && <button onClick={() => removeDetailLine(i)} style={{ color: "#ef4444", display: "flex", alignItems: "center" }}><X size={14} /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "1px solid var(--border)", background: "var(--muted)" }}>
                  <td colSpan={3} className="px-3 py-2 text-right" style={{ fontWeight: 600, fontSize: 12, color: "var(--muted-foreground)" }}>Order Total</td>
                  <td className="px-3 py-2 text-center" style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, color: "var(--foreground)" }}>
                    Php {form.details.reduce((s, d) => s + d.purchaseQuantity * d.unitCost, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={modal === "delete"} onClose={() => setModal(null)} onConfirm={handleDelete} label={selected?.purchaseOrderID ?? ""} />
    </div>
  );
}
