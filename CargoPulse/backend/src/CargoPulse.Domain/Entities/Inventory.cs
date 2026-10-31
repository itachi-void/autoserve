using CargoPulse.Domain.Enums;

namespace CargoPulse.Domain.Entities;

public class Item
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Unit { get; set; } = "PCS";
    public decimal WeightKg { get; set; }
    public decimal DeclaredPrice { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public Tenant? Tenant { get; set; }
    public ICollection<StockLevel> StockLevels { get; set; } = new List<StockLevel>();
}

public class StockLevel
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WarehouseId { get; set; }
    public Guid ItemId { get; set; }
    public Guid? BinId { get; set; }
    public int QuantityAvailable { get; set; }
    public int QuantityReserved { get; set; }
    public int QuantityDamaged { get; set; }
    public DateTime LastUpdatedUtc { get; set; } = DateTime.UtcNow;

    public Warehouse? Warehouse { get; set; }
    public Item? Item { get; set; }
    public WarehouseBin? Bin { get; set; }
}

public class StockMovement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid ItemId { get; set; }
    public Guid? SourceWarehouseId { get; set; }
    public Guid? TargetWarehouseId { get; set; }
    public int Quantity { get; set; }
    public MovementType MovementType { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string PerformedBy { get; set; } = string.Empty;
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
    public string Notes { get; set; } = string.Empty;

    public Item? Item { get; set; }
}
