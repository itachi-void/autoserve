using CargoPulse.Domain.Enums;

namespace CargoPulse.Application.DTOs;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(
    string CompanyName,
    string CompanyNameAr,
    string FullName,
    string Email,
    string Password,
    string PhoneNumber
);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    UserDto User
);

public record UserDto(
    Guid Id,
    Guid TenantId,
    string FullName,
    string Email,
    string PhoneNumber,
    UserRole Role,
    string PreferredLanguage,
    string TenantName,
    string CurrencyCode
);
