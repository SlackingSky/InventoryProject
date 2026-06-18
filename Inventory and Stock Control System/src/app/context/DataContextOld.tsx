import React, { createContext, useContext, useState } from "react";
import {
  users as initialUsers,
  categories as initialCategories,
  suppliers as initialSuppliers,
  warehouses as initialWarehouses,
  products as initialProducts,
  inventory as initialInventory,
  stockMovements as initialMovements,
  purchaseOrders as initialPOs,
} from "../data/mockData";
import type {
  User, Category, Supplier, Warehouse, Product,
  Inventory, StockMovement, PurchaseOrder,
} from "../data/mockData";

interface DataContextType {
  currentUserID: string;
  users: User[];
  categories: Category[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  products: Product[];
  inventory: Inventory[];
  stockMovements: StockMovement[];
  purchaseOrders: PurchaseOrder[];

  addUser: (u: Omit<User, "userID">) => void;
  updateUser: (u: User) => void;
  deleteUser: (id: string) => void;

  addCategory: (c: Omit<Category, "categoryID">) => void;
  updateCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;

  addSupplier: (s: Omit<Supplier, "supplierID">) => void;
  updateSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;

  addWarehouse: (w: Omit<Warehouse, "warehouseID">) => void;
  updateWarehouse: (w: Warehouse) => void;
  deleteWarehouse: (id: string) => void;

  addProduct: (p: Omit<Product, "productID">) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;

  addInventory: (i: Omit<Inventory, "inventoryID">) => void;
  updateInventory: (i: Inventory) => void;
  deleteInventory: (id: string) => void;

  addStockMovement: (m: Omit<StockMovement, "stockMovementID">) => void;
  updateStockMovement: (m: StockMovement) => void;
  deleteStockMovement: (id: string) => void;

  addPurchaseOrder: (po: Omit<PurchaseOrder, "purchaseOrderID">) => void;
  updatePurchaseOrder: (po: PurchaseOrder) => void;
  deletePurchaseOrder: (id: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

function nextId(prefix: string, existing: string[]): string {
  const nums = existing
    .map((id) => parseInt(id.replace(/\D/g, ""), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

function nextPoId(existing: string[]): string {
  const nums = existing.map((id) => parseInt(id.replace(/\D/g, ""), 10)).filter((n) => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `PO-2026-${String(next).padStart(4, "0")}`;
}

export function DataProvider({ children, currentUserID }: { children: React.ReactNode; currentUserID: string }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [inventory, setInventory] = useState<Inventory[]>(initialInventory);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialMovements);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPOs);

  const value: DataContextType = {
    currentUserID, users, categories, suppliers, warehouses, products, inventory, stockMovements, purchaseOrders,

    addUser: (u) => setUsers((p) => [...p, { ...u, userID: nextId("USR", p.map((x) => x.userID)) }]),
    updateUser: (u) => setUsers((p) => p.map((x) => (x.userID === u.userID ? u : x))),
    deleteUser: (id) => setUsers((p) => p.filter((x) => x.userID !== id)),

    addCategory: (c) => setCategories((p) => [...p, { ...c, categoryID: nextId("CAT", p.map((x) => x.categoryID)) }]),
    updateCategory: (c) => setCategories((p) => p.map((x) => (x.categoryID === c.categoryID ? c : x))),
    deleteCategory: (id) => setCategories((p) => p.filter((x) => x.categoryID !== id)),

    addSupplier: (s) => setSuppliers((p) => [...p, { ...s, supplierID: nextId("SUP", p.map((x) => x.supplierID)) }]),
    updateSupplier: (s) => setSuppliers((p) => p.map((x) => (x.supplierID === s.supplierID ? s : x))),
    deleteSupplier: (id) => setSuppliers((p) => p.filter((x) => x.supplierID !== id)),

    addWarehouse: (w) => setWarehouses((p) => [...p, { ...w, warehouseID: nextId("WH", p.map((x) => x.warehouseID)) }]),
    updateWarehouse: (w) => setWarehouses((p) => p.map((x) => (x.warehouseID === w.warehouseID ? w : x))),
    deleteWarehouse: (id) => setWarehouses((p) => p.filter((x) => x.warehouseID !== id)),

    addProduct: (p) => setProducts((prev) => [...prev, { ...p, productID: nextId("PRD", prev.map((x) => x.productID)) }]),
    updateProduct: (p) => setProducts((prev) => prev.map((x) => (x.productID === p.productID ? p : x))),
    deleteProduct: (id) => setProducts((p) => p.filter((x) => x.productID !== id)),

    addInventory: (i) => setInventory((p) => [...p, { ...i, inventoryID: nextId("INV", p.map((x) => x.inventoryID)) }]),
    updateInventory: (i) => setInventory((p) => p.map((x) => (x.inventoryID === i.inventoryID ? i : x))),
    deleteInventory: (id) => setInventory((p) => p.filter((x) => x.inventoryID !== id)),

    addStockMovement: (m) => setStockMovements((p) => [...p, { ...m, stockMovementID: nextId("MOV", p.map((x) => x.stockMovementID)) }]),
    updateStockMovement: (m) => setStockMovements((p) => p.map((x) => (x.stockMovementID === m.stockMovementID ? m : x))),
    deleteStockMovement: (id) => setStockMovements((p) => p.filter((x) => x.stockMovementID !== id)),

    addPurchaseOrder: (po) => setPurchaseOrders((p) => [...p, { ...po, purchaseOrderID: nextPoId(p.map((x) => x.purchaseOrderID)) }]),
    updatePurchaseOrder: (po) => setPurchaseOrders((p) => p.map((x) => (x.purchaseOrderID === po.purchaseOrderID ? po : x))),
    deletePurchaseOrder: (id) => setPurchaseOrders((p) => p.filter((x) => x.purchaseOrderID !== id)),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
