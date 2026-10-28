using FixSys.Application.Abstractions;
using FixSys.Application.Common;
using FixSys.Application.Invoicing;
using FixSys.Application.WorkOrders;
using FixSys.Domain.Common;
using FixSys.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FixSys.Application.Workspace;

public record SavePartInput(Guid? Id, string Sku, string Name, string Category, string Brand, string Unit, decimal Price, int MinStock, decimal Quantity, decimal Cost, List<string> Compatible, string? Barcode, string? Oem);
public record SaveCategoryInput(Guid? Id, string Name, string? Description, string Color, string Icon);
public record TemplateSectionInput(string Name, List<string> Items);
public record SaveTemplateInput(Guid? Id, string Name, string Type, List<TemplateSectionInput> Sections);
public record SaveServiceInput(Guid? Id, string Name, Guid CategoryId, decimal BasePrice, decimal? ExtraPrice, decimal DurationHours, ActiveStatus Status, string? Description, PricingModel PricingModel, string? RequiredBay, string? RequiredSpecialty);
public record SaveDepartmentInput(Guid? Id, string Name, string Color, string? Description, Guid? HeadEmployeeId);
public record SaveEmployeeInput(Guid? Id, string Name, string JobTitle, Guid DepartmentId, string Phone, string? Email, string? Address, decimal BasicSalary, EmployeeStatus Status);
public record SaveTechnicianInput(Guid? Id, string Name, string Phone, string Specialty, TechnicianStatus Status, int MaxTasks);
public record SaveSupplierInput(Guid? Id, string Name, string Code, string Category, string ContactName, string Phone, ActiveStatus Status);
public record PurchaseLineInput(Guid SparePartId, decimal Quantity, string Unit, decimal UnitPrice);
public record SavePurchaseOrderInput(Guid? Id, Guid SupplierId, DateOnly? ExpectedDate, string? Notes, PurchaseOrderStatus Status, List<PurchaseLineInput> Items);
public record SaveAppointmentInput(Guid? Id, Guid CustomerId, Guid VehicleId, Guid? ServiceId, Guid? TechnicianId, DateTime ScheduledAt, decimal EstimatedDurationHours, string? ComplaintNotes, AppointmentStatus Status);
public record SaveInspectionInput(Guid? Id, string Name, Guid TemplateId, Guid VehicleId, Guid? TechnicianId, InspectionStatus Status, string? Result);
public record EstimateLineInput(LineKind Kind, string Name, decimal Price, int Quantity, LineDecision Decision, string? RejectionReason);
public record SaveEstimateInput(Guid? Id, Guid CustomerId, Guid VehicleId, DateOnly ValidUntil, decimal Discount, EstimateStatus Status, Guid? InspectionSessionId, List<EstimateLineInput> Lines);
public record SaveVehicleInput(Guid Id, Guid CustomerId, string Plate, string Make, string Model, int Year, string Color, int Mileage, string Vin);
public record SaveRoleInput(Guid? Id, string Key, string Name, string Color, List<string> Permissions);
public record SaveSystemUserInput(Guid? Id, string Name, string Email, string RoleKey, bool IsActive, string? Password);
public record ChangeWorkOrderInput(Guid Id, Guid? TechnicianId, WorkOrderStatus Status, int Progress, string? Notes);
public record StockAdjustmentInput(Guid SparePartId, decimal Quantity, decimal UnitCost, StockTransactionType Type, string? ReferenceType);

public class WorkspaceService(IAppDbContext db, ICurrentUser current, IPasswordHasher hasher)
{
    public async Task<ServiceCategory> SaveCategoryAsync(SaveCategoryInput input, CancellationToken ct)
    {
        Required(input.Name, "اسم التصنيف");
        var category = await Upsert(db.ServiceCategories, input.Id, ct);
        category.Name = input.Name; category.Description = input.Description; category.Color = input.Color; category.Icon = input.Icon;
        await db.SaveChangesAsync(ct); return category;
    }

