using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using TaskManagement.Application.Tasks.Interfaces;
using TaskManagement.Tests.TestDoubles;

namespace TaskManagement.Tests.Api;

public sealed class TaskManagementApiFactory : WebApplicationFactory<Program>
{
    private const string TestConnectionString =
        "Server=(localdb)\\TaskManagementLocalDb;Database=TaskManagementDb;Integrated Security=true;TrustServerCertificate=true;";

    public FakeTaskRepository Repository { get; } = new();

    public TaskManagementApiFactory()
    {
        Environment.SetEnvironmentVariable(
            "ConnectionStrings__TaskManagement",
            TestConnectionString);
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((_, configurationBuilder) =>
        {
            configurationBuilder.AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["ConnectionStrings:TaskManagement"] = TestConnectionString
                });
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<ITaskRepository>();
            services.AddSingleton(Repository);
            services.AddScoped<ITaskRepository>(
                serviceProvider => serviceProvider.GetRequiredService<FakeTaskRepository>());
        });
    }
}
