import { useState, Fragment } from "react";
import { Badge, MonoValue } from "./DataTable";
import { Modal, Field, Input, Select, ConfirmDialog } from "./Modal";
import { useData } from "../context/DataContext";
import type { PurchaseOrder, DeliveryStatus } from "../data/mockData";
import { Plus, Pencil, Trash2, Package, ChevronRight, ChevronDown } from "lucide-react";

type POForm = {
  supplierID: number;
  purchaseDate: string;
  deliveryStatus: DeliveryStatus;
  details: { productId: number; purchaseQuantity: number; unitCost: number; }[];
};

const blank = (): POForm => ({
  supplierID: 0,
  purchaseDate: new Date().toISOString().split("T")[0],
  deliveryStatus: "Pending",
  details: [],
});

const statusColors: Record<DeliveryStatus, string> = {
  Pending: "#f59e0b",
  "In Transit": "#3b82f6",
  Delivered: "#10b981",
  Cancelled: "#ef4444",
};

export function PurchaseOrders({ canAdd = true, canModify = true, canEdit = true }: any) {
  const { purchaseOrders, suppliers, products, currentUserID, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } = useData();
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [form, setForm] = useState<POForm>(blank());
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = () => { setForm(blank()); setError(""); setModal("create"); };
  
  const openEdit = (po: PurchaseOrder) => {
    setSelected(po);
    setForm({
      supplierID: po.supplierID,
      purchaseDate: po.purchaseDate,
      deliveryStatus: po.deliveryStatus,
      details: po.details ? po.details.map((d) => ({
        productId: d.productId,
        purchaseQuantity: d.purchaseQuantity,
        unitCost: d.unitCost,
      })) : [],
    });
    setError("");
    setModal("edit");
  };

  const addItem = () => {
    setForm(p => ({
      ...p,
      details: [...p.details, { productId: products[0]?.productID || 0, purchaseQuantity: 1, unitCost: products[0]?.price || 0 }]
    }));
  };

  const updateItem = (index: number, field: string, value: number) => {
    setForm(p => {
      const newDetails = [...p.details];
      newDetails[index] = { ...newDetails[index], [field]: value };
      if (field === "productId") {
        const prod = products.find((pr) => pr.productID === value);
        if (prod) newDetails[index].unitCost = prod.price;
      }
      return { ...p, details: newDetails };
    });
  };

  const removeItem = (index: number) => {
    setForm(p => ({ ...p, details: p.details.filter((_, i) => i !== index) }));
  };

  const handleSave = () => {
    if (!form.supplierID) return setError("Please select a supplier.");
    if (!form.purchaseDate) return setError("Please enter a purchase date.");
    if (form.details.length === 0) return setError("You must add at least one line item.");
    
    const hasBadItems = form.details.some((d) => !d.productId || d.purchaseQuantity <= 0 || d.unitCost < 0);
    if (hasBadItems) return setError("All line items must have a valid product and a quantity greater than zero.");

    if (modal === "create") {
      addPurchaseOrder({ ...form, createdBy: currentUserID });
    } else if (selected) {
      updatePurchaseOrder({ ...selected, ...form });
    }
    setModal(null);
  };

  const handleReceive = (po: PurchaseOrder) => {
    updatePurchaseOrder({ 
      ...po, 
      deliveryStatus: "Delivered", 
      receivedDate: new Date().toISOString().split("T")[0], 
      receivedBy: currentUserID 
    });
  };

  const cols = [
    { key: "expand", label: "", width: 36, align: "center" as const },
    { key: "purchaseOrderID", label: "PO Number", align: "center" as const },
    { key: "supplierName", label: "Supplier", align: "left" as const },
    { key: "purchaseDate", label: "Order Date", align: "center" as const },
    { key: "receivedDate", label: "Received", align: "center" as const },
    { key: "deliveryStatus", label: "Status", align: "center" as const },
    { key: "total", label: "Order Total", align: "center" as const },
    { key: "items", label: "Lines", align: "center" as const },
    { key: "createdByName", label: "Created By", align: "left" as const },
    { key: "actions", label: "", align: "center" as const },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 style={{ color: "var(--foreground)", marginBottom: 4 }}>Purchase Orders</h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Manage inbound orders and supplier shipments.</p>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>Orders List</h3>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{purchaseOrders.length} total orders</p>
          </div>
          {canAdd && (
            <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500 }}>
              <Plus size={14} /> New Purchase Order
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
                {cols.map((c) => <th key={c.key} className="px-4 py-3" style={{ textAlign: c.align, fontWeight: 500, color: "var(--muted-foreground)", fontSize: 12, width: c.width }}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => {
                const isExpanded = expanded.has(po.purchaseOrderID);
                const totalAmount = po.details ? po.details.reduce((s, d) => s + (d.purchaseQuantity * d.unitCost), 0) : 0;
                
                return (
                  <Fragment key={po.purchaseOrderID}>
                    <tr className="hover:bg-[var(--muted)] transition-colors" style={{ borderBottom: "1px solid var(--border)", background: isExpanded ? "var(--muted)" : "transparent" }}>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleExpand(po.purchaseOrderID)} className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: "var(--muted-foreground)" }}>
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center"><MonoValue value={po.purchaseOrderID} /></td>
                      <td className="px-4 py-3" style={{ textAlign: "left", fontWeight: 500 }}>{po.supplierName}</td>
                      <td className="px-4 py-3 text-center" style={{ color: "var(--muted-foreground)", fontSize: 13 }}>{new Date(po.purchaseDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center" style={{ color: "var(--muted-foreground)", fontSize: 13 }}>{po.receivedDate ? new Date(po.receivedDate).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3 text-center"><Badge label={po.deliveryStatus} color={statusColors[po.deliveryStatus]} /></td>
                      <td className="px-4 py-3 text-center"><MonoValue value={`Php ${totalAmount.toLocaleString()}`} /></td>
                      <td className="px-4 py-3 text-center"><MonoValue value={po.details?.length || 0} /></td>
                      <td className="px-4 py-3" style={{ textAlign: "left", fontSize: 12, color: "var(--muted-foreground)" }}>{po.createdByName}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {canModify && po.deliveryStatus !== "Delivered" && po.deliveryStatus !== "Cancelled" && (
                            <button onClick={() => handleReceive(po)} title="Mark as Delivered" className="p-1.5 rounded-lg hover:bg-[#10b98118] transition-colors" style={{ color: "#10b981" }}><Package size={14} /></button>
                          )}
                          {canEdit && (
                            <>
                              <button onClick={() => openEdit(po)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors" style={{ color: "var(--muted-foreground)" }}><Pencil size={14} /></button>
                              <button onClick={() => { setSelected(po); setModal("delete"); }} className="p-1.5 rounded-lg hover:bg-[#ef444418] transition-colors" style={{ color: "#ef4444" }}><Trash2 size={14} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
                        <td colSpan={10} className="p-0">
                          <div className="pl-14 pr-8 py-4" style={{ background: "rgba(0,0,0,0.02)" }}>
                            <table className="w-full">
                              <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                  <th className="pb-2" style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Product Name</th>
                                  <th className="pb-2" style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Qty</th>
                                  <th className="pb-2" style={{ textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Unit Cost</th>
                                  <th className="pb-2 pr-4" style={{ textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {po.details?.map((item: any, i: number) => {
                                  const p = products.find(prod => prod.productID === item.productId);
                                  return (
                                    <tr key={i} style={{ borderBottom: i === po.details.length - 1 ? "none" : "1px solid var(--border)" }}>
                                      <td className="py-2" style={{ color: "var(--foreground)", fontWeight: 500, fontSize: 13 }}>{p?.productName || "Unknown"}</td>
                                      <td className="py-2 text-center" style={{ fontSize: 13 }}><MonoValue value={item.purchaseQuantity} /></td>
                                      <td className="py-2 text-right" style={{ fontSize: 13 }}><MonoValue value={`Php ${item.unitCost.toLocaleString()}`} /></td>
                                      <td className="py-2 pr-4 text-right" style={{ fontSize: 13, fontWeight: 500 }}><MonoValue value={`Php ${(item.purchaseQuantity * item.unitCost).toLocaleString()}`} /></td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal title={modal === "create" ? "New Purchase Order" : "Edit Purchase Order"} open={modal === "create" || modal === "edit"} onClose={() => setModal(null)} onSubmit={handleSave} submitLabel={modal === "create" ? "Create Order" : "Save Changes"} size="xl">
        {error && <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: "#ef444418", color: "#ef4444", fontSize: 12 }}>{error}</div>}
        <div className="grid grid-cols-2 gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
          <Field label="Supplier" required>
            <Select value={form.supplierID.toString()} onChange={(e) => setForm(p => ({ ...p, supplierID: parseInt(e.target.value) || 0 }))}>
              <option value="0">Select supplier...</option>
              {suppliers.map(s => <option key={s.supplierID} value={s.supplierID}>{s.supplierName}</option>)}
            </Select>
          </Field>
          <Field label="Order Date" required>
            <Input type="date" value={form.purchaseDate} onChange={(e) => setForm(p => ({ ...p, purchaseDate: e.target.value }))} />
          </Field>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>Line Items</label>
          <button type="button" onClick={addItem} className="text-xs font-medium px-2 py-1 rounded" style={{ background: "var(--muted)", color: "var(--foreground)" }}>+ Add Item</button>
        </div>

        <div className="space-y-2">
          {form.details.map((item, index) => (
            <div key={index} className="flex gap-2 items-start p-3 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
              <div className="flex-1">
                <Select value={item.productId.toString()} onChange={(e) => updateItem(index, "productId", parseInt(e.target.value) || 0)}>
                  <option value="0">Select product...</option>
                  {products.map(p => <option key={p.productID} value={p.productID}>{p.productName}</option>)}
                </Select>
              </div>
              <div className="w-24">
                <Input type="number" min={1} placeholder="Qty" value={item.purchaseQuantity} onChange={(e) => updateItem(index, "purchaseQuantity", parseInt(e.target.value) || 0)} />
              </div>
              <div className="w-32">
                <Input type="number" min={0} step="0.01" placeholder="Unit Cost" value={item.unitCost} onChange={(e) => updateItem(index, "unitCost", parseFloat(e.target.value) || 0)} />
              </div>
              <div className="w-32 py-2 text-right" style={{ fontSize: 13, fontWeight: 500 }}>
                Php {(item.purchaseQuantity * item.unitCost).toLocaleString()}
              </div>
              <button type="button" onClick={() => removeItem(index)} className="p-2 hover:bg-red-500/10 rounded-md transition-colors" style={{ color: "#ef4444" }}><Trash2 size={16} /></button>
            </div>
          ))}
          {form.details.length === 0 && (
            <div className="p-8 text-center rounded-lg" style={{ border: "1px dashed var(--border)", color: "var(--muted-foreground)", fontSize: 13 }}>No items added to this order yet.</div>
          )}
        </div>
      </Modal>

      <ConfirmDialog open={modal === "delete"} onClose={() => setModal(null)} onConfirm={() => { if (selected) deletePurchaseOrder(selected.purchaseOrderID); setModal(null); }} label={`Purchase Order #${selected?.purchaseOrderID}`} />
    </div>
  );
}