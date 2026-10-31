using CargoPulse.Application.Common.Interfaces;
using CargoPulse.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CargoPulse.Infrastructure.Persistence;

public class AppDbContext : DbContext, IAppDbContext
{
    private readonly ICurrentUserService? _currentUserService;

    public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUserService? currentUserService = null)
        : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<WarehouseZone> WarehouseZones => Set<WarehouseZone>();
    public DbSet<WarehouseBin> WarehouseBins => Set<WarehouseBin>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<StockLevel> StockLevels => Set<StockLevel>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<Shipment> Shipments => Set<Shipment>();
    public DbSet<ShipmentEvent> ShipmentEvents => Set<ShipmentEvent>();
    public DbSet<ProofOfDelivery> ProofsOfDelivery => Set<ProofOfDelivery>();
    public DbSet<DriverSettlement> DriverSettlements => Set<DriverSettlement>();

    public Guid? CurrentTenantId => _currentUserService?.TenantId;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Multi-tenant Query Filters
        modelBuilder.Entity<Warehouse>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        modelBuilder.Entity<Item>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        modelBuilder.Entity<Shipment>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        modelBuilder.Entity<DriverSettlement>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);

        // Indexes & Constraints
        modelBuilder.Entity<Tenant>()
            .HasIndex(t => t.Code)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => new { u.TenantId, u.Email })
            .IsUnique();

        modelBuilder.Entity<Shipment>()
            .HasIndex(s => s.TrackingNumber)
            .IsUnique();

        modelBuilder.Entity<Shipment>()
            .HasIndex(s => s.Barcode);

        modelBuilder.Entity<Item>()
            .HasIndex(i => new { i.TenantId, i.Sku })
            .IsUnique();

        // Decimal precisions
        foreach (var property in modelBuilder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetPrecision(18);
            property.SetScale(2);
        }

        // Configure Proof of Delivery 1:1
        modelBuilder.Entity<Shipment>()
            .HasOne(s => s.ProofOfDelivery)
            .WithOne(p => p.Shipment)
            .HasForeignKey<ProofOfDelivery>(p => p.ShipmentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Shipment Events 1:N
        modelBuilder.Entity<Shipment>()
            .HasMany(s => s.Events)
            .WithOne(e => e.Shipment)
            .HasForeignKey(e => e.ShipmentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