    public async Task<InspectionTemplate> SaveTemplateAsync(SaveTemplateInput input, CancellationToken ct)
    {
        Required(input.Name, "اسم القالب");
        if (input.Sections.Count == 0 || input.Sections.Any(section => string.IsNullOrWhiteSpace(section.Name) || section.Items.Count == 0 || section.Items.Any(string.IsNullOrWhiteSpace))) throw new AppException("أضف أقساماً ونقاط فحص صحيحة");
        var template = input.Id is { } id ? await db.InspectionTemplates.Include(item => item.Sections).FirstOrDefaultAsync(item => item.Id == id, ct) ?? throw new AppException("القالب غير موجود") : new InspectionTemplate();
        if (input.Id is null) db.InspectionTemplates.Add(template);
        db.InspectionSections.RemoveRange(template.Sections); template.Sections.Clear();
        template.Name = input.Name; template.Type = input.Type;
        foreach (var section in input.Sections) db.InspectionSections.Add(new InspectionSection { TemplateId = template.Id, Name = section.Name, Items = section.Items });
        await db.SaveChangesAsync(ct); return template;
    }
    private static void Required(string value, string label)
    {
        if (string.IsNullOrWhiteSpace(value)) throw new AppException($"{label} مطلوب");
    }

    private static async Task<T> Find<T>(DbSet<T> set, Guid id, CancellationToken ct) where T : Entity =>
        await set.FirstOrDefaultAsync(item => item.Id == id, ct) ?? throw new AppException("السجل غير موجود أو خارج الفرع", "NOT_FOUND");

    private static async Task<T> Upsert<T>(DbSet<T> set, Guid? id, CancellationToken ct) where T : Entity, new()
    {
        if (id is { } existing) return await Find(set, existing, ct);
        var entity = new T();
        set.Add(entity);
        return entity;
    }

    public async Task<SparePart> SavePartAsync(SavePartInput input, CancellationToken ct)
    {
        Required(input.Name, "اسم القطعة"); Required(input.Sku, "رمز القطعة");
        if (input.Price < 0 || input.Quantity < 0 || input.Cost < 0 || input.MinStock < 0) throw new AppException("قيم المخزون والأسعار لا يمكن أن تكون سالبة");
        if (await db.SpareParts.AnyAsync(part => part.Sku == input.Sku && part.Id != input.Id, ct)) throw new AppException("رمز القطعة مستخدم", "DUPLICATE");
        var part = await Upsert(db.SpareParts, input.Id, ct);
        part.Sku = input.Sku.Trim(); part.Name = input.Name.Trim(); part.Category = input.Category; part.Brand = input.Brand;
        part.SalesUoM = input.Unit; part.Price = input.Price; part.MinStock = input.MinStock; part.CompatibleVehicles = input.Compatible;
        part.Barcode = input.Barcode; part.Oem = input.Oem;
        var inventory = await db.InventoryItems.FirstOrDefaultAsync(item => item.SparePartId == part.Id, ct);
        if (inventory is null) { inventory = new InventoryItem { SparePartId = part.Id }; db.InventoryItems.Add(inventory); }
        if (input.Quantity < inventory.AllocatedQuantity) throw new AppException("لا يمكن تقليل المخزون دون الكمية المحجوزة");
        var delta = input.Quantity - inventory.Quantity;
        inventory.Quantity = input.Quantity; inventory.AverageCost = input.Cost;
        if (delta != 0) db.StockTransactions.Add(new StockTransaction { SparePartId = part.Id, Quantity = Math.Abs(delta), UnitCost = input.Cost, Type = delta > 0 ? StockTransactionType.In : StockTransactionType.Out, CreatedBy = current.Email ?? "", ReferenceType = "inventory-edit" });
        await db.SaveChangesAsync(ct); return part;
    }

    public async Task<ServiceItem> SaveServiceAsync(SaveServiceInput input, CancellationToken ct)
    {
        Required(input.Name, "اسم الخدمة");
        if (input.BasePrice < 0 || input.ExtraPrice < 0 || input.DurationHours <= 0) throw new AppException("سعر أو مدة الخدمة غير صالح");
        await Find(db.ServiceCategories, input.CategoryId, ct);
        var service = await Upsert(db.Services, input.Id, ct);
        service.Name = input.Name; service.CategoryId = input.CategoryId; service.BasePrice = input.BasePrice; service.ExtraPrice = input.ExtraPrice;
        service.DurationHours = input.DurationHours; service.Status = input.Status; service.Description = input.Description;
        service.PricingModel = input.PricingModel; service.RequiredBayType = input.RequiredBay; service.RequiredSpecialty = input.RequiredSpecialty;
        await db.SaveChangesAsync(ct); return service;
    }

