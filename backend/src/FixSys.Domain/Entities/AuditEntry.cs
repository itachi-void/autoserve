using FixSys.Domain.Common;

namespace FixSys.Domain.Entities;

public class AuditEntry : BranchEntity
{
    public Guid? ActorId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public Guid RecordId { get; set; }
    public string Action { get; set; } = string.Empty;
}
