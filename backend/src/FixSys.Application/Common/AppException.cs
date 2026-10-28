namespace FixSys.Application.Common;

/// <summary>Expected business error; its message is safe to show to the client.</summary>
public class AppException(string message, string code = "BAD_REQUEST") : Exception(message)
{
    public string Code { get; } = code;
}
