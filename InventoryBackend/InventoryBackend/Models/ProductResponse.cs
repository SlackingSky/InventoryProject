namespace InventoryBackend.Models
{
    public class ProductResponse
    {
        public int ProductID { get; set; }
        public short CategoryID { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public short LeadTime { get; set; }
        public int ReorderLevel { get; set; }
        public int MinimumStockQuantity { get; set; }
        public int SupplierID { get; set; }
        public string SupplierName { get; set; } = string.Empty;
    }
}