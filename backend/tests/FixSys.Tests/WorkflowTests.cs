using FixSys.Application.Abstractions;
using FixSys.Application.Common;
using FixSys.Application.Invoicing;
using FixSys.Application.WorkOrders;
using FixSys.Application.Workspace;
using FixSys.Application.Auth;
using FixSys.Domain.Common;
using FixSys.Domain.Entities;
using FixSys.Infrastructure.Persistence;
using FixSys.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using Xunit;

namespace FixSys.Tests;

public class WorkflowTests
{
    private sealed class Actor : ICurrentUser
    {
        public Guid? UserId { get; } = Guid.NewGuid();
        public Guid? BranchId { get; } = Guid.NewGuid();
        public string? Email => "test@example.invalid";
    }

    private static AppDbContext Database(ICurrentUser actor) => new(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options, actor);
    private sealed class NoEmail : IEmailSender
    {
        public Task SendOtpAsync(string email, string code, CancellationToken ct = default) => Task.CompletedTask;
    }

    [Fact]
    public async Task RevokedSessionCannotRefresh()
    {
        var actor = new Actor();
        await using var db = Database(actor);
        var user = new AppUser { BranchId = actor.BranchId, Email = actor.Email!, IsActive = true };
        db.Add(user); await db.SaveChangesAsync();
        var tokens = new JwtTokenService(Options.Create(new JwtOptions { Key = new string('k', 64) }));
        var token = tokens.Create(user).Token;
        user.SecurityStamp = Guid.NewGuid(); await db.SaveChangesAsync();
        var auth = new AuthService(db, new Pbkdf2PasswordHasher(), tokens, new NoEmail());
        await Assert.ThrowsAsync<AppException>(() => auth.RefreshAsync(new(token), default));
    }

    [Fact]
    public async Task NewAssignmentsRespectTechnicianCapacityAndAvailability()
    {
        var actor = new Actor();
        await using var db = Database(actor);
        var employee = new Employee { BranchId = actor.BranchId!.Value, Status = EmployeeStatus.Active };
        var technician = new Technician { BranchId = actor.BranchId.Value, EmployeeId = employee.Id, MaxTasks = 1 };
        db.AddRange(employee, technician); await db.SaveChangesAsync();
        await WorkOrderWorkflow.ValidateAssignmentAsync(db, technician.Id, null, default);
        var order = new WorkOrder { BranchId = actor.BranchId.Value, TechnicianId = technician.Id };
        db.Add(order); await db.SaveChangesAsync();
        await Assert.ThrowsAsync<AppException>(() => WorkOrderWorkflow.ValidateAssignmentAsync(db, technician.Id, null, default));
        await WorkOrderWorkflow.ValidateAssignmentAsync(db, technician.Id, order.Id, default);
        technician.Status = TechnicianStatus.Off; await db.SaveChangesAsync();
        await Assert.ThrowsAsync<AppException>(() => WorkOrderWorkflow.ValidateAssignmentAsync(db, technician.Id, order.Id, default));
    }

    [Theory]
    [InlineData(0.045, 0.05)]
    [InlineData(1.005, 1.01)]
    public void MoneyRoundsAwayFromZero(double amount, double expected) => Assert.Equal((decimal)expected, Money.Round((decimal)amount));

    [Fact]
    public void SubCentMoneyIsRejected() => Assert.Throws<AppException>(() => Money.RequirePrecision(1.001m));

    [Fact]
    public void InvalidPasswordHashesDoNotThrow()
    {
        var hasher = new Pbkdf2PasswordHasher();
        Assert.False(hasher.Verify("test", "v1.210000.not-base64.not-base64"));
        Assert.False(hasher.Verify("test", "v1.2147483647.AA==.AA=="));
    }

    [Fact]
    public async Task JwtCarriesSessionIdentityAndRejectsGarbage()
    {
        var tokens = new JwtTokenService(Options.Create(new JwtOptions { Key = new string('k', 64) }));
        var user = new AppUser { BranchId = Guid.NewGuid(), Email = "test@example.invalid" };
        var session = await tokens.ValidateForRefreshAsync(tokens.Create(user).Token);
        Assert.Equal(new ValidatedSession(user.Id, user.BranchId!.Value, user.SecurityStamp), session);
        Assert.Null(await tokens.ValidateForRefreshAsync("invalid-token"));
    }

