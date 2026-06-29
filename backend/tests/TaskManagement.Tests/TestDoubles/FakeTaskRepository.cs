using TaskManagement.Application.Tasks.Interfaces;
using TaskManagement.Domain.Entities;
using DomainTaskPriority = TaskManagement.Domain.Enums.TaskPriority;
using DomainTaskStatus = TaskManagement.Domain.Enums.TaskStatus;

namespace TaskManagement.Tests.TestDoubles;

public class FakeTaskRepository : ITaskRepository
{
    public IReadOnlyCollection<TaskItem> TasksToReturn { get; set; } = Array.Empty<TaskItem>();

    public TaskItem? TaskByIdToReturn { get; set; }

    public Exception? ExceptionToThrowOnGetAsync { get; set; }

    public Exception? ExceptionToThrowOnGetByIdAsync { get; set; }

    public DomainTaskStatus? ReceivedStatus { get; private set; }

    public DomainTaskPriority? ReceivedPriority { get; private set; }

    public int? ReceivedId { get; private set; }

    public CancellationToken ReceivedListCancellationToken { get; private set; }

    public CancellationToken ReceivedByIdCancellationToken { get; private set; }

    public int GetAsyncCallCount { get; private set; }

    public int GetByIdAsyncCallCount { get; private set; }

    public void Reset()
    {
        TasksToReturn = Array.Empty<TaskItem>();
        TaskByIdToReturn = null;
        ExceptionToThrowOnGetAsync = null;
        ExceptionToThrowOnGetByIdAsync = null;
        ReceivedStatus = null;
        ReceivedPriority = null;
        ReceivedId = null;
        ReceivedListCancellationToken = default;
        ReceivedByIdCancellationToken = default;
        GetAsyncCallCount = 0;
        GetByIdAsyncCallCount = 0;
    }

    public Task<IReadOnlyCollection<TaskItem>> GetAsync(
        DomainTaskStatus? status,
        DomainTaskPriority? priority,
        CancellationToken cancellationToken)
    {
        if (ExceptionToThrowOnGetAsync is not null)
        {
            throw ExceptionToThrowOnGetAsync;
        }

        GetAsyncCallCount++;
        ReceivedStatus = status;
        ReceivedPriority = priority;
        ReceivedListCancellationToken = cancellationToken;

        return Task.FromResult(TasksToReturn);
    }

    public Task<TaskItem?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken)
    {
        if (ExceptionToThrowOnGetByIdAsync is not null)
        {
            throw ExceptionToThrowOnGetByIdAsync;
        }

        GetByIdAsyncCallCount++;
        ReceivedId = id;
        ReceivedByIdCancellationToken = cancellationToken;

        return Task.FromResult(TaskByIdToReturn);
    }
}
