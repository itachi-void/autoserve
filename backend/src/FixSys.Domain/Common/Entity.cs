namespace FixSys.Domain.Common;

public abstract class Entity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>Entity scoped to a branch; automatically filtered by the caller's branch.</summary>
public abstract class BranchEntity : Entity
{
    public Guid BranchId { get; set; }
}
