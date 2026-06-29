using TaskManagement.Application.Common.Exceptions;
using TaskManagement.Application.Tasks.DTOs;
using DomainTaskPriority = TaskManagement.Domain.Enums.TaskPriority;
using DomainTaskStatus = TaskManagement.Domain.Enums.TaskStatus;

namespace TaskManagement.Application.Tasks.Validation;

public class TaskFilterValidator
{
    private static readonly IReadOnlyDictionary<string, DomainTaskStatus> AllowedStatuses =
        new Dictionary<string, DomainTaskStatus>(StringComparer.OrdinalIgnoreCase)
        {
            ["Pending"] = DomainTaskStatus.Pending,
            ["InProgress"] = DomainTaskStatus.InProgress,
            ["Completed"] = DomainTaskStatus.Completed
        };

    private static readonly IReadOnlyDictionary<string, DomainTaskPriority> AllowedPriorities =
        new Dictionary<string, DomainTaskPriority>(StringComparer.OrdinalIgnoreCase)
        {
            ["Low"] = DomainTaskPriority.Low,
            ["Medium"] = DomainTaskPriority.Medium,
            ["High"] = DomainTaskPriority.High
        };

    public ValidatedTaskFilter Validate(TaskFilterDto filter)
    {
        ArgumentNullException.ThrowIfNull(filter);

        var errors = new Dictionary<string, string[]>(StringComparer.Ordinal);

        var status = ParseStatus(filter.Status, errors);
        var priority = ParsePriority(filter.Priority, errors);

        if (errors.Count > 0)
        {
            throw new ApplicationValidationException(errors);
        }

        return new ValidatedTaskFilter(status, priority);
    }

    private static DomainTaskStatus? ParseStatus(
        string? rawStatus,
        IDictionary<string, string[]> errors)
    {
        var normalized = Normalize(rawStatus);
        if (normalized is null)
        {
            return null;
        }

        if (AllowedStatuses.TryGetValue(normalized, out var status))
        {
            return status;
        }

        errors["Status"] = ["Status must be Pending, InProgress or Completed."];
        return null;
    }

    private static DomainTaskPriority? ParsePriority(
        string? rawPriority,
        IDictionary<string, string[]> errors)
    {
        var normalized = Normalize(rawPriority);
        if (normalized is null)
        {
            return null;
        }

        if (AllowedPriorities.TryGetValue(normalized, out var priority))
        {
            return priority;
        }

        errors["Priority"] = ["Priority must be Low, Medium or High."];
        return null;
    }

    private static string? Normalize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Trim();
    }
}
