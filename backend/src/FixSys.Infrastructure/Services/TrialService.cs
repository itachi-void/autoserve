using FixSys.Application.Abstractions;
using FixSys.Application.Auth;
using FixSys.Application.Common;
using FixSys.Domain.Entities;
using FixSys.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace FixSys.Infrastructure.Services;

public class TrialService(AppDbContext db, IConfiguration config, IPasswordHasher hasher, IJwtTokenService jwt, ICurrentUser current) : ITrialService
{
    public bool Enabled => config.GetValue<bool>("Trials:Enabled");
    public Task<Branch?> WorkspaceAsync(CancellationToken ct) => db.Branches.AsNoTracking().FirstOrDefaultAsync(branch => branch.Id == current.BranchId, ct);

    public async Task<LoginPayload> CreateAsync(CreateTrialInput input, CancellationToken ct)
    {
        if (!Enabled) throw new AppException("إنشاء التجارب غير متاح حالياً", "TRIALS_DISABLED");
        var email = input.Email.Trim().ToLowerInvariant();
        if (input.CompanyName.Trim().Length is < 2 or > 120 || email.Length > 254 || !System.Net.Mail.MailAddress.TryCreate(email, out var address) || !address.Host.Contains('.')) throw new AppException("أدخل اسم المركز وبريداً إلكترونياً صالحاً");
        if (input.Password.Length is < 12 or > 128) throw new AppException("استخدم كلمة مرور من ١٢ إلى ١٢٨ حرفاً");
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(19261007)", ct);
        if (await db.Users.AnyAsync(user => user.Email == email, ct)) throw new AppException("لا يمكن إنشاء التجربة بهذا البريد؛ جرّب تسجيل الدخول أو استخدم بريداً آخر", "ACCOUNT_UNAVAILABLE");
        var now = DateTime.UtcNow;
        if (await db.Branches.CountAsync(branch => branch.IsTrial && branch.TrialExpiresAt > now, ct) >= config.GetValue("Trials:MaxActive", 50)) throw new AppException("التجارب ممتلئة مؤقتاً؛ حاول لاحقاً", "TRIAL_CAPACITY");
        var branch = new Branch { Name = input.CompanyName.Trim(), Code = "TRIAL-" + Guid.NewGuid().ToString("N"), IsTrial = true, TrialExpiresAt = now.AddDays(Math.Clamp(config.GetValue("Trials:Days", 7), 1, 30)), Address = "مساحة اختبار مستقلة", ContactNumber = "" };
        var user = new AppUser { BranchId = branch.Id, Name = input.CompanyName.Trim(), Email = email, PasswordHash = hasher.Hash(input.Password), Roles = ["admin"], IsActive = true };
        db.Branches.Add(branch); db.Users.Add(user);
        db.Roles.Add(new Role { BranchId = branch.Id, Key = "admin", Name = "مدير التجربة", Color = "amber", Permissions = ["*"] });
        await db.SaveChangesAsync(ct);
        await WorkspaceDemoSeeder.PopulateAsync(db, branch);
        await transaction.CommitAsync(ct);
        var issued = jwt.Create(user);
        return new LoginPayload(new AuthPayload(issued.Token, issued.ExpiresOn, new AuthUserInfo(user.Id, user.Name, user.Email, user.Roles)));
    }
}
