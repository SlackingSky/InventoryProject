namespace InventoryBackend.Models
{
    public class CategoryRequest
    {
        public string CategoryName { get; set; } = string.Empty;
        public string CategoryDescription { get; set; } = string.Empty;
    }
    public class CategoryResponse : CategoryRequest
    {
        public short CategoryID { get; set; }
    }

    public class SupplierRequest
    {
        public string SupplierName { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
        public string EmailAddress { get; set; } = string.Empty;
        public string SupplierAddress { get; set; } = string.Empty;
    }
    public class SupplierResponse : SupplierRequest
    {
        public int SupplierID { get; set; }
    }

    public class WarehouseRequest
    {
        public string WarehouseName { get; set; } = string.Empty;
        public string WarehouseLocation { get; set; } = string.Empty;
    }
    public class WarehouseResponse : WarehouseRequest
    {
        public short WarehouseID { get; set; }
    }

    public class InventoryRequest
    {
        public int ProductID { get; set; }
        public short WarehouseID { get; set; }
        public int ProductQuantity { get; set; }
    }

    public class InventoryResponse
    {
        public int InventoryID { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public int ProductQuantity { get; set; }
    }

    public class PurchaseOrderSummaryResponse
    {
        public int PurchaseOrderID { get; set; }
        public DateTime PurchaseDate { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public string DeliveryStatus { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public string CreatedByName { get; set; } = string.Empty;
    }

    public class UserListResponse
    {
        public int UserID { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string UserRole { get; set; } = string.Empty;
    }
}