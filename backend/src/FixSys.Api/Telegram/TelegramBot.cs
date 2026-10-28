using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using FixSys.Application.Abstractions;
using FixSys.Application.Common;
using FixSys.Application.Workspace;
using FixSys.Domain.Common;
using FixSys.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Path = System.IO.Path;

namespace FixSys.Api.Telegram;

public record TelegramStatus(bool Configured, bool SimulationEnabled, bool Connected, string? Username, string? BotUsername = null, bool OwnBot = false);
public record TelegramActor(Guid? UserId, Guid? BranchId, string? Email) : ICurrentUser;
public record TelegramLink(Guid BranchId, Guid UserId, long ChatId, string? Username);
public record TelegramTicket(Guid BranchId, Guid UserId, string Action, Guid RecordId, DateTime ExpiresAt, DateTime? ExpectedRevision = null);
public class TelegramState
{
    public long Offset { get; set; }
    public Dictionary<Guid, TelegramLink> Links { get; set; } = [];
    public Dictionary<string, TelegramTicket> Tickets { get; set; } = [];
}

public sealed class TelegramBot : BackgroundService
{
    private readonly IServiceScopeFactory scopes;
    private readonly IConfiguration config;
    private readonly ILogger<TelegramBot> logger;
    private readonly HttpClient http;
    private readonly SemaphoreSlim gate = new(1, 1);
    private readonly string token;
    private readonly string statePath;
    private TelegramState state;
    private bool Enabled => config.GetValue<bool>("Telegram:SimulationEnabled");

    public TelegramBot(IServiceScopeFactory scopes, IConfiguration config, ILogger<TelegramBot> logger, HttpMessageHandler? transport = null)
    {
        this.scopes = scopes; this.config = config; this.logger = logger;
        http = new HttpClient(transport ?? new HttpClientHandler(), transport == null) { Timeout = TimeSpan.FromSeconds(40) };
        token = config["TELEGRAM_BOT_TOKEN"] ?? config["Telegram:BotToken"] ?? "";
        statePath = Path.GetFullPath(config["Telegram:StatePath"] ?? "data/telegram.json");
        state = File.Exists(statePath)
            ? JsonSerializer.Deserialize<TelegramState>(File.ReadAllText(statePath)) ?? throw new InvalidOperationException("Invalid Telegram state")
            : new();
    }

    private void RequireEnabled()
    {
        if (string.IsNullOrWhiteSpace(token) || !Enabled)
            throw new AppException("اضبط TELEGRAM_BOT_TOKEN وفعّل Telegram__SimulationEnabled في الباك اند أولاً");
    }

