using FixSys.Domain.Common;

namespace FixSys.Domain.Entities;

public class SparePart : BranchEntity
{
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string? Oem { get; set; }
    public string SalesUoM { get; set; } = "قطعة";
    public decimal Price { get; set; }
    public int MinStock { get; set; }
    public List<string> CompatibleVehicles { get; set; } = [];
    public List<Guid> AlternativeIds { get; set; } = [];
}

public class InventoryItem : BranchEntity
{
    public Guid SparePartId { get; set; }
    public SparePart? SparePart { get; set; }
    public decimal Quantity { get; set; }
    public decimal AllocatedQuantity { get; set; }
    public decimal AverageCost { get; set; }
    public decimal AvailableQuantity { get; private set; }
}

public class StockTransaction : BranchEntity
{
    public Guid SparePartId { get; set; }
    public SparePart? SparePart { get; set; }
    public StockTransactionType Type { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public string? ReferenceType { get; set; }
    public Guid? ReferenceId { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}

public class Supplier : BranchEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public ActiveStatus Status { get; set; } = ActiveStatus.Active;
}

public class PurchaseOrder : BranchEntity
{
    public string Number { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public Supplier? Supplier { get; set; }
    public DateOnly OrderDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly? ExpectedDate { get; set; }
    public PurchaseOrderStatus Status { get; set; } = PurchaseOrderStatus.Draft;
    public string? Notes { get; set; }
    public decimal Total { get; set; }
    public List<PurchaseOrderItem> Items { get; set; } = [];
}

public class PurchaseOrderItem : Entity
{
    public Guid PurchaseOrderId { get; set; }
    public Guid? SparePartId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal Total { get; set; }
}