    public async Task<Department> SaveDepartmentAsync(SaveDepartmentInput input, CancellationToken ct)
    {
        Required(input.Name, "اسم القسم");
        if (input.HeadEmployeeId is { } head) await Find(db.Employees, head, ct);
        var department = await Upsert(db.Departments, input.Id, ct);
        department.Name = input.Name; department.Color = input.Color; department.Description = input.Description; department.HeadEmployeeId = input.HeadEmployeeId;
        await db.SaveChangesAsync(ct); return department;
    }

    public async Task<Employee> SaveEmployeeAsync(SaveEmployeeInput input, CancellationToken ct)
    {
        Required(input.Name, "اسم الموظف"); Required(input.Phone, "رقم الهاتف");
        if (input.BasicSalary < 0) throw new AppException("الراتب غير صالح");
        await Find(db.Departments, input.DepartmentId, ct);
        var employee = await Upsert(db.Employees, input.Id, ct);
        employee.Name = input.Name; employee.JobTitle = input.JobTitle; employee.DepartmentId = input.DepartmentId; employee.Phone = input.Phone;
        employee.Email = input.Email; employee.Address = input.Address; employee.BasicSalary = input.BasicSalary; employee.Status = input.Status;
        await db.SaveChangesAsync(ct); return employee;
    }

    public async Task<Technician> SaveTechnicianAsync(SaveTechnicianInput input, CancellationToken ct)
    {
        Required(input.Name, "اسم الفني"); Required(input.Phone, "رقم الهاتف");
        if (input.MaxTasks < 1) throw new AppException("عدد المهام الأقصى يجب أن يكون موجباً");
        var tech = await Upsert(db.Technicians, input.Id, ct);
        Employee employee;
        if (input.Id is null)
        {
            var department = await db.Departments.FirstOrDefaultAsync(ct) ?? throw new AppException("أضف قسماً قبل تسجيل الفني");
            employee = new Employee { DepartmentId = department.Id, JobTitle = "فني" }; db.Employees.Add(employee); tech.EmployeeId = employee.Id;
        }
        else employee = await Find(db.Employees, tech.EmployeeId, ct);
        employee.Name = input.Name; employee.Phone = input.Phone; tech.Specialty = input.Specialty; tech.Status = input.Status; tech.MaxTasks = input.MaxTasks;
        await db.SaveChangesAsync(ct); return tech;
    }

    public async Task<Supplier> SaveSupplierAsync(SaveSupplierInput input, CancellationToken ct)
    {
        Required(input.Name, "اسم المورد"); Required(input.Code, "رمز المورد");
        if (await db.Suppliers.AnyAsync(item => item.Code == input.Code && item.Id != input.Id, ct)) throw new AppException("رمز المورد مستخدم", "DUPLICATE");
        var supplier = await Upsert(db.Suppliers, input.Id, ct);
        supplier.Name = input.Name; supplier.Code = input.Code; supplier.Category = input.Category; supplier.ContactName = input.ContactName; supplier.Phone = input.Phone; supplier.Status = input.Status;
        await db.SaveChangesAsync(ct); return supplier;
    }

    public async Task<PurchaseOrder> SavePurchaseOrderAsync(SavePurchaseOrderInput input, CancellationToken ct)
    {
        await Find(db.Suppliers, input.SupplierId, ct);
        if (input.Items.Count == 0 || input.Items.Any(item => item.Quantity <= 0 || item.UnitPrice < 0)) throw new AppException("أضف قطعاً بكميات وأسعار صحيحة");
        foreach (var line in input.Items) Money.RequirePrecision(line.UnitPrice);
        if (input.Status is PurchaseOrderStatus.Received or PurchaseOrderStatus.PartiallyReceived) throw new AppException("استخدم عملية استلام التوريد لتحديث المخزون");
        var order = input.Id is { } id ? await db.PurchaseOrders.Include(item => item.Items).FirstOrDefaultAsync(item => item.Id == id, ct) ?? throw new AppException("أمر الشراء غير موجود") : new PurchaseOrder { Number = NumberGenerator.Next("PO") };
        if (order.Status is PurchaseOrderStatus.Received or PurchaseOrderStatus.PartiallyReceived or PurchaseOrderStatus.Cancelled) throw new AppException("لا يمكن تعديل توريد مستلم أو ملغى؛ أنشئ طلباً جديداً");
        if (input.Id is null) db.PurchaseOrders.Add(order);
        foreach (var line in input.Items) await Find(db.SpareParts, line.SparePartId, ct);
        db.PurchaseOrderItems.RemoveRange(order.Items); order.Items.Clear();
        order.SupplierId = input.SupplierId; order.ExpectedDate = input.ExpectedDate; order.Notes = input.Notes; order.Status = input.Status;
        foreach (var item in input.Items) { var part = await Find(db.SpareParts, item.SparePartId, ct); db.PurchaseOrderItems.Add(new PurchaseOrderItem { PurchaseOrderId = order.Id, SparePartId = part.Id, Name = part.Name, Quantity = item.Quantity, Unit = item.Unit, UnitPrice = item.UnitPrice, Total = Money.Round(item.Quantity * item.UnitPrice) }); }
        order.Total = input.Items.Sum(item => Money.Round(item.Quantity * item.UnitPrice));
        await db.SaveChangesAsync(ct); return order;
    }