    private async Task<JsonElement> Call(string method, object body, CancellationToken ct)
    {
        try
        {
            using var response = await http.PostAsJsonAsync($"https://api.telegram.org/bot{token}/{method}", body, ct);
            using var json = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);
            if (!response.IsSuccessStatusCode || !json.RootElement.GetProperty("ok").GetBoolean())
                throw new AppException("رفض Telegram الطلب. تحقق من إعداد البوت والمحادثة.", "TELEGRAM_ERROR");
            return json.RootElement.GetProperty("result").Clone();
        }
        catch (HttpRequestException) { throw new AppException("تعذّر الاتصال بخوادم Telegram", "TELEGRAM_NETWORK"); }
        catch (JsonException) { throw new AppException("استجابة Telegram غير صالحة", "TELEGRAM_ERROR"); }
    }

    private void Save()
    {
        Directory.CreateDirectory(Path.GetDirectoryName(statePath)!);
        var temporary = statePath + ".tmp";
        File.WriteAllText(temporary, JsonSerializer.Serialize(state));
        if (!OperatingSystem.IsWindows()) File.SetUnixFileMode(temporary, UnixFileMode.UserRead | UnixFileMode.UserWrite);
        File.Move(temporary, statePath, true);
    }

    private static string Hash(string value) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));
    private string Issue(Guid branch, Guid user, string action, Guid record, TimeSpan lifetime, DateTime? expectedRevision = null)
    {
        foreach (var key in state.Tickets.Where(pair => pair.Value.ExpiresAt <= DateTime.UtcNow).Select(pair => pair.Key).ToArray()) state.Tickets.Remove(key);
        var code = Convert.ToHexString(RandomNumberGenerator.GetBytes(20)).ToLowerInvariant();
        state.Tickets[Hash(code)] = new(branch, user, action, record, DateTime.UtcNow.Add(lifetime), expectedRevision);
        return code;
    }

    public async Task<TelegramStatus> Status(ICurrentUser current, CancellationToken ct)
    {
        await gate.WaitAsync(ct);
        try
        {
            state.Links.TryGetValue(current.BranchId ?? Guid.Empty, out var link);
            return new(!string.IsNullOrWhiteSpace(token), Enabled, link != null, link?.Username);
        }
        finally { gate.Release(); }
    }

    public async Task<string> Pair(ICurrentUser current, CancellationToken ct)
    {
        RequireEnabled();
        await RequireNonTrial(current, ct);
        var me = await Call("getMe", new { }, ct);
        var webhook = await Call("getWebhookInfo", new { }, ct);
        if (!string.IsNullOrEmpty(webhook.GetProperty("url").GetString())) throw new AppException("البوت مرتبط بـ webhook. أزله من إعدادات البوت قبل تشغيل polling، أو استخدم بوتاً مخصصاً.");
        await gate.WaitAsync(ct);
        try
        {
            var branch = current.BranchId ?? throw new AppException("الفرع غير محدد");
            var user = current.UserId ?? throw new AppException("المستخدم غير محدد");
            foreach (var key in state.Tickets.Where(pair => pair.Value.BranchId == branch && pair.Value.Action == "pair").Select(pair => pair.Key).ToArray()) state.Tickets.Remove(key);
            var code = Issue(branch, user, "pair", Guid.Empty, TimeSpan.FromMinutes(10));
            Save();
            return $"https://t.me/{me.GetProperty("username").GetString()}?start={code}";
        }
        finally { gate.Release(); }
    }

    private async Task<AppDbContext> ActorDb(TelegramTicket ticket, IServiceProvider services, CancellationToken ct)
    {
        var db = new AppDbContext(services.GetRequiredService<DbContextOptions<AppDbContext>>(), new TelegramActor(ticket.UserId, ticket.BranchId, null));
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(user => user.Id == ticket.UserId && user.IsActive && user.BranchId == ticket.BranchId, ct);
        var allowed = user?.Roles.Contains("admin") == true;
        if (user != null && !allowed)
            allowed = await db.Roles.AnyAsync(role => user.Roles.Contains(role.Key) && role.Permissions.Any(permission => permission == "*" || permission == "كل الصلاحيات" || permission == "administration" || permission == "الصلاحيات"), ct);
        if (!allowed) { await db.DisposeAsync(); throw new AppException("صلاحية المسؤول المرتبط لم تعد متاحة"); }
        if (!await db.Branches.AnyAsync(branch => branch.Id == ticket.BranchId && branch.IsActive && (!branch.IsTrial || branch.TrialExpiresAt > DateTime.UtcNow), ct))
        { await db.DisposeAsync(); throw new AppException("مساحة العمل منتهية أو غير متاحة"); }
        if (Guid.TryParse(config["Telegram:WorkspaceBranch"], out var isolatedBranch) && isolatedBranch != ticket.BranchId)
        { await db.DisposeAsync(); throw new AppException("هذا البوت لا يخص مساحة العمل"); }
        return db;
    }

    public async Task<bool> Send(ICurrentUser current, string scenario, Guid recordId, CancellationToken ct)
    {
        RequireEnabled();
        await RequireNonTrial(current, ct);
        await gate.WaitAsync(ct);
        try
        {
            if (!state.Links.TryGetValue(current.BranchId ?? Guid.Empty, out var link)) throw new AppException("اربط حساب Telegram واضغط Start أولاً");
            using var scope = scopes.CreateScope();
            var ticket = new TelegramTicket(link.BranchId, current.UserId ?? throw new AppException("المستخدم غير محدد"), "", recordId, DateTime.UtcNow);
            await using var db = await ActorDb(ticket, scope.ServiceProvider, ct);
            string title;
            DateTime? expectedRevision = null;
            (string Label, string Action)[] actions;
            if (scenario == "shipping")
            {
                var order = await db.PurchaseOrders.FirstOrDefaultAsync(order => order.Id == recordId, ct) ?? throw new AppException("طلب الشراء غير موجود");
                if (order.Status is PurchaseOrderStatus.Received or PurchaseOrderStatus.Cancelled) throw new AppException("طلب الشراء مغلق");
                if (order.Status == PurchaseOrderStatus.PartiallyReceived) throw new AppException("أكمل الاستلام الجزئي من النظام، وليس من المحاكاة");
                title = $"محاكاة شركة الشحن\nطلب الشراء: {order.Number}\nالتسليم سيضيف المخزون فعلياً.";
                actions = [("تم الشحن", "ship"), ("تم التسليم", "receive")];
            }
            else if (scenario == "customer")
            {
                var estimate = await db.Estimates.FirstOrDefaultAsync(estimate => estimate.Id == recordId, ct) ?? throw new AppException("عرض السعر غير موجود");
                if (estimate.Status != EstimateStatus.Presented || estimate.ValidUntil < DateOnly.FromDateTime(DateTime.UtcNow)) throw new AppException("اختر عرضاً مقدّماً للعميل وساري الصلاحية");
                title = $"محاكاة العميل\nعرض السعر: {estimate.Number}\nالإجمالي: {estimate.Total:0.00}\nقرارك سيُسجَّل فعلياً.";
                expectedRevision = estimate.UpdatedAt ?? estimate.CreatedAt;
                actions = [("موافق", "approve"), ("غير موافق", "reject")];
            }
            else if (scenario == "employee")
            {
                var order = await db.WorkOrders.FirstOrDefaultAsync(order => order.Id == recordId, ct) ?? throw new AppException("أمر التشغيل غير موجود");
                if (order.Status is WorkOrderStatus.Completed or WorkOrderStatus.Delivered or WorkOrderStatus.Cancelled) throw new AppException("أمر التشغيل مغلق");
                title = $"محاكاة موظف المركز\nأمر التشغيل: {order.Number}\nالأزرار تحدّث حالة الأمر فعلياً.";
                actions = [("بدء العمل", "start"), ("انتظار قطع", "wait"), ("اكتمل العمل", "complete")];
            }
            else throw new AppException("سيناريو غير معروف");
            var buttons = actions.Select(action => new { text = action.Label, callback_data = Issue(link.BranchId, ticket.UserId, action.Action, recordId, TimeSpan.FromHours(24), expectedRevision) }).ToArray();
            Save();
            await Call("sendMessage", new { chat_id = link.ChatId, text = title, reply_markup = new { inline_keyboard = new[] { buttons } } }, ct);
            return true;
        }
        finally { gate.Release(); }
    }

    public async Task<bool> Disconnect(ICurrentUser current, CancellationToken ct)
    {
        await gate.WaitAsync(ct);
        try
        {
            var branch = current.BranchId ?? Guid.Empty;
            state.Links.Remove(branch);
            foreach (var key in state.Tickets.Where(pair => pair.Value.BranchId == branch).Select(pair => pair.Key).ToArray()) state.Tickets.Remove(key);
            Save(); return true;
        }
        finally { gate.Release(); }
    }

    private async Task RequireNonTrial(ICurrentUser current, CancellationToken ct)
    {
        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var isolated = Guid.TryParse(config["Telegram:WorkspaceBranch"], out var branchId);
        if (isolated && current.BranchId != branchId) throw new AppException("هذا البوت لا يخص مساحة العمل");
        if (!await db.Branches.AnyAsync(branch => branch.Id == current.BranchId && branch.IsActive && (!branch.IsTrial || isolated && branch.TrialExpiresAt > DateTime.UtcNow), ct))
            throw new AppException("اربط بوت Telegram خاصاً بتجربتك أولاً؛ بوت المسؤول المشترك غير متاح للتجارب.");
    }

    private async Task Apply(TelegramTicket ticket, CancellationToken ct)
    {
        using var scope = scopes.CreateScope();
        await using var db = await ActorDb(ticket, scope.ServiceProvider, ct);
        var actor = new TelegramActor(ticket.UserId, ticket.BranchId, null);
        var service = new WorkspaceService(db, actor, scope.ServiceProvider.GetRequiredService<IPasswordHasher>());
        if (ticket.Action is "ship" or "receive")
        {
            var order = await db.PurchaseOrders.FirstOrDefaultAsync(order => order.Id == ticket.RecordId, ct) ?? throw new AppException("طلب الشراء غير موجود");
            if (order.Status == PurchaseOrderStatus.Cancelled) throw new AppException("طلب الشراء ملغى");
            if (order.Status == PurchaseOrderStatus.Received) return;
            if (order.Status == PurchaseOrderStatus.PartiallyReceived) throw new AppException("الطلب مستلم جزئياً؛ أكمل استلامه من النظام");
            if (ticket.Action == "receive") await service.ReceivePurchaseOrderAsync(order.Id, ct);
            else { order.Status = PurchaseOrderStatus.Sent; await db.SaveChangesAsync(ct); }
        }
        else if (ticket.Action is "approve" or "reject")
        {
            var estimate = await db.Estimates.Include(estimate => estimate.LineItems).FirstOrDefaultAsync(estimate => estimate.Id == ticket.RecordId, ct) ?? throw new AppException("عرض السعر غير موجود");
            var status = ticket.Action == "approve" ? EstimateStatus.Approved : EstimateStatus.Rejected;
            if (ticket.ExpectedRevision != (estimate.UpdatedAt ?? estimate.CreatedAt)) throw new AppException("تم تعديل عرض السعر؛ أرسل نسخة جديدة للعميل قبل اتخاذ القرار");
            if (estimate.Status == status) return;
            if (estimate.Status != EstimateStatus.Presented || estimate.ValidUntil < DateOnly.FromDateTime(DateTime.UtcNow)) throw new AppException("تم اتخاذ قرار سابق أو انتهت صلاحية العرض");
            if (await db.WorkOrders.AnyAsync(order => order.EstimateId == estimate.Id, ct)) throw new AppException("تم تحويل العرض إلى أمر تشغيل");
            estimate.Status = status;
            estimate.ApprovedAt = status == EstimateStatus.Approved ? DateTime.UtcNow : null;
            foreach (var line in estimate.LineItems) line.Decision = status == EstimateStatus.Approved ? LineDecision.Accepted : LineDecision.Rejected;
            await db.SaveChangesAsync(ct);
        }
        else
        {
            var order = await db.WorkOrders.FirstOrDefaultAsync(order => order.Id == ticket.RecordId, ct) ?? throw new AppException("أمر التشغيل غير موجود");
            var status = ticket.Action switch { "start" => WorkOrderStatus.InProgress, "wait" => WorkOrderStatus.WaitingParts, "complete" => WorkOrderStatus.Completed, _ => throw new AppException("إجراء غير معروف") };
            if (order.Status == status) return;
            if (order.Status is WorkOrderStatus.Completed or WorkOrderStatus.Delivered or WorkOrderStatus.Cancelled) throw new AppException("أمر التشغيل مغلق");
            await service.ChangeWorkOrderAsync(new(order.Id, order.TechnicianId, status, status == WorkOrderStatus.Completed ? 100 : order.Progress, order.Notes), ct);
        }
    }

    private async Task Handle(JsonElement update, CancellationToken ct)
    {
        if (update.TryGetProperty("message", out var message) && message.TryGetProperty("text", out var text) && text.GetString() is { } command && command.StartsWith("/start "))
        {
            var chat = message.GetProperty("chat");
            var sender = message.GetProperty("from");
            if (chat.GetProperty("type").GetString() != "private" || chat.GetProperty("id").GetInt64() != sender.GetProperty("id").GetInt64()) return;
            var key = Hash(command[7..].Trim());
            if (!state.Tickets.TryGetValue(key, out var ticket) || ticket.Action != "pair" || ticket.ExpiresAt <= DateTime.UtcNow) return;
            var chatId = chat.GetProperty("id").GetInt64();
            if (state.Links.Values.Any(link => link.ChatId == chatId && link.BranchId != ticket.BranchId)) throw new AppException("الحساب مربوط بفرع آخر؛ افصل الربط أولاً");
            using var scope = scopes.CreateScope();
            await using var db = await ActorDb(ticket, scope.ServiceProvider, ct);
            foreach (var pending in state.Tickets.Where(pair => pair.Value.BranchId == ticket.BranchId).Select(pair => pair.Key).ToArray()) state.Tickets.Remove(pending);
            state.Links[ticket.BranchId] = new(ticket.BranchId, ticket.UserId, chatId, sender.TryGetProperty("username", out var username) ? username.GetString() : null);
            Save();
            await Call("sendMessage", new { chat_id = chatId, text = "تم الربط ✅ هذا حساب محاكاة للأدوار الثلاثة. ارجع للنظام واختر السجل المطلوب إرساله." }, ct);
        }
        if (!update.TryGetProperty("callback_query", out var callback)) return;
        var result = "هذا الزر منتهي أو غير مصرح به";
        if (callback.TryGetProperty("data", out var data) && callback.TryGetProperty("message", out var original))
        {
            var key = Hash(data.GetString() ?? "");
            if (state.Tickets.TryGetValue(key, out var ticket) && ticket.Action != "pair" && ticket.ExpiresAt > DateTime.UtcNow && state.Links.TryGetValue(ticket.BranchId, out var link) && original.GetProperty("chat").GetProperty("id").GetInt64() == link.ChatId && callback.GetProperty("from").GetProperty("id").GetInt64() == link.ChatId)
            {
                try
                {
                    await Apply(ticket, ct);
                    state.Tickets.Remove(key); Save(); result = "تم تحديث النظام فعلياً ✅";
                }
                catch (AppException error) { result = error.Message; }
                catch (DbUpdateException) { result = "تعارض مع تحديث آخر. حدّث السجل من النظام وحاول مجدداً."; }
            }
        }
        await Call("answerCallbackQuery", new { callback_query_id = callback.GetProperty("id").GetString(), text = result, show_alert = true }, ct);
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(token) || !Enabled) return;
        while (!ct.IsCancellationRequested)
        {
            try
            {
                var webhook = await Call("getWebhookInfo", new { }, ct);
                if (!string.IsNullOrEmpty(webhook.GetProperty("url").GetString())) throw new AppException("Telegram polling requires a dedicated bot without a webhook.");
                var updates = await Call("getUpdates", new { offset = state.Offset, timeout = 25, allowed_updates = new[] { "message", "callback_query" } }, ct);
                foreach (var update in updates.EnumerateArray())
                {
                    await gate.WaitAsync(ct);
                    try
                    {
                        try { await Handle(update, ct); }
                        catch (AppException) { logger.LogWarning("Telegram update could not be processed; check integration settings."); }
                        state.Offset = update.GetProperty("update_id").GetInt64() + 1; Save();
                    }
                    finally { gate.Release(); }
                }
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested) { break; }
            catch (Exception) { logger.LogWarning("Telegram polling unavailable; retrying without exposing credentials."); await Task.Delay(TimeSpan.FromSeconds(10), ct); }
        }
    }

    public override void Dispose() { http.Dispose(); gate.Dispose(); base.Dispose(); }
}
