using FixSys.Domain.Common;

namespace FixSys.Domain.Entities;

public class Appointment : BranchEntity
{
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public Guid VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
    public Guid? ServiceId { get; set; }
    public ServiceItem? Service { get; set; }
    public Guid? TechnicianId { get; set; }
    public Technician? Technician { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string? ComplaintNotes { get; set; }
    public decimal EstimatedDurationHours { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
}

public class InspectionTemplate : BranchEntity
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public List<InspectionSection> Sections { get; set; } = [];
}

public class InspectionSection : Entity
{
    public Guid TemplateId { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<string> Items { get; set; } = [];
}

public class InspectionSession : BranchEntity
{
    public string Name { get; set; } = string.Empty;
    public Guid TemplateId { get; set; }
    public InspectionTemplate? Template { get; set; }
    public Guid VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
    public Guid? TechnicianId { get; set; }
    public Technician? Technician { get; set; }
    public InspectionStatus Status { get; set; } = InspectionStatus.Draft;
    public string? Result { get; set; }
    public string? CustomerSignatureUrl { get; set; }
    public List<InspectionDamage> Damages { get; set; } = [];
}

public class InspectionDamage : Entity
{
    public Guid SessionId { get; set; }
    public string Location { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
}

public class Estimate : BranchEntity
{
    public string Number { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public Guid VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
    public Guid? InspectionSessionId { get; set; }
    public InspectionSession? InspectionSession { get; set; }
    public DateOnly ValidUntil { get; set; }
    public decimal Discount { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Vat { get; set; }
    public decimal Total { get; set; }
    public EstimateStatus Status { get; set; } = EstimateStatus.Draft;
    public DateTime? PresentedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public List<EstimateLineItem> LineItems { get; set; } = [];
}

public class EstimateLineItem : Entity
{
    public Guid EstimateId { get; set; }
    public LineKind Kind { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; } = 1;
    public LineDecision Decision { get; set; } = LineDecision.Pending;
    public string? RejectionReason { get; set; }
}

public class WorkOrder : BranchEntity
{
    public string Number { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public Guid VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
    public Guid? EstimateId { get; set; }
    public Estimate? Estimate { get; set; }
    public Guid? TechnicianId { get; set; }
    public Technician? Technician { get; set; }
    public WorkOrderStatus Status { get; set; } = WorkOrderStatus.Pending;
    public WorkOrderPriority Priority { get; set; } = WorkOrderPriority.Normal;
    public decimal Total { get; set; }
    public int Progress { get; set; }
    public bool StockReserved { get; set; }
    public bool StockConsumed { get; set; }
    public string? Notes { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public List<WorkOrderLine> Lines { get; set; } = [];
    public List<WorkOrderTask> Tasks { get; set; } = [];
    public List<WorkOrderSupplement> Supplements { get; set; } = [];
}

public class WorkOrderLine : Entity
{
    public Guid? SparePartId { get; set; }
    public Guid WorkOrderId { get; set; }
    public LineKind Kind { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; } = 1;
}

public class WorkOrderTask : Entity
{
    public Guid WorkOrderId { get; set; }
    public string Service { get; set; } = string.Empty;
    public Guid? TechnicianId { get; set; }
    public int Progress { get; set; }
}

public class WorkOrderSupplement : Entity
{
    public Guid WorkOrderId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public SupplementStatus Status { get; set; } = SupplementStatus.Pending;
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
}
