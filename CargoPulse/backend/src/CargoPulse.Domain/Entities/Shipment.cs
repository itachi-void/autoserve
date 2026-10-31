using CargoPulse.Domain.Enums;

namespace CargoPulse.Domain.Entities;

public class Shipment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public string TrackingNumber { get; set; } = string.Empty; // e.g. "CP-2026-98214"
    public string Barcode { get; set; } = string.Empty;

    // Sender details
    public string SenderName { get; set; } = string.Empty;
    public string SenderPhone { get; set; } = string.Empty;
    public string SenderCity { get; set; } = string.Empty;
    public string SenderAddress { get; set; } = string.Empty;

    // Recipient details
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientPhone { get; set; } = string.Empty;
    public string RecipientCity { get; set; } = string.Empty;
    public string RecipientAddress { get; set; } = string.Empty;
    public double? RecipientLatitude { get; set; }
    public double? RecipientLongitude { get; set; }

    // Routing & Warehouse
    public Guid? OriginWarehouseId { get; set; }
    public Guid? DestinationWarehouseId { get; set; }
    public Guid? CurrentBinId { get; set; }

    // Status & LifeCycle
    public ShipmentStatus Status { get; set; } = ShipmentStatus.Created;

    // Dimensions & Weight
    public decimal WeightKg { get; set; } = 1.0m;
    public decimal LengthCm { get; set; } = 20m;
    public decimal WidthCm { get; set; } = 15m;
    public decimal HeightCm { get; set; } = 10m;
    public decimal VolumetricWeightKg => (LengthCm * WidthCm * HeightCm) / 5000m;

    // Financials
    public decimal DeclaredValue { get; set; } = 0m;
    public decimal ShippingFee { get; set; } = 25.00m;
    public decimal CodAmount { get; set; } = 0m;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Prepaid;
    public bool IsCodCollected { get; set; } = false;

    // Fleet & Driver
    public Guid? AssignedDriverId { get; set; }
    public string AssignedDriverName { get; set; } = string.Empty;
    public string VehiclePlate { get; set; } = string.Empty;

    // Timestamps
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? DeliveredAtUtc { get; set; }

    // Relations
    public Tenant? Tenant { get; set; }
    public Warehouse? OriginWarehouse { get; set; }
    public Warehouse? DestinationWarehouse { get; set; }
    public WarehouseBin? CurrentBin { get; set; }
    public ProofOfDelivery? ProofOfDelivery { get; set; }
    public ICollection<ShipmentEvent> Events { get; set; } = new List<ShipmentEvent>();

    // Domain State Machine Transition Method
    public bool CanTransitionTo(ShipmentStatus targetStatus)
    {
        return (Status, targetStatus) switch
        {
            (ShipmentStatus.Created, ShipmentStatus.Received) => true,
            (ShipmentStatus.Created, ShipmentStatus.Cancelled) => true,
            (ShipmentStatus.Received, ShipmentStatus.Sorted) => true,
            (ShipmentStatus.Received, ShipmentStatus.Stored) => true,
            (ShipmentStatus.Sorted, ShipmentStatus.Stored) => true,
            (ShipmentStatus.Sorted, ShipmentStatus.InTransit) => true,
            (ShipmentStatus.Stored, ShipmentStatus.InTransit) => true,
            (ShipmentStatus.Stored, ShipmentStatus.OutForDelivery) => true,
            (ShipmentStatus.InTransit, ShipmentStatus.ArrivedAtHub) => true,
            (ShipmentStatus.ArrivedAtHub, ShipmentStatus.OutForDelivery) => true,
            (ShipmentStatus.OutForDelivery, ShipmentStatus.Delivered) => true,
            (ShipmentStatus.OutForDelivery, ShipmentStatus.FailedDelivery) => true,
            (ShipmentStatus.FailedDelivery, ShipmentStatus.OutForDelivery) => true,
            (ShipmentStatus.FailedDelivery, ShipmentStatus.Returned) => true,
            _ => false
        };
    }

    public void TransitionTo(ShipmentStatus targetStatus, string actor, string notes = "", string location = "")
    {
        if (!CanTransitionTo(targetStatus))
        {
            throw new InvalidOperationException($"Invalid status transition from {Status} to {targetStatus}.");
        }

        var previous = Status;
        Status = targetStatus;

        if (targetStatus == ShipmentStatus.Delivered)
        {
            DeliveredAtUtc = DateTime.UtcNow;
        }

        Events.Add(new ShipmentEvent
        {
            ShipmentId = Id,
            PreviousStatus = previous,
            NewStatus = targetStatus,
            Actor = actor,
            Location = location,
            Notes = notes,
            TimestampUtc = DateTime.UtcNow
        });
    }
}

public class ShipmentEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ShipmentId { get; set; }
    public ShipmentStatus PreviousStatus { get; set; }
    public ShipmentStatus NewStatus { get; set; }
    public string Actor { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;

    public Shipment? Shipment { get; set; }
}

public class ProofOfDelivery
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ShipmentId { get; set; }
    public string RecipientName { get; set; } = string.Empty;
    public string SignatureData { get; set; } = string.Empty; // SVG or base64
    public string PhotoEvidenceUrl { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
    public string Notes { get; set; } = string.Empty;

    public Shipment? Shipment { get; set; }
}

public class DriverSettlement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public DateTime SettlementDateUtc { get; set; } = DateTime.UtcNow;
    public decimal ExpectedCodAmount { get; set; }
    public decimal CollectedCodAmount { get; set; }
    public decimal DifferenceAmount => CollectedCodAmount - ExpectedCodAmount;
    public SettlementStatus Status { get; set; } = SettlementStatus.Pending;
    public string Notes { get; set; } = string.Empty;
}
