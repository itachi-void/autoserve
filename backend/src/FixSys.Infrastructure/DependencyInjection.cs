using FixSys.Application.Abstractions;
using FixSys.Infrastructure.Persistence;
using FixSys.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FixSys.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddOptions<JwtOptions>().Bind(config.GetSection("Jwt"))
            .Validate(o => o.Key.Length >= 32, "Jwt:Key must be at least 32 characters. Set it via user-secrets or environment variables.")
            .ValidateOnStart();

        services.AddHttpContextAccessor();
        services.AddDbContext<AppDbContext>(o => o.UseNpgsql(config.GetConnectionString("Default")));
        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddScoped<FixSys.Application.Auth.ITrialService, TrialService>();
        if (string.IsNullOrWhiteSpace(config["Smtp:Host"])) services.AddSingleton<IEmailSender, LoggingEmailSender>();
        else services.AddSingleton<IEmailSender, SmtpEmailSender>();
        return services;
    }
}
