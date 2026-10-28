using FixSys.Application.Abstractions;
using FixSys.Application.Common;
using FixSys.Domain.Common;
using FixSys.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FixSys.Application.Invoicing;

public record CreateInvoiceInput(Guid WorkOrderId, decimal Discount);
public record RecordPaymentInput(Guid InvoiceId, decimal Amount, PaymentMethod Method, string? Reference, Guid? RequestId = null);

public class InvoiceService(IAppDbContext db)
{
    public const decimal VatRate = 0.15m;

    public async Task<Invoice> CreateFromWorkOrderAsync(CreateInvoiceInput input, CancellationToken ct)
    {
        Money.RequirePrecision(input.Discount);
        var order = await db.WorkOrders.FirstOrDefaultAsync(o => o.Id == input.WorkOrderId, ct)
            ?? throw new AppException("أمر الشغل غير موجود", "NOT_FOUND");

        if (order.Status is not (WorkOrderStatus.Completed or WorkOrderStatus.Delivered))
            throw new AppException("لا يمكن إصدار فاتورة قبل اكتمال أمر الشغل");
        if (await db.Invoices.AnyAsync(i => i.WorkOrderId == order.Id && i.Status != InvoiceStatus.Cancelled, ct))
            throw new AppException("توجد فاتورة مسجلة لهذا الأمر", "DUPLICATE");
        if (input.Discount < 0 || input.Discount > order.Total)
            throw new AppException("قيمة الخصم غير صالحة");

        var customer = await db.Customers.FirstAsync(c => c.Id == order.CustomerId, ct);

        var taxable = order.Total - input.Discount;
        var vat = Math.Round(taxable * VatRate, 2, MidpointRounding.AwayFromZero);
        var invoice = new Invoice
        {
            Number = NumberGenerator.Next("INV"),
            CustomerId = order.CustomerId,
            VehicleId = order.VehicleId,
            WorkOrderId = order.Id,
            Subtotal = order.Total,
            Discount = input.Discount,
            Vat = vat,
            Total = taxable + vat,
            Status = taxable + vat == 0 ? InvoiceStatus.Paid : InvoiceStatus.Unpaid,
            PaidAt = taxable + vat == 0 ? DateTime.UtcNow : null,
            BranchId = order.BranchId,
        };
        db.Invoices.Add(invoice);

        customer.OutstandingBalance += invoice.Total;
        db.LedgerEntries.Add(new CustomerLedgerEntry
        {
            CustomerId = customer.Id,
            BranchId = order.BranchId,
            Type = LedgerTransactionType.Invoice,
            Amount = invoice.Total,
            Description = $"فاتورة {invoice.Number}",
            ReferenceId = invoice.Id,
        });

        await db.SaveChangesAsync(ct);
        return invoice;
    }

    public async Task<Invoice> RecordPaymentAsync(RecordPaymentInput input, CancellationToken ct)
    {
        Money.RequirePrecision(input.Amount);
        var invoice = await db.Invoices.FirstOrDefaultAsync(i => i.Id == input.InvoiceId, ct)
            ?? throw new AppException("الفاتورة غير موجودة", "NOT_FOUND");
        if (input.RequestId is { } requestId)
        {
            var previous = await db.InvoicePayments.FirstOrDefaultAsync(payment => payment.RequestId == requestId, ct);
            if (previous != null)
            {
                if (previous.InvoiceId != invoice.Id || previous.Amount != input.Amount || previous.Method != input.Method) throw new AppException("معرّف الدفعة مستخدم لطلب مختلف");
                return invoice;
            }
        }
        if (invoice.Status is InvoiceStatus.Paid or InvoiceStatus.Cancelled)
            throw new AppException("لا يمكن تسجيل دفعة على هذه الفاتورة");

        var remaining = invoice.Total - invoice.PaidAmount;
        if (input.Amount <= 0 || input.Amount > remaining)
            throw new AppException($"مبلغ الدفعة يجب أن يكون بين 0 و {remaining:0.00}");

        var customer = await db.Customers.FirstAsync(c => c.Id == invoice.CustomerId, ct);

        var payment = new InvoicePayment { InvoiceId = invoice.Id, Amount = input.Amount, Method = input.Method, Reference = input.Reference, RequestId = input.RequestId };
        db.InvoicePayments.Add(payment);
        invoice.PaidAmount += input.Amount;
        if (invoice.PaidAmount >= invoice.Total)
        {
            invoice.Status = InvoiceStatus.Paid;
            invoice.PaidAt = DateTime.UtcNow;
        }
        else
        {
            invoice.Status = InvoiceStatus.PartiallyPaid;
        }

        customer.OutstandingBalance -= input.Amount;
        db.LedgerEntries.Add(new CustomerLedgerEntry
        {
            CustomerId = customer.Id,
            BranchId = invoice.BranchId,
            Type = LedgerTransactionType.Payment,
            Amount = -input.Amount,
            Description = $"دفعة على فاتورة {invoice.Number}",
            ReferenceId = invoice.Id,
        });

        await db.SaveChangesAsync(ct);
        return invoice;
    }
}