    [Fact]
    public async Task LegacySignedTokenWithoutSessionStampRequiresLogin()
    {
        var options = new JwtOptions { Key = new string('k', 64) };
        var token = new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
        {
            Issuer = options.Issuer, Audience = options.Audience, Expires = DateTime.UtcNow.AddMinutes(5),
            Subject = new ClaimsIdentity([new Claim("sub", Guid.NewGuid().ToString()), new Claim("branch_id", Guid.NewGuid().ToString())]),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Key)), SecurityAlgorithms.HmacSha256),
        });
        Assert.Null(await new JwtTokenService(Options.Create(options)).ValidateForRefreshAsync(token));
    }

    [Fact]
    public async Task ReserveCompleteAndRepeatNeverConsumeTwice()
    {
        var actor = new Actor();
        await using var db = Database(actor);
        var part = new SparePart { BranchId = actor.BranchId!.Value, Name = "Oil" };
        var stock = new InventoryItem { BranchId = actor.BranchId.Value, SparePartId = part.Id, Quantity = 10 };
        var order = new WorkOrder { BranchId = actor.BranchId.Value, Lines = [new WorkOrderLine { Kind = LineKind.Part, SparePartId = part.Id, Quantity = 2, Name = part.Name }] };
        db.AddRange(part, stock, order);
        await db.SaveChangesAsync();
        await WorkOrderWorkflow.ReserveAsync(db, order, default);
        await WorkOrderWorkflow.ReserveAsync(db, order, default);
        Assert.Equal(2m, stock.AllocatedQuantity);
        await WorkOrderWorkflow.ChangeAsync(db, order, WorkOrderStatus.InProgress, 20, default);
        await WorkOrderWorkflow.ChangeAsync(db, order, WorkOrderStatus.Completed, 100, default);
        await WorkOrderWorkflow.ChangeAsync(db, order, WorkOrderStatus.Completed, 100, default);
        Assert.Equal(8m, stock.Quantity);
        Assert.Equal(0m, stock.AllocatedQuantity);
        Assert.Single(db.ChangeTracker.Entries<StockTransaction>());
        await Assert.ThrowsAsync<AppException>(() => WorkOrderWorkflow.ChangeAsync(db, order, WorkOrderStatus.Delivered, 100, default));
        await Assert.ThrowsAsync<AppException>(() => WorkOrderWorkflow.ChangeAsync(db, order, WorkOrderStatus.Pending, 0, default));
    }

    [Fact]
    public async Task CancellationReleasesWithoutConsumingStock()
    {
        var actor = new Actor();
        await using var db = Database(actor);
        var part = new SparePart { BranchId = actor.BranchId!.Value, Name = "Filter" };
        var stock = new InventoryItem { BranchId = actor.BranchId.Value, SparePartId = part.Id, Quantity = 5 };
        var order = new WorkOrder { BranchId = actor.BranchId.Value, Lines = [new WorkOrderLine { Kind = LineKind.Part, SparePartId = part.Id, Quantity = 1, Name = part.Name }] };
        db.AddRange(part, stock, order); await db.SaveChangesAsync();
        await WorkOrderWorkflow.ReserveAsync(db, order, default);
        await WorkOrderWorkflow.ChangeAsync(db, order, WorkOrderStatus.Cancelled, 0, default);
        Assert.Equal(5m, stock.Quantity); Assert.Equal(0m, stock.AllocatedQuantity);
        await Assert.ThrowsAsync<AppException>(() => WorkOrderWorkflow.ChangeAsync(db, order, WorkOrderStatus.InProgress, 0, default));
    }

    [Fact]
    public async Task ForeignBranchPartsCannotBeReserved()
    {
        var actor = new Actor();
        await using var db = Database(actor);
        var part = new SparePart { BranchId = Guid.NewGuid(), Name = "Foreign" };
        db.Add(part); await db.SaveChangesAsync();
        var order = new WorkOrder { BranchId = actor.BranchId!.Value, Lines = [new WorkOrderLine { Kind = LineKind.Part, SparePartId = part.Id, Quantity = 1, Name = part.Name }] };
        await Assert.ThrowsAsync<AppException>(() => WorkOrderWorkflow.ReserveAsync(db, order, default));
    }

    [Fact]
    public async Task InvoiceRoundingAndPaymentRetryAreConsistent()
    {
        var actor = new Actor();
        await using var db = Database(actor);
        var customer = new Customer { BranchId = actor.BranchId!.Value, Name = "Customer" };
        var order = new WorkOrder { BranchId = actor.BranchId.Value, CustomerId = customer.Id, Status = WorkOrderStatus.Completed, Total = 0.30m };
        db.AddRange(customer, order); await db.SaveChangesAsync();
        var service = new InvoiceService(db);
        var invoice = await service.CreateFromWorkOrderAsync(new(order.Id, 0), default);
        Assert.Equal(0.05m, invoice.Vat); Assert.Equal(0.35m, invoice.Total);
        await Assert.ThrowsAsync<AppException>(() => service.CreateFromWorkOrderAsync(new(order.Id, 0), default));
        var payment = new RecordPaymentInput(invoice.Id, 0.35m, PaymentMethod.Cash, null, Guid.NewGuid());
        await service.RecordPaymentAsync(payment, default); await service.RecordPaymentAsync(payment, default);
        Assert.Equal(InvoiceStatus.Paid, invoice.Status); Assert.Equal(0m, customer.OutstandingBalance);
        Assert.Single(await db.InvoicePayments.ToListAsync());
        await WorkOrderWorkflow.ChangeAsync(db, order, WorkOrderStatus.Delivered, 100, default);
        Assert.Equal(WorkOrderStatus.Delivered, order.Status);
    }

    [Fact]
    public async Task ZeroInvoiceIsPaidAndSubCentPaymentFails()
    {
        var actor = new Actor();
        await using var db = Database(actor);
        var customer = new Customer { BranchId = actor.BranchId!.Value };
        var order = new WorkOrder { BranchId = actor.BranchId.Value, CustomerId = customer.Id, Total = 10, Status = WorkOrderStatus.Completed };
        db.AddRange(customer, order); await db.SaveChangesAsync();
        var service = new InvoiceService(db);
        var invoice = await service.CreateFromWorkOrderAsync(new(order.Id, 10), default);
        Assert.Equal(InvoiceStatus.Paid, invoice.Status); Assert.NotNull(invoice.PaidAt);
        await Assert.ThrowsAsync<AppException>(() => service.RecordPaymentAsync(new(invoice.Id, 0.001m, PaymentMethod.Cash, null), default));
    }

    [Fact]
    public async Task AccountPasswordChangeRotatesStampAndCannotDisableSelf()
    {
        var actor = new Actor();
        await using var db = Database(actor);
        var admin = new Role { BranchId = actor.BranchId!.Value, Key = "admin", Permissions = ["*"] };
        var user = new AppUser { Id = actor.UserId!.Value, BranchId = actor.BranchId, Email = actor.Email!, Roles = ["admin"], IsActive = true };
        db.AddRange(admin, user); await db.SaveChangesAsync();
        var service = new WorkspaceService(db, actor, new Pbkdf2PasswordHasher());
        var stamp = user.SecurityStamp;
        await service.SaveSystemUserAsync(new(user.Id, "Admin", user.Email, "admin", true, "new-password-123"), default);
        Assert.NotEqual(stamp, user.SecurityStamp);
        await Assert.ThrowsAsync<AppException>(() => service.SaveSystemUserAsync(new(user.Id, "Admin", user.Email, "admin", false, null), default));
        await Assert.ThrowsAsync<AppException>(() => service.SaveRoleAsync(new(admin.Id, "admin", "Admin", "blue", ["customers"]), default));
    }

    [Fact]
    public async Task ApprovedQuoteCannotBeEditedAndUsesSameVatRounding()
    {
        var actor = new Actor();
        await using var db = Database(actor);
        var customer = new Customer { BranchId = actor.BranchId!.Value };
        var vehicle = new Vehicle { BranchId = actor.BranchId.Value, CustomerId = customer.Id };
        db.AddRange(customer, vehicle); await db.SaveChangesAsync();
        var service = new WorkspaceService(db, actor, new Pbkdf2PasswordHasher());
        var input = new SaveEstimateInput(null, customer.Id, vehicle.Id, DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)), 0, EstimateStatus.Approved, null, [new(LineKind.Service, "Inspection", 0.30m, 1, LineDecision.Accepted, null)]);
        var estimate = await service.SaveEstimateAsync(input, default);
        Assert.Equal(0.05m, estimate.Vat); Assert.Equal(0.35m, estimate.Total);
        await Assert.ThrowsAsync<AppException>(() => service.SaveEstimateAsync(input with { Id = estimate.Id }, default));
        await Assert.ThrowsAsync<AppException>(() => service.SaveEstimateAsync(input with { Status = EstimateStatus.Presented, ValidUntil = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)) }, default));
    }

    [Fact]
    public async Task CancelledPurchasesCannotBeReopened()
    {
        var actor = new Actor();
        await using var db = Database(actor);
        var supplier = new Supplier { BranchId = actor.BranchId!.Value };
        var part = new SparePart { BranchId = actor.BranchId.Value };
        var order = new PurchaseOrder { BranchId = actor.BranchId.Value, SupplierId = supplier.Id, Status = PurchaseOrderStatus.Cancelled };
        db.AddRange(supplier, part, order); await db.SaveChangesAsync();
        var service = new WorkspaceService(db, actor, new Pbkdf2PasswordHasher());
        await Assert.ThrowsAsync<AppException>(() => service.SavePurchaseOrderAsync(new(order.Id, supplier.Id, null, null, PurchaseOrderStatus.Draft, [new(part.Id, 1, "piece", 10)]), default));
    }
}
