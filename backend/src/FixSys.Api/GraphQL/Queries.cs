using HotChocolate;
using HotChocolate.Types;
using FixSys.Application.Abstractions;
using FixSys.Application.Auth;
using FixSys.Domain.Entities;
using HotChocolate.Authorization;
using HotChocolate.Data;
using Microsoft.EntityFrameworkCore;

namespace FixSys.Api.GraphQL;

public record UserSummary(Guid Id, string Name, string Email, List<string> Roles, bool IsActive, DateTime? LastLoginAt);

[ExtendObjectType(OperationTypeNames.Query)]
[Authorize]
public class AuthQueries
{
    public async Task<List<string>> GetAccessPermissions([Service] Microsoft.AspNetCore.Authorization.IAuthorizationService authorization, [Service] IHttpContextAccessor http)
    {
        var permissions = new List<string>();
        var principal = http.HttpContext?.User;
        if (principal is null) return permissions;
        foreach (var module in WorkspacePolicies.Modules)
            if ((await authorization.AuthorizeAsync(principal, null, module.Module)).Succeeded) permissions.Add(module.Module);
        return permissions;
    }
    public async Task<AuthUserInfo?> GetMe(
        [Service] IAppDbContext db, [Service] ICurrentUser current, CancellationToken ct) =>
        await db.Users.Where(u => u.Id == current.UserId && u.IsActive)
            .Select(u => new AuthUserInfo(u.Id, u.Name, u.Email, u.Roles))
            .FirstOrDefaultAsync(ct);

    [Authorize(Policy = "administration")]
    [UseOffsetPaging(MaxPageSize = 100, IncludeTotalCount = true)]
    [UseFiltering]
    [UseSorting]
    public IQueryable<UserSummary> GetSystemUsers([Service] IAppDbContext db, [Service] ICurrentUser current) =>
        db.Users.Where(u => u.BranchId == current.BranchId).OrderBy(u => u.Id).Select(u => new UserSummary(u.Id, u.Name, u.Email, u.Roles, u.IsActive, u.LastLoginAt));

    [Authorize(Policy = "administration")]
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<Role>))] [UseSorting(typeof(ScopedEntitySort<Role>))]
    public IQueryable<Role> GetRoles([Service] IAppDbContext db) => db.Roles;
}

[ExtendObjectType(OperationTypeNames.Query)]
[Authorize]
public class OrganizationQueries
{
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<Branch>))] [UseSorting(typeof(ScopedEntitySort<Branch>))]
    public IQueryable<Branch> GetBranches([Service] IAppDbContext db, [Service] ICurrentUser current) => db.Branches.Where(branch => branch.Id == current.BranchId);

    [Authorize(Policy = "administration")]
    [UseOffsetPaging(MaxPageSize = 100, IncludeTotalCount = true)]
    [UseSorting(typeof(ScopedEntitySort<AuditEntry>))]
    public IQueryable<AuditEntry> GetAuditEntries([Service] IAppDbContext db) => db.AuditEntries.OrderByDescending(entry => entry.CreatedAt);

    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<Department>))] [UseSorting(typeof(ScopedEntitySort<Department>))]
    [Authorize(Policy = "employees")]
    public IQueryable<Department> GetDepartments([Service] IAppDbContext db) => db.Departments;

    [UseOffsetPaging(MaxPageSize = 100, IncludeTotalCount = true)]
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<Employee>))] [UseSorting(typeof(ScopedEntitySort<Employee>))]
    [Authorize(Policy = "employees")]
    public IQueryable<Employee> GetEmployees([Service] IAppDbContext db) => db.Employees;

    [UseOffsetPaging(MaxPageSize = 100, IncludeTotalCount = true)]
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<Technician>))] [UseSorting(typeof(ScopedEntitySort<Technician>))]
    [Authorize(Policy = "technicians")]
    public IQueryable<Technician> GetTechnicians([Service] IAppDbContext db) => db.Technicians;
}

[ExtendObjectType(OperationTypeNames.Query)]
[Authorize]
public class CustomerQueries
{
    [UseOffsetPaging(MaxPageSize = 100, IncludeTotalCount = true)]
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<Customer>))] [UseSorting(typeof(ScopedEntitySort<Customer>))]
    [Authorize(Policy = "customers")]
    public IQueryable<Customer> GetCustomers([Service] IAppDbContext db) => db.Customers;

    [UseOffsetPaging(MaxPageSize = 100, IncludeTotalCount = true)]
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<Vehicle>))] [UseSorting(typeof(ScopedEntitySort<Vehicle>))]
    [Authorize(Policy = "vehicles")]
    public IQueryable<Vehicle> GetVehicles([Service] IAppDbContext db) => db.Vehicles;

    [Authorize(Policy = "invoices")]
    [UseOffsetPaging(MaxPageSize = 100, IncludeTotalCount = true)]
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<CustomerLedgerEntry>))] [UseSorting(typeof(ScopedEntitySort<CustomerLedgerEntry>))]
    public IQueryable<CustomerLedgerEntry> GetLedgerEntries([Service] IAppDbContext db) => db.LedgerEntries;
}

