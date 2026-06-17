export type UserRole = "Admin" | "Manager" | "Staff";
export type DeliveryStatus = "Pending" | "In Transit" | "Delivered" | "Cancelled";
export type MovementType = "Stock In" | "Stock Out" | "Transfer" | "Adjustment" | "Return";

export interface User {
  userID: string;
  username: string;
  fullName: string;
  userRole: UserRole;
}

export interface Category {
  categoryID: string;
  categoryName: string;
  categoryDescription: string;
}

export interface Supplier {
  supplierID: string;
  supplierName: string;
  contactNumber: string;
  emailAddress: string;
  supplierAddress: string;
}

export interface Warehouse {
  warehouseID: string;
  warehouseName: string;
  warehouseLocation: string;
}

export interface Product {
  productID: string;
  categoryID: string;
  productName: string;
  description: string;
  price: number;
  reorderLevel: number;
  minimumStockQuantity: number;
  supplierID: string;
}

export interface Inventory {
  inventoryID: string;
  productID: string;
  warehouseID: string;
  productQuantity: number;
}

export interface StockMovement {
  stockMovementID: string;
  warehouseID: string;
  productID: string;
  movementType: MovementType;
  movementDate: string;
  movementQuantity: number;
  movementReference: string;
  processedBy: string;
}

export interface PurchaseOrder {
  purchaseOrderID: string;
  supplierID: string;
  purchaseDate: string;
  receivedDate: string | null;
  deliveryStatus: DeliveryStatus;
  createdBy: string;
  receivedBy: string | null;
  details: PurchaseOrderDetail[];
}

export interface PurchaseOrderDetail {
  purchaseOrderDetailID: string;
  purchaseOrderID: string;
  productID: string;
  purchaseQuantity: number;
  unitCost: number;
  totalAmount: number;
}

export const users: User[] = [
  { userID: "USR001", username: "admin.ross", fullName: "Richard Ross", userRole: "Admin" },
  { userID: "USR002", username: "mgr.santos", fullName: "Maria Santos", userRole: "Manager" },
  { userID: "USR003", username: "staff.lee", fullName: "James Lee", userRole: "Staff" },
  { userID: "USR004", username: "staff.garcia", fullName: "Sofia Garcia", userRole: "Staff" },
  { userID: "USR005", username: "staff.chen", fullName: "Kevin Chen", userRole: "Staff" },
];

export const categories: Category[] = [
  { categoryID: "CAT001", categoryName: "Smartphones", categoryDescription: "Mobile devices including iPhones, Androids, and feature phones." },
  { categoryID: "CAT002", categoryName: "Laptops", categoryDescription: "Portable computers including ultrabooks, gaming laptops, and workstations." },
  { categoryID: "CAT003", categoryName: "Tablets", categoryDescription: "Portable flat-panel computing devices." },
  { categoryID: "CAT004", categoryName: "Networking", categoryDescription: "Routers, switches, access points, and network infrastructure equipment." },
  { categoryID: "CAT005", categoryName: "Audio", categoryDescription: "Headphones, speakers, earbuds, and audio accessories." },
  { categoryID: "CAT006", categoryName: "Peripherals", categoryDescription: "Keyboards, mice, monitors, and other computer peripherals." },
];

export const suppliers: Supplier[] = [
  { supplierID: "SUP001", supplierName: "TechCore Distributors", contactNumber: "(+63) 917-123-4567", emailAddress: "orders@techcore.com", supplierAddress: "1200 Silicon Ave, San Jose, CA 95002" },
  { supplierID: "SUP002", supplierName: "ElectroPrime Inc.", contactNumber: "(+63) 918-234-5678", emailAddress: "supply@electroprime.com", supplierAddress: "400 Circuit Blvd, Austin, TX 78701" },
  { supplierID: "SUP003", supplierName: "GlobalTech Wholesale", contactNumber: "(+63) 919-345-6789", emailAddress: "wholesale@globaltech.com", supplierAddress: "789 Trade Center Dr, Seattle, WA 98101" },
  { supplierID: "SUP004", supplierName: "ApexElectronics Co.", contactNumber: "(+63) 920-456-7890", emailAddress: "sales@apexelec.com", supplierAddress: "55 Innovation Park, Boston, MA 02101" },
];

export const warehouses: Warehouse[] = [
  { warehouseID: "WH001", warehouseName: "Main Distribution Center", warehouseLocation: "1500 Logistics Way, Chicago, IL 60601" },
  { warehouseID: "WH002", warehouseName: "West Coast Hub", warehouseLocation: "900 Harbor Blvd, Los Angeles, CA 90001" },
  { warehouseID: "WH003", warehouseName: "East Coast Depot", warehouseLocation: "220 Industrial Rd, Newark, NJ 07101" },
];

