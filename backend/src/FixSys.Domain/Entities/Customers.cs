using FixSys.Domain.Common;

namespace FixSys.Domain.Entities;

public class Customer : BranchEntity
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public CustomerType Type { get; set; } = CustomerType.Individual;
    public ActiveStatus Status { get; set; } = ActiveStatus.Active;
    public decimal OutstandingBalance { get; set; }
    public List<Vehicle> Vehicles { get; set; } = [];
    public List<CustomerLedgerEntry> Ledger { get; set; } = [];
}

public class CustomerLedgerEntry : BranchEntity
{
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public LedgerTransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public Guid? ReferenceId { get; set; }
}

public class Vehicle : BranchEntity
{
    public string Plate { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string? Trim { get; set; }
    public string Color { get; set; } = string.Empty;
    public string Vin { get; set; } = string.Empty;
    public int Mileage { get; set; }
    public Guid CustomerId { get; set; }
    public Customer? Owner { get; set; }
    public List<VehicleOwnership> OwnershipHistory { get; set; } = [];
}

public class VehicleOwnership : Entity
{
    public Guid VehicleId { get; set; }
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public DateTime FromDate { get; set; } = DateTime.UtcNow;
    public DateTime? ToDate { get; set; }
}
