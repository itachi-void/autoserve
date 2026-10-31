using CargoPulse.Domain.Enums;

namespace CargoPulse.Application.DTOs;

public record CreateShipmentRequest(
    string SenderName,
    string SenderPhone,
    string SenderCity,
    string SenderAddress,
    string RecipientName,
    string RecipientPhone,
    string RecipientCity,
    string RecipientAddress,
    double? RecipientLatitude,
    double? RecipientLongitude,
    Guid? OriginWarehouseId,
    Guid? DestinationWarehouseId,
    decimal WeightKg,
    decimal LengthCm,
    decimal WidthCm,
    decimal HeightCm,
    decimal DeclaredValue,
    decimal ShippingFee,
    decimal CodAmount,
    PaymentMethod PaymentMethod
);

public record UpdateShipmentStatusRequest(
    ShipmentStatus TargetStatus,
    string Location,
    string Notes
);

public record AssignDriverRequest(
    Guid DriverId,
    string DriverName,
    string VehiclePlate
);

public record CapturePodRequest(
    string RecipientName,
    string SignatureData,
    string PhotoEvidenceUrl,
    double Latitude,
    double Longitude,
    string Notes,
    bool CodCollected
);

public record ShipmentDto(
    Guid Id,
    string TrackingNumber,
    string Barcode,
    string SenderName,
    string SenderPhone,
    string SenderCity,
    string SenderAddress,
    string RecipientName,
    string RecipientPhone,
    string RecipientCity,
    string RecipientAddress,
    ShipmentStatus Status,
    decimal WeightKg,
    decimal VolumetricWeightKg,
    decimal ShippingFee,
    decimal CodAmount,
    PaymentMethod PaymentMethod,
    bool IsCodCollected,
    Guid? AssignedDriverId,
    string AssignedDriverName,
    string VehiclePlate,
    string CurrentBinCode,
    DateTime CreatedAtUtc,
    DateTime? DeliveredAtUtc,
    List<ShipmentEventDto> Events
);

public record ShipmentEventDto(
    Guid Id,
    ShipmentStatus PreviousStatus,
    ShipmentStatus NewStatus,
    string Actor,
    string Location,
    string Notes,
    DateTime TimestampUtc
);
