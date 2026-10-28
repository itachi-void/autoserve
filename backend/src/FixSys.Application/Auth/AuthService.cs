using System.Security.Cryptography;
using System.Text;
using FixSys.Application.Abstractions;
using FixSys.Application.Common;
using FixSys.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FixSys.Application.Auth;

public record LoginInput(string Email, string Password);
public record ForgetPasswordInput(string Email);
public record ResetPasswordInput(string Email, string Otp, string NewPassword);
public record RefreshTokenInput(string Token);

public record AuthUserInfo(Guid Id, string Name, string Email, List<string> Roles);
public record AuthPayload(string AccessToken, DateTime ExpiresOn, AuthUserInfo User);
public record LoginPayload(AuthPayload AuthPayload);
public record RefreshTokenPayload(AuthPayload AuthPayload);
public record ForgetPasswordPayload(bool Success);
public record ResetPasswordPayload(bool Success);

public class AuthService(IAppDbContext db, IPasswordHasher hasher, IJwtTokenService jwt, IEmailSender email)
{
    private const int OtpMinutes = 10;
    private const int OtpMaxAttempts = 5;
    private const int OtpResendSeconds = 60;
    private const int MinPasswordLength = 8;

    private static string Normalize(string value) => value.Trim().ToLowerInvariant();

    public async Task<LoginPayload> LoginAsync(LoginInput input, CancellationToken ct)
    {
        var mail = Normalize(input.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == mail, ct);

        if (user is null || !user.IsActive || !hasher.Verify(input.Password, user.PasswordHash))
            throw new AppException("البريد الإلكتروني أو كلمة المرور غير صحيحة", "INVALID_CREDENTIALS");

        user.LastLoginAt = DateTime.UtcNow;
        await RequireWorkspaceAsync(user, ct);
        await db.SaveChangesAsync(ct);
        return new LoginPayload(ToPayload(user));
    }

    public async Task<RefreshTokenPayload> RefreshAsync(RefreshTokenInput input, CancellationToken ct)
    {
        var session = await jwt.ValidateForRefreshAsync(input.Token)
            ?? throw new AppException("الجلسة منتهية، يرجى تسجيل الدخول مجدداً", "INVALID_TOKEN");

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == session.UserId && u.BranchId == session.BranchId && u.SecurityStamp == session.SecurityStamp && u.IsActive, ct)
            ?? throw new AppException("الجلسة منتهية، يرجى تسجيل الدخول مجدداً", "INVALID_TOKEN");
        await RequireWorkspaceAsync(user, ct);

        return new RefreshTokenPayload(ToPayload(user));
    }

    public async Task<ForgetPasswordPayload> ForgetPasswordAsync(ForgetPasswordInput input, CancellationToken ct)
    {
        var mail = Normalize(input.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == mail && u.IsActive, ct);

        // Same response whether or not the account exists, to avoid user enumeration.
        if (user is null) return new ForgetPasswordPayload(true);

        var now = DateTime.UtcNow;
        var recentlySent = await db.OtpCodes.AnyAsync(
            o => o.Email == mail && !o.Used && o.CreatedAt > now.AddSeconds(-OtpResendSeconds), ct);
        if (recentlySent) return new ForgetPasswordPayload(true);

        await db.OtpCodes.Where(o => o.Email == mail && !o.Used)
            .ExecuteUpdateAsync(s => s.SetProperty(o => o.Used, true), ct);

        var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        db.OtpCodes.Add(new OtpCode
        {
            Email = mail,
            CodeHash = HashOtp(mail, code),
            ExpiresAt = now.AddMinutes(OtpMinutes),
        });
        await db.SaveChangesAsync(ct);
        await email.SendOtpAsync(mail, code, ct);
        return new ForgetPasswordPayload(true);
    }

    public async Task<ResetPasswordPayload> ResetPasswordAsync(ResetPasswordInput input, CancellationToken ct)
    {
        if (input.NewPassword.Length < MinPasswordLength)
            throw new AppException($"كلمة المرور يجب ألا تقل عن {MinPasswordLength} أحرف", "WEAK_PASSWORD");

        var mail = Normalize(input.Email);
        var now = DateTime.UtcNow;
        var invalid = new AppException("كود التحقق غير صحيح أو انتهت صلاحيته", "INVALID_OTP");

        var otp = await db.OtpCodes
            .Where(o => o.Email == mail && !o.Used && o.ExpiresAt > now)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(ct);
        if (otp is null || otp.Attempts >= OtpMaxAttempts) throw invalid;

        otp.Attempts++;
        var matches = CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(HashOtp(mail, input.Otp.Trim())),
            Encoding.UTF8.GetBytes(otp.CodeHash));
        if (!matches)
        {
            await db.SaveChangesAsync(ct);
            throw invalid;
        }

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == mail && u.IsActive, ct) ?? throw invalid;
        user.PasswordHash = hasher.Hash(input.NewPassword);
        user.SecurityStamp = Guid.NewGuid();
        otp.Used = true;
        await db.SaveChangesAsync(ct);
        return new ResetPasswordPayload(true);
    }

    private AuthPayload ToPayload(AppUser user)
    {
        var issued = jwt.Create(user);
        return new AuthPayload(issued.Token, issued.ExpiresOn, new AuthUserInfo(user.Id, user.Name, user.Email, user.Roles));
    }

    private static string HashOtp(string mail, string code) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes($"{mail}:{code}")));

    private async Task RequireWorkspaceAsync(AppUser user, CancellationToken ct)
    {
        if (!await db.Branches.AnyAsync(branch => branch.Id == user.BranchId && branch.IsActive && (!branch.IsTrial || branch.TrialExpiresAt > DateTime.UtcNow), ct))
            throw new AppException("انتهت مدة التجربة أو مساحة العمل غير متاحة", "WORKSPACE_EXPIRED");
    }
}
