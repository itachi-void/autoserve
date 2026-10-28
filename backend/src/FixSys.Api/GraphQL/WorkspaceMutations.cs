using FixSys.Application.Workspace;
using HotChocolate.Authorization;
using HotChocolate.Types;

namespace FixSys.Api.GraphQL;

[ExtendObjectType(OperationTypeNames.Mutation)]
[Authorize]
public class WorkspaceMutations
{
    [Authorize(Policy = "services")]
    public Task<FixSys.Domain.Entities.ServiceCategory> SaveServiceCategory([Service] WorkspaceService service, SaveCategoryInput input, CancellationToken ct) => service.SaveCategoryAsync(input, ct);
    [Authorize(Policy = "inspections")]
    public Task<FixSys.Domain.Entities.InspectionTemplate> SaveInspectionTemplate([Service] WorkspaceService service, SaveTemplateInput input, CancellationToken ct) => service.SaveTemplateAsync(input, ct);
    [Authorize(Policy = "inventory")]
    public Task<FixSys.Domain.Entities.SparePart> SaveSparePart([Service] WorkspaceService service, SavePartInput input, CancellationToken ct) => service.SavePartAsync(input, ct);
    [Authorize(Policy = "services")]
    public Task<FixSys.Domain.Entities.ServiceItem> SaveService([Service] WorkspaceService service, SaveServiceInput input, CancellationToken ct) => service.SaveServiceAsync(input, ct);
    [Authorize(Policy = "employees")]
    public Task<FixSys.Domain.Entities.Department> SaveDepartment([Service] WorkspaceService service, SaveDepartmentInput input, CancellationToken ct) => service.SaveDepartmentAsync(input, ct);
    [Authorize(Policy = "employees")]
    public Task<FixSys.Domain.Entities.Employee> SaveEmployee([Service] WorkspaceService service, SaveEmployeeInput input, CancellationToken ct) => service.SaveEmployeeAsync(input, ct);
    [Authorize(Policy = "employees")]
    public Task<bool> DeleteEmployee([Service] WorkspaceService service, Guid id, CancellationToken ct) => service.DeleteEmployeeAsync(id, ct);
    [Authorize(Policy = "technicians")]
    public Task<FixSys.Domain.Entities.Technician> SaveTechnician([Service] WorkspaceService service, SaveTechnicianInput input, CancellationToken ct) => service.SaveTechnicianAsync(input, ct);
    [Authorize(Policy = "warehouse")]
    public Task<FixSys.Domain.Entities.Supplier> SaveSupplier([Service] WorkspaceService service, SaveSupplierInput input, CancellationToken ct) => service.SaveSupplierAsync(input, ct);
    [Authorize(Policy = "purchases")]
    public Task<FixSys.Domain.Entities.PurchaseOrder> SavePurchaseOrder([Service] WorkspaceService service, SavePurchaseOrderInput input, CancellationToken ct) => service.SavePurchaseOrderAsync(input, ct);
    [Authorize(Policy = "purchases")]
    public Task<FixSys.Domain.Entities.PurchaseOrder> ReceivePurchaseOrder([Service] WorkspaceService service, Guid id, CancellationToken ct) => service.ReceivePurchaseOrderAsync(id, ct);
    [Authorize(Policy = "warehouse")]
    public Task<FixSys.Domain.Entities.StockTransaction> AdjustStock([Service] WorkspaceService service, StockAdjustmentInput input, CancellationToken ct) => service.AdjustStockAsync(input, ct);
}

[ExtendObjectType(OperationTypeNames.Mutation)]
[Authorize]
public class SchedulingMutations
{
    [Authorize(Policy = "vehicles")]
    public Task<FixSys.Domain.Entities.Vehicle> SaveVehicle([Service] WorkspaceService service, SaveVehicleInput input, CancellationToken ct) => service.SaveVehicleAsync(input, ct);
    [Authorize(Policy = "appointments")]
    public Task<FixSys.Domain.Entities.Appointment> SaveAppointment([Service] WorkspaceService service, SaveAppointmentInput input, CancellationToken ct) => service.SaveAppointmentAsync(input, ct);
    [Authorize(Policy = "estimates")]
    public Task<FixSys.Domain.Entities.Estimate> SaveEstimate([Service] WorkspaceService service, SaveEstimateInput input, CancellationToken ct) => service.SaveEstimateAsync(input, ct);
}

[ExtendObjectType(OperationTypeNames.Mutation)]
[Authorize]
public class ExecutionMutations
{
    [Authorize(Policy = "inspections")]
    public Task<FixSys.Domain.Entities.InspectionSession> SaveInspection([Service] WorkspaceService service, SaveInspectionInput input, CancellationToken ct) => service.SaveInspectionAsync(input, ct);
    [Authorize(Policy = "workorders")]
    public Task<FixSys.Domain.Entities.WorkOrder> ChangeWorkOrder([Service] WorkspaceService service, ChangeWorkOrderInput input, CancellationToken ct) => service.ChangeWorkOrderAsync(input, ct);
}

[ExtendObjectType(OperationTypeNames.Mutation)]
[Authorize]
public class AdministrationMutations
{
    [Authorize(Policy = "administration")]
    public Task<FixSys.Domain.Entities.Role> SaveRole([Service] WorkspaceService service, SaveRoleInput input, CancellationToken ct) => service.SaveRoleAsync(input, ct);
    [Authorize(Policy = "administration")]
    public async Task<UserSummary> SaveSystemUser([Service] WorkspaceService service, SaveSystemUserInput input, CancellationToken ct)
    {
        var user = await service.SaveSystemUserAsync(input, ct);
        return new UserSummary(user.Id, user.Name, user.Email, user.Roles, user.IsActive, user.LastLoginAt);
    }
}
