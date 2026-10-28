using FixSys.Domain.Common;

namespace FixSys.Domain.Entities;

public class Branch : Entity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public bool IsTrial { get; set; }
    public DateTime? TrialExpiresAt { get; set; }
}

public class Department : BranchEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Color { get; set; } = string.Empty;
    public Guid? HeadEmployeeId { get; set; }
    public Employee? HeadEmployee { get; set; }
    public List<Employee> Employees { get; set; } = [];
}

public class Employee : BranchEntity
{
    public string Name { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public Department? Department { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public EmployeeStatus Status { get; set; } = EmployeeStatus.Active;
    public string? StatusReason { get; set; }
    public decimal BasicSalary { get; set; }
    public DateOnly JoinDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
}

public class Technician : BranchEntity
{
    public Guid EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    public string Specialty { get; set; } = string.Empty;
    public TechnicianStatus Status { get; set; } = TechnicianStatus.Available;
    public int MaxTasks { get; set; } = 3;
    public decimal Rating { get; set; }
    public int CompletedJobs { get; set; }
    public decimal Efficiency { get; set; }
    public List<TechnicianTimeLog> TimeLogs { get; set; } = [];
}

public class TechnicianTimeLog : Entity
{
    public Guid TechnicianId { get; set; }
    public Guid? WorkOrderId { get; set; }
    public string Task { get; set; } = string.Empty;
    public DateTime ClockIn { get; set; } = DateTime.UtcNow;
    public DateTime? ClockOut { get; set; }
    public TaskClockStatus Status { get; set; } = TaskClockStatus.Running;
}
