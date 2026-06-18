import { useState, Fragment } from "react";
import { Badge, MonoValue } from "./DataTable";
import { Modal, Field, Input, Select, FormGrid } from "./Modal";
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
  const { purchaseOrders, suppliers, products, warehouses, currentUserID, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, addStockMovement } = useData();
  
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [confirmAction, setConfirmAction] = useState<"add" | "edit" | "delete" | "receive" | null>(null);
  
  const [form, setForm] = useState<POForm>(blank());
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  
  const [receiveWarehouse, setReceiveWarehouse] = useState<number>(0);
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

  const handlePreSave = () => {
    if (!form.supplierID) return setError("Please select a supplier.");
    if (!form.purchaseDate) return setError("Please enter a purchase date.");
    if (form.details.length === 0) return setError("You must add at least one line item.");

    const hasBadItems = form.details.some((d) => !d.productId || d.purchaseQuantity <= 0 || d.unitCost < 0);
    if (hasBadItems) return setError("All line items must have a valid product and a quantity greater than zero.");

    setConfirmAction(modal === "create" ? "add" : "edit");
  };

  const executeAction = async () => {
    setError("");

    if (confirmAction === "add") {
      addPurchaseOrder({ ...form, createdBy: currentUserID });
    } 
    else if (confirmAction === "edit" && selected) {
      updatePurchaseOrder({ ...selected, ...form });
    } 
    else if (confirmAction === "delete" && selected) {
      deletePurchaseOrder(selected.purchaseOrderID);
    } 
    else if (confirmAction === "receive" && selected) {
      if (!receiveWarehouse) {
        setError("You must select a destination warehouse to auto-receive inventory.");
        return; 
      }

      try {
        await updatePurchaseOrder({
          ...selected,
          deliveryStatus: "Delivered",
          receivedDate: new Date().toISOString().split("T")[0],
          receivedBy: currentUserID
        });

        const movements = selected.details.map((item) => 
          addStockMovement({
            warehouseID: receiveWarehouse,
            productID: item.productId,
            movementType: "Stock In",
            movementQuantity: item.purchaseQuantity,
            movementReference: `PO-${selected.purchaseOrderID}`,
            processedBy: currentUserID
          })
        );
        
        await Promise.all(movements);
      } catch (err) {
        setError("Failed to update Purchase Order. Stock movements were aborted.");
        return;
      }
    }

    setConfirmAction(null);
    setModal(null);
  };

  const cols = [
    { key: "expand", label: "", width: 36, align: "center" as const },
    { key: "purchaseOrderID", label: "PO Number", align: "center" as const },
    { key: "supplierName", label: "Supplier", align: "left" as const },
    { key: "purchaseDate", label: "Order Date", align: "center" as const },
    { key: "receivedDate", label: "Received", align: "center" as const },
    { key: "deliveryStatus", label: "Status", align: "center" as const },
    { key: "total", label: "Order Total", align: "right" as const },
    { key: "items", label: "Lines", align: "center" as const },
    { key: "createdByName", label: "Created By", align: "left" as const },
    { key: "actions", label: "Actions", align: "center" as const },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold mb-1 text-[var(--foreground)]">Purchase Orders</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Manage inbound orders and supplier shipments.</p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Orders List</h3>
            <p className="text-xs text-[var(--muted-foreground)]">{purchaseOrders.length} total orders</p>
          </div>
          {canAdd && (
            <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus size={14} /> New Purchase Order
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                {cols.map((c) => <th key={c.key} className="px-4 py-3 font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wider" style={{ textAlign: c.align, width: c.width }}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => {
                const isExpanded = expanded.has(po.purchaseOrderID);
                const totalAmount = po.details ? po.details.reduce((s, d) => s + (d.purchaseQuantity * d.unitCost), 0) : 0;

                return (
                  <Fragment key={po.purchaseOrderID}>
                    <tr className={`border-b border-[var(--border)] transition-colors hover:bg-[var(--muted)] ${isExpanded ? "bg-[var(--muted)]" : ""}`}>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleExpand(po.purchaseOrderID)} className="p-1 rounded text-[var(--muted-foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center"><MonoValue value={po.purchaseOrderID} /></td>
                      <td className="px-4 py-3 text-left font-medium text-[var(--foreground)]">{po.supplierName}</td>
                      <td className="px-4 py-3 text-center text-[var(--muted-foreground)] text-xs">{new Date(po.purchaseDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center text-[var(--muted-foreground)] text-xs">{po.receivedDate ? new Date(po.receivedDate).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3 text-center"><Badge label={po.deliveryStatus} color={statusColors[po.deliveryStatus]} /></td>
                      <td className="px-4 py-3 text-right"><MonoValue value={`Php ${totalAmount.toLocaleString()}`} /></td>
                      <td className="px-4 py-3 text-center"><MonoValue value={po.details?.length || 0} /></td>
                      <td className="px-4 py-3 text-left text-xs text-[var(--muted-foreground)]">{po.createdByName}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {canModify && po.deliveryStatus !== "Delivered" && po.deliveryStatus !== "Cancelled" && (
                            <button onClick={() => { 
                              setSelected(po); 
                              setReceiveWarehouse(warehouses[0]?.warehouseID || 0);
                              setError(""); 
                              setConfirmAction("receive"); 
                            }} title="Mark as Delivered" className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"><Package size={16} /></button>
                          )}
                          {canEdit && (
                            <>
                              <button onClick={() => openEdit(po)} title="Edit Order" className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"><Pencil size={16} /></button>
                              <button onClick={() => { setSelected(po); setError(""); setConfirmAction("delete"); }} title="Delete Order" className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                        <td colSpan={10} className="p-0">
                          <div className="pl-14 pr-8 py-4 bg-black/5 dark:bg-white/5">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-[var(--border)]">
                                  <th className="pb-2 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Product Name</th>
                                  <th className="pb-2 text-center text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Qty</th>
                                  <th className="pb-2 text-right text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Unit Cost</th>
                                  <th className="pb-2 pr-4 text-right text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {po.details?.map((item: any, i: number) => {
                                  const p = products.find(prod => prod.productID === item.productId);
                                  return (
                                    <tr key={i} className={i !== po.details.length - 1 ? "border-b border-[var(--border)]" : ""}>
                                      <td className="py-2 text-[var(--foreground)] font-medium text-sm">{p?.productName || "Unknown"}</td>
                                      <td className="py-2 text-center text-sm"><MonoValue value={item.purchaseQuantity} /></td>
                                      <td className="py-2 text-right text-sm"><MonoValue value={`Php ${item.unitCost.toLocaleString()}`} /></td>
                                      <td className="py-2 pr-4 text-right text-sm font-medium"><MonoValue value={`Php ${(item.purchaseQuantity * item.unitCost).toLocaleString()}`} /></td>
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

      {/* Form Modal */}
      <Modal title={modal === "create" ? "New Purchase Order" : "Edit Purchase Order"} open={modal === "create" || modal === "edit"} onClose={() => setModal(null)} onSubmit={handlePreSave} submitLabel={modal === "create" ? "Create Order" : "Save Changes"} size="xl">
        <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-[var(--border)]">
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
          <label className="text-sm font-semibold text-[var(--foreground)]">Line Items</label>
          <button type="button" onClick={addItem} className="text-xs font-medium px-2 py-1 rounded bg-[var(--muted)] text-[var(--foreground)] hover:brightness-95 transition-colors">+ Add Item</button>
        </div>

        <div className="space-y-2">
          {form.details.map((item, index) => (
            <div key={index} className="flex gap-2 items-start p-3 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
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
              <div className="w-32 py-2 text-right text-sm font-medium text-[var(--foreground)]">
                Php {(item.purchaseQuantity * item.unitCost).toLocaleString()}
              </div>
              <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 size={16} /></button>
            </div>
          ))}
          {form.details.length === 0 && (
            <div className="p-8 text-center rounded-lg border border-dashed border-[var(--border)] text-[var(--muted-foreground)] text-sm">No items added to this order yet.</div>
          )}
        </div>
      </Modal>

      {/* Universal Confirmation Modal */}
      <Modal title={confirmAction === "receive" ? "Receive Order" : "Confirm Action"} open={!!confirmAction} onClose={() => setConfirmAction(null)} onSubmit={executeAction} submitLabel="Yes, Proceed" size="sm">
        {error && <div className="mb-4 px-3 py-2 rounded bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>}
        
        <div className="p-2 text-sm text-[var(--foreground)]">
          {confirmAction === "receive" ? (
            <>
              <p className="mb-4">You are about to mark this order as <strong>Delivered</strong>.</p>
              <Field label="Destination Warehouse" required>
                <Select value={receiveWarehouse.toString()} onChange={(e) => setReceiveWarehouse(parseInt(e.target.value) || 0)}>
                  <option value="0">Select warehouse...</option>
                  {warehouses.map(w => <option key={w.warehouseID} value={w.warehouseID}>{w.warehouseName}</option>)}
                </Select>
              </Field>
              <div className="mt-4 text-xs text-emerald-600 font-medium bg-emerald-50 p-2 rounded">
                Automation: This will instantly update the status and inject all line items into your live inventory.
              </div>
            </>
          ) : (
            <>
              Are you sure you want to <strong>{
                confirmAction === "add" ? "create this new purchase order" :
                confirmAction === "edit" ? "save changes to this purchase order" :
                "delete this purchase order"
              }</strong>?
              {confirmAction === "delete" && <div className="mt-2 text-xs text-red-500 font-medium">Warning: This action cannot be undone and will delete all associated line items.</div>}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}