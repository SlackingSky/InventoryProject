using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace InventoryBackend.Models
{
    public class PurchaseOrderRequest
    {
        public int SupplierID { get; set; }
        public string PurchaseDate { get; set; } = string.Empty;
        public string? ReceivedDate { get; set; }
        public string DeliveryStatus { get; set; } = string.Empty;
        public int CreatedBy { get; set; }
        public int? ReceivedBy { get; set; }
        public List<PurchaseOrderItemRequest> Details { get; set; } = new List<PurchaseOrderItemRequest>();
    }

    public class PurchaseOrderItemRequest
    {
        [JsonPropertyName("ProductID")]
        public int ProductID { get; set; }

        [JsonPropertyName("PurchaseQuantity")]
        public int PurchaseQuantity { get; set; }

        [JsonPropertyName("UnitCost")]
        public decimal UnitCost { get; set; }
    }
}