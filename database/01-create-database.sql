IF DB_ID(N'TaskManagementDb') IS NULL
BEGIN
    CREATE DATABASE TaskManagementDb;
    PRINT N'Database TaskManagementDb created.';
END;
ELSE
BEGIN
    PRINT N'Database TaskManagementDb already exists.';
END;
GO
