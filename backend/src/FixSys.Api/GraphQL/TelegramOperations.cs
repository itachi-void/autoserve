using FixSys.Api.Telegram;
using FixSys.Application.Abstractions;
using HotChocolate.Authorization;
using HotChocolate.Types;

namespace FixSys.Api.GraphQL;

[ExtendObjectType(OperationTypeNames.Query)]
[Authorize(Policy = "administration")]
public class TelegramQueries
{
    public Task<TelegramStatus> TelegramStatus([Service] TelegramWorkspaceBots bot, [Service] ICurrentUser current, CancellationToken ct) => bot.Status(current, ct);
}

[ExtendObjectType(OperationTypeNames.Mutation)]
[Authorize(Policy = "administration")]
public class TelegramMutations
{
    public Task<TelegramStatus> ConfigureTelegramBot([Service] TelegramWorkspaceBots bot, [Service] ICurrentUser current, string token, CancellationToken ct) => bot.Configure(current, token, ct);
    public Task<bool> RemoveTelegramBot([Service] TelegramWorkspaceBots bot, [Service] ICurrentUser current, CancellationToken ct) => bot.Remove(current, ct);
    public Task<string> CreateTelegramLink([Service] TelegramWorkspaceBots bot, [Service] ICurrentUser current, CancellationToken ct) => bot.Run(current, worker => worker.Pair(current, ct), ct);
    public Task<bool> SendTelegramSimulation([Service] TelegramWorkspaceBots bot, [Service] ICurrentUser current, string scenario, Guid recordId, CancellationToken ct) => bot.Run(current, worker => worker.Send(current, scenario, recordId, ct), ct);
    public Task<bool> DisconnectTelegram([Service] TelegramWorkspaceBots bot, [Service] ICurrentUser current, CancellationToken ct) => bot.Run(current, worker => worker.Disconnect(current, ct), ct);
}
