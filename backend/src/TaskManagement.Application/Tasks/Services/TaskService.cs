using TaskManagement.Application.Common.Exceptions;
using TaskManagement.Application.Tasks.DTOs;
using TaskManagement.Application.Tasks.Exceptions;
using TaskManagement.Application.Tasks.Interfaces;
using TaskManagement.Application.Tasks.Mappings;
using TaskManagement.Application.Tasks.Validation;

namespace TaskManagement.Application.Tasks.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly TaskFilterValidator _taskFilterValidator = new();

    public TaskService(ITaskRepository taskRepository)
    {
        ArgumentNullException.ThrowIfNull(taskRepository);
        _taskRepository = taskRepository;
    }

    public async Task<IReadOnlyCollection<TaskDto>> GetAsync(
        TaskFilterDto filter,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(filter);

        var validatedFilter = _taskFilterValidator.Validate(filter);

        var tasks = await _taskRepository.GetAsync(
            validatedFilter.Status,
            validatedFilter.Priority,
            cancellationToken);

        return tasks.Select(task => task.ToDto()).ToArray();
    }

    public async Task<TaskDto> GetByIdAsync(
        int id,
        CancellationToken cancellationToken)
    {
        if (id <= 0)
        {
            throw new ApplicationValidationException(new Dictionary<string, string[]>
            {
                ["Id"] = ["Id must be greater than zero."]
            });
        }

        var task = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (task is null)
        {
            throw new TaskNotFoundException(id);
        }

        return task.ToDto();
    }
}
