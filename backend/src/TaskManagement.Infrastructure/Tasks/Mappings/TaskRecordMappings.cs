using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Tasks.Models;
using DomainTaskPriority = TaskManagement.Domain.Enums.TaskPriority;
using DomainTaskStatus = TaskManagement.Domain.Enums.TaskStatus;

namespace TaskManagement.Infrastructure.Tasks.Mappings;

internal static class TaskRecordMappings
{
    public static TaskItem ToDomain(this TaskRecord record)
    {
        ArgumentNullException.ThrowIfNull(record);

        return new TaskItem
        {
            Id = record.Id,
            Title = record.Title,
            Description = record.Description,
            Priority = MapPriority(record.Priority),
            Status = MapStatus(record.Status),
            CreatedAt = record.CreatedAt
        };
    }

    private static DomainTaskPriority MapPriority(string priority)
    {
        return priority switch
        {
            "Low" => DomainTaskPriority.Low,
            "Medium" => DomainTaskPriority.Medium,
            "High" => DomainTaskPriority.High,
            _ => throw new InvalidOperationException(
                "Unsupported task priority value returned by the database.")
        };
    }

    private static DomainTaskStatus MapStatus(string status)
    {
        return status switch
        {
            "Pending" => DomainTaskStatus.Pending,
            "InProgress" => DomainTaskStatus.InProgress,
            "Completed" => DomainTaskStatus.Completed,
            _ => throw new InvalidOperationException(
                "Unsupported task status value returned by the database.")
        };
    }
}
