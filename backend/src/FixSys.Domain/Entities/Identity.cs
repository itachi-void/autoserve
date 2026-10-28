using FixSys.Domain.Common;

namespace FixSys.Domain.Entities;

public class AppUser : Entity
{
    public Guid? BranchId { get; set; }
    public Guid? EmployeeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public Guid SecurityStamp { get; set; } = Guid.NewGuid();
    public List<string> Roles { get; set; } = [];
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
}

public class OtpCode : Entity
{
    public string Email { get; set; } = string.Empty;
    public string CodeHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public int Attempts { get; set; }
    public bool Used { get; set; }
}

public class Role : BranchEntity
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = [];
}
