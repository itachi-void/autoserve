using CargoPulse.Domain.Enums;

namespace CargoPulse.Domain.Entities;

public class Warehouse
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal CapacitySqMeters { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public Tenant? Tenant { get; set; }
    public ICollection<WarehouseZone> Zones { get; set; } = new List<WarehouseZone>();
    public ICollection<StockLevel> StockLevels { get; set; } = new List<StockLevel>();
}

public class WarehouseZone
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WarehouseId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public ZoneType ZoneType { get; set; } = ZoneType.Storage;

    public Warehouse? Warehouse { get; set; }
    public ICollection<WarehouseBin> Bins { get; set; } = new List<WarehouseBin>();
}

public class WarehouseBin
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ZoneId { get; set; }
    public string BinCode { get; set; } = string.Empty; // e.g. "A-01-02-B"
    public string Aisle { get; set; } = string.Empty;
    public string Rack { get; set; } = string.Empty;
    public string Shelf { get; set; } = string.Empty;
    public decimal MaxWeightKg { get; set; } = 500;
    public bool IsOccupied { get; set; } = false;

    public WarehouseZone? Zone { get; set; }
}
