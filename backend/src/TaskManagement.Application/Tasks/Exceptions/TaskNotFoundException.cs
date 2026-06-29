namespace TaskManagement.Application.Tasks.Exceptions;

public class TaskNotFoundException : Exception
{
    public TaskNotFoundException(int taskId)
        : base($"Task with id {taskId} was not found.")
    {
        TaskId = taskId;
    }

    public int TaskId { get; }
}
