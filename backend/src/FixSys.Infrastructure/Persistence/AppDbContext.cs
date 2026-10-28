using System.Reflection;
using FixSys.Application.Abstractions;
using FixSys.Application.Common;
using FixSys.Domain.Common;
using FixSys.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace FixSys.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUser currentUser)
    : DbContext(options), IAppDbContext
{
    private Guid? CurrentBranchId => currentUser.BranchId;

    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<AuditEntry> AuditEntries => Set<AuditEntry>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<OtpCode> OtpCodes => Set<OtpCode>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Technician> Technicians => Set<Technician>();
    public DbSet<TechnicianTimeLog> TechnicianTimeLogs => Set<TechnicianTimeLog>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerLedgerEntry> LedgerEntries => Set<CustomerLedgerEntry>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<VehicleOwnership> VehicleOwnerships => Set<VehicleOwnership>();
    public DbSet<SparePart> SpareParts => Set<SparePart>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();
    public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
    public DbSet<ServiceItem> Services => Set<ServiceItem>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<InspectionTemplate> InspectionTemplates => Set<InspectionTemplate>();
    public DbSet<InspectionSection> InspectionSections => Set<InspectionSection>();
    public DbSet<InspectionSession> InspectionSessions => Set<InspectionSession>();
    public DbSet<InspectionDamage> InspectionDamages => Set<InspectionDamage>();
    public DbSet<Estimate> Estimates => Set<Estimate>();
    public DbSet<EstimateLineItem> EstimateLineItems => Set<EstimateLineItem>();
    public DbSet<WorkOrder> WorkOrders => Set<WorkOrder>();
    public DbSet<WorkOrderLine> WorkOrderLines => Set<WorkOrderLine>();
    public DbSet<WorkOrderTask> WorkOrderTasks => Set<WorkOrderTask>();
    public DbSet<WorkOrderSupplement> WorkOrderSupplements => Set<WorkOrderSupplement>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoicePayment> InvoicePayments => Set<InvoicePayment>();

    protected override void ConfigureConventions(ModelConfigurationBuilder builder)
    {
        builder.Properties<decimal>().HavePrecision(18, 2);
    }

    protected override void OnModelCreating(ModelBuilder b)
    {
        // Nothing cascades by accident (deleting a customer must never wipe their history).
        foreach (var fk in b.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            fk.DeleteBehavior = DeleteBehavior.Restrict;

        foreach (var entity in b.Model.GetEntityTypes())
            foreach (var prop in entity.GetProperties().Where(p => p.ClrType.IsEnum))
            {
                var converterType = typeof(EnumToStringConverter<>).MakeGenericType(prop.ClrType);
                prop.SetValueConverter((ValueConverter)Activator.CreateInstance(converterType, new object?[] { null })!);
                prop.SetMaxLength(40);
            }

        // Parent -> owned children
        b.Entity<Vehicle>().HasMany(v => v.OwnershipHistory).WithOne().HasForeignKey(o => o.VehicleId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<PurchaseOrder>().HasMany(p => p.Items).WithOne().HasForeignKey(i => i.PurchaseOrderId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<InspectionTemplate>().HasMany(t => t.Sections).WithOne().HasForeignKey(s => s.TemplateId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<InspectionSession>().HasMany(s => s.Damages).WithOne().HasForeignKey(d => d.SessionId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<Estimate>().HasMany(e => e.LineItems).WithOne().HasForeignKey(l => l.EstimateId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<WorkOrder>().HasMany(w => w.Lines).WithOne().HasForeignKey(l => l.WorkOrderId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<WorkOrder>().HasMany(w => w.Tasks).WithOne().HasForeignKey(l => l.WorkOrderId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<WorkOrder>().HasMany(w => w.Supplements).WithOne().HasForeignKey(l => l.WorkOrderId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<Invoice>().HasMany(i => i.Payments).WithOne().HasForeignKey(p => p.InvoiceId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<Technician>().HasMany(t => t.TimeLogs).WithOne().HasForeignKey(l => l.TechnicianId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<Customer>().HasMany(c => c.Ledger).WithOne(l => l.Customer).HasForeignKey(l => l.CustomerId);
        b.Entity<Vehicle>().HasOne(v => v.Owner).WithMany(c => c.Vehicles).HasForeignKey(v => v.CustomerId);
        b.Entity<Department>().HasOne(d => d.HeadEmployee).WithMany().HasForeignKey(d => d.HeadEmployeeId);
        b.Entity<Employee>().HasOne(e => e.Department).WithMany(d => d.Employees).HasForeignKey(e => e.DepartmentId);

        // Unique keys
        b.Entity<AppUser>().HasIndex(u => u.Email).IsUnique();
        b.Entity<OtpCode>().HasIndex(o => new { o.Email, o.CreatedAt });
        b.Entity<Role>().HasIndex(r => new { r.BranchId, r.Key }).IsUnique();
        b.Entity<Branch>().HasIndex(x => x.Code).IsUnique();
        b.Entity<Customer>().HasIndex(c => new { c.BranchId, c.Phone }).IsUnique();
        b.Entity<Vehicle>().HasIndex(v => new { v.BranchId, v.Plate }).IsUnique();
        b.Entity<SparePart>().HasIndex(p => new { p.BranchId, p.Sku }).IsUnique();
        b.Entity<InventoryItem>().HasIndex(i => new { i.BranchId, i.SparePartId }).IsUnique();
        b.Entity<Supplier>().HasIndex(s => new { s.BranchId, s.Code }).IsUnique();
        b.Entity<PurchaseOrder>().HasIndex(p => p.Number).IsUnique();
        b.Entity<Estimate>().HasIndex(e => e.Number).IsUnique();
        b.Entity<WorkOrder>().HasIndex(w => w.Number).IsUnique();
        b.Entity<Invoice>().HasIndex(i => i.Number).IsUnique();
        b.Entity<WorkOrder>().HasIndex(order => order.EstimateId).IsUnique().HasFilter("\"EstimateId\" IS NOT NULL");
        b.Entity<Invoice>().HasIndex(invoice => invoice.WorkOrderId).IsUnique().HasFilter("\"WorkOrderId\" IS NOT NULL AND \"Status\" <> 'Cancelled'");
        b.Entity<AuditEntry>().HasIndex(entry => new { entry.BranchId, entry.CreatedAt });
        b.Entity<InvoicePayment>().HasIndex(payment => payment.RequestId).IsUnique().HasFilter("\"RequestId\" IS NOT NULL");
        b.Entity<Appointment>().HasIndex(a => new { a.BranchId, a.ScheduledAt });

        // Computed (stored generated) columns
        b.Entity<InventoryItem>().Property(i => i.AvailableQuantity)
            .HasComputedColumnSql("\"Quantity\" - \"AllocatedQuantity\"", stored: true);
        b.Entity<Invoice>().Property(i => i.Balance)
            .HasComputedColumnSql("\"Total\" - \"PaidAmount\"", stored: true);

        // Optimistic concurrency for money-carrying rows (PostgreSQL xmin)
        b.Entity<Invoice>().Property<uint>("xmin").HasColumnType("xid").ValueGeneratedOnAddOrUpdate().IsConcurrencyToken();
        b.Entity<Customer>().Property<uint>("xmin").HasColumnType("xid").ValueGeneratedOnAddOrUpdate().IsConcurrencyToken();
        b.Entity<PurchaseOrder>().Property<uint>("xmin").HasColumnType("xid").ValueGeneratedOnAddOrUpdate().IsConcurrencyToken();
        b.Entity<InventoryItem>().Property<uint>("xmin").HasColumnType("xid").ValueGeneratedOnAddOrUpdate().IsConcurrencyToken();
        b.Entity<Estimate>().Property<uint>("xmin").HasColumnType("xid").ValueGeneratedOnAddOrUpdate().IsConcurrencyToken();
        b.Entity<WorkOrder>().Property<uint>("xmin").HasColumnType("xid").ValueGeneratedOnAddOrUpdate().IsConcurrencyToken();
        b.Entity<WorkOrderSupplement>().Property<uint>("xmin").HasColumnType("xid").ValueGeneratedOnAddOrUpdate().IsConcurrencyToken();
        b.Entity<OtpCode>().Property<uint>("xmin").HasColumnType("xid").ValueGeneratedOnAddOrUpdate().IsConcurrencyToken();

        // Multi-branch isolation
        var apply = typeof(AppDbContext).GetMethod(nameof(ApplyBranchFilter), BindingFlags.NonPublic | BindingFlags.Instance)!;
        foreach (var type in b.Model.GetEntityTypes().Where(t => typeof(BranchEntity).IsAssignableFrom(t.ClrType)).Select(t => t.ClrType))
            apply.MakeGenericMethod(type).Invoke(this, [b]);
        b.Entity<WorkOrderSupplement>().HasQueryFilter(entry => CurrentBranchId != null && WorkOrders.Any(parent => parent.Id == entry.WorkOrderId && parent.BranchId == CurrentBranchId));
        b.Entity<WorkOrderTask>().HasQueryFilter(entry => CurrentBranchId != null && WorkOrders.Any(parent => parent.Id == entry.WorkOrderId && parent.BranchId == CurrentBranchId));
        b.Entity<TechnicianTimeLog>().HasQueryFilter(entry => CurrentBranchId != null && Technicians.Any(parent => parent.Id == entry.TechnicianId && parent.BranchId == CurrentBranchId));
        b.Entity<VehicleOwnership>().HasQueryFilter(entry => CurrentBranchId != null && Vehicles.Any(parent => parent.Id == entry.VehicleId && parent.BranchId == CurrentBranchId) && Customers.Any(customer => customer.Id == entry.CustomerId && customer.BranchId == CurrentBranchId));
        b.Entity<InvoicePayment>().HasQueryFilter(entry => CurrentBranchId != null && Invoices.Any(parent => parent.Id == entry.InvoiceId && parent.BranchId == CurrentBranchId));
    }

    private void ApplyBranchFilter<T>(ModelBuilder b) where T : BranchEntity =>
        b.Entity<T>().HasQueryFilter(e => CurrentBranchId != null && e.BranchId == CurrentBranchId);

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var entry in ChangeTracker.Entries<Entity>().ToArray())
        {
            if (entry.State == EntityState.Modified) entry.Entity.UpdatedAt = DateTime.UtcNow;

            if (entry.State == EntityState.Added && entry.Entity is BranchEntity { BranchId: var id } branchEntity && id == Guid.Empty)
            {
                branchEntity.BranchId = CurrentBranchId
                    ?? throw new AppException("تعذّر تحديد الفرع لهذه العملية", "BRANCH_REQUIRED");
            }
            if (entry.Entity is BranchEntity scoped && entry.Entity is not AuditEntry && entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
                AuditEntries.Add(new AuditEntry { BranchId = scoped.BranchId, ActorId = currentUser.UserId, EntityType = entry.Entity.GetType().Name, RecordId = entry.Entity.Id, Action = entry.State.ToString() });
        }
        return base.SaveChangesAsync(ct);
    }
}
