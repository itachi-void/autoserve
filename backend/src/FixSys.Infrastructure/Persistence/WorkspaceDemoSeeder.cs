using FixSys.Application.Abstractions;
using FixSys.Domain.Common;
using FixSys.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FixSys.Infrastructure.Persistence;

public static class WorkspaceDemoSeeder
{
    private sealed record DemoActor(Guid? UserId, Guid? BranchId, string? Email) : ICurrentUser;

    public static async Task InitializeAsync(IServiceProvider services, Guid? branchId = null)
    {
        using var scope = services.CreateScope();
        var original = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var branch = await original.Branches.AsNoTracking().FirstOrDefaultAsync(branch => branchId != null ? branch.Id == branchId : branch.Code == "HQ");
        if (branch is null) return;
        await using var db = new AppDbContext(scope.ServiceProvider.GetRequiredService<DbContextOptions<AppDbContext>>(), new DemoActor(null, branch.Id, null));
        await using var transaction = await db.Database.BeginTransactionAsync();
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(19261005)");
        if (await db.Customers.AnyAsync(customer => customer.Phone == "0599000100" && customer.Name == "أحمد السالم [تجريبي]")) return;

        await PopulateAsync(db, branch);
        await transaction.CommitAsync();
    }

    public static async Task PopulateAsync(AppDbContext db, Branch branch)
    {

        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);
        var prefix = $"DEMO-{branch.Id.ToString("N")[..8]}";
        var departments = new[]
        {
            new Department { BranchId = branch.Id, Name = "التشغيل [تجريبي]", Color = "sky", Description = "فريق صيانة السيارات التجريبي" },
            new Department { BranchId = branch.Id, Name = "الاستقبال [تجريبي]", Color = "emerald", Description = "خدمة العملاء" },
            new Department { BranchId = branch.Id, Name = "التوريد [تجريبي]", Color = "amber", Description = "المخزون والموردون" },
        };
        db.Departments.AddRange(departments);
        var employeeNames = new[] { "محمد الفني", "خالد الميكانيكي", "عمر الكهربائي", "علي الفني", "سارة الاستقبال", "حسن المخازن" };
        var employees = employeeNames.Select((name, index) => new Employee
        {
            BranchId = branch.Id, Name = name + " [تجريبي]", DepartmentId = departments[index < 4 ? 0 : index - 3].Id,
            JobTitle = index < 4 ? "فني صيانة" : index == 4 ? "موظفة استقبال" : "أمين مخزن",
            Phone = $"05991001{index:00}", Email = $"demo.employee{index}@example.com", BasicSalary = index < 4 ? 5500 : 4500,
            JoinDate = today.AddMonths(-6), Status = EmployeeStatus.Active,
        }).ToArray();
        db.Employees.AddRange(employees);
        var specialties = new[] { "صيانة دورية", "محرك", "كهرباء", "فرامل" };
        var technicians = employees.Take(4).Select((employee, index) => new Technician
        {
            BranchId = branch.Id, EmployeeId = employee.Id, Specialty = specialties[index], Status = index is 1 or 2 ? TechnicianStatus.Busy : TechnicianStatus.Available,
            MaxTasks = 3, Rating = 4.5m, CompletedJobs = 12 + index * 4, Efficiency = 90,
        }).ToArray();
        db.Technicians.AddRange(technicians);

        var names = new[] { "أحمد السالم", "محمد العتيبي", "خالد الحربي", "شركة أسطول الاختبار", "عمر القحطاني", "ناصر الغامدي" };
        var customers = names.Select((name, index) => new Customer
        {
            BranchId = branch.Id, Name = name + " [تجريبي]", Phone = $"05990001{index:00}", Email = $"demo.customer{index}@example.com",
            Address = "الرياض — عنوان اختبار", Type = index == 3 ? CustomerType.Company : CustomerType.Individual, Status = ActiveStatus.Active,
        }).ToArray();
        db.Customers.AddRange(customers);
        var makes = new[] { "تويوتا", "هيونداي", "كيا", "نيسان", "فورد", "شيفروليه" };
        var models = new[] { "كامري", "سوناتا", "سبورتاج", "باترول", "تورس", "تاهو" };
        var vehicles = customers.Select((customer, index) => new Vehicle
        {
            BranchId = branch.Id, CustomerId = customer.Id, Plate = $"ت ج ر {9100 + index}", Make = makes[index], Model = models[index],
            Year = 2021 + index % 4, Color = index % 2 == 0 ? "أبيض" : "أسود", Vin = $"DEMO{branch.Id.ToString("N")[..7]}{index:000000}", Mileage = 35000 + index * 8000,
            OwnershipHistory = [new VehicleOwnership { CustomerId = customer.Id, FromDate = now.AddMonths(-6) }],
        }).ToArray();
        db.Vehicles.AddRange(vehicles);

