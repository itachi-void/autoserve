using HotChocolate;
using HotChocolate.Types;
using System.Text;
using FixSys.Api.GraphQL;
using FixSys.Api.Telegram;
using FixSys.Application;
using FixSys.Infrastructure;
using FixSys.Infrastructure.Persistence;
using FixSys.Infrastructure.Services;
using HotChocolate.Execution.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.DataProtection;

var builder = WebApplication.CreateBuilder(args);
var isDev = builder.Environment.IsDevelopment();
builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 1_048_576);

builder.Services.AddApplication().AddInfrastructure(builder.Configuration);
builder.Services.AddSingleton<TelegramBot>();
builder.Services.AddHostedService(services => services.GetRequiredService<TelegramBot>());
builder.Services.AddDataProtection().SetApplicationName("FixSys")
    .PersistKeysToFileSystem(new DirectoryInfo(builder.Configuration["DataProtection:KeyPath"] ?? "/app/data/protection-keys"));
builder.Services.AddSingleton<TelegramWorkspaceBots>();
builder.Services.AddHostedService(services => services.GetRequiredService<TelegramWorkspaceBots>());

var jwt = builder.Configuration.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();
if (jwt.Key.Length < 32)
    throw new InvalidOperationException("Jwt:Key must be at least 32 characters (use user-secrets or the Jwt__Key environment variable).");
if (!isDev && jwt.Key.StartsWith("dev-only", StringComparison.OrdinalIgnoreCase))
    throw new InvalidOperationException("Production requires a private Jwt:Key, not the development key.");
if (!isDev && builder.Configuration.GetValue<bool>("Telegram:SimulationEnabled"))
    throw new InvalidOperationException("The shared Telegram simulation bot is development-only. Disable Telegram:SimulationEnabled in production.");

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("graphql", context => RateLimitPartition.GetFixedWindowLimiter(
        context.User.Identity?.IsAuthenticated == true ? "user:" + context.User.FindFirstValue("sub") : "ip:" + context.Connection.RemoteIpAddress,
        _ => new FixedWindowRateLimiterOptions { PermitLimit = context.User.Identity?.IsAuthenticated == true ? 600 : 30, Window = TimeSpan.FromMinutes(1), QueueLimit = 0, AutoReplenishment = true }));
});

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.MapInboundClaims = false;
        o.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                if (!Guid.TryParse(context.Principal?.FindFirstValue("sub"), out var userId) ||
                    !Guid.TryParse(context.Principal?.FindFirstValue("branch_id"), out var branchId) ||
                    !Guid.TryParse(context.Principal?.FindFirstValue("session_stamp"), out var stamp))
                { context.Fail("Invalid account"); return; }
                var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                if (!await db.Users.AnyAsync(user => user.Id == userId && user.IsActive && user.BranchId == branchId && user.SecurityStamp == stamp, context.HttpContext.RequestAborted))
                    context.Fail("Account unavailable");
                if (!await db.Branches.AnyAsync(branch => branch.Id == branchId && branch.IsActive && (!branch.IsTrial || branch.TrialExpiresAt > DateTime.UtcNow), context.HttpContext.RequestAborted))
                    context.Fail("Workspace expired or unavailable");
            },
        };
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
            ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
            ClockSkew = TimeSpan.FromMinutes(1),
            NameClaimType = "name",
            RoleClaimType = "role",
        };
    });
builder.Services.AddAuthorization(options =>
{
    foreach (var module in WorkspacePolicies.Modules)
        options.AddPolicy(module.Module, policy => policy.RequireAuthenticatedUser().AddRequirements(module));
});
builder.Services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, ModuleAuthorizationHandler>();

var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [];
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod()));

builder.Services
    .AddGraphQLServer()
    .AddAuthorization()
    .AddQueryType(d => d.Name(OperationTypeNames.Query))
    .AddMutationType(d => d.Name(OperationTypeNames.Mutation))
    .AddTypeExtension<AuthQueries>()
    .AddTypeExtension<TrialQueries>()
    .AddTypeExtension<OrganizationQueries>()
    .AddTypeExtension<CustomerQueries>()
    .AddTypeExtension<InventoryQueries>()
    .AddTypeExtension<ServiceQueries>()
    .AddTypeExtension<OperationQueries>()
    .AddTypeExtension<BillingQueries>()
    .AddTypeExtension<AuthMutations>()
    .AddTypeExtension<CustomerMutations>()
    .AddTypeExtension<WorkOrderMutations>()
    .AddTypeExtension<InvoiceMutations>()
    .AddTypeExtension<WorkspaceMutations>()
    .AddTypeExtension<SchedulingMutations>()
    .AddTypeExtension<ExecutionMutations>()
    .AddTypeExtension<AdministrationMutations>()
    .AddTypeExtension<TelegramQueries>()
    .AddTypeExtension<TelegramMutations>()
    .AddFiltering()
    .AddSorting()
    .AddProjections()
    .AddScopedEntityTypes()
    .AddErrorFilter<AppErrorFilter>()
    .AddMaxExecutionDepthRule(12)
    .ModifyRequestOptions(o => o.IncludeExceptionDetails = isDev);

var app = builder.Build();

if (isDev || app.Configuration.GetValue<bool>("Database:AutoMigrate"))
{
    await SchemaUpgrade.ApplyAsync(app.Services);
    await DbSeeder.InitializeAsync(app.Services, isDev);
}

if (isDev && app.Configuration.GetValue<bool>("Seed:DemoData"))
    await WorkspaceDemoSeeder.InitializeAsync(app.Services);

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapGraphQL("/graphql").RequireRateLimiting("graphql");

app.Run();
