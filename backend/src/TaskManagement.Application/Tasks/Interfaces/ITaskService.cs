using TaskManagement.Application.Tasks.DTOs;

namespace TaskManagement.Application.Tasks.Interfaces;

public interface ITaskService
{
    Task<IReadOnlyCollection<TaskDto>> GetAsync(
        TaskFilterDto filter,
        CancellationToken cancellationToken);

    Task<TaskDto> GetByIdAsync(
        int id,
        CancellationToken cancellationToken);
}
