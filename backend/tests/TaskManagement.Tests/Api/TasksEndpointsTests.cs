using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using TaskManagement.Application.Tasks.DTOs;
using TaskManagement.Domain.Entities;
using DomainTaskPriority = TaskManagement.Domain.Enums.TaskPriority;
using DomainTaskStatus = TaskManagement.Domain.Enums.TaskStatus;

namespace TaskManagement.Tests.Api;

public class TasksEndpointsTests
{
    [Fact]
    public async Task GetTasks_ReturnsOkWithJsonCollection()
    {
        using var factory = new TaskManagementApiFactory();
        factory.Repository.TasksToReturn =
        [
            CreateTaskItem(1, "Plan sprint", DomainTaskStatus.Pending, DomainTaskPriority.High),
            CreateTaskItem(2, "Review PR", DomainTaskStatus.Completed, DomainTaskPriority.Medium)
        ];

        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/tasks");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);

        var tasks = await response.Content.ReadFromJsonAsync<List<TaskDto>>();

        Assert.NotNull(tasks);
        Assert.Equal(2, tasks.Count);
        Assert.Equal("Plan sprint", tasks[0].Title);
        Assert.Equal("Pending", tasks[0].Status);
    }

    [Fact]
    public async Task GetTasks_WithValidFilters_PassesParsedEnumsToRepository()
    {
        using var factory = new TaskManagementApiFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/tasks?status=InProgress&priority=High");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(DomainTaskStatus.InProgress, factory.Repository.ReceivedStatus);
        Assert.Equal(DomainTaskPriority.High, factory.Repository.ReceivedPriority);
    }

    [Fact]
    public async Task GetTasks_WithInvalidStatus_ReturnsValidationProblemDetails()
    {
        using var factory = new TaskManagementApiFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/tasks?status=Cancelled");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);

        using var document = await ReadJsonDocumentAsync(response);

        Assert.Equal(
            "One or more validation errors occurred.",
            document.RootElement.GetProperty("title").GetString());
        Assert.Equal(
            "Status must be Pending, InProgress or Completed.",
            document.RootElement.GetProperty("errors").GetProperty("Status")[0].GetString());
    }

    [Fact]
    public async Task GetTasks_WithTwoInvalidFilters_ReturnsBothValidationErrors()
    {
        using var factory = new TaskManagementApiFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/tasks?status=Done&priority=Urgent");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var document = await ReadJsonDocumentAsync(response);
        var errors = document.RootElement.GetProperty("errors");

        Assert.Equal(
            "Status must be Pending, InProgress or Completed.",
            errors.GetProperty("Status")[0].GetString());
        Assert.Equal(
            "Priority must be Low, Medium or High.",
            errors.GetProperty("Priority")[0].GetString());
    }

    [Fact]
    public async Task GetTaskById_ReturnsOkWithTaskDto()
    {
        using var factory = new TaskManagementApiFactory();
        factory.Repository.TaskByIdToReturn =
            CreateTaskItem(7, "Ship release", DomainTaskStatus.Completed, DomainTaskPriority.High);

        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/tasks/7");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var task = await response.Content.ReadFromJsonAsync<TaskDto>();

        Assert.NotNull(task);
        Assert.Equal(7, task.Id);
        Assert.Equal("Ship release", task.Title);
        Assert.Equal("Completed", task.Status);
        Assert.Equal("High", task.Priority);
    }

    [Fact]
    public async Task GetTaskById_WhenTaskDoesNotExist_ReturnsNotFoundProblemDetails()
    {
        using var factory = new TaskManagementApiFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/tasks/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);

        using var document = await ReadJsonDocumentAsync(response);

        Assert.Equal("Task not found.", document.RootElement.GetProperty("title").GetString());
        Assert.Equal(
            "Task with id 999999 was not found.",
            document.RootElement.GetProperty("detail").GetString());
    }

    [Fact]
    public async Task GetTaskById_WithZeroId_ReturnsValidationProblemDetails()
    {
        using var factory = new TaskManagementApiFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/tasks/0");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var document = await ReadJsonDocumentAsync(response);

        Assert.Equal(
            "Id must be greater than zero.",
            document.RootElement.GetProperty("errors").GetProperty("Id")[0].GetString());
    }

    [Fact]
    public async Task GetTasks_WhenUnexpectedExceptionOccurs_ReturnsInternalServerError()
    {
        using var factory = new TaskManagementApiFactory();
        factory.Repository.ExceptionToThrowOnGetAsync = new InvalidOperationException("sql down");

        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/tasks");

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);

        using var document = await ReadJsonDocumentAsync(response);

        Assert.Equal(
            "An unexpected error occurred.",
            document.RootElement.GetProperty("title").GetString());
    }

    [Fact]
    public async Task GetTasks_InternalServerError_DoesNotLeakExceptionDetails()
    {
        using var factory = new TaskManagementApiFactory();
        factory.Repository.ExceptionToThrowOnGetAsync = new InvalidOperationException("sensitive failure");

        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/tasks");

        using var document = await ReadJsonDocumentAsync(response);

        Assert.Equal(
            "An unexpected error occurred while processing the request.",
            document.RootElement.GetProperty("detail").GetString());
        Assert.DoesNotContain(
            "sensitive failure",
            document.RootElement.GetRawText(),
            StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetTasks_ValidationError_IncludesTraceId()
    {
        using var factory = new TaskManagementApiFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/tasks?status=Invalid");

        using var document = await ReadJsonDocumentAsync(response);

        Assert.True(
            document.RootElement.TryGetProperty("traceId", out var traceIdProperty));
        Assert.False(string.IsNullOrWhiteSpace(traceIdProperty.GetString()));
    }

    [Fact]
    public async Task OpenApiDocument_IsAvailableInDevelopment()
    {
        using var factory = new TaskManagementApiFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/openapi/v1.json");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task OpenApiDocument_ContainsTasksPath()
    {
        using var factory = new TaskManagementApiFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/openapi/v1.json");
        using var document = await ReadJsonDocumentAsync(response);

        Assert.True(
            document.RootElement.GetProperty("paths").TryGetProperty("/api/tasks", out _));
    }

    [Fact]
    public async Task SwaggerUi_IsAvailableInDevelopment()
    {
        using var factory = new TaskManagementApiFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/swagger/index.html");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/html", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task GetTasks_PassesCancelableRequestTokenToRepository()
    {
        using var factory = new TaskManagementApiFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/tasks");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(factory.Repository.ReceivedListCancellationToken.CanBeCanceled);
    }

    [Fact]
    public async Task GetTaskById_PassesCancelableRequestTokenToRepository()
    {
        using var factory = new TaskManagementApiFactory();
        factory.Repository.TaskByIdToReturn =
            CreateTaskItem(3, "Refine backlog", DomainTaskStatus.InProgress, DomainTaskPriority.Low);

        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/tasks/3");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(factory.Repository.ReceivedByIdCancellationToken.CanBeCanceled);
    }

    private static TaskItem CreateTaskItem(
        int id,
        string title,
        DomainTaskStatus status,
        DomainTaskPriority priority)
    {
        return new TaskItem
        {
            Id = id,
            Title = title,
            Description = $"{title} description",
            Status = status,
            Priority = priority,
            CreatedAt = new DateTime(2026, 6, 1, 8, 30, 0, DateTimeKind.Utc)
        };
    }

    private static async Task<JsonDocument> ReadJsonDocumentAsync(HttpResponseMessage response)
    {
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    }
}