    public async Task<PurchaseOrder> ReceivePurchaseOrderAsync(Guid id, CancellationToken ct)
    {
        var order = await db.PurchaseOrders.Include(item => item.Items).FirstOrDefaultAsync(item => item.Id == id, ct) ?? throw new AppException("أمر الشراء غير موجود", "NOT_FOUND");
        if (order.Status == PurchaseOrderStatus.Received) return order;
        if (order.Status == PurchaseOrderStatus.Cancelled) throw new AppException("لا يمكن استلام أمر ملغى");
        if (order.Status == PurchaseOrderStatus.PartiallyReceived) throw new AppException("الاستلام الجزئي يحتاج مراجعة الكميات المستلمة؛ لا يمكن إضافة كامل الطلب مرة أخرى");
        foreach (var line in order.Items)
        {
            if (line.SparePartId is not { } partId) throw new AppException("القطعة غير مرتبطة بالمخزون");
            var stock = await db.InventoryItems.FirstOrDefaultAsync(item => item.SparePartId == partId, ct);
            if (stock is null) { stock = new InventoryItem { SparePartId = partId }; db.InventoryItems.Add(stock); }
            var newQuantity = stock.Quantity + line.Quantity;
            stock.AverageCost = newQuantity > 0 ? (stock.Quantity * stock.AverageCost + line.Quantity * line.UnitPrice) / newQuantity : 0;
            stock.Quantity = newQuantity;
            db.StockTransactions.Add(new StockTransaction { SparePartId = partId, Type = StockTransactionType.In, Quantity = line.Quantity, UnitCost = line.UnitPrice, ReferenceId = order.Id, ReferenceType = "purchase-order", CreatedBy = current.Email ?? "" });
        }
        order.Status = PurchaseOrderStatus.Received; await db.SaveChangesAsync(ct); return order;
    }

    public async Task<Appointment> SaveAppointmentAsync(SaveAppointmentInput input, CancellationToken ct)
    {
        var vehicle = await Find(db.Vehicles, input.VehicleId, ct);
        if (vehicle.CustomerId != input.CustomerId) throw new AppException("السيارة لا تخص هذا العميل");
        if (input.EstimatedDurationHours <= 0) throw new AppException("مدة الموعد يجب أن تكون موجبة");
        if (input.ServiceId is { } service) await Find(db.Services, service, ct);
        if (input.TechnicianId is { } tech)
        {
            await Find(db.Technicians, tech, ct);
            var end = input.ScheduledAt.AddHours((double)input.EstimatedDurationHours);
            if (input.Status != AppointmentStatus.Cancelled && await db.Appointments.AnyAsync(item => item.Id != input.Id && item.TechnicianId == tech && item.Status != AppointmentStatus.Cancelled && item.ScheduledAt < end && item.ScheduledAt.AddHours((double)item.EstimatedDurationHours) > input.ScheduledAt, ct)) throw new AppException("الفني لديه موعد متداخل", "CONFLICT");
        }
        var appointment = await Upsert(db.Appointments, input.Id, ct);
        if (input.Id != null && appointment.Status is AppointmentStatus.Completed or AppointmentStatus.Cancelled or AppointmentStatus.NoShow) throw new AppException("لا يمكن تعديل موعد مغلق؛ أنشئ موعداً جديداً");
        appointment.CustomerId = input.CustomerId; appointment.VehicleId = input.VehicleId; appointment.ServiceId = input.ServiceId; appointment.TechnicianId = input.TechnicianId;
        appointment.ScheduledAt = input.ScheduledAt.ToUniversalTime(); appointment.EstimatedDurationHours = input.EstimatedDurationHours; appointment.ComplaintNotes = input.ComplaintNotes; appointment.Status = input.Status;
        await db.SaveChangesAsync(ct); return appointment;
    }

