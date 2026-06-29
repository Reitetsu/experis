IF DB_ID(N'TaskManagementDb') IS NULL
BEGIN
    THROW 51000, 'TaskManagementDb does not exist. Run 01-create-database.sql first.', 1;
END;
GO

USE TaskManagementDb;
GO

IF OBJECT_ID(N'dbo.Tasks', N'U') IS NULL
BEGIN
    THROW 51000, 'Verification failed: dbo.Tasks does not exist.', 1;
END;

IF (SELECT COUNT(*) FROM dbo.Tasks) <> 9
BEGIN
    THROW 51000, 'Verification failed: dbo.Tasks must contain exactly nine rows after seed.', 1;
END;

DECLARE @ProcedureColumns TABLE
(
    ColumnOrdinal INT NOT NULL,
    ColumnName SYSNAME NOT NULL
);

INSERT INTO @ProcedureColumns (ColumnOrdinal, ColumnName)
SELECT
    column_ordinal,
    name
FROM sys.dm_exec_describe_first_result_set_for_object(
    OBJECT_ID(N'dbo.usp_Tasks_Get'),
    NULL)
WHERE is_hidden = 0;

IF (SELECT COUNT(*) FROM @ProcedureColumns) <> 6
BEGIN
    THROW 51000, 'Verification failed: dbo.usp_Tasks_Get must expose exactly six visible columns.', 1;
END;

IF EXISTS
(
    SELECT 1
    FROM
    (
        VALUES
            (1, N'Id'),
            (2, N'Title'),
            (3, N'Description'),
            (4, N'Priority'),
            (5, N'Status'),
            (6, N'CreatedAt')
    ) AS Expected(ColumnOrdinal, ColumnName)
    FULL OUTER JOIN @ProcedureColumns AS Actual
        ON Expected.ColumnOrdinal = Actual.ColumnOrdinal
       AND Expected.ColumnName = Actual.ColumnName
    WHERE Expected.ColumnOrdinal IS NULL
       OR Actual.ColumnOrdinal IS NULL
)
BEGIN
    THROW 51000, 'Verification failed: dbo.usp_Tasks_Get columns do not match the expected contract.', 1;
END;

DELETE FROM @ProcedureColumns;

INSERT INTO @ProcedureColumns (ColumnOrdinal, ColumnName)
SELECT
    column_ordinal,
    name
FROM sys.dm_exec_describe_first_result_set_for_object(
    OBJECT_ID(N'dbo.usp_Tasks_GetById'),
    NULL)
WHERE is_hidden = 0;

IF (SELECT COUNT(*) FROM @ProcedureColumns) <> 6
BEGIN
    THROW 51000, 'Verification failed: dbo.usp_Tasks_GetById must expose exactly six visible columns.', 1;
END;

IF EXISTS
(
    SELECT 1
    FROM
    (
        VALUES
            (1, N'Id'),
            (2, N'Title'),
            (3, N'Description'),
            (4, N'Priority'),
            (5, N'Status'),
            (6, N'CreatedAt')
    ) AS Expected(ColumnOrdinal, ColumnName)
    FULL OUTER JOIN @ProcedureColumns AS Actual
        ON Expected.ColumnOrdinal = Actual.ColumnOrdinal
       AND Expected.ColumnName = Actual.ColumnName
    WHERE Expected.ColumnOrdinal IS NULL
       OR Actual.ColumnOrdinal IS NULL
)
BEGIN
    THROW 51000, 'Verification failed: dbo.usp_Tasks_GetById columns do not match the expected contract.', 1;
END;

CREATE TABLE #TaskResults
(
    RowNumber INT IDENTITY(1,1) NOT NULL,
    Id INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(2000) NOT NULL,
    Priority VARCHAR(10) NOT NULL,
    Status VARCHAR(20) NOT NULL,
    CreatedAt DATETIME2(0) NOT NULL
);

INSERT INTO #TaskResults (Id, Title, Description, Priority, Status, CreatedAt)
EXEC dbo.usp_Tasks_Get;

IF (SELECT COUNT(*) FROM #TaskResults) <> 9
BEGIN
    THROW 51000, 'Verification failed: dbo.usp_Tasks_Get without filters must return nine rows.', 1;
END;

DECLARE
    @ExpectedFirstId INT,
    @ExpectedFirstCreatedAt DATETIME2(0),
    @ActualFirstId INT,
    @ActualFirstCreatedAt DATETIME2(0);

SELECT TOP (1)
    @ExpectedFirstId = Id,
    @ExpectedFirstCreatedAt = CreatedAt
FROM dbo.Tasks
ORDER BY CreatedAt DESC, Id DESC;

SELECT
    @ActualFirstId = Id,
    @ActualFirstCreatedAt = CreatedAt
FROM #TaskResults
WHERE RowNumber = 1;

IF @ExpectedFirstId <> @ActualFirstId
   OR @ExpectedFirstCreatedAt <> @ActualFirstCreatedAt
BEGIN
    THROW 51000, 'Verification failed: dbo.usp_Tasks_Get ordering must be CreatedAt DESC, Id DESC.', 1;
END;

TRUNCATE TABLE #TaskResults;

INSERT INTO #TaskResults (Id, Title, Description, Priority, Status, CreatedAt)
EXEC dbo.usp_Tasks_Get @Status = 'Pending';

IF (SELECT COUNT(*) FROM #TaskResults) <> 3
BEGIN
    THROW 51000, 'Verification failed: Pending filter must return three rows.', 1;
END;

TRUNCATE TABLE #TaskResults;

INSERT INTO #TaskResults (Id, Title, Description, Priority, Status, CreatedAt)
EXEC dbo.usp_Tasks_Get @Priority = 'High';

IF (SELECT COUNT(*) FROM #TaskResults) <> 3
BEGIN
    THROW 51000, 'Verification failed: High priority filter must return three rows.', 1;
END;

TRUNCATE TABLE #TaskResults;

INSERT INTO #TaskResults (Id, Title, Description, Priority, Status, CreatedAt)
EXEC dbo.usp_Tasks_Get @Status = 'Pending', @Priority = 'High';

IF (SELECT COUNT(*) FROM #TaskResults) <> 1
BEGIN
    THROW 51000, 'Verification failed: Pending + High filter must return one row.', 1;
END;

CREATE TABLE #TaskById
(
    Id INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(2000) NOT NULL,
    Priority VARCHAR(10) NOT NULL,
    Status VARCHAR(20) NOT NULL,
    CreatedAt DATETIME2(0) NOT NULL
);

DECLARE @ExistingId INT = (SELECT MIN(Id) FROM dbo.Tasks);

INSERT INTO #TaskById (Id, Title, Description, Priority, Status, CreatedAt)
EXEC dbo.usp_Tasks_GetById @Id = @ExistingId;

IF (SELECT COUNT(*) FROM #TaskById) <> 1
BEGIN
    THROW 51000, 'Verification failed: existing Id must return one row.', 1;
END;

TRUNCATE TABLE #TaskById;

INSERT INTO #TaskById (Id, Title, Description, Priority, Status, CreatedAt)
EXEC dbo.usp_Tasks_GetById @Id = 999999;

IF (SELECT COUNT(*) FROM #TaskById) <> 0
BEGIN
    THROW 51000, 'Verification failed: non-existing Id must return zero rows.', 1;
END;

DROP TABLE #TaskById;
DROP TABLE #TaskResults;

PRINT N'Database verification completed successfully.';
GO
