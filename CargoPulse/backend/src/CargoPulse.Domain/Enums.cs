namespace CargoPulse.Domain.Enums;

public enum UserRole
{
    Admin = 1,
    WarehouseManager = 2,
    WarehouseStaff = 3,
    Dispatcher = 4,
    Driver = 5
}

public enum ShipmentStatus
{
    Created = 1,
    Received = 2,
    Sorted = 3,
    Stored = 4,
    InTransit = 5,
    ArrivedAtHub = 6,
    OutForDelivery = 7,
    Delivered = 8,
    FailedDelivery = 9,
    Returned = 10,
    Cancelled = 11
}

public enum PaymentMethod
{
    Prepaid = 1,
    CashOnDelivery = 2
}

public enum MovementType
{
    Inbound = 1,
    Outbound = 2,
    Transfer = 3,
    Adjustment = 4,
    Damage = 5
}

public enum SettlementStatus
{
    Pending = 1,
    Reconciled = 2,
    Discrepancy = 3
}

public enum ZoneType
{
    Receiving = 1,
    Storage = 2,
    Staging = 3,
    Dispatch = 4
}
