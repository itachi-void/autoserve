using CargoPulse.Domain.Entities;
using CargoPulse.Domain.Enums;
using CargoPulse.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace CargoPulse.Infrastructure.Persistence;

public static class SeedData
{
    public static async Task InitializeAsync(AppDbContext context)
    {
        if (await context.Tenants.AnyAsync())
        {
            return; // Already seeded
        }

        var tenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "CargoPulse Global Logistics",
            NameAr = "كارغوبلس للخدمات اللوجستية وسلاسل الإمداد",
            Code = "CP-GLOBAL",
            CurrencyCode = "SAR",
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };
        context.Tenants.Add(tenant);

        // Users
        var adminUser = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            TenantId = tenantId,
            FullName = "Eng. Tariq Al-Mansoor",
            Email = "admin@cargopulse.com",
            PasswordHash = PasswordService.HashPassword("Admin@123456"),
            PhoneNumber = "+966501234567",
            Role = UserRole.Admin,
            PreferredLanguage = "ar",
            IsActive = true
        };

        var managerUser = new User
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            TenantId = tenantId,
            FullName = "Khaled Al-Harbi",
            Email = "manager@cargopulse.com",
            PasswordHash = PasswordService.HashPassword("Manager@123456"),
            PhoneNumber = "+966509876543",
            Role = UserRole.WarehouseManager,
            PreferredLanguage = "ar",
            IsActive = true
        };

        var driverUser = new User
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            TenantId = tenantId,
            FullName = "Sami Al-Otaibi",
            Email = "driver@cargopulse.com",
            PasswordHash = PasswordService.HashPassword("Driver@123456"),
            PhoneNumber = "+966555123456",
            Role = UserRole.Driver,
            PreferredLanguage = "ar",
            IsActive = true
        };

        context.Users.AddRange(adminUser, managerUser, driverUser);

        // Warehouses
        var ruhWarehouse = new Warehouse
        {
            Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            TenantId = tenantId,
            Name = "Riyadh Central Logistics Hub",
            NameAr = "مركز الرياض اللوجستي المركزي",
            Code = "RUH-HUB-01",
            City = "Riyadh",
            Address = "Industrial City 2, Riyadh",
            CapacitySqMeters = 15000m,
            IsActive = true
        };

        var jedWarehouse = new Warehouse
        {
            Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            TenantId = tenantId,
            Name = "Jeddah Port Distribution Depot",
            NameAr = "مستودع توزيع ميناء جدة الإسلامي",
            Code = "JED-DEPOT-02",
            City = "Jeddah",
            Address = "Port Area, King Faisal St, Jeddah",
            CapacitySqMeters = 12000m,
            IsActive = true
        };

        context.Warehouses.AddRange(ruhWarehouse, jedWarehouse);

        // Zones & Bins in Riyadh
        var zoneA = new WarehouseZone
        {
            Id = Guid.NewGuid(),
            WarehouseId = ruhWarehouse.Id,
            Name = "Aisle A - High Value Electronics",
            Code = "ZONE-A",
            ZoneType = ZoneType.Storage
        };

        var binA1 = new WarehouseBin { Id = Guid.NewGuid(), ZoneId = zoneA.Id, BinCode = "A-01-01", Aisle = "A", Rack = "01", Shelf = "01", IsOccupied = true };
        var binA2 = new WarehouseBin { Id = Guid.NewGuid(), ZoneId = zoneA.Id, BinCode = "A-01-02", Aisle = "A", Rack = "01", Shelf = "02", IsOccupied = true };
        var binA3 = new WarehouseBin { Id = Guid.NewGuid(), ZoneId = zoneA.Id, BinCode = "A-02-01", Aisle = "A", Rack = "02", Shelf = "01", IsOccupied = false };

        context.WarehouseZones.Add(zoneA);
        context.WarehouseBins.AddRange(binA1, binA2, binA3);

        // Items
        var item1 = new Item
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Sku = "ELEC-SEN-092",
            Barcode = "6281002345671",
            NameEn = "Precision Telemetry Sensors",
            NameAr = "حساسات قياس عن بعد ذكية",
            Category = "Industrial IoT",
            Unit = "BOX",
            WeightKg = 2.5m,
            DeclaredPrice = 850.00m
        };

        var item2 = new Item
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Sku = "HYD-FIL-404",
            Barcode = "6281009876542",
            NameEn = "Heavy Fleet Hydraulic Filters",
            NameAr = "فلاتر هيدروليكية للشاحنات الثقيلة",
            Category = "Automotive Parts",
            Unit = "PCS",
            WeightKg = 4.2m,
            DeclaredPrice = 320.00m
        };

        context.Items.AddRange(item1, item2);

        // Shipments
        var shipment1 = new Shipment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            TrackingNumber = "CP-882190-SA",
            Barcode = "CP882190SA",
            SenderName = "Al-Badr Advanced Technologies",
            SenderPhone = "+966501112233",
            SenderCity = "Riyadh",
            SenderAddress = "Olaya Towers, Riyadh",
            RecipientName = "Abdullah Al-Qahtani",
            RecipientPhone = "+966559988776",
            RecipientCity = "Jeddah",
            RecipientAddress = "Al-Rawdah Dist, Prince Saud St, Jeddah",
            OriginWarehouseId = ruhWarehouse.Id,
            DestinationWarehouseId = jedWarehouse.Id,
            CurrentBinId = binA1.Id,
            Status = ShipmentStatus.OutForDelivery,
            WeightKg = 5.2m,
            LengthCm = 35m,
            WidthCm = 25m,
            HeightCm = 15m,
            DeclaredValue = 1800m,
            ShippingFee = 45m,
            CodAmount = 650.00m,
            PaymentMethod = PaymentMethod.CashOnDelivery,
            IsCodCollected = false,
            AssignedDriverId = driverUser.Id,
            AssignedDriverName = driverUser.FullName,
            VehiclePlate = "أ ب ج 9821",
            CreatedAtUtc = DateTime.UtcNow.AddHours(-18)
        };
        shipment1.Events.Add(new ShipmentEvent
        {
            PreviousStatus = ShipmentStatus.Created,
            NewStatus = ShipmentStatus.Received,
            Actor = "Khaled Al-Harbi",
            Location = "RUH-HUB-01",
            Notes = "Shipment received at Riyadh Central Hub",
            TimestampUtc = DateTime.UtcNow.AddHours(-16)
        });
        shipment1.Events.Add(new ShipmentEvent
        {
            PreviousStatus = ShipmentStatus.Received,
            NewStatus = ShipmentStatus.InTransit,
            Actor = "Dispatcher System",
            Location = "Highway 40",
            Notes = "Dispatched via inter-city transport truck",
            TimestampUtc = DateTime.UtcNow.AddHours(-10)
        });
        shipment1.Events.Add(new ShipmentEvent
        {
            PreviousStatus = ShipmentStatus.InTransit,
            NewStatus = ShipmentStatus.OutForDelivery,
            Actor = driverUser.FullName,
            Location = "Jeddah Delivery Zone 4",
            Notes = "Loaded into delivery van for delivery",
            TimestampUtc = DateTime.UtcNow.AddHours(-2)
        });

        var shipment2 = new Shipment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            TrackingNumber = "CP-441029-SA",
            Barcode = "CP441029SA",
            SenderName = "Saudi Industrial Supplies",
            SenderPhone = "+966504443322",
            SenderCity = "Dammam",
            SenderAddress = "Dammam 1st Industrial City",
            RecipientName = "Mohammed Al-Shehri",
            RecipientPhone = "+966567788990",
            RecipientCity = "Riyadh",
            RecipientAddress = "Al-Malqa, Anas Ibn Malik St, Riyadh",
            OriginWarehouseId = ruhWarehouse.Id,
            DestinationWarehouseId = ruhWarehouse.Id,
            CurrentBinId = binA2.Id,
            Status = ShipmentStatus.Delivered,
            WeightKg = 12.0m,
            LengthCm = 50m,
            WidthCm = 40m,
            HeightCm = 30m,
            DeclaredValue = 2400m,
            ShippingFee = 80m,
            CodAmount = 0m,
            PaymentMethod = PaymentMethod.Prepaid,
            IsCodCollected = true,
            AssignedDriverId = driverUser.Id,
            AssignedDriverName = driverUser.FullName,
            VehiclePlate = "أ ب ج 9821",
            CreatedAtUtc = DateTime.UtcNow.AddDays(-2),
            DeliveredAtUtc = DateTime.UtcNow.AddHours(-5)
        };
        shipment2.Events.Add(new ShipmentEvent
        {
            PreviousStatus = ShipmentStatus.OutForDelivery,
            NewStatus = ShipmentStatus.Delivered,
            Actor = driverUser.FullName,
            Location = "Al-Malqa, Riyadh",
            Notes = "Delivered successfully with digital signature",
            TimestampUtc = DateTime.UtcNow.AddHours(-5)
        });
        shipment2.ProofOfDelivery = new ProofOfDelivery
        {
            ShipmentId = shipment2.Id,
            RecipientName = "Mohammed Al-Shehri",
            SignatureData = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><path d='M10 50 Q 50 10 90 50 T 170 50' stroke='black' fill='none'/></svg>",
            PhotoEvidenceUrl = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400",
            Latitude = 24.774265,
            Longitude = 46.738586,
            TimestampUtc = DateTime.UtcNow.AddHours(-5),
            Notes = "Received by recipient personally at office entrance"
        };

        context.Shipments.AddRange(shipment1, shipment2);

        // Driver Settlement
        var settlement = new DriverSettlement
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            DriverId = driverUser.Id,
            DriverName = driverUser.FullName,
            SettlementDateUtc = DateTime.UtcNow.Date,
            ExpectedCodAmount = 650.00m,
            CollectedCodAmount = 650.00m,
            Status = SettlementStatus.Reconciled,
            Notes = "Daily settlement matched 100% without discrepancy"
        };
        context.DriverSettlements.Add(settlement);

        await context.SaveChangesAsync();
    }
}
