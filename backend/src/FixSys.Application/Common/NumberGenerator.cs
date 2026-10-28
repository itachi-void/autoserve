using System.Security.Cryptography;

namespace FixSys.Application.Common;

public static class NumberGenerator
{
    public static string Next(string prefix) =>
        $"{prefix}-{DateTime.UtcNow:yyMMdd}-{RandomNumberGenerator.GetInt32(0, 1_000_000):D6}";
}
