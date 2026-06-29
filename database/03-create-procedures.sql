IF DB_ID(N'TaskManagementDb') IS NULL
BEGIN
    THROW 51000, 'TaskManagementDb does not exist. Run 01-create-database.sql first.', 1;
END;
GO

USE TaskManagementDb;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Tasks_Get
    @Status VARCHAR(20) = NULL,
    @Priority VARCHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Id,
        Title,
        Description,
        Priority,
        Status,
        CreatedAt
    FROM dbo.Tasks
    WHERE (@Status IS NULL OR Status = @Status)
      AND (@Priority IS NULL OR Priority = @Priority)
    ORDER BY CreatedAt DESC, Id DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Tasks_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Id,
        Title,
        Description,
        Priority,
        Status,
        CreatedAt
    FROM dbo.Tasks
    WHERE Id = @Id;
END;
GO
