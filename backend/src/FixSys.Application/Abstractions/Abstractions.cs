using FixSys.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FixSys.Application.Abstractions;

public interface IAppDbContext
{
    DbSet<Branch> Branches { get; }
    DbSet<AuditEntry> AuditEntries { get; }
    DbSet<AppUser> Users { get; }
    DbSet<OtpCode> OtpCodes { get; }
    DbSet<Role> Roles { get; }
    DbSet<Department> Departments { get; }
    DbSet<Employee> Employees { get; }
    DbSet<Technician> Technicians { get; }
    DbSet<TechnicianTimeLog> TechnicianTimeLogs { get; }
    DbSet<Customer> Customers { get; }
    DbSet<CustomerLedgerEntry> LedgerEntries { get; }
    DbSet<Vehicle> Vehicles { get; }
    DbSet<VehicleOwnership> VehicleOwnerships { get; }
    DbSet<SparePart> SpareParts { get; }
    DbSet<InventoryItem> InventoryItems { get; }
    DbSet<StockTransaction> StockTransactions { get; }
    DbSet<Supplier> Suppliers { get; }
    DbSet<PurchaseOrder> PurchaseOrders { get; }
    DbSet<PurchaseOrderItem> PurchaseOrderItems { get; }
    DbSet<ServiceCategory> ServiceCategories { get; }
    DbSet<ServiceItem> Services { get; }
    DbSet<Appointment> Appointments { get; }
    DbSet<InspectionTemplate> InspectionTemplates { get; }
    DbSet<InspectionSection> InspectionSections { get; }
    DbSet<InspectionSession> InspectionSessions { get; }
    DbSet<InspectionDamage> InspectionDamages { get; }
    DbSet<Estimate> Estimates { get; }
    DbSet<EstimateLineItem> EstimateLineItems { get; }
    DbSet<WorkOrder> WorkOrders { get; }
    DbSet<WorkOrderLine> WorkOrderLines { get; }
    DbSet<WorkOrderTask> WorkOrderTasks { get; }
    DbSet<WorkOrderSupplement> WorkOrderSupplements { get; }
    DbSet<Invoice> Invoices { get; }
    DbSet<InvoicePayment> InvoicePayments { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

public interface ICurrentUser
{
    Guid? UserId { get; }
    Guid? BranchId { get; }
    string? Email { get; }
}

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public record IssuedToken(string Token, DateTime ExpiresOn);
public record ValidatedSession(Guid UserId, Guid BranchId, Guid SecurityStamp);

public interface IJwtTokenService
{
    IssuedToken Create(AppUser user);
    Task<ValidatedSession?> ValidateForRefreshAsync(string token);
}

public interface IEmailSender
{
    Task SendOtpAsync(string email, string code, CancellationToken ct = default);
}
