using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.Common.Exceptions;
using TaskManagement.Application.Tasks.Exceptions;

namespace TaskManagement.Api.ExceptionHandling;

internal sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly IProblemDetailsService _problemDetailsService;
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(
        IProblemDetailsService problemDetailsService,
        ILogger<GlobalExceptionHandler> logger)
    {
        ArgumentNullException.ThrowIfNull(problemDetailsService);
        ArgumentNullException.ThrowIfNull(logger);

        _problemDetailsService = problemDetailsService;
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(httpContext);
        ArgumentNullException.ThrowIfNull(exception);

        var problemDetails = CreateProblemDetails(exception, out var statusCode);
        httpContext.Response.StatusCode = statusCode;

        return await _problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problemDetails,
            Exception = exception
        });
    }

    private ProblemDetails CreateProblemDetails(
        Exception exception,
        out int statusCode)
    {
        switch (exception)
        {
            case ApplicationValidationException validationException:
                statusCode = StatusCodes.Status400BadRequest;
                _logger.LogInformation("A validation error occurred while processing the request.");

                return new HttpValidationProblemDetails(validationException.Errors)
                {
                    Title = "One or more validation errors occurred.",
                    Status = statusCode
                };

            case TaskNotFoundException notFoundException:
                statusCode = StatusCodes.Status404NotFound;
                _logger.LogInformation(
                    "Task with id {TaskId} was not found.",
                    notFoundException.TaskId);

                return new ProblemDetails
                {
                    Title = "Task not found.",
                    Detail = notFoundException.Message,
                    Status = statusCode
                };

            default:
                statusCode = StatusCodes.Status500InternalServerError;
                _logger.LogError(
                    exception,
                    "An unexpected error occurred while processing the request.");

                return new ProblemDetails
                {
                    Title = "An unexpected error occurred.",
                    Detail = "An unexpected error occurred while processing the request.",
                    Status = statusCode
                };
        }
    }
}
