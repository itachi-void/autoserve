using CargoPulse.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CargoPulse.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<Tenant> Tenants { get; }
    DbSet<User> Users { get; }
    DbSet<Warehouse> Warehouses { get; }
    DbSet<WarehouseZone> WarehouseZones { get; }
    DbSet<WarehouseBin> WarehouseBins { get; }
    DbSet<Item> Items { get; }
    DbSet<StockLevel> StockLevels { get; }
    DbSet<StockMovement> StockMovements { get; }
    DbSet<Shipment> Shipments { get; }
    DbSet<ShipmentEvent> ShipmentEvents { get; }
    DbSet<ProofOfDelivery> ProofsOfDelivery { get; }
    DbSet<DriverSettlement> DriverSettlements { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
