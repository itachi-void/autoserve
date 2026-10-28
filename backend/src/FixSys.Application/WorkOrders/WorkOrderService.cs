using FixSys.Application.Abstractions;
using FixSys.Application.Common;
using FixSys.Domain.Common;
using FixSys.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FixSys.Application.WorkOrders;

public record WorkOrderLineInput(LineKind Kind, string Name, decimal Price, int Quantity, Guid? SparePartId = null);
public record CreateWorkOrderInput(
    Guid CustomerId, Guid VehicleId, Guid? TechnicianId, Guid? EstimateId,
    WorkOrderPriority Priority, string? Notes, List<WorkOrderLineInput> Lines);
public record UpdateWorkOrderStatusInput(Guid Id, WorkOrderStatus Status);
public record AddSupplementInput(Guid WorkOrderId, string Reason, decimal Amount);
public record ResolveSupplementInput(Guid SupplementId, bool Approved);

public class WorkOrderService(IAppDbContext db)
{
    public async Task<WorkOrder> CreateAsync(CreateWorkOrderInput input, CancellationToken ct)
    {
        var lines = input.Lines;
        decimal discount = 0;
        if (input.EstimateId is { } estimateId)
        {
            var estimate = await db.Estimates.Include(e => e.LineItems).FirstOrDefaultAsync(e => e.Id == estimateId, ct)
                ?? throw new AppException("عرض السعر غير موجود", "NOT_FOUND");
            if (estimate.CustomerId != input.CustomerId || estimate.VehicleId != input.VehicleId)
                throw new AppException("عرض السعر لا يخص هذا العميل والمركبة");
            if (estimate.Status is not (EstimateStatus.Approved or EstimateStatus.PartiallyApproved))
                throw new AppException("يجب اعتماد عرض السعر قبل تحويله");
            if (await db.WorkOrders.AnyAsync(o => o.EstimateId == estimateId, ct))
                throw new AppException("تم تحويل عرض السعر بالفعل");
            lines = estimate.LineItems.Where(l => l.Decision == LineDecision.Accepted)
                .Select(l => new WorkOrderLineInput(l.Kind, l.Name, l.Price, l.Quantity)).ToList();
            discount = Math.Min(estimate.Discount, lines.Sum(line => line.Price * line.Quantity));
        }
        if (lines.Count == 0) throw new AppException("يجب إضافة خدمة أو قطعة واحدة على الأقل");
        if (lines.Any(l => l.Price < 0 || l.Quantity <= 0))
            throw new AppException("السعر أو الكمية غير صالحة");
        foreach (var line in lines) Money.RequirePrecision(line.Price);

        var vehicle = await db.Vehicles.FirstOrDefaultAsync(v => v.Id == input.VehicleId && v.CustomerId == input.CustomerId, ct)
            ?? throw new AppException("المركبة غير موجودة أو لا تخص هذا العميل", "NOT_FOUND");

        if (input.TechnicianId is { } techId) await WorkOrderWorkflow.ValidateAssignmentAsync(db, techId, null, ct);

        var order = new WorkOrder
        {
            Number = NumberGenerator.Next("WO"),
            CustomerId = input.CustomerId,
            VehicleId = input.VehicleId,
            TechnicianId = input.TechnicianId,
            EstimateId = input.EstimateId,
            Priority = input.Priority,
            Notes = input.Notes,
            BranchId = vehicle.BranchId,
            Lines = lines.Select(l => new WorkOrderLine
            {
                Kind = l.Kind, Name = l.Name.Trim(), Price = l.Price, Quantity = l.Quantity,
                SparePartId = l.SparePartId,
            }).ToList(),
        };
        order.Tasks = order.Lines.Where(l => l.Kind == LineKind.Service)
            .Select(l => new WorkOrderTask { Service = l.Name, TechnicianId = input.TechnicianId }).ToList();
        order.Total = Money.Round(order.Lines.Sum(l => l.Price * l.Quantity) - discount);
        await WorkOrderWorkflow.ReserveAsync(db, order, ct);

        db.WorkOrders.Add(order);
        await db.SaveChangesAsync(ct);
        return order;
    }

    public async Task<WorkOrder> UpdateStatusAsync(UpdateWorkOrderStatusInput input, CancellationToken ct)
    {
        var order = await db.WorkOrders.Include(order => order.Lines).Include(order => order.Tasks).FirstOrDefaultAsync(o => o.Id == input.Id, ct)
            ?? throw new AppException("أمر الشغل غير موجود", "NOT_FOUND");

        await WorkOrderWorkflow.ChangeAsync(db, order, input.Status, order.Progress, ct);
        await db.SaveChangesAsync(ct);
        return order;
    }

    public async Task<WorkOrderSupplement> AddSupplementAsync(AddSupplementInput input, CancellationToken ct)
    {
        if (input.Amount <= 0) throw new AppException("قيمة الملحق يجب أن تكون أكبر من صفر");
        Money.RequirePrecision(input.Amount);
        var order = await db.WorkOrders.FirstOrDefaultAsync(o => o.Id == input.WorkOrderId, ct)
            ?? throw new AppException("أمر الشغل غير موجود", "NOT_FOUND");
        if (order.Status is WorkOrderStatus.Completed or WorkOrderStatus.Delivered or WorkOrderStatus.Cancelled)
            throw new AppException("لا يمكن إضافة ملحق بعد اكتمال أمر الشغل");

        var supplement = new WorkOrderSupplement { WorkOrderId = order.Id, Reason = input.Reason.Trim(), Amount = input.Amount };
        db.WorkOrderSupplements.Add(supplement);
        await db.SaveChangesAsync(ct);
        return supplement;
    }

    public async Task<WorkOrderSupplement> ResolveSupplementAsync(ResolveSupplementInput input, CancellationToken ct)
    {
        var supplement = await db.WorkOrderSupplements.FirstOrDefaultAsync(s => s.Id == input.SupplementId, ct)
            ?? throw new AppException("الملحق غير موجود", "NOT_FOUND");
        if (supplement.Status != SupplementStatus.Pending)
            throw new AppException("تم البتّ في هذا الملحق مسبقاً");

        var order = await db.WorkOrders.FirstAsync(order => order.Id == supplement.WorkOrderId, ct);
        if (order.Status is WorkOrderStatus.Completed or WorkOrderStatus.Delivered or WorkOrderStatus.Cancelled) throw new AppException("لا يمكن اعتماد تكلفة إضافية لأمر مغلق");

        supplement.Status = input.Approved ? SupplementStatus.Approved : SupplementStatus.Rejected;
        if (input.Approved)
        {
            order.Total += supplement.Amount;
        }
        await db.SaveChangesAsync(ct);
        return supplement;
    }
}
