using System.Net;
using System.Net.Mail;
using FixSys.Application.Abstractions;
using Microsoft.Extensions.Configuration;

namespace FixSys.Infrastructure.Services;

public class SmtpEmailSender(IConfiguration configuration) : IEmailSender
{
    public async Task SendOtpAsync(string email, string code, CancellationToken ct = default)
    {
        var settings = configuration.GetSection("Smtp");
        using var client = new SmtpClient(settings["Host"], settings.GetValue<int>("Port", 587))
        {
            EnableSsl = settings.GetValue<bool>("EnableSsl", true),
            Credentials = new NetworkCredential(settings["Username"], settings["Password"]),
        };
        using var message = new MailMessage(settings["From"] ?? settings["Username"]!, email)
        {
            Subject = "رمز استعادة كلمة المرور — FixSys",
            Body = $"رمز التحقق: {code}\nصالح لمدة عشر دقائق. لا تشاركه مع أي شخص.",
        };
        await client.SendMailAsync(message, ct);
    }
}
