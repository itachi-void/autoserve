using FixSys.Application.Abstractions;
using FixSys.Application.Common;
using FixSys.Domain.Common;
using FixSys.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FixSys.Application.WorkOrders;

public static class WorkOrderWorkflow
{
    public static async Task ValidateAssignmentAsync(IAppDbContext db, Guid technicianId, Guid? existingOrderId, CancellationToken ct)
    {
        var technician = await db.Technicians.Include(item => item.Employee).FirstOrDefaultAsync(item => item.Id == technicianId, ct) ?? throw new AppException("الفني غير موجود", "NOT_FOUND");
        if (technician.Employee?.Status != EmployeeStatus.Active || technician.Status is TechnicianStatus.Off or TechnicianStatus.OnBreak) throw new AppException("الفني غير متاح لاستلام أعمال جديدة");
        var assigned = await db.WorkOrders.CountAsync(order => order.Id != existingOrderId && order.TechnicianId == technicianId && (order.Status == WorkOrderStatus.Pending || order.Status == WorkOrderStatus.InProgress || order.Status == WorkOrderStatus.WaitingParts), ct);
        if (assigned >= technician.MaxTasks) throw new AppException("الفني وصل للحد الأقصى من أوامر التشغيل المفتوحة");
    }

    public static async Task ReserveAsync(IAppDbContext db, WorkOrder order, CancellationToken ct)
    {
        if (order.StockReserved || order.StockConsumed) return;
        foreach (var line in order.Lines.Where(line => line.Kind == LineKind.Part))
        {
            var candidates = await db.SpareParts.Where(part => line.SparePartId != null ? part.Id == line.SparePartId : part.Name == line.Name).Take(2).ToListAsync(ct);
            if (candidates.Count != 1) throw new AppException($"اربط القطعة «{line.Name}» بقطعة غيار مسجلة وغير ملتبسة");
            line.SparePartId = candidates[0].Id;
        }
        foreach (var group in order.Lines.Where(line => line.Kind == LineKind.Part).GroupBy(line => line.SparePartId!.Value))
        {
            var stock = await db.InventoryItems.FirstOrDefaultAsync(item => item.SparePartId == group.Key, ct) ?? throw new AppException("القطعة غير موجودة في مخزون الفرع");
            var quantity = group.Sum(line => line.Quantity);
            if (stock.Quantity - stock.AllocatedQuantity < quantity) throw new AppException($"الرصيد المتاح غير كافٍ للقطعة «{group.First().Name}»");
            stock.AllocatedQuantity += quantity;
        }
        order.StockReserved = true;
    }

    public static async Task ChangeAsync(IAppDbContext db, WorkOrder order, WorkOrderStatus status, int progress, CancellationToken ct)
    {
        if (progress is < 0 or > 100) throw new AppException("نسبة الإنجاز غير صالحة");
        if (order.Status is WorkOrderStatus.Cancelled or WorkOrderStatus.Delivered) throw new AppException("أمر التشغيل مغلق ولا يمكن تعديله");
        if (order.Status != status)
        {
            var allowed = order.Status switch
            {
                WorkOrderStatus.Pending => status is WorkOrderStatus.InProgress or WorkOrderStatus.WaitingParts or WorkOrderStatus.Cancelled,
                WorkOrderStatus.InProgress => status is WorkOrderStatus.WaitingParts or WorkOrderStatus.Completed or WorkOrderStatus.Cancelled,
                WorkOrderStatus.WaitingParts => status is WorkOrderStatus.InProgress or WorkOrderStatus.Cancelled,
                WorkOrderStatus.Completed => status == WorkOrderStatus.Delivered,
                _ => false,
            };
            if (!allowed) throw new AppException("انتقال الحالة غير مسموح؛ ابدأ التنفيذ قبل إكماله، ولا تعِد فتح أمر مكتمل");
        }
        if (status == WorkOrderStatus.Delivered && !await db.Invoices.AnyAsync(invoice => invoice.WorkOrderId == order.Id && invoice.Status == InvoiceStatus.Paid, ct)) throw new AppException("أصدر الفاتورة وسجّل كامل السداد قبل تسليم السيارة");
        if (status != WorkOrderStatus.Cancelled && !order.StockConsumed) await ReserveAsync(db, order, ct);
        if (status is WorkOrderStatus.Completed or WorkOrderStatus.Cancelled && order.StockReserved && !order.StockConsumed)
        {
            foreach (var group in order.Lines.Where(line => line.Kind == LineKind.Part).GroupBy(line => line.SparePartId!.Value))
            {
                var stock = await db.InventoryItems.FirstAsync(item => item.SparePartId == group.Key, ct);
                var quantity = group.Sum(line => line.Quantity);
                if (stock.AllocatedQuantity < quantity || stock.Quantity < quantity) throw new AppException("رصيد حجز المخزون غير متطابق؛ راجع المخزن قبل الإكمال");
                stock.AllocatedQuantity -= quantity;
                if (status == WorkOrderStatus.Completed)
                {
                    stock.Quantity -= quantity;
                    db.StockTransactions.Add(new StockTransaction { BranchId = order.BranchId, SparePartId = group.Key, Type = StockTransactionType.Out, Quantity = quantity, UnitCost = stock.AverageCost, ReferenceType = "workorder", ReferenceId = order.Id, CreatedBy = "تنفيذ أمر التشغيل" });
                }
            }
            order.StockReserved = false;
            order.StockConsumed = status == WorkOrderStatus.Completed;
        }
        order.Status = status;
        order.Progress = status is WorkOrderStatus.Completed or WorkOrderStatus.Delivered ? 100 : Math.Min(progress, 99);
        foreach (var task in order.Tasks) task.Progress = order.Progress;
        if (status == WorkOrderStatus.InProgress) order.StartedAt ??= DateTime.UtcNow;
        if (status == WorkOrderStatus.Completed) order.CompletedAt ??= DateTime.UtcNow;
    }
}
