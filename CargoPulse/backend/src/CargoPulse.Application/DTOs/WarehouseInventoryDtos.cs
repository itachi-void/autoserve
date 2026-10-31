using CargoPulse.Domain.Enums;

namespace CargoPulse.Application.DTOs;

public record WarehouseDto(
    Guid Id,
    string Name,
    string NameAr,
    string Code,
    string City,
    string Address,
    decimal CapacitySqMeters,
    bool IsActive,
    int TotalBins,
    int OccupiedBins
);

public record CreateWarehouseRequest(
    string Name,
    string NameAr,
    string Code,
    string City,
    string Address,
    decimal CapacitySqMeters
);

public record ItemDto(
    Guid Id,
    string Sku,
    string Barcode,
    string NameEn,
    string NameAr,
    string Category,
    string Unit,
    decimal WeightKg,
    decimal DeclaredPrice,
    int TotalAvailable,
    int TotalReserved
);

public record CreateItemRequest(
    string Sku,
    string Barcode,
    string NameEn,
    string NameAr,
    string Category,
    string Unit,
    decimal WeightKg,
    decimal DeclaredPrice
);

public record StockMovementDto(
    Guid Id,
    string ItemSku,
    string ItemNameEn,
    string ItemNameAr,
    int Quantity,
    MovementType MovementType,
    string ReferenceNumber,
    string PerformedBy,
    DateTime TimestampUtc,
    string Notes
);

public record ReceiveInventoryRequest(
    Guid ItemId,
    Guid WarehouseId,
    Guid? BinId,
    int Quantity,
    string ReferenceNumber,
    string Notes
);