export const products: Product[] = [
  { productID: "PRD001", categoryID: "CAT001", productName: "iPhone 15 Pro Max 256GB", description: "Apple's flagship smartphone with A17 Pro chip, titanium build, and 48MP camera system.", price: 1199.00, reorderLevel: 50, minimumStockQuantity: 20, supplierID: "SUP001" },
  { productID: "PRD002", categoryID: "CAT001", productName: "Samsung Galaxy S24 Ultra", description: "Samsung's premium smartphone with AI features, S-Pen, and 200MP camera.", price: 1299.00, reorderLevel: 40, minimumStockQuantity: 15, supplierID: "SUP002" },
  { productID: "PRD003", categoryID: "CAT002", productName: "MacBook Pro 14-inch M3", description: "Apple M3 chip, 14-inch Liquid Retina XDR display, 18-hour battery life.", price: 1999.00, reorderLevel: 25, minimumStockQuantity: 10, supplierID: "SUP001" },
  { productID: "PRD004", categoryID: "CAT002", productName: "Dell XPS 15 9530", description: "Intel Core i9, NVIDIA RTX 4070, 15.6-inch OLED display, 32GB RAM.", price: 2299.00, reorderLevel: 20, minimumStockQuantity: 8, supplierID: "SUP003" },
  { productID: "PRD005", categoryID: "CAT003", productName: "iPad Pro 12.9-inch M2", description: "Apple M2 chip, 12.9-inch Liquid Retina XDR, supports Apple Pencil 2.", price: 1099.00, reorderLevel: 30, minimumStockQuantity: 12, supplierID: "SUP001" },
  { productID: "PRD006", categoryID: "CAT004", productName: "Cisco Catalyst 9200L Switch", description: "24-port PoE+ managed switch with advanced security features.", price: 3499.00, reorderLevel: 10, minimumStockQuantity: 5, supplierID: "SUP004" },
  { productID: "PRD007", categoryID: "CAT005", productName: "Sony WH-1000XM5", description: "Industry-leading noise cancelling headphones with 30-hour battery.", price: 349.00, reorderLevel: 60, minimumStockQuantity: 25, supplierID: "SUP002" },
  { productID: "PRD008", categoryID: "CAT006", productName: 'LG UltraWide 34" Monitor', description: "34-inch curved IPS panel, 3440x1440 resolution, 144Hz refresh rate.", price: 799.00, reorderLevel: 20, minimumStockQuantity: 8, supplierID: "SUP003" },
  { productID: "PRD009", categoryID: "CAT001", productName: "Google Pixel 8 Pro", description: "Google's flagship with Tensor G3 chip, 50MP camera, and 7 years of updates.", price: 999.00, reorderLevel: 35, minimumStockQuantity: 15, supplierID: "SUP002" },
  { productID: "PRD010", categoryID: "CAT004", productName: "Ubiquiti UniFi AP WiFi 6", description: "Wi-Fi 6 access point with 4x4 MU-MIMO, 2.4/5GHz dual band.", price: 189.00, reorderLevel: 40, minimumStockQuantity: 20, supplierID: "SUP004" },
];

export const inventory: Inventory[] = [
  { inventoryID: "INV001", productID: "PRD001", warehouseID: "WH001", productQuantity: 85 },
  { inventoryID: "INV002", productID: "PRD001", warehouseID: "WH002", productQuantity: 42 },
  { inventoryID: "INV003", productID: "PRD002", warehouseID: "WH001", productQuantity: 63 },
  { inventoryID: "INV004", productID: "PRD002", warehouseID: "WH003", productQuantity: 28 },
  { inventoryID: "INV005", productID: "PRD003", warehouseID: "WH001", productQuantity: 18 },
  { inventoryID: "INV006", productID: "PRD003", warehouseID: "WH002", productQuantity: 7 },
  { inventoryID: "INV007", productID: "PRD004", warehouseID: "WH001", productQuantity: 12 },
  { inventoryID: "INV008", productID: "PRD005", warehouseID: "WH001", productQuantity: 35 },
  { inventoryID: "INV009", productID: "PRD005", warehouseID: "WH003", productQuantity: 22 },
  { inventoryID: "INV010", productID: "PRD006", warehouseID: "WH001", productQuantity: 4 },
  { inventoryID: "INV011", productID: "PRD007", warehouseID: "WH001", productQuantity: 92 },
  { inventoryID: "INV012", productID: "PRD007", warehouseID: "WH002", productQuantity: 48 },
  { inventoryID: "INV013", productID: "PRD008", warehouseID: "WH001", productQuantity: 15 },
  { inventoryID: "INV014", productID: "PRD009", warehouseID: "WH002", productQuantity: 51 },
  { inventoryID: "INV015", productID: "PRD010", warehouseID: "WH001", productQuantity: 67 },
  { inventoryID: "INV016", productID: "PRD010", warehouseID: "WH003", productQuantity: 33 },
];

