using DomainTaskPriority = TaskManagement.Domain.Enums.TaskPriority;
using DomainTaskStatus = TaskManagement.Domain.Enums.TaskStatus;

namespace TaskManagement.Application.Tasks.Validation;

public sealed record ValidatedTaskFilter(
    DomainTaskStatus? Status,
    DomainTaskPriority? Priority);