        var category = new ServiceCategory { BranchId = branch.Id, Name = "خدمات الاختبار [تجريبي]", Color = "sky", Icon = "wrench", Description = "بيانات اختبار الربط الفعلي" };
        db.ServiceCategories.Add(category);
        var serviceNames = new[] { "تغيير زيت المحرك", "صيانة الفرامل", "فحص كهرباء", "صيانة التكييف", "ضبط الزوايا", "فحص شامل" };
        var servicesList = serviceNames.Select(name => new ServiceItem
        {
            BranchId = branch.Id, Name = name + " [تجريبي]", CategoryId = category.Id, BasePrice = 250, DurationHours = 1,
            Status = ActiveStatus.Active, PricingModel = PricingModel.Fixed,
        }).ToArray();
        db.Services.AddRange(servicesList);
        var partNames = new[] { "فلتر زيت", "تيل فرامل", "بطارية", "فلتر هواء", "بواجي", "سير محرك" };
        var parts = partNames.Select((name, index) => new SparePart
        {
            BranchId = branch.Id, Sku = $"{prefix}-PART-{index + 1:00}", Name = name + " [تجريبي]", Category = index == 2 ? "كهرباء" : "صيانة",
            Brand = "علامة اختبار", SalesUoM = "قطعة", Price = 120, MinStock = 10, CompatibleVehicles = [makes[index] + " " + models[index]],
        }).ToArray();
        db.SpareParts.AddRange(parts);
        foreach (var part in parts)
        {
            db.InventoryItems.Add(new InventoryItem { BranchId = branch.Id, SparePartId = part.Id, Quantity = 40, AverageCost = 80 });
            db.StockTransactions.Add(new StockTransaction { BranchId = branch.Id, SparePartId = part.Id, Type = StockTransactionType.In, Quantity = 40, UnitCost = 80, ReferenceType = "demo-opening", CreatedBy = "تهيئة الاختبار" });
        }
        var suppliers = new[] { "مورد قطع الغيار", "مورد الكهرباء", "مورد الزيوت" }.Select((name, index) => new Supplier
        {
            BranchId = branch.Id, Name = name + " [تجريبي]", Code = $"{prefix}-SUP-{index + 1}", Category = "قطع غيار", ContactName = "مندوب الاختبار",
            Phone = $"05992001{index:00}", Status = ActiveStatus.Active,
        }).ToArray();
        db.Suppliers.AddRange(suppliers);
        foreach (var index in Enumerable.Range(0, 3))
            db.PurchaseOrders.Add(new PurchaseOrder
            {
                BranchId = branch.Id, Number = $"{prefix}-PO-{index + 1:00}", SupplierId = suppliers[index].Id, OrderDate = today,
                ExpectedDate = today.AddDays(index + 2), Status = index == 1 ? PurchaseOrderStatus.Sent : PurchaseOrderStatus.Draft,
                Total = 1600, Notes = "طلب اختبار Telegram؛ التسليم يزيد المخزون فعلياً",
                Items = [new PurchaseOrderItem { SparePartId = parts[index].Id, Name = parts[index].Name, Quantity = 20, Unit = "قطعة", UnitPrice = 80, Total = 1600 }],
            });

