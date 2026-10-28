using FixSys.Domain.Entities;

namespace FixSys.Application.Auth;

public record CreateTrialInput(string CompanyName, string Email, string Password);
public interface ITrialService
{
    bool Enabled { get; }
    Task<LoginPayload> CreateAsync(CreateTrialInput input, CancellationToken ct);
    Task<Branch?> WorkspaceAsync(CancellationToken ct);
}
