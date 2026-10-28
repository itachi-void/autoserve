using FixSys.Domain.Common;

namespace FixSys.Domain.Entities;

public class ServiceCategory : BranchEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Icon { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public List<ServiceItem> Services { get; set; } = [];
}

public class ServiceItem : BranchEntity
{
    public string Name { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public ServiceCategory? Category { get; set; }
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public decimal? ExtraPrice { get; set; }
    public decimal DurationHours { get; set; }
    public PricingModel PricingModel { get; set; } = PricingModel.Fixed;
    public string? RequiredBayType { get; set; }
    public string? RequiredSpecialty { get; set; }
    public ActiveStatus Status { get; set; } = ActiveStatus.Active;
}
