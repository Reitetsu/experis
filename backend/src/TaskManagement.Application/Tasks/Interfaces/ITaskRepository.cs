using DomainTaskPriority = TaskManagement.Domain.Enums.TaskPriority;
using DomainTaskStatus = TaskManagement.Domain.Enums.TaskStatus;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Tasks.Interfaces;

public interface ITaskRepository
{
    Task<IReadOnlyCollection<TaskItem>> GetAsync(
        DomainTaskStatus? status,
        DomainTaskPriority? priority,
        CancellationToken cancellationToken);

    Task<TaskItem?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken);
}
