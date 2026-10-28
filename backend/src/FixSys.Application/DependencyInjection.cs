using FixSys.Application.Auth;
using FixSys.Application.Customers;
using FixSys.Application.Invoicing;
using FixSys.Application.WorkOrders;
using Microsoft.Extensions.DependencyInjection;

namespace FixSys.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<AuthService>();
        services.AddScoped<CustomerService>();
        services.AddScoped<WorkOrderService>();
        services.AddScoped<InvoiceService>();
        services.AddScoped<Workspace.WorkspaceService>();
        return services;
    }
}