    public async Task<InspectionSession> SaveInspectionAsync(SaveInspectionInput input, CancellationToken ct)
    {
        await Find(db.Vehicles, input.VehicleId, ct); await Find(db.InspectionTemplates, input.TemplateId, ct);
        if (input.TechnicianId is { } tech) await Find(db.Technicians, tech, ct);
        var inspection = await Upsert(db.InspectionSessions, input.Id, ct);
        if (input.Id != null && (inspection.Status == InspectionStatus.Completed || await db.Estimates.AnyAsync(estimate => estimate.InspectionSessionId == inspection.Id, ct))) throw new AppException("الفحص مكتمل أو مرتبط بعرض سعر؛ أنشئ فحصاً جديداً للتعديل");
        Required(input.Name, "اسم الفحص"); inspection.Name = input.Name;
        inspection.TemplateId = input.TemplateId; inspection.VehicleId = input.VehicleId; inspection.TechnicianId = input.TechnicianId; inspection.Status = input.Status; inspection.Result = input.Result;
        await db.SaveChangesAsync(ct); return inspection;
    }

    public async Task<Estimate> SaveEstimateAsync(SaveEstimateInput input, CancellationToken ct)
    {
        var vehicle = await Find(db.Vehicles, input.VehicleId, ct);
        if (vehicle.CustomerId != input.CustomerId) throw new AppException("السيارة لا تخص هذا العميل");
        if (input.InspectionSessionId is { } inspectionId) { var inspection = await Find(db.InspectionSessions, inspectionId, ct); if (inspection.VehicleId != vehicle.Id) throw new AppException("الفحص لا يخص السيارة"); }
        if (input.Lines.Count == 0 || input.Lines.Any(line => line.Price < 0 || line.Quantity <= 0)) throw new AppException("بنود العرض غير صالحة");
        Money.RequirePrecision(input.Discount);
        foreach (var line in input.Lines) Money.RequirePrecision(line.Price);
        if (input.Status == EstimateStatus.Presented && input.ValidUntil < DateOnly.FromDateTime(DateTime.UtcNow)) throw new AppException("لا يمكن تقديم عرض منتهي الصلاحية");
        var estimate = input.Id is { } id ? await db.Estimates.Include(item => item.LineItems).FirstOrDefaultAsync(item => item.Id == id, ct) ?? throw new AppException("العرض غير موجود") : new Estimate { Number = NumberGenerator.Next("QT") };
        if (input.Id != null && (estimate.Status is EstimateStatus.Approved or EstimateStatus.PartiallyApproved or EstimateStatus.Rejected || await db.WorkOrders.AnyAsync(order => order.EstimateId == estimate.Id, ct))) throw new AppException("قرار عرض السعر نهائي أو تم تحويله؛ أنشئ عرضاً جديداً للتعديل");
        if (input.Id is null) db.Estimates.Add(estimate);
        estimate.CustomerId = input.CustomerId; estimate.VehicleId = input.VehicleId; estimate.ValidUntil = input.ValidUntil; estimate.InspectionSessionId = input.InspectionSessionId;
        estimate.Subtotal = Money.Round(input.Lines.Sum(line => line.Price * line.Quantity));
        if (input.Discount < 0 || input.Discount > estimate.Subtotal) throw new AppException("الخصم غير صالح");
        estimate.Discount = input.Discount; estimate.Vat = Money.Round((estimate.Subtotal - input.Discount) * InvoiceService.VatRate); estimate.Total = estimate.Subtotal - estimate.Discount + estimate.Vat;
        estimate.Status = input.Status; if (input.Status == EstimateStatus.Presented) estimate.PresentedAt = DateTime.UtcNow; if (input.Status is EstimateStatus.Approved or EstimateStatus.PartiallyApproved) estimate.ApprovedAt = DateTime.UtcNow;
        db.EstimateLineItems.RemoveRange(estimate.LineItems); estimate.LineItems.Clear();
        foreach (var line in input.Lines) db.EstimateLineItems.Add(new EstimateLineItem { EstimateId = estimate.Id, Kind = line.Kind, Name = line.Name, Price = line.Price, Quantity = line.Quantity, Decision = line.Decision, RejectionReason = line.RejectionReason });
        await db.SaveChangesAsync(ct); return estimate;
    }

