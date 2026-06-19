export type UserRole = "Admin" | "Manager" | "Staff";
export type DeliveryStatus = "Draft" | "Pending" | "In Transit" | "Delivered" | "Cancelled";
export type MovementType = "Stock In" | "Stock Out" | "Transfer" | "Adjustment" | "Return";

export interface User { userID: number; username: string; fullName: string; userRole: UserRole; }
export interface Category { categoryID: number; categoryName: string; categoryDescription: string; }
export interface Supplier { supplierID: number; supplierName: string; contactNumber: string; emailAddress: string; supplierAddress: string; }
export interface Warehouse { warehouseID: number; warehouseName: string; warehouseLocation: string; }

export interface Product {
    productID: number;
    categoryID: number;
    categoryName: string;
    productName: string;
    description: string;
    price: number;
    leadTime: number;
    reorderLevel: number;
    minimumStockQuantity: number;
    supplierID: number;
    supplierName: string;
}

export interface Inventory {
    inventoryID: number;
    productID: number;
    warehouseID: number;
    productName: string;
    warehouseName: string;
    productQuantity: number;
}

export interface StockMovement {
    stockMovementID: number;
    warehouseName: string;
    productName: string;
    movementType: MovementType;
    movementDate: string;
    movementQuantity: number;
    movementReference: string;
    processedByName: string;
}

export interface PurchaseOrder {
    purchaseOrderID: number;
    supplierID: number;
    purchaseDate: string;
    receivedDate: string | null;
    deliveryStatus: DeliveryStatus;
    supplierName: string;
    createdBy: number;
    createdByName: string;
    receivedBy: number | null;
    details: PurchaseOrderDetail[];
}

export interface PurchaseOrderDetail {
    purchaseOrderDetailId: string | number;
    purchaseOrderId: number;
    productId: number;
    purchaseQuantity: number;
    unitCost: number;
    totalAmount: number;
}