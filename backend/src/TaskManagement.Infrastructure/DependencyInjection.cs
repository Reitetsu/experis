using Microsoft.Extensions.DependencyInjection;
using TaskManagement.Application.Tasks.Interfaces;
using TaskManagement.Infrastructure.Data;
using TaskManagement.Infrastructure.Tasks.Repositories;

namespace TaskManagement.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        string connectionString)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);

        services.AddSingleton<ISqlConnectionFactory>(
            _ => new SqlConnectionFactory(connectionString));
        services.AddScoped<ITaskRepository, TaskRepository>();

        return services;
    }
}
