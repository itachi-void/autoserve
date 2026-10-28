using HotChocolate;
using HotChocolate.Types;
using FixSys.Application.Auth;
using FixSys.Application.Customers;
using FixSys.Application.Invoicing;
using FixSys.Application.WorkOrders;
using FixSys.Domain.Entities;
using HotChocolate.Authorization;

namespace FixSys.Api.GraphQL;

[ExtendObjectType(OperationTypeNames.Mutation)]
public class AuthMutations
{
    [AllowAnonymous]
    public Task<LoginPayload> CreateTrial([Service] ITrialService trials, [Service] IHttpContextAccessor http, CreateTrialInput input, CancellationToken ct)
    {
        var context = http.HttpContext ?? throw new InvalidOperationException("HTTP context required");
        lock (context.Items)
        {
            if (context.Items.ContainsKey("trial-created")) throw new FixSys.Application.Common.AppException("أنشئ تجربة واحدة فقط في الطلب الواحد");
            context.Items["trial-created"] = true;
        }
        return trials.CreateAsync(input, ct);
    }

    [AllowAnonymous]
    public Task<LoginPayload> Login([Service] AuthService auth, LoginInput input, CancellationToken ct) =>
        auth.LoginAsync(input, ct);

    [AllowAnonymous]
    public Task<RefreshTokenPayload> RefreshToken([Service] AuthService auth, RefreshTokenInput input, CancellationToken ct) =>
        auth.RefreshAsync(input, ct);

    [AllowAnonymous]
    public Task<ForgetPasswordPayload> ForgetPassword([Service] AuthService auth, ForgetPasswordInput input, CancellationToken ct) =>
        auth.ForgetPasswordAsync(input, ct);

    [AllowAnonymous]
    public Task<ResetPasswordPayload> ResetPassword([Service] AuthService auth, ResetPasswordInput input, CancellationToken ct) =>
        auth.ResetPasswordAsync(input, ct);
}

[ExtendObjectType(OperationTypeNames.Mutation)]
[Authorize]
public class CustomerMutations
{
    [Authorize(Policy = "customers")]
    public Task<Customer> CreateCustomer([Service] CustomerService svc, CreateCustomerInput input, CancellationToken ct) =>
        svc.CreateAsync(input, ct);

    [Authorize(Policy = "customers")]
    public Task<Customer> UpdateCustomer([Service] CustomerService svc, UpdateCustomerInput input, CancellationToken ct) =>
        svc.UpdateAsync(input, ct);

    [Authorize(Policy = "vehicles")]
    public Task<Vehicle> CreateVehicle([Service] CustomerService svc, CreateVehicleInput input, CancellationToken ct) =>
        svc.CreateVehicleAsync(input, ct);
}

[ExtendObjectType(OperationTypeNames.Mutation)]
[Authorize]
public class WorkOrderMutations
{
    [Authorize]
    [Authorize(Policy = "workorders")]
    public Task<WorkOrder> CreateWorkOrder([Service] WorkOrderService svc, CreateWorkOrderInput input, CancellationToken ct) =>
        svc.CreateAsync(input, ct);

    [Authorize(Policy = "workorders")]
    public Task<WorkOrder> UpdateWorkOrderStatus([Service] WorkOrderService svc, UpdateWorkOrderStatusInput input, CancellationToken ct) =>
        svc.UpdateStatusAsync(input, ct);

    [Authorize(Policy = "workorders")]
    public Task<WorkOrderSupplement> AddWorkOrderSupplement([Service] WorkOrderService svc, AddSupplementInput input, CancellationToken ct) =>
        svc.AddSupplementAsync(input, ct);

    [Authorize]
    [Authorize(Policy = "workorders")]
    public Task<WorkOrderSupplement> ResolveWorkOrderSupplement([Service] WorkOrderService svc, ResolveSupplementInput input, CancellationToken ct) =>
        svc.ResolveSupplementAsync(input, ct);
}

[ExtendObjectType(OperationTypeNames.Mutation)]
[Authorize]
public class InvoiceMutations
{
    [Authorize(Policy = "invoices")]
    public Task<Invoice> CreateInvoice([Service] InvoiceService svc, CreateInvoiceInput input, CancellationToken ct) =>
        svc.CreateFromWorkOrderAsync(input, ct);

    [Authorize(Policy = "invoices")]
    public Task<Invoice> RecordPayment([Service] InvoiceService svc, RecordPaymentInput input, CancellationToken ct) =>
        svc.RecordPaymentAsync(input, ct);
}
