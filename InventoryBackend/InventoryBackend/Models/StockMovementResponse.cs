using System;

namespace InventoryBackend.Models
{
    public class StockMovementResponse
    {
        public long StockMovementID { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string MovementType { get; set; } = string.Empty;
        public DateTime MovementDate { get; set; }
        public int MovementQuantity { get; set; }
        public string MovementReference { get; set; } = string.Empty;
        public string ProcessedByName { get; set; } = string.Empty;
    }
}