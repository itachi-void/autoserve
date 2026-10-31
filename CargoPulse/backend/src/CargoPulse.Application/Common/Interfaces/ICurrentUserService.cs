using CargoPulse.Domain.Enums;

namespace CargoPulse.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    Guid? TenantId { get; }
    string? UserEmail { get; }
    UserRole? Role { get; }
    bool IsAuthenticated { get; }
}
