using System.Security.Claims;
using FixSys.Api.GraphQL;
using FixSys.Application.Abstractions;
using FixSys.Domain.Entities;
using FixSys.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace FixSys.Tests;

public class AuthorizationTests
{
    private sealed class Actor : ICurrentUser
    {
        public Guid? UserId { get; } = Guid.NewGuid();
        public Guid? BranchId { get; } = Guid.NewGuid();
        public string? Email => "manager@example.invalid";
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task StoredPermissionsOverrideBuiltInRoleNames(bool allow)
    {
        var actor = new Actor();
        var options = new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        var services = new ServiceCollection();
        services.AddSingleton<ICurrentUser>(actor);
        services.AddScoped(_ => new AppDbContext(options, actor));
        await using var provider = services.BuildServiceProvider();
        await using (var scope = provider.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.AddRange(new AppUser { Id = actor.UserId!.Value, BranchId = actor.BranchId, Roles = ["manager"], IsActive = true }, new Role { BranchId = actor.BranchId!.Value, Key = "manager", Permissions = allow ? ["الفواتير"] : ["customers"] });
            await db.SaveChangesAsync();
        }
        var requirement = WorkspacePolicies.Modules.Single(item => item.Module == "invoices");
        var principal = new ClaimsPrincipal(new ClaimsIdentity([new Claim("sub", actor.UserId!.Value.ToString())], "test"));
        var context = new AuthorizationHandlerContext([requirement], principal, null);
        await new ModuleAuthorizationHandler(provider.GetRequiredService<IServiceScopeFactory>()).HandleAsync(context);
        Assert.Equal(allow, context.HasSucceeded);
    }
}
