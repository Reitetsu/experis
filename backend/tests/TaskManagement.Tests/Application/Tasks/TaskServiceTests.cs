using TaskManagement.Application.Common.Exceptions;
using TaskManagement.Application.Tasks.DTOs;
using TaskManagement.Application.Tasks.Exceptions;
using TaskManagement.Application.Tasks.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Tests.TestDoubles;
using DomainTaskPriority = TaskManagement.Domain.Enums.TaskPriority;
using DomainTaskStatus = TaskManagement.Domain.Enums.TaskStatus;

namespace TaskManagement.Tests.Application.Tasks;

public class TaskServiceTests
{
    [Fact]
    public async Task GetAsync_WithoutFilters_PassesNullFiltersToRepository()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        _ = await service.GetAsync(new TaskFilterDto(), CancellationToken.None);

        Assert.Null(repository.ReceivedStatus);
        Assert.Null(repository.ReceivedPriority);
        Assert.Equal(1, repository.GetAsyncCallCount);
    }

    [Fact]
    public async Task GetAsync_WithStatusFilter_ParsesPendingAndPassesItToRepository()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        _ = await service.GetAsync(
            new TaskFilterDto { Status = "Pending" },
            CancellationToken.None);

        Assert.Equal(DomainTaskStatus.Pending, repository.ReceivedStatus);
        Assert.Null(repository.ReceivedPriority);
    }

    [Fact]
    public async Task GetAsync_WithPriorityFilter_ParsesHighAndPassesItToRepository()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        _ = await service.GetAsync(
            new TaskFilterDto { Priority = "High" },
            CancellationToken.None);

        Assert.Null(repository.ReceivedStatus);
        Assert.Equal(DomainTaskPriority.High, repository.ReceivedPriority);
    }

    [Fact]
    public async Task GetAsync_WithCombinedFilters_PassesParsedEnumsToRepository()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        _ = await service.GetAsync(
            new TaskFilterDto { Status = "Pending", Priority = "High" },
            CancellationToken.None);

        Assert.Equal(DomainTaskStatus.Pending, repository.ReceivedStatus);
        Assert.Equal(DomainTaskPriority.High, repository.ReceivedPriority);
    }

    [Fact]
    public async Task GetAsync_WithCaseInsensitiveFilters_AcceptsAndParsesValues()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        _ = await service.GetAsync(
            new TaskFilterDto { Status = "pending", Priority = "high" },
            CancellationToken.None);

        Assert.Equal(DomainTaskStatus.Pending, repository.ReceivedStatus);
        Assert.Equal(DomainTaskPriority.High, repository.ReceivedPriority);
    }

    [Fact]
    public async Task GetAsync_WithFiltersContainingWhitespace_NormalizesValuesBeforeParsing()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        _ = await service.GetAsync(
            new TaskFilterDto { Status = "  Pending  ", Priority = "  High  " },
            CancellationToken.None);

        Assert.Equal(DomainTaskStatus.Pending, repository.ReceivedStatus);
        Assert.Equal(DomainTaskPriority.High, repository.ReceivedPriority);
    }

    [Fact]
    public async Task GetAsync_WithEmptyFilters_TreatsThemAsNotProvided()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        _ = await service.GetAsync(
            new TaskFilterDto { Status = "   ", Priority = string.Empty },
            CancellationToken.None);

        Assert.Null(repository.ReceivedStatus);
        Assert.Null(repository.ReceivedPriority);
    }

    [Fact]
    public async Task GetAsync_WithInvalidStatus_ThrowsApplicationValidationException()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        var exception = await Assert.ThrowsAsync<ApplicationValidationException>(() =>
            service.GetAsync(new TaskFilterDto { Status = "Cancelled" }, CancellationToken.None));

        Assert.Equal(
            "Status must be Pending, InProgress or Completed.",
            Assert.Single(exception.Errors["Status"]));
    }

    [Fact]
    public async Task GetAsync_WithInvalidPriority_ThrowsApplicationValidationException()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        var exception = await Assert.ThrowsAsync<ApplicationValidationException>(() =>
            service.GetAsync(new TaskFilterDto { Priority = "Urgent" }, CancellationToken.None));

        Assert.Equal(
            "Priority must be Low, Medium or High.",
            Assert.Single(exception.Errors["Priority"]));
    }

    [Fact]
    public async Task GetAsync_WithBothInvalidFilters_ReturnsErrorsForStatusAndPriority()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        var exception = await Assert.ThrowsAsync<ApplicationValidationException>(() =>
            service.GetAsync(
                new TaskFilterDto { Status = "Cancelled", Priority = "Urgent" },
                CancellationToken.None));

        Assert.True(exception.Errors.ContainsKey("Status"));
        Assert.True(exception.Errors.ContainsKey("Priority"));
        Assert.Equal(2, exception.Errors.Count);
    }

    [Fact]
    public async Task GetAsync_WithNumericEnumValue_RejectsStatusFilter()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        var exception = await Assert.ThrowsAsync<ApplicationValidationException>(() =>
            service.GetAsync(new TaskFilterDto { Status = "1" }, CancellationToken.None));

        Assert.True(exception.Errors.ContainsKey("Status"));
    }

    [Fact]
    public async Task GetAsync_WhenValidationFails_DoesNotInvokeRepository()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        await Assert.ThrowsAsync<ApplicationValidationException>(() =>
            service.GetAsync(new TaskFilterDto { Priority = "999" }, CancellationToken.None));

        Assert.Equal(0, repository.GetAsyncCallCount);
    }

    [Fact]
    public async Task GetAsync_WithEntities_MapsAllFieldsToDtos()
    {
        var repository = CreateRepository(
            CreateTaskItem(
                id: 7,
                title: "Prepare deck",
                description: "Review all slides",
                priority: DomainTaskPriority.Medium,
                status: DomainTaskStatus.InProgress,
                createdAt: new DateTime(2026, 06, 29, 10, 30, 0, DateTimeKind.Utc)));
        var service = CreateService(repository);

        var result = await service.GetAsync(new TaskFilterDto(), CancellationToken.None);
        var task = Assert.Single(result);

        Assert.Equal(7, task.Id);
        Assert.Equal("Prepare deck", task.Title);
        Assert.Equal("Review all slides", task.Description);
        Assert.Equal(new DateTime(2026, 06, 29, 10, 30, 0, DateTimeKind.Utc), task.CreatedAt);
    }

    [Fact]
    public async Task GetAsync_WithEntities_ReturnsReadableEnumNamesInDto()
    {
        var repository = CreateRepository(
            CreateTaskItem(priority: DomainTaskPriority.High, status: DomainTaskStatus.InProgress));
        var service = CreateService(repository);

        var result = await service.GetAsync(new TaskFilterDto(), CancellationToken.None);
        var task = Assert.Single(result);

        Assert.Equal("High", task.Priority);
        Assert.Equal("InProgress", task.Status);
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsEmptyCollection_ReturnsEmptyCollection()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        var result = await service.GetAsync(new TaskFilterDto(), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetAsync_PassesTheSameCancellationTokenToRepository()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);
        using var cancellationTokenSource = new CancellationTokenSource();

        _ = await service.GetAsync(new TaskFilterDto(), cancellationTokenSource.Token);

        Assert.Equal(cancellationTokenSource.Token, repository.ReceivedListCancellationToken);
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_ReturnsMappedDto()
    {
        var repository = CreateRepository();
        repository.TaskByIdToReturn = CreateTaskItem(id: 3);
        var service = CreateService(repository);

        var result = await service.GetByIdAsync(3, CancellationToken.None);

        Assert.Equal(3, result.Id);
        Assert.Equal("High", result.Priority);
        Assert.Equal("Pending", result.Status);
    }

    [Fact]
    public async Task GetByIdAsync_WhenTaskDoesNotExist_ThrowsTaskNotFoundException()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        var exception = await Assert.ThrowsAsync<TaskNotFoundException>(() =>
            service.GetByIdAsync(99, CancellationToken.None));

        Assert.Equal(99, exception.TaskId);
        Assert.Equal("Task with id 99 was not found.", exception.Message);
    }

    [Fact]
    public async Task GetByIdAsync_WithZeroId_ThrowsApplicationValidationException()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        var exception = await Assert.ThrowsAsync<ApplicationValidationException>(() =>
            service.GetByIdAsync(0, CancellationToken.None));

        Assert.Equal("Id must be greater than zero.", Assert.Single(exception.Errors["Id"]));
    }

    [Fact]
    public async Task GetByIdAsync_WithNegativeId_ThrowsApplicationValidationException()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        var exception = await Assert.ThrowsAsync<ApplicationValidationException>(() =>
            service.GetByIdAsync(-5, CancellationToken.None));

        Assert.Equal("Id must be greater than zero.", Assert.Single(exception.Errors["Id"]));
    }

    [Fact]
    public async Task GetByIdAsync_WithInvalidId_DoesNotInvokeRepository()
    {
        var repository = CreateRepository();
        var service = CreateService(repository);

        await Assert.ThrowsAsync<ApplicationValidationException>(() =>
            service.GetByIdAsync(0, CancellationToken.None));

        Assert.Equal(0, repository.GetByIdAsyncCallCount);
    }

    [Fact]
    public async Task GetByIdAsync_PassesTheSameCancellationTokenToRepository()
    {
        var repository = CreateRepository();
        repository.TaskByIdToReturn = CreateTaskItem(id: 11);
        var service = CreateService(repository);
        using var cancellationTokenSource = new CancellationTokenSource();

        _ = await service.GetByIdAsync(11, cancellationTokenSource.Token);

        Assert.Equal(cancellationTokenSource.Token, repository.ReceivedByIdCancellationToken);
    }

    private static TaskService CreateService(FakeTaskRepository repository)
    {
        return new TaskService(repository);
    }

    private static FakeTaskRepository CreateRepository(params TaskItem[] tasks)
    {
        return new FakeTaskRepository
        {
            TasksToReturn = tasks
        };
    }

    private static TaskItem CreateTaskItem(
        int id = 1,
        string title = "Sample task",
        string description = "Sample description",
        DomainTaskPriority priority = DomainTaskPriority.High,
        DomainTaskStatus status = DomainTaskStatus.Pending,
        DateTime? createdAt = null)
    {
        return new TaskItem
        {
            Id = id,
            Title = title,
            Description = description,
            Priority = priority,
            Status = status,
            CreatedAt = createdAt ?? new DateTime(2026, 06, 29, 12, 0, 0, DateTimeKind.Utc)
        };
    }
}
