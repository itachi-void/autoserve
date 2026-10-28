using FixSys.Application.Auth;
using FixSys.Domain.Entities;
using HotChocolate.Authorization;
using HotChocolate.Types;
using FixSys.Application.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace FixSys.Api.GraphQL;

[ExtendObjectType(OperationTypeNames.Query)]
public class TrialQueries
{
    [AllowAnonymous]
    public bool TrialsEnabled([Service] ITrialService trials) => trials.Enabled;
    [Authorize]
    public Task<Branch?> WorkspaceInfo([Service] ITrialService trials, CancellationToken ct) => trials.WorkspaceAsync(ct);

    [Authorize]
    public async Task<WorkspaceReferences> WorkspaceReferences([Service] IAppDbContext db, CancellationToken ct) => new(
        await db.Customers.Select(customer => new CustomerReference(customer.Id, customer.Name)).ToListAsync(ct),
        await db.Vehicles.Select(vehicle => new VehicleReference(vehicle.Id, vehicle.CustomerId, vehicle.Make, vehicle.Model, vehicle.Year, vehicle.Plate)).ToListAsync(ct),
        await db.Services.Select(service => new ServiceReference(service.Id, service.Name, service.BasePrice)).ToListAsync(ct),
        await db.Technicians.Select(technician => new TechnicianReference(technician.Id, technician.EmployeeId)).ToListAsync(ct),
        await db.Employees.Select(employee => new EmployeeReference(employee.Id, employee.Name)).ToListAsync(ct));
}

public record CustomerReference(Guid Id, string Name);
public record VehicleReference(Guid Id, Guid CustomerId, string Make, string Model, int Year, string Plate);
public record ServiceReference(Guid Id, string Name, decimal BasePrice);
public record TechnicianReference(Guid Id, Guid EmployeeId);
public record EmployeeReference(Guid Id, string Name);
public record WorkspaceReferences(List<CustomerReference> Customers, List<VehicleReference> Vehicles, List<ServiceReference> Services, List<TechnicianReference> Technicians, List<EmployeeReference> Employees);
