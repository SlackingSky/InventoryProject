namespace InventoryBackend.Models
{
    public class StockMovementRequest
    {
        public short WarehouseID { get; set; }
        public int ProductID { get; set; }
        public string MovementType { get; set; } = string.Empty;
        public int MovementQuantity { get; set; }
        public string MovementReference { get; set; } = string.Empty;
        public int ProcessedBy { get; set; }
    }
}