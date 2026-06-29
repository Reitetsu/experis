using System.Data;
using Dapper;
using TaskManagement.Application.Tasks.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Data;
using TaskManagement.Infrastructure.Tasks.Mappings;
using TaskManagement.Infrastructure.Tasks.Models;
using DomainTaskPriority = TaskManagement.Domain.Enums.TaskPriority;
using DomainTaskStatus = TaskManagement.Domain.Enums.TaskStatus;

namespace TaskManagement.Infrastructure.Tasks.Repositories;

internal sealed class TaskRepository : ITaskRepository
{
    private const string GetTasksProcedure = "dbo.usp_Tasks_Get";
    private const string GetTaskByIdProcedure = "dbo.usp_Tasks_GetById";

    private readonly ISqlConnectionFactory _sqlConnectionFactory;

    public TaskRepository(ISqlConnectionFactory sqlConnectionFactory)
    {
        ArgumentNullException.ThrowIfNull(sqlConnectionFactory);
        _sqlConnectionFactory = sqlConnectionFactory;
    }

    public async Task<IReadOnlyCollection<TaskItem>> GetAsync(
        DomainTaskStatus? status,
        DomainTaskPriority? priority,
        CancellationToken cancellationToken)
    {
        await using var connection = _sqlConnectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        var command = new CommandDefinition(
            commandText: GetTasksProcedure,
            parameters: new
            {
                Status = status?.ToString(),
                Priority = priority?.ToString()
            },
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var records = await connection.QueryAsync<TaskRecord>(command);

        return records
            .Select(record => record.ToDomain())
            .ToArray();
    }

    public async Task<TaskItem?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken)
    {
        await using var connection = _sqlConnectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        var command = new CommandDefinition(
            commandText: GetTaskByIdProcedure,
            parameters: new
            {
                Id = id
            },
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var record = await connection.QuerySingleOrDefaultAsync<TaskRecord>(command);

        return record?.ToDomain();
    }
}