        var template = new InspectionTemplate
        {
            Name = "فحص الربط [تجريبي]", Type = "شامل",
            BranchId = branch.Id,
            Sections = [new InspectionSection { Name = "السلامة", Items = ["الفرامل", "الإطارات", "الإضاءة"] }, new InspectionSection { Name = "المحرك", Items = ["الزيت", "التسريبات"] }],
        };
        db.InspectionTemplates.Add(template);
        var inspections = Enumerable.Range(0, 4).Select(index => new InspectionSession
        {
            BranchId = branch.Id, Name = $"فحص سيارة اختبار {index + 1}", TemplateId = template.Id, VehicleId = vehicles[index].Id, TechnicianId = technicians[index].Id,
            Status = index == 0 ? InspectionStatus.InProgress : InspectionStatus.Completed, Result = "فحص تجريبي: مراجعة الصيانة الدورية",
            Damages = [new InspectionDamage { Location = "الصدام الأمامي", Note = "خدش مسجل للاختبار" }],
        }).ToArray();
        db.InspectionSessions.AddRange(inspections);
        var estimates = customers.Select((customer, index) => new Estimate
        {
            BranchId = branch.Id, Number = $"{prefix}-QT-{index + 1:00}", CustomerId = customer.Id, VehicleId = vehicles[index].Id,
            InspectionSessionId = index < 4 ? inspections[index].Id : null, ValidUntil = today.AddDays(30),
            Subtotal = 370, Vat = 55.50m, Total = 425.50m, Status = index < 2 ? EstimateStatus.Presented : EstimateStatus.Approved,
            PresentedAt = now, ApprovedAt = index < 2 ? null : now,
            LineItems = [new EstimateLineItem { Kind = LineKind.Service, Name = servicesList[index].Name, Price = 250, Quantity = 1, Decision = index < 2 ? LineDecision.Pending : LineDecision.Accepted }, new EstimateLineItem { Kind = LineKind.Part, Name = parts[index].Name, Price = 120, Quantity = 1, Decision = index < 2 ? LineDecision.Pending : LineDecision.Accepted }],
        }).ToArray();
        db.Estimates.AddRange(estimates);
        var orderStatuses = new[] { WorkOrderStatus.Pending, WorkOrderStatus.InProgress, WorkOrderStatus.WaitingParts, WorkOrderStatus.Completed };
        var workOrders = Enumerable.Range(0, 4).Select(index => new WorkOrder
        {
            BranchId = branch.Id, Number = $"{prefix}-WO-{index + 1:00}", CustomerId = customers[index + 2].Id, VehicleId = vehicles[index + 2].Id,
            EstimateId = estimates[index + 2].Id, TechnicianId = technicians[index].Id, Status = orderStatuses[index], Priority = index == 1 ? WorkOrderPriority.High : WorkOrderPriority.Normal,
            Total = 370, Progress = index == 3 ? 100 : index * 25, StartedAt = index == 0 ? null : now.AddHours(-2), CompletedAt = index == 3 ? now : null,
            StockReserved = index < 3, StockConsumed = index == 3,
            Notes = "أمر تشغيل للاختبار الفعلي",
            Lines = [new WorkOrderLine { Kind = LineKind.Service, Name = servicesList[index + 2].Name, Price = 250, Quantity = 1 }, new WorkOrderLine { SparePartId = parts[index + 2].Id, Kind = LineKind.Part, Name = parts[index + 2].Name, Price = 120, Quantity = 1 }],
            Tasks = [new WorkOrderTask { Service = servicesList[index + 2].Name, TechnicianId = technicians[index].Id, Progress = index == 3 ? 100 : index * 25 }],
        }).ToArray();
        db.WorkOrders.AddRange(workOrders);
        foreach (var index in Enumerable.Range(0, 4))
        {
            var stock = db.InventoryItems.Local.Single(item => item.SparePartId == parts[index + 2].Id);
            if (index < 3) stock.AllocatedQuantity = 1;
            else
            {
                stock.Quantity -= 1;
                db.StockTransactions.Add(new StockTransaction { BranchId = branch.Id, SparePartId = stock.SparePartId, Type = StockTransactionType.Out, Quantity = 1, UnitCost = stock.AverageCost, ReferenceType = "workorder", ReferenceId = workOrders[index].Id, CreatedBy = "تهيئة الاختبار" });
            }
        }
        workOrders[1].Supplements.Add(new WorkOrderSupplement { Reason = "طلب مراجعة إضافية للاختبار", Amount = 75, Status = SupplementStatus.Pending, RequestedAt = now });
        db.TechnicianTimeLogs.Add(new TechnicianTimeLog { TechnicianId = technicians[3].Id, WorkOrderId = workOrders[3].Id, Task = servicesList[5].Name, ClockIn = now.AddHours(-2), ClockOut = now, Status = TaskClockStatus.Completed });
        var invoice = new Invoice
        {
            BranchId = branch.Id, Number = $"{prefix}-INV-01", CustomerId = customers[5].Id, VehicleId = vehicles[5].Id, WorkOrderId = workOrders[3].Id,
            Subtotal = 370, Vat = 55.50m, Total = 425.50m, PaidAmount = 100, Status = InvoiceStatus.PartiallyPaid,
            Payments = [new InvoicePayment { Amount = 100, Method = PaymentMethod.Cash, Reference = "دفعة اختبار", PaidAt = now }],
        };
        db.Invoices.Add(invoice);
        customers[5].OutstandingBalance = 325.50m;
        db.LedgerEntries.AddRange(
            new CustomerLedgerEntry { BranchId = branch.Id, CustomerId = customers[5].Id, Type = LedgerTransactionType.Invoice, Amount = 425.50m, Description = "فاتورة اختبار", ReferenceId = invoice.Id },
            new CustomerLedgerEntry { BranchId = branch.Id, CustomerId = customers[5].Id, Type = LedgerTransactionType.Payment, Amount = -100, Description = "دفعة نقدية للاختبار", ReferenceId = invoice.Id });
        foreach (var index in Enumerable.Range(0, 6))
            db.Appointments.Add(new Appointment
            {
                BranchId = branch.Id, CustomerId = customers[index].Id, VehicleId = vehicles[index].Id, ServiceId = servicesList[index].Id,
                TechnicianId = technicians[index % 4].Id, ScheduledAt = now.Date.AddDays(1 + index / 3).AddHours(8 + index % 3 * 2),
                EstimatedDurationHours = 1, Status = index % 2 == 0 ? AppointmentStatus.Confirmed : AppointmentStatus.Scheduled, ComplaintNotes = "حجز اختبار؛ لا تُرسل إشعارات تلقائياً",
            });

        await db.SaveChangesAsync();
    }
}
