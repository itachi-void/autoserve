using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FixSys.Application.Abstractions;
using FixSys.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace FixSys.Infrastructure.Services;

public class JwtOptions
{
    public string Issuer { get; set; } = "fixsys";
    public string Audience { get; set; } = "fixsys-clients";
    public string Key { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 60;
    public int RefreshGraceDays { get; set; } = 7;
}

public class JwtTokenService(IOptions<JwtOptions> options) : IJwtTokenService
{
    private readonly JwtOptions _o = options.Value;
    private readonly JsonWebTokenHandler _handler = new();

    private SymmetricSecurityKey SigningKey => new(Encoding.UTF8.GetBytes(_o.Key));

    public IssuedToken Create(AppUser user)
    {
        var expires = DateTime.UtcNow.AddMinutes(_o.ExpiryMinutes);
        var claims = new List<Claim>
        {
            new("sub", user.Id.ToString()),
            new("session_stamp", user.SecurityStamp.ToString()),
            new("email", user.Email),
            new("name", user.Name),
        };
        if (user.BranchId is { } branch) claims.Add(new Claim("branch_id", branch.ToString()));
        claims.AddRange(user.Roles.Select(r => new Claim("role", r)));

        var token = _handler.CreateToken(new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Issuer = _o.Issuer,
            Audience = _o.Audience,
            Expires = expires,
            SigningCredentials = new SigningCredentials(SigningKey, SecurityAlgorithms.HmacSha256),
        });
        return new IssuedToken(token, expires);
    }

    public async Task<ValidatedSession?> ValidateForRefreshAsync(string token)
    {
        var result = await _handler.ValidateTokenAsync(token, new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = _o.Issuer,
            ValidateAudience = true,
            ValidAudience = _o.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = SigningKey,
            ValidateLifetime = false,
            ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
        });
        if (!result.IsValid || result.SecurityToken is not JsonWebToken jwt) return null;
        if (jwt.ValidTo < DateTime.UtcNow.AddDays(-_o.RefreshGraceDays)) return null;
        if (!Guid.TryParse(jwt.Subject, out var id) || !jwt.TryGetClaim("branch_id", out var branchClaim) || !jwt.TryGetClaim("session_stamp", out var stampClaim) || !Guid.TryParse(branchClaim.Value, out var branch) || !Guid.TryParse(stampClaim.Value, out var stamp)) return null;
        return new ValidatedSession(id, branch, stamp);
    }
}

public class Pbkdf2PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16, KeySize = 32, Iterations = 210_000;

    public string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var key = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, KeySize);
        return $"v1.{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(key)}";
    }

    public bool Verify(string password, string hash)
    {
        var parts = hash.Split('.');
        if (parts.Length != 4 || parts[0] != "v1" || !int.TryParse(parts[1], out var iterations) || iterations is < 10000 or > 1000000) return false;
        try
        {
            var salt = Convert.FromBase64String(parts[2]);
            var expected = Convert.FromBase64String(parts[3]);
            if (salt.Length != SaltSize || expected.Length != KeySize) return false;
            var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expected.Length);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch (FormatException) { return false; }
    }
}

public class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    private ClaimsPrincipal? Principal => accessor.HttpContext?.User;

    public Guid? UserId => Guid.TryParse(Principal?.FindFirstValue("sub"), out var id) ? id : null;
    public Guid? BranchId => Guid.TryParse(Principal?.FindFirstValue("branch_id"), out var id) ? id : null;
    public string? Email => Principal?.FindFirstValue("email");
}

/// <summary>Placeholder sender: logs the OTP. Replace with an SMTP/SendGrid/SMS implementation before production.</summary>
public class LoggingEmailSender(ILogger<LoggingEmailSender> logger, IHostEnvironment env) : IEmailSender
{
    public Task SendOtpAsync(string email, string code, CancellationToken ct = default)
    {
        if (env.IsDevelopment()) logger.LogWarning("DEV ONLY - OTP for {Email}: {Code}", email, code);
        else throw new FixSys.Application.Common.AppException("خدمة إرسال البريد غير مهيأة", "EMAIL_UNAVAILABLE");
        return Task.CompletedTask;
    }
}
