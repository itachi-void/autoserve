using FixSys.Application.Abstractions;
using FixSys.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FixSys.Infrastructure.Persistence;

public static class DbSeeder
{
    /// <summary>
    /// Applies the schema, then seeds base data once. Development gets the two demo accounts used by the
    /// frontend; other environments get a single admin only if Seed:AdminEmail / Seed:AdminPassword are set.
    /// </summary>
    public static async Task InitializeAsync(IServiceProvider services, bool development)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        if (db.Database.GetMigrations().Any()) await db.Database.MigrateAsync();
        else await db.Database.EnsureCreatedAsync();

        if (await db.Branches.AnyAsync()) return;

        var branch = new Branch { Name = "المركز الرئيسي", Code = "HQ", Address = "-", ContactNumber = "-" };
        db.Branches.Add(branch);
        db.Departments.Add(new Department { BranchId = branch.Id, Name = "الورشة", Color = "sky", Description = "قسم التشغيل والصيانة" });
        foreach (var name in new[] { "صيانة دورية", "محرك وناقل حركة", "فرامل وتعليق", "كهرباء وكمبيوتر", "تكييف وتبريد", "هيكل ودهان", "إطارات وتوازن" })
            db.ServiceCategories.Add(new ServiceCategory { BranchId = branch.Id, Name = name, Color = "sky", Icon = "wrench" });
        db.InspectionTemplates.Add(new InspectionTemplate
        {
            Name = "الفحص الشامل", Type = "شامل",
            BranchId = branch.Id,
            Sections = [new InspectionSection { Name = "المحرك", Items = ["مستوى الزيت", "التسريبات", "الأصوات"] }, new InspectionSection { Name = "السلامة", Items = ["الفرامل", "الإطارات", "الإضاءة"] }],
        });

        db.Roles.AddRange(
            new Role { BranchId = branch.Id, Key = "admin", Name = "مدير النظام", Color = "amber", Permissions = ["*"] },
            new Role { BranchId = branch.Id, Key = "manager", Name = "مشرف العمليات", Color = "sky", Permissions = ["customers", "vehicles", "workorders", "appointments", "inspections", "estimates", "inventory"] },
            new Role { BranchId = branch.Id, Key = "accountant", Name = "محاسب", Color = "emerald", Permissions = ["invoices", "customers"] },
            new Role { BranchId = branch.Id, Key = "receptionist", Name = "موظف استقبال", Color = "rose", Permissions = ["customers", "vehicles", "appointments", "workorders"] },
            new Role { BranchId = branch.Id, Key = "technician", Name = "فني", Color = "violet", Permissions = ["workorders", "inspections"] });

        if (development)
        {
            db.Users.AddRange(
                new AppUser { BranchId = branch.Id, Name = "أحمد المدير", Email = "admin@fixsys.sa", PasswordHash = hasher.Hash("admin123"), Roles = ["admin"] },
                new AppUser { BranchId = branch.Id, Name = "محمد المشرف", Email = "manager@fixsys.sa", PasswordHash = hasher.Hash("manager123"), Roles = ["manager"] });
        }
        else if (config["Seed:AdminEmail"] is { Length: > 0 } email && config["Seed:AdminPassword"] is { Length: >= 8 } password)
        {
            db.Users.Add(new AppUser
            {
                BranchId = branch.Id,
                Name = config["Seed:AdminName"] ?? "مدير النظام",
                Email = email.Trim().ToLowerInvariant(),
                PasswordHash = hasher.Hash(password),
                Roles = ["admin"],
            });
        }

        await db.SaveChangesAsync();
    }
}
