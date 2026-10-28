using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using FixSys.Application.Abstractions;
using FixSys.Application.Common;
using FixSys.Infrastructure.Persistence;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Path = System.IO.Path;

namespace FixSys.Api.Telegram;

public record WorkspaceBotCredential(string Token, long BotId, string Username);

public sealed class TelegramWorkspaceBots : BackgroundService
{
    private readonly IServiceScopeFactory scopes;
    private readonly IConfiguration config;
    private readonly ILoggerFactory loggers;
    private readonly TelegramBot shared;
    private readonly IDataProtector protector;
    private readonly SemaphoreSlim gate = new(1, 1);
    private readonly HttpClient http;
    private readonly HttpMessageHandler? transport;
    private readonly Dictionary<Guid, TelegramBot> bots = [];
    private readonly Dictionary<Guid, DateTime> configurationAttempts = [];
    private readonly Dictionary<Guid, WorkspaceBotCredential> credentials;
    private readonly string directory;
    private readonly string credentialPath;
    private readonly bool enabled;

    public TelegramWorkspaceBots(IServiceScopeFactory scopes, IConfiguration config, ILoggerFactory loggers, TelegramBot shared, IDataProtectionProvider protection, HttpMessageHandler? transport = null)
    {
        this.scopes = scopes; this.config = config; this.loggers = loggers; this.shared = shared;
        this.transport = transport;
        http = new HttpClient(transport ?? new HttpClientHandler(), transport == null) { Timeout = TimeSpan.FromSeconds(15) };
        protector = protection.CreateProtector("FixSys.Telegram.WorkspaceCredentials.v1");
        directory = Path.GetFullPath(config["Telegram:WorkspaceStateDirectory"] ?? "/app/data/workspace-bots");
        credentialPath = Path.Combine(directory, "credentials.protected");
        enabled = config.GetValue("Telegram:AllowWorkspaceBots", true);
        credentials = File.Exists(credentialPath)
            ? JsonSerializer.Deserialize<Dictionary<Guid, WorkspaceBotCredential>>(protector.Unprotect(File.ReadAllText(credentialPath))) ?? throw new InvalidOperationException("Invalid protected Telegram configuration") : [];
    }

    private async Task RequireWorkspace(ICurrentUser current, CancellationToken ct)
    {
        if (!enabled) throw new AppException("ربط البوتات الخاصة غير مفعّل في هذا الخادم");
        if (current.UserId == null || current.BranchId == null) throw new AppException("مساحة العمل غير محددة");
        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (!await db.Branches.AnyAsync(branch => branch.Id == current.BranchId && branch.IsActive && (!branch.IsTrial || branch.TrialExpiresAt > DateTime.UtcNow), ct)) throw new AppException("مساحة العمل منتهية أو غير متاحة");
    }

    private string StatePath(Guid branch) => Path.Combine(directory, branch.ToString("N") + ".json");
    private void Save()
    {
        Directory.CreateDirectory(directory);
        if (!OperatingSystem.IsWindows()) File.SetUnixFileMode(directory, UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute);
        var temporary = credentialPath + ".tmp";
        File.WriteAllText(temporary, protector.Protect(JsonSerializer.Serialize(credentials)));
        if (!OperatingSystem.IsWindows()) File.SetUnixFileMode(temporary, UnixFileMode.UserRead | UnixFileMode.UserWrite);
        File.Move(temporary, credentialPath, true);
    }

