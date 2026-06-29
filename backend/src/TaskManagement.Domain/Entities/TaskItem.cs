using DomainTaskPriority = TaskManagement.Domain.Enums.TaskPriority;
using DomainTaskStatus = TaskManagement.Domain.Enums.TaskStatus;

namespace TaskManagement.Domain.Entities;

public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DomainTaskPriority Priority { get; set; }

    public DomainTaskStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }
}
