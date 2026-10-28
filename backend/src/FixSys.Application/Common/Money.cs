namespace FixSys.Application.Common;

public static class Money
{
    public static decimal Round(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);
    public static void RequirePrecision(decimal value)
    {
        if (value != Round(value)) throw new AppException("القيم المالية تقبل منزلتين عشريتين فقط", "INVALID_MONEY");
    }
}