    public async Task<Vehicle> SaveVehicleAsync(SaveVehicleInput input, CancellationToken ct)
    {
        Required(input.Plate, "اللوحة"); Required(input.Make, "الماركة"); Required(input.Model, "الموديل");
        if (input.Year < 1900 || input.Year > DateTime.UtcNow.Year + 2 || input.Mileage < 0) throw new AppException("سنة الصنع أو العداد غير صالح");
        await Find(db.Customers, input.CustomerId, ct);
        var vehicle = await Find(db.Vehicles, input.Id, ct);
        if (vehicle.CustomerId != input.CustomerId)
        {
            if (await db.WorkOrders.AnyAsync(order => order.VehicleId == vehicle.Id && order.Status != WorkOrderStatus.Delivered && order.Status != WorkOrderStatus.Cancelled, ct) || await db.Appointments.AnyAsync(appointment => appointment.VehicleId == vehicle.Id && appointment.Status != AppointmentStatus.Completed && appointment.Status != AppointmentStatus.Cancelled && appointment.Status != AppointmentStatus.NoShow, ct)) throw new AppException("أغلق أوامر التشغيل والمواعيد قبل نقل ملكية السيارة");
            var ownership = await db.VehicleOwnerships.FirstOrDefaultAsync(item => item.VehicleId == vehicle.Id && item.ToDate == null, ct);
            if (ownership is not null) ownership.ToDate = DateTime.UtcNow;
            else db.VehicleOwnerships.Add(new VehicleOwnership { VehicleId = vehicle.Id, CustomerId = vehicle.CustomerId, FromDate = vehicle.CreatedAt, ToDate = DateTime.UtcNow });
            db.VehicleOwnerships.Add(new VehicleOwnership { VehicleId = vehicle.Id, CustomerId = input.CustomerId });
        }
        vehicle.CustomerId = input.CustomerId; vehicle.Plate = input.Plate; vehicle.Make = input.Make; vehicle.Model = input.Model; vehicle.Year = input.Year; vehicle.Color = input.Color; vehicle.Mileage = input.Mileage; vehicle.Vin = input.Vin;
        await db.SaveChangesAsync(ct); return vehicle;
    }

    public async Task<WorkOrder> ChangeWorkOrderAsync(ChangeWorkOrderInput input, CancellationToken ct)
    {
        if (input.Progress is < 0 or > 100) throw new AppException("نسبة الإنجاز غير صالحة");
        var order = await db.WorkOrders.Include(order => order.Lines).Include(order => order.Tasks).FirstOrDefaultAsync(order => order.Id == input.Id, ct) ?? throw new AppException("أمر التشغيل غير موجود", "NOT_FOUND");
        if (input.TechnicianId is { } tech && order.TechnicianId != input.TechnicianId) await WorkOrderWorkflow.ValidateAssignmentAsync(db, tech, order.Id, ct);
        await WorkOrderWorkflow.ChangeAsync(db, order, input.Status, input.Progress, ct);
        order.TechnicianId = input.TechnicianId; order.Notes = input.Notes;
        foreach (var task in order.Tasks) task.TechnicianId = input.TechnicianId;
        await db.SaveChangesAsync(ct); return order;
    }

    public async Task<Role> SaveRoleAsync(SaveRoleInput input, CancellationToken ct)
    {
        Required(input.Key, "رمز الدور"); Required(input.Name, "اسم الدور");
        if (await db.Roles.AnyAsync(role => role.Key == input.Key && role.Id != input.Id, ct)) throw new AppException("رمز الدور مستخدم", "DUPLICATE");
        var role = await Upsert(db.Roles, input.Id, ct);
        if (input.Id != null && role.Key != input.Key && await db.Users.AnyAsync(user => user.BranchId == current.BranchId && user.Roles.Contains(role.Key), ct)) throw new AppException("لا يمكن تغيير رمز دور مستخدم؛ أنشئ دورًا جديدًا أولًا");
        if (role.Key == "admin" && !input.Permissions.Any(permission => permission is "*" or "كل الصلاحيات")) throw new AppException("دور المسؤول يجب أن يحتفظ بكل الصلاحيات");
        role.Key = input.Key; role.Name = input.Name; role.Color = input.Color; role.Permissions = input.Permissions.Distinct().ToList();
        await db.SaveChangesAsync(ct); return role;
    }

