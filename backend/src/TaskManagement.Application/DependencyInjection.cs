using Microsoft.Extensions.DependencyInjection;
using TaskManagement.Application.Tasks.Interfaces;
using TaskManagement.Application.Tasks.Services;

namespace TaskManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddScoped<ITaskService, TaskService>();
        return services;
    }
}