    private async Task<JsonElement> VerifyCall(string token, string method, CancellationToken ct)
    {
        try
        {
            using var response = await http.PostAsJsonAsync($"https://api.telegram.org/bot{token}/{method}", new { }, ct);
            using var json = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);
            if (!response.IsSuccessStatusCode || !json.RootElement.TryGetProperty("ok", out var ok) || !ok.GetBoolean()) throw new AppException("Telegram رفض التوكن؛ تأكد أنه توكن بوت صالح", "TELEGRAM_ERROR");
            return json.RootElement.GetProperty("result").Clone();
        }
        catch (HttpRequestException) { throw new AppException("تعذّر التحقق من البوت لدى Telegram", "TELEGRAM_NETWORK"); }
        catch (JsonException) { throw new AppException("استجابة Telegram غير صالحة", "TELEGRAM_ERROR"); }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested) { throw new AppException("انتهت مهلة التحقق من Telegram", "TELEGRAM_NETWORK"); }
    }

    private async Task<TelegramBot> StartBot(Guid branch, WorkspaceBotCredential credential)
    {
        if (bots.TryGetValue(branch, out var existing)) return existing;
        var settings = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["TELEGRAM_BOT_TOKEN"] = credential.Token, ["Telegram:SimulationEnabled"] = "true",
            ["Telegram:WorkspaceBranch"] = branch.ToString(), ["Telegram:StatePath"] = StatePath(branch),
        }).Build();
        var bot = new TelegramBot(scopes, settings, loggers.CreateLogger<TelegramBot>(), transport);
        await bot.StartAsync(CancellationToken.None);
        bots.Add(branch, bot);
        return bot;
    }

    private async Task StopBot(Guid branch)
    {
        if (!bots.Remove(branch, out var bot)) return;
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(45));
        await bot.StopAsync(timeout.Token);
        bot.Dispose();
    }

    public async Task<TelegramStatus> Configure(ICurrentUser current, string token, CancellationToken ct)
    {
        await RequireWorkspace(current, ct);
        token = token.Trim();
        if (token.Length > 160 || !Regex.IsMatch(token, @"^\d{5,20}:[A-Za-z0-9_-]{30,100}$")) throw new AppException("أدخل توكن البوت من BotFather، وليس اسم المستخدم أو رابط الحساب");
        var sharedToken = config["TELEGRAM_BOT_TOKEN"] ?? config["Telegram:BotToken"] ?? "";
        if (sharedToken.Length > 0 && CryptographicOperations.FixedTimeEquals(SHA256.HashData(Encoding.UTF8.GetBytes(token)), SHA256.HashData(Encoding.UTF8.GetBytes(sharedToken)))) throw new AppException("استخدم بوتاً خاصاً بتجربتك، وليس بوت المسؤول المشترك");
        await gate.WaitAsync(ct);
        try
        {
            var now = DateTime.UtcNow;
            foreach (var expired in configurationAttempts.Where(entry => entry.Value < now.AddMinutes(-1)).Select(entry => entry.Key).ToArray()) configurationAttempts.Remove(expired);
            if (configurationAttempts.TryGetValue(current.BranchId!.Value, out var last) && last > now.AddSeconds(-10)) throw new AppException("انتظر عشر ثوانٍ قبل إعادة التحقق من توكن آخر", "RATE_LIMITED");
            configurationAttempts[current.BranchId.Value] = now;
        }
        finally { gate.Release(); }
        var me = await VerifyCall(token, "getMe", ct);
        var webhook = await VerifyCall(token, "getWebhookInfo", ct);
        if (!string.IsNullOrEmpty(webhook.GetProperty("url").GetString())) throw new AppException("البوت مرتبط بـ webhook؛ استخدم بوتاً جديداً مخصصاً للمحاكاة. لن نحذف webhook تلقائياً.");
        var botId = me.GetProperty("id").GetInt64();
        if (sharedToken.Split(':')[0] == botId.ToString(System.Globalization.CultureInfo.InvariantCulture)) throw new AppException("بوت المسؤول المشترك لا يمكن ربطه بتجربة مستقلة");
        var username = me.GetProperty("username").GetString() ?? throw new AppException("البوت ليس له اسم مستخدم");
        await RequireWorkspace(current, ct);
        await gate.WaitAsync(ct);
        try
        {
            var branch = current.BranchId!.Value;
            if (credentials.Any(entry => entry.Key != branch && entry.Value.BotId == botId)) throw new AppException("هذا البوت مرتبط بمساحة أخرى؛ أنشئ بوتاً مستقلاً");
            if (!credentials.ContainsKey(branch) && credentials.Count >= config.GetValue("Telegram:MaxWorkspaceBots", 50)) throw new AppException("وصل الخادم للحد المتاح من البوتات الخاصة");
            await StopBot(branch);
            credentials[branch] = new(token, botId, username);
            if (File.Exists(StatePath(branch))) File.Delete(StatePath(branch));
            Save();
            await StartBot(branch, credentials[branch]);
            return new(true, true, false, null, username, true);
        }
        finally { gate.Release(); }
    }

    private async Task<TelegramBot?> Resolve(ICurrentUser current, CancellationToken ct)
    {
        if (enabled && credentials.TryGetValue(current.BranchId ?? Guid.Empty, out var credential)) return await StartBot(current.BranchId!.Value, credential);
        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await db.Branches.AnyAsync(branch => branch.Id == current.BranchId && branch.IsActive && !branch.IsTrial, ct) ? shared : null;
    }

    public async Task<TelegramStatus> Status(ICurrentUser current, CancellationToken ct)
    {
        await gate.WaitAsync(ct);
        try
        {
            var bot = await Resolve(current, ct);
            if (bot == null) return new(false, enabled, false, null);
            var status = await bot.Status(current, ct);
            return credentials.TryGetValue(current.BranchId ?? Guid.Empty, out var credential) && enabled ? status with { BotUsername = credential.Username, OwnBot = true } : status;
        }
        finally { gate.Release(); }
    }

    public async Task<T> Run<T>(ICurrentUser current, Func<TelegramBot, Task<T>> operation, CancellationToken ct)
    {
        await gate.WaitAsync(ct);
        try { return await operation(await Resolve(current, ct) ?? throw new AppException("أضف توكن بوت خاص بتجربتك أولاً")); }
        finally { gate.Release(); }
    }

    public async Task<bool> Remove(ICurrentUser current, CancellationToken ct)
    {
        await gate.WaitAsync(ct);
        try
        {
            var branch = current.BranchId ?? throw new AppException("مساحة العمل غير محددة");
            await StopBot(branch); credentials.Remove(branch); Save();
            if (File.Exists(StatePath(branch))) File.Delete(StatePath(branch));
            return true;
        }
        finally { gate.Release(); }
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            await gate.WaitAsync(ct);
            try
            {
                using var scope = scopes.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                foreach (var entry in credentials.ToArray())
                {
                    var active = await db.Branches.AnyAsync(branch => branch.Id == entry.Key && branch.IsActive && (!branch.IsTrial || branch.TrialExpiresAt > DateTime.UtcNow), ct);
                    if (!active) { await StopBot(entry.Key); credentials.Remove(entry.Key); Save(); if (File.Exists(StatePath(entry.Key))) File.Delete(StatePath(entry.Key)); }
                    else if (enabled) await StartBot(entry.Key, entry.Value);
                }
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested) { break; }
            catch (Exception) { loggers.CreateLogger<TelegramWorkspaceBots>().LogWarning("Workspace Telegram workers could not refresh; credentials are not logged."); }
            finally { gate.Release(); }
            try { await Task.Delay(TimeSpan.FromSeconds(60), ct); } catch (OperationCanceledException) when (ct.IsCancellationRequested) { break; }
        }
    }

    public override async Task StopAsync(CancellationToken ct)
    {
        await base.StopAsync(ct);
        await gate.WaitAsync(ct);
        try { foreach (var branch in bots.Keys.ToArray()) await StopBot(branch); }
        finally { gate.Release(); }
    }
    public override void Dispose() { http.Dispose(); gate.Dispose(); base.Dispose(); }
}
