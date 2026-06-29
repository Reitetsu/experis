using TaskManagement.Application.Tasks.DTOs;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Tasks.Mappings;

public static class TaskMappings
{
    public static TaskDto ToDto(this TaskItem task)
    {
        ArgumentNullException.ThrowIfNull(task);

        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Priority = task.Priority.ToString(),
            Status = task.Status.ToString(),
            CreatedAt = task.CreatedAt
        };
    }
}
