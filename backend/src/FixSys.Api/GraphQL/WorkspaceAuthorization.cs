using System.Security.Claims;
using FixSys.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace FixSys.Api.GraphQL;

public record ModuleRequirement(string Module, string Label, string[] BuiltInRoles) : IAuthorizationRequirement;

public class ModuleAuthorizationHandler(IServiceScopeFactory scopes) : AuthorizationHandler<ModuleRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, ModuleRequirement requirement)
    {
        if (!Guid.TryParse(context.User.FindFirstValue("sub"), out var userId)) return;
        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(user => user.Id == userId && user.IsActive);
        if (user is null) return;
        var roles = await db.Roles.IgnoreQueryFilters().AsNoTracking().Where(role => role.BranchId == user.BranchId && user.Roles.Contains(role.Key)).ToListAsync();
        if (roles.Any(role => role.Permissions.Any(permission => permission == "*" || permission == "كل الصلاحيات" || permission == requirement.Module || permission == requirement.Label)))
            context.Succeed(requirement);
    }
}

public static class WorkspacePolicies
{
    public static readonly ModuleRequirement[] Modules =
    [
        new("customers", "العملاء", ["admin", "manager", "receptionist"]),
        new("vehicles", "السيارات", ["admin", "manager", "receptionist"]),
        new("inventory", "قطع الغيار", ["admin", "manager"]),
        new("services", "الخدمات", ["admin", "manager"]),
        new("employees", "الموظفون", ["admin", "manager"]),
        new("technicians", "الفنيون", ["admin", "manager"]),
        new("purchases", "التوريد", ["admin", "manager"]),
        new("warehouse", "المخازن", ["admin", "manager"]),
        new("appointments", "المواعيد", ["admin", "manager", "receptionist"]),
        new("inspections", "الفحوصات", ["admin", "manager", "technician"]),
        new("estimates", "عروض الأسعار", ["admin", "manager", "receptionist"]),
        new("workorders", "أوامر التشغيل", ["admin", "manager", "receptionist", "technician"]),
        new("invoices", "الفواتير", ["admin", "manager", "accountant"]),
        new("administration", "الصلاحيات", ["admin"]),
    ];
}
