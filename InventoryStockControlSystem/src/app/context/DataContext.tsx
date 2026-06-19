import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, Category, Supplier, Warehouse, Product, Inventory, StockMovement, PurchaseOrder } from "../data/mockData";

//const API_URL = import.meta.env.VITE_API_URL;
const API_URL = "https://localhost:7131/api";

interface DataContextType {
    isLoading: boolean;
    currentUserID: number;
    users: User[]; categories: Category[]; suppliers: Supplier[]; warehouses: Warehouse[];
    products: Product[]; inventory: Inventory[]; stockMovements: StockMovement[]; purchaseOrders: PurchaseOrder[];

    addCategory: (c: any) => Promise<void>; updateCategory: (c: any) => Promise<void>; deleteCategory: (id: number) => Promise<void>;
    addSupplier: (s: any) => Promise<void>; updateSupplier: (s: any) => Promise<void>; deleteSupplier: (id: number) => Promise<void>;
    addWarehouse: (w: any) => Promise<void>; updateWarehouse: (w: any) => Promise<void>; deleteWarehouse: (id: number) => Promise<void>;
    addProduct: (p: any) => Promise<void>; updateProduct: (p: any) => Promise<void>; deleteProduct: (id: number) => Promise<void>;
    addStockMovement: (m: any) => Promise<void>; deleteStockMovement: (id: number) => Promise<void>;
    addPurchaseOrder: (po: any) => Promise<void>; updatePurchaseOrder: (po: any) => Promise<void>; deletePurchaseOrder: (id: number) => Promise<void>;
    addInventory: (i: any) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children, currentUserID }: { children: React.ReactNode; currentUserID: number }) {
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [catRes, supRes, whRes, invRes, prodRes, poRes, usrRes, movRes] = await Promise.all([
                    fetch(`${API_URL}/Categories`), fetch(`${API_URL}/Suppliers`), fetch(`${API_URL}/Warehouses`), fetch(`${API_URL}/Inventory`),
                    fetch(`${API_URL}/Products`), fetch(`${API_URL}/PurchaseOrders`), fetch(`${API_URL}/Users`), fetch(`${API_URL}/StockMovements`)
                ]);
                setCategories(await catRes.json()); setSuppliers(await supRes.json()); setWarehouses(await whRes.json());
                setInventory(await invRes.json()); setProducts(await prodRes.json()); setPurchaseOrders(await poRes.json());
                setUsers(await usrRes.json()); setStockMovements(await movRes.json());
            } catch (error) { console.error("API Connection Failed", error); } 
            finally { setIsLoading(false); }
        };
        fetchAllData();
    }, []);

    const executeAndRefresh = async (url: string, method: string, body?: any) => {
        const res = await fetch(url, {
            method,
            headers: body ? { "Content-Type": "application/json" } : undefined,
            body: body ? JSON.stringify(body) : undefined
        });
        if (!res.ok) {
            let errMsg = "Database transaction failed";
            try {
                const errData = await res.json();
                if (errData && errData.message) errMsg = errData.message;
            } catch (e) {}
            alert("⚠️ SYSTEM ERROR:\n" + errMsg);
            throw new Error(errMsg);
        }
    };

    const addCategory = async (c: any) => { await executeAndRefresh(`${API_URL}/Categories`, "POST", c); setCategories(await (await fetch(`${API_URL}/Categories`)).json()); };
    const updateCategory = async (c: any) => { await executeAndRefresh(`${API_URL}/Categories/${c.categoryID || c.categoryId}`, "PUT", c); setCategories(await (await fetch(`${API_URL}/Categories`)).json()); };
    const deleteCategory = async (id: number) => { await executeAndRefresh(`${API_URL}/Categories/${id}`, "DELETE"); setCategories(await (await fetch(`${API_URL}/Categories`)).json()); };

    const addSupplier = async (s: any) => { await executeAndRefresh(`${API_URL}/Suppliers`, "POST", s); setSuppliers(await (await fetch(`${API_URL}/Suppliers`)).json()); };
    const updateSupplier = async (s: any) => { await executeAndRefresh(`${API_URL}/Suppliers/${s.supplierID || s.supplierId}`, "PUT", s); setSuppliers(await (await fetch(`${API_URL}/Suppliers`)).json()); };
    const deleteSupplier = async (id: number) => { await executeAndRefresh(`${API_URL}/Suppliers/${id}`, "DELETE"); setSuppliers(await (await fetch(`${API_URL}/Suppliers`)).json()); };

    const addWarehouse = async (w: any) => { await executeAndRefresh(`${API_URL}/Warehouses`, "POST", w); setWarehouses(await (await fetch(`${API_URL}/Warehouses`)).json()); };
    const updateWarehouse = async (w: any) => { await executeAndRefresh(`${API_URL}/Warehouses/${w.warehouseID || w.warehouseId}`, "PUT", w); setWarehouses(await (await fetch(`${API_URL}/Warehouses`)).json()); };
    const deleteWarehouse = async (id: number) => { await executeAndRefresh(`${API_URL}/Warehouses/${id}`, "DELETE"); setWarehouses(await (await fetch(`${API_URL}/Warehouses`)).json()); };

    const addProduct = async (p: any) => { await executeAndRefresh(`${API_URL}/Products`, "POST", p); setProducts(await (await fetch(`${API_URL}/Products`)).json()); };
    const updateProduct = async (p: any) => { await executeAndRefresh(`${API_URL}/Products/${p.productID || p.productId}`, "PUT", p); setProducts(await (await fetch(`${API_URL}/Products`)).json()); };
    const deleteProduct = async (id: number) => { await executeAndRefresh(`${API_URL}/Products/${id}`, "DELETE"); setProducts(await (await fetch(`${API_URL}/Products`)).json()); };

    const addStockMovement = async (m: any) => { 
        await executeAndRefresh(`${API_URL}/StockMovements`, "POST", m); 
        setStockMovements(await (await fetch(`${API_URL}/StockMovements`)).json()); 
        setInventory(await (await fetch(`${API_URL}/Inventory`)).json()); 
        
        // FIX: Triggers a silent Network Request so React immediately sees any Draft POs!
        setPurchaseOrders(await (await fetch(`${API_URL}/PurchaseOrders`)).json()); 
    };
    
    const deleteStockMovement = async (id: number) => { await executeAndRefresh(`${API_URL}/StockMovements/${id}`, "DELETE"); setStockMovements(await (await fetch(`${API_URL}/StockMovements`)).json()); };

    const addPurchaseOrder = async (po: any) => { await executeAndRefresh(`${API_URL}/PurchaseOrders`, "POST", po); setPurchaseOrders(await (await fetch(`${API_URL}/PurchaseOrders`)).json()); };
    const updatePurchaseOrder = async (po: any) => { await executeAndRefresh(`${API_URL}/PurchaseOrders/${po.purchaseOrderID || po.purchaseOrderId}`, "PUT", po); setPurchaseOrders(await (await fetch(`${API_URL}/PurchaseOrders`)).json()); };
    const deletePurchaseOrder = async (id: number) => { await executeAndRefresh(`${API_URL}/PurchaseOrders/${id}`, "DELETE"); setPurchaseOrders(await (await fetch(`${API_URL}/PurchaseOrders`)).json()); };

    const addInventory = async (i: any) => { 
        await executeAndRefresh(`${API_URL}/Inventory`, "POST", i); 
        setInventory(await (await fetch(`${API_URL}/Inventory`)).json()); 
    };

    const value: DataContextType = {
        isLoading, currentUserID, users, categories, suppliers, warehouses, products, inventory, stockMovements, purchaseOrders,
        addCategory, updateCategory, deleteCategory, addSupplier, updateSupplier, deleteSupplier, addWarehouse, updateWarehouse, deleteWarehouse,
        addProduct, updateProduct, deleteProduct, addStockMovement, deleteStockMovement, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, addInventory
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useData must be used within DataProvider");
    return ctx;
}