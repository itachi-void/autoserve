using FixSys.Api.GraphQL;
using FixSys.Domain.Entities;
using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Execution;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace FixSys.Tests;

public class SchemaTests
{
    [Fact]
    public async Task ApplicationQuerySchemaBuildsWithScopedTypes()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddAuthorization();
        var builder = services.AddGraphQLServer().AddAuthorization().AddQueryType(descriptor => descriptor.Name("Query")).AddFiltering().AddSorting().AddProjections().AddScopedEntityTypes();
        foreach (var type in new[] { typeof(AuthQueries), typeof(TrialQueries), typeof(OrganizationQueries), typeof(CustomerQueries), typeof(InventoryQueries), typeof(ServiceQueries), typeof(OperationQueries), typeof(BillingQueries), typeof(TelegramQueries) }) builder.AddTypeExtension(type);
        await using var provider = services.BuildServiceProvider();
        var executor = await provider.GetRequiredService<IRequestExecutorResolver>().GetRequestExecutorAsync();
        Assert.Contains(executor.Schema.QueryType.Fields, field => field.Name == "accessPermissions");
        Assert.Contains(executor.Schema.QueryType.Fields, field => field.Name == "workspaceReferences");
        Assert.Contains(executor.Schema.QueryType.Fields, field => field.Name == "workOrders");
    }

    public class TestQuery
    {
        [UseFiltering(typeof(ScopedEntityFilter<WorkOrder>))]
        [UseSorting(typeof(ScopedEntitySort<WorkOrder>))]
        public IQueryable<WorkOrder> GetWorkOrders() => Array.Empty<WorkOrder>().AsQueryable();
    }

    [Fact]
    public async Task SchemaHidesCrossModuleNavigationAndPreservesOwnedLines()
    {
        var services = new ServiceCollection();
        services.AddGraphQLServer().AddQueryType<TestQuery>().AddFiltering().AddSorting().AddScopedEntityTypes();
        await using var provider = services.BuildServiceProvider();
        var executor = await provider.GetRequiredService<IRequestExecutorResolver>().GetRequestExecutorAsync();
        var schema = executor.Schema;
        Assert.DoesNotContain(schema.GetType<HotChocolate.Types.ObjectType>("Technician").Fields, field => field.Name == "employee");
        Assert.DoesNotContain(schema.GetType<HotChocolate.Types.ObjectType>("Customer").Fields, field => field.Name == "ledger");
        Assert.Contains(schema.GetType<HotChocolate.Types.ObjectType>("WorkOrder").Fields, field => field.Name == "lines");
        var result = await executor.ExecuteAsync("{ workOrders(where: { technician: { employee: { basicSalary: { gt: 0 } } } }) { id } }");
        Assert.Contains("errors", result.ToJson());
        var valid = await executor.ExecuteAsync("{ workOrders { id lines { name quantity } } }");
        Assert.DoesNotContain("errors", valid.ToJson());
    }
}
