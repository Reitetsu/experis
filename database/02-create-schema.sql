IF DB_ID(N'TaskManagementDb') IS NULL
BEGIN
    THROW 51000, 'TaskManagementDb does not exist. Run 01-create-database.sql first.', 1;
END;
GO

USE TaskManagementDb;
GO

IF OBJECT_ID(N'dbo.Tasks', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Tasks
    (
        Id INT IDENTITY(1,1) NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(2000) NOT NULL,
        Priority VARCHAR(10) NOT NULL,
        Status VARCHAR(20) NOT NULL,
        CreatedAt DATETIME2(0) NOT NULL
            CONSTRAINT DF_Tasks_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_Tasks PRIMARY KEY CLUSTERED (Id),
        CONSTRAINT CK_Tasks_Title_NotEmpty
            CHECK (LEN(LTRIM(RTRIM(Title))) > 0),
        CONSTRAINT CK_Tasks_Description_NotEmpty
            CHECK (LEN(LTRIM(RTRIM(Description))) > 0),
        CONSTRAINT CK_Tasks_Priority
            CHECK (Priority IN ('Low', 'Medium', 'High')),
        CONSTRAINT CK_Tasks_Status
            CHECK (Status IN ('Pending', 'InProgress', 'Completed'))
    );

    PRINT N'Table dbo.Tasks created.';
END;
ELSE
BEGIN
    PRINT N'Table dbo.Tasks already exists.';
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Tasks')
      AND name = N'IX_Tasks_Status_Priority'
)
BEGIN
    CREATE INDEX IX_Tasks_Status_Priority
        ON dbo.Tasks (Status, Priority);

    PRINT N'Index IX_Tasks_Status_Priority created.';
END;
ELSE
BEGIN
    PRINT N'Index IX_Tasks_Status_Priority already exists.';
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Tasks')
      AND name = N'IX_Tasks_Priority'
)
BEGIN
    CREATE INDEX IX_Tasks_Priority
        ON dbo.Tasks (Priority);

    PRINT N'Index IX_Tasks_Priority created.';
END;
ELSE
BEGIN
    PRINT N'Index IX_Tasks_Priority already exists.';
END;
GO