[ExtendObjectType(OperationTypeNames.Query)]
[Authorize]
public class InventoryQueries
{
    [UseOffsetPaging(MaxPageSize = 100, IncludeTotalCount = true)]
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<SparePart>))] [UseSorting(typeof(ScopedEntitySort<SparePart>))]
    [Authorize(Policy = "inventory")]
    public IQueryable<SparePart> GetSpareParts([Service] IAppDbContext db) => db.SpareParts;

    [UseOffsetPaging(MaxPageSize = 100, IncludeTotalCount = true)]
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<InventoryItem>))] [UseSorting(typeof(ScopedEntitySort<InventoryItem>))]
    [Authorize(Policy = "warehouse")]
    public IQueryable<InventoryItem> GetInventoryItems([Service] IAppDbContext db) => db.InventoryItems;

    [UseOffsetPaging(MaxPageSize = 100, IncludeTotalCount = true)]
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<StockTransaction>))] [UseSorting(typeof(ScopedEntitySort<StockTransaction>))]
    [Authorize(Policy = "warehouse")]
    public IQueryable<StockTransaction> GetStockTransactions([Service] IAppDbContext db) => db.StockTransactions;

    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<Supplier>))] [UseSorting(typeof(ScopedEntitySort<Supplier>))]
    [Authorize(Policy = "purchases")]
    public IQueryable<Supplier> GetSuppliers([Service] IAppDbContext db) => db.Suppliers;

    [UseOffsetPaging(MaxPageSize = 100, IncludeTotalCount = true)]
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<PurchaseOrder>))] [UseSorting(typeof(ScopedEntitySort<PurchaseOrder>))]
    [Authorize(Policy = "purchases")]
    public IQueryable<PurchaseOrder> GetPurchaseOrders([Service] IAppDbContext db) => db.PurchaseOrders;
}

[ExtendObjectType(OperationTypeNames.Query)]
[Authorize]
public class ServiceQueries
{
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<ServiceCategory>))] [UseSorting(typeof(ScopedEntitySort<ServiceCategory>))]
    [Authorize(Policy = "services")]
    public IQueryable<ServiceCategory> GetServiceCategories([Service] IAppDbContext db) => db.ServiceCategories;

    [UseOffsetPaging(MaxPageSize = 100, IncludeTotalCount = true)]
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<ServiceItem>))] [UseSorting(typeof(ScopedEntitySort<ServiceItem>))]
    [Authorize(Policy = "services")]
    public IQueryable<ServiceItem> GetServices([Service] IAppDbContext db) => db.Services;
}

[ExtendObjectType(OperationTypeNames.Query)]
[Authorize]
public class OperationQueries
{
    [UseOffsetPaging(MaxPageSize = 200, IncludeTotalCount = true)]
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<Appointment>))] [UseSorting(typeof(ScopedEntitySort<Appointment>))]
    [Authorize(Policy = "appointments")]
    public IQueryable<Appointment> GetAppointments([Service] IAppDbContext db) => db.Appointments;

    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<InspectionTemplate>))] [UseSorting(typeof(ScopedEntitySort<InspectionTemplate>))]
    [Authorize(Policy = "inspections")]
    public IQueryable<InspectionTemplate> GetInspectionTemplates([Service] IAppDbContext db) => db.InspectionTemplates;

    [UseOffsetPaging(MaxPageSize = 100, IncludeTotalCount = true)]
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<InspectionSession>))] [UseSorting(typeof(ScopedEntitySort<InspectionSession>))]
    [Authorize(Policy = "inspections")]
    public IQueryable<InspectionSession> GetInspections([Service] IAppDbContext db) => db.InspectionSessions;

    [UseOffsetPaging(MaxPageSize = 100, IncludeTotalCount = true)]
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<Estimate>))] [UseSorting(typeof(ScopedEntitySort<Estimate>))]
    [Authorize(Policy = "estimates")]
    public IQueryable<Estimate> GetEstimates([Service] IAppDbContext db) => db.Estimates;

    [UseOffsetPaging(MaxPageSize = 100, IncludeTotalCount = true)]
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<WorkOrder>))] [UseSorting(typeof(ScopedEntitySort<WorkOrder>))]
    [Authorize(Policy = "workorders")]
    public IQueryable<WorkOrder> GetWorkOrders([Service] IAppDbContext db) => db.WorkOrders;
}

[ExtendObjectType(OperationTypeNames.Query)]
public class BillingQueries
{
    [Authorize(Policy = "invoices")]
    [UseOffsetPaging(MaxPageSize = 100, IncludeTotalCount = true)]
    [UseProjection] [UseFiltering(typeof(ScopedEntityFilter<Invoice>))] [UseSorting(typeof(ScopedEntitySort<Invoice>))]
    public IQueryable<Invoice> GetInvoices([Service] IAppDbContext db) => db.Invoices;
}
