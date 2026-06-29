namespace TaskManagement.Application.Common.Exceptions;

public class ApplicationValidationException : Exception
{
    public ApplicationValidationException(IReadOnlyDictionary<string, string[]> errors)
        : base("One or more validation errors occurred.")
    {
        ArgumentNullException.ThrowIfNull(errors);

        Errors = errors.ToDictionary(
            pair => pair.Key,
            pair => pair.Value.ToArray(),
            StringComparer.Ordinal);
    }

    public IReadOnlyDictionary<string, string[]> Errors { get; }
}