    public async Task<AppUser> SaveSystemUserAsync(SaveSystemUserInput input, CancellationToken ct)
    {
        if (input.Id == null && await db.Branches.AnyAsync(branch => branch.Id == current.BranchId && branch.IsTrial, ct) && await db.Users.CountAsync(user => user.BranchId == current.BranchId, ct) >= 8) throw new AppException("التجربة تسمح بثمانية حسابات كحد أقصى");
        Required(input.Name, "الاسم"); Required(input.Email, "البريد");
        if (!System.Net.Mail.MailAddress.TryCreate(input.Email, out _)) throw new AppException("البريد غير صالح");
        if (!await db.Roles.AnyAsync(role => role.Key == input.RoleKey, ct)) throw new AppException("الدور غير موجود");
        if (input.Password is { Length: < 8 } || input.Id is null && string.IsNullOrEmpty(input.Password)) throw new AppException("كلمة المرور يجب ألا تقل عن ٨ أحرف");
        var email = input.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(user => user.Email == email && user.Id != input.Id, ct)) throw new AppException("البريد مستخدم", "DUPLICATE");
        var user = await Upsert(db.Users, input.Id, ct);
        if (input.Id is not null && user.BranchId != current.BranchId) throw new AppException("المستخدم خارج الفرع", "NOT_FOUND");
        if (input.Id == current.UserId && (!input.IsActive || !user.Roles.Contains(input.RoleKey))) throw new AppException("لا يمكنك تعطيل حسابك أو تغيير دورك من هذه الشاشة");
        if (user.IsActive && user.Roles.Contains("admin") && (!input.IsActive || input.RoleKey != "admin") && !await db.Users.AnyAsync(other => other.Id != user.Id && other.BranchId == current.BranchId && other.IsActive && other.Roles.Contains("admin"), ct)) throw new AppException("يجب الإبقاء على مسؤول نشط واحد على الأقل");
        if (input.Id != null && (user.Email != email || user.IsActive != input.IsActive || !user.Roles.SequenceEqual(new[] { input.RoleKey }) || !string.IsNullOrEmpty(input.Password))) user.SecurityStamp = Guid.NewGuid();
        user.BranchId = current.BranchId ?? throw new AppException("الفرع مطلوب"); user.Name = input.Name; user.Email = email; user.Roles = [input.RoleKey]; user.IsActive = input.IsActive;
        if (!string.IsNullOrEmpty(input.Password)) user.PasswordHash = hasher.Hash(input.Password);
        await db.SaveChangesAsync(ct); return user;
    }

    public async Task<StockTransaction> AdjustStockAsync(StockAdjustmentInput input, CancellationToken ct)
    {
        if (input.Quantity <= 0 || input.UnitCost < 0) throw new AppException("الكمية أو التكلفة غير صالحة");
        await Find(db.SpareParts, input.SparePartId, ct);
        var stock = await db.InventoryItems.FirstOrDefaultAsync(item => item.SparePartId == input.SparePartId, ct) ?? throw new AppException("القطعة غير موجودة في مخزون الفرع");
        var delta = input.Type == StockTransactionType.Out ? -input.Quantity : input.Quantity;
        if (stock.Quantity + delta < stock.AllocatedQuantity) throw new AppException("الرصيد المتاح غير كافٍ");
        if (delta > 0) stock.AverageCost = (stock.Quantity * stock.AverageCost + delta * input.UnitCost) / (stock.Quantity + delta);
        stock.Quantity += delta;
        var transaction = new StockTransaction { SparePartId = input.SparePartId, Quantity = input.Quantity, UnitCost = input.UnitCost, Type = input.Type, ReferenceType = input.ReferenceType, CreatedBy = current.Email ?? "" };
        db.StockTransactions.Add(transaction); await db.SaveChangesAsync(ct); return transaction;
    }

    public async Task<bool> DeleteEmployeeAsync(Guid id, CancellationToken ct)
    {
        var employee = await Find(db.Employees, id, ct);
        if (await db.Technicians.AnyAsync(tech => tech.EmployeeId == id, ct) || await db.Users.AnyAsync(user => user.EmployeeId == id, ct)) throw new AppException("الموظف مرتبط بفني أو حساب؛ أوقفه بدلاً من حذفه");
        db.Employees.Remove(employee); await db.SaveChangesAsync(ct); return true;
    }
}
