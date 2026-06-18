import React, { createContext, useContext, useState, useEffect } from "react";
import type {
    User, Category, Supplier, Warehouse, Product,
    Inventory, StockMovement, PurchaseOrder,
} from "../data/mockData";

//const API_URL = "https://localhost:7131/api";
const API_URL = "https://demanding-envy-isolation.ngrok-free.dev/api";

interface DataContextType {
    currentUserID: number;
    users: User[];
    categories: Category[];
    suppliers: Supplier[];
    warehouses: Warehouse[];
    products: Product[];
    inventory: Inventory[];
    stockMovements: StockMovement[];
    purchaseOrders: PurchaseOrder[];

    addCategory: (c: Omit<Category, "categoryId">) => void;
    updateCategory: (c: Category) => void;
    deleteCategory: (id: number) => void;

    addSupplier: (s: Omit<Supplier, "supplierId">) => void;
    updateSupplier: (s: Supplier) => void;
    deleteSupplier: (id: number) => void;

    addWarehouse: (w: Omit<Warehouse, "warehouseId">) => void;
    updateWarehouse: (w: Warehouse) => void;
    deleteWarehouse: (id: number) => void;

    addProduct: (p: any) => void;
    updateProduct: (p: any) => void;
    deleteProduct: (id: number) => void;

    addStockMovement: (m: any) => void;
    deleteStockMovement: (id: number) => void;

    addPurchaseOrder: (po: any) => void;
    updatePurchaseOrder: (po: any) => void;
    deletePurchaseOrder: (id: number) => void;

    addInventory: (i: any) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children, currentUserID }: { children: React.ReactNode; currentUserID: number }) {
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
            try {
                const [catRes, supRes, whRes, invRes, prodRes, poRes, usrRes, movRes] = await Promise.all([
                    fetch(`${API_URL}/Categories`),
                    fetch(`${API_URL}/Suppliers`),
                    fetch(`${API_URL}/Warehouses`),
                    fetch(`${API_URL}/Inventory`),
                    fetch(`${API_URL}/Products`),
                    fetch(`${API_URL}/PurchaseOrders`),
                    fetch(`${API_URL}/Users`),
                    fetch(`${API_URL}/StockMovements`)
                ]);

                setCategories(await catRes.json());
                setSuppliers(await supRes.json());
                setWarehouses(await whRes.json());
                setInventory(await invRes.json());
                setProducts(await prodRes.json());
                setPurchaseOrders(await poRes.json());
                setUsers(await usrRes.json());
                setStockMovements(await movRes.json());
            } catch (error) {
                console.error("Failed to connect to API.", error);
            }
        };
        fetchAllData();
    }, []);

    const addCategory = async (c: Omit<Category, "categoryId">) => {
        await fetch(`${API_URL}/Categories`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) });
        setCategories(await (await fetch(`${API_URL}/Categories`)).json());
    };
    const updateCategory = async (c: Category) => {
        await fetch(`${API_URL}/Categories/${c.categoryID}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) });
        setCategories(await (await fetch(`${API_URL}/Categories`)).json());
    };
    const deleteCategory = async (id: number) => {
        await fetch(`${API_URL}/Categories/${id}`, { method: "DELETE" });
        setCategories(await (await fetch(`${API_URL}/Categories`)).json());
    };

    const addSupplier = async (s: Omit<Supplier, "supplierId">) => {
        await fetch(`${API_URL}/Suppliers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
        setSuppliers(await (await fetch(`${API_URL}/Suppliers`)).json());
    };
    const updateSupplier = async (s: Supplier) => {
        await fetch(`${API_URL}/Suppliers/${s.supplierID}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
        setSuppliers(await (await fetch(`${API_URL}/Suppliers`)).json());
    };
    const deleteSupplier = async (id: number) => {
        await fetch(`${API_URL}/Suppliers/${id}`, { method: "DELETE" });
        setSuppliers(await (await fetch(`${API_URL}/Suppliers`)).json());
    };

    const addWarehouse = async (w: Omit<Warehouse, "warehouseId">) => {
        await fetch(`${API_URL}/Warehouses`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(w) });
        setWarehouses(await (await fetch(`${API_URL}/Warehouses`)).json());
    };
    const updateWarehouse = async (w: Warehouse) => {
        await fetch(`${API_URL}/Warehouses/${w.warehouseID}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(w) });
        setWarehouses(await (await fetch(`${API_URL}/Warehouses`)).json());
    };
    const deleteWarehouse = async (id: number) => {
        await fetch(`${API_URL}/Warehouses/${id}`, { method: "DELETE" });
        setWarehouses(await (await fetch(`${API_URL}/Warehouses`)).json());
    };

    const addProduct = async (p: any) => {
        await fetch(`${API_URL}/Products`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
        setProducts(await (await fetch(`${API_URL}/Products`)).json());
    };
    const updateProduct = async (p: any) => {
        await fetch(`${API_URL}/Products/${p.productID}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
        setProducts(await (await fetch(`${API_URL}/Products`)).json());
    };
    const deleteProduct = async (id: number) => {
        await fetch(`${API_URL}/Products/${id}`, { method: "DELETE" });
        setProducts(await (await fetch(`${API_URL}/Products`)).json());
    };

    const addStockMovement = async (m: any) => {
        await fetch(`${API_URL}/StockMovements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(m) });
        setStockMovements(await (await fetch(`${API_URL}/StockMovements`)).json());
        setInventory(await (await fetch(`${API_URL}/Inventory`)).json());
    };
    const deleteStockMovement = async (id: number) => {
        await fetch(`${API_URL}/StockMovements/${id}`, { method: "DELETE" });
        setStockMovements(await (await fetch(`${API_URL}/StockMovements`)).json());
    };

    const addPurchaseOrder = async (po: any) => {
        await fetch(`${API_URL}/PurchaseOrders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(po) });
        setPurchaseOrders(await (await fetch(`${API_URL}/PurchaseOrders`)).json());
    };
    const updatePurchaseOrder = async (po: any) => {
        await fetch(`${API_URL}/PurchaseOrders/${po.purchaseOrderID}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(po) });
        setPurchaseOrders(await (await fetch(`${API_URL}/PurchaseOrders`)).json());
    };
    const deletePurchaseOrder = async (id: number) => {
        await fetch(`${API_URL}/PurchaseOrders/${id}`, { method: "DELETE" });
        setPurchaseOrders(await (await fetch(`${API_URL}/PurchaseOrders`)).json());
    };

    const addInventory = async (i: any) => {
        await fetch(`${API_URL}/Inventory`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(i) });
        setInventory(await (await fetch(`${API_URL}/Inventory`)).json());
    };

    const value: DataContextType = {
        currentUserID, users, categories, suppliers, warehouses, products, inventory, stockMovements, purchaseOrders,
        addCategory, updateCategory, deleteCategory,
        addSupplier, updateSupplier, deleteSupplier,
        addWarehouse, updateWarehouse, deleteWarehouse,
        addProduct, updateProduct, deleteProduct,
        addStockMovement, deleteStockMovement,
        addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
        addInventory
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useData must be used within DataProvider");
    return ctx;
}