export const stockMovements: StockMovement[] = [
  { stockMovementID: "MOV001", warehouseID: "WH001", productID: "PRD001", movementType: "Stock In", movementDate: "2026-06-15T08:30:00", movementQuantity: 50, movementReference: "PO-2026-0041", processedBy: "USR003" },
  { stockMovementID: "MOV002", warehouseID: "WH001", productID: "PRD007", movementType: "Stock Out", movementDate: "2026-06-15T10:15:00", movementQuantity: 12, movementReference: "Sales Order SO-5521", processedBy: "USR003" },
  { stockMovementID: "MOV003", warehouseID: "WH002", productID: "PRD001", movementType: "Transfer", movementDate: "2026-06-14T14:00:00", movementQuantity: 20, movementReference: "Transfer from WH001", processedBy: "USR004" },
  { stockMovementID: "MOV004", warehouseID: "WH001", productID: "PRD003", movementType: "Adjustment", movementDate: "2026-06-14T09:00:00", movementQuantity: -2, movementReference: "Cycle count discrepancy Q2", processedBy: "USR002" },
  { stockMovementID: "MOV005", warehouseID: "WH001", productID: "PRD006", movementType: "Stock In", movementDate: "2026-06-13T11:30:00", movementQuantity: 5, movementReference: "PO-2026-0038", processedBy: "USR003" },
  { stockMovementID: "MOV006", warehouseID: "WH003", productID: "PRD002", movementType: "Stock In", movementDate: "2026-06-12T09:45:00", movementQuantity: 30, movementReference: "PO-2026-0037", processedBy: "USR004" },
  { stockMovementID: "MOV007", warehouseID: "WH001", productID: "PRD008", movementType: "Stock Out", movementDate: "2026-06-12T15:30:00", movementQuantity: 5, movementReference: "B2B Order ORD-8871", processedBy: "USR003" },
  { stockMovementID: "MOV008", warehouseID: "WH002", productID: "PRD009", movementType: "Return", movementDate: "2026-06-11T13:00:00", movementQuantity: 3, movementReference: "Customer return RET-0221", processedBy: "USR004" },
];

export const purchaseOrders: PurchaseOrder[] = [
  {
    purchaseOrderID: "PO-2026-0041",
    supplierID: "SUP001",
    purchaseDate: "2026-06-08",
    receivedDate: "2026-06-15",
    deliveryStatus: "Delivered",
    createdBy: "USR002",
    receivedBy: "USR003",
    details: [
      { purchaseOrderDetailID: "POD001", purchaseOrderID: "PO-2026-0041", productID: "PRD001", purchaseQuantity: 50, unitCost: 1050.00, totalAmount: 52500.00 },
      { purchaseOrderDetailID: "POD002", purchaseOrderID: "PO-2026-0041", productID: "PRD003", purchaseQuantity: 10, unitCost: 1750.00, totalAmount: 17500.00 },
    ]
  },
  {
    purchaseOrderID: "PO-2026-0042",
    supplierID: "SUP002",
    purchaseDate: "2026-06-10",
    receivedDate: null,
    deliveryStatus: "In Transit",
    createdBy: "USR002",
    receivedBy: null,
    details: [
      { purchaseOrderDetailID: "POD003", purchaseOrderID: "PO-2026-0042", productID: "PRD002", purchaseQuantity: 40, unitCost: 1100.00, totalAmount: 44000.00 },
      { purchaseOrderDetailID: "POD004", purchaseOrderID: "PO-2026-0042", productID: "PRD007", purchaseQuantity: 80, unitCost: 295.00, totalAmount: 23600.00 },
    ]
  },
  {
    purchaseOrderID: "PO-2026-0043",
    supplierID: "SUP004",
    purchaseDate: "2026-06-16",
    receivedDate: null,
    deliveryStatus: "Pending",
    createdBy: "USR002",
    receivedBy: null,
    details: [
      { purchaseOrderDetailID: "POD005", purchaseOrderID: "PO-2026-0043", productID: "PRD006", purchaseQuantity: 8, unitCost: 3100.00, totalAmount: 24800.00 },
      { purchaseOrderDetailID: "POD006", purchaseOrderID: "PO-2026-0043", productID: "PRD010", purchaseQuantity: 50, unitCost: 160.00, totalAmount: 8000.00 },
    ]
  },
  {
    purchaseOrderID: "PO-2026-0038",
    supplierID: "SUP004",
    purchaseDate: "2026-06-05",
    receivedDate: "2026-06-13",
    deliveryStatus: "Delivered",
    createdBy: "USR002",
    receivedBy: "USR003",
    details: [
      { purchaseOrderDetailID: "POD007", purchaseOrderID: "PO-2026-0038", productID: "PRD006", purchaseQuantity: 5, unitCost: 3100.00, totalAmount: 15500.00 },
    ]
  },
];
