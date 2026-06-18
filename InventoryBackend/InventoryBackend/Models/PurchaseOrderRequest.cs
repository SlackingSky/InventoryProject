using System.Collections.Generic;

namespace InventoryBackend.Models
{
    public class PurchaseOrderRequest
    {
        public int SupplierID { get; set; }
        public string PurchaseDate { get; set; } = string.Empty;
        public string DeliveryStatus { get; set; } = string.Empty;
        public int CreatedBy { get; set; }

        public List<PurchaseOrderItemRequest> Items { get; set; } = new List<PurchaseOrderItemRequest>();
    }

    public class PurchaseOrderItemRequest
    {
        public int ProductID { get; set; }
        public int PurchaseQuantity { get; set; }
        public decimal UnitCost { get; set; }
    }
}