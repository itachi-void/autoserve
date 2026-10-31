using CargoPulse.Domain.Entities;

namespace CargoPulse.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
