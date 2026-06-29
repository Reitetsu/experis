# Database Setup

This folder contains the SQL Server scripts for the `TaskManagementDb` contract that will later be consumed by `TaskRepository`.

## Requirements

- SQL Server available locally or on a reachable host
- `sqlcmd` available in PowerShell
- Windows Authentication preferred

## Scripts

- `01-create-database.sql`
  Creates `TaskManagementDb` only if it does not already exist.
- `02-create-schema.sql`
  Creates `dbo.Tasks`, its named constraints, and the required indexes.
- `03-create-procedures.sql`
  Creates or updates `dbo.usp_Tasks_Get` and `dbo.usp_Tasks_GetById`.
- `04-seed-data.sql`
  Inserts the initial nine tasks only when `dbo.Tasks` is empty.
- `05-verify-database.sql`
  Verifies schema, seed data, stored procedures, result columns, filter counts, and ordering. It stops with `THROW` if a check fails.

## Execution Order

Run the scripts in this exact order:

1. `01-create-database.sql`
2. `02-create-schema.sql`
3. `03-create-procedures.sql`
4. `04-seed-data.sql`
5. `05-verify-database.sql`

## PowerShell Commands

From the repository root:

```powershell
$SqlServer = "localhost"

sqlcmd -S $SqlServer -E -C -b `
  -i .\database\01-create-database.sql

sqlcmd -S $SqlServer -E -C -b `
  -i .\database\02-create-schema.sql

sqlcmd -S $SqlServer -E -C -b `
  -i .\database\03-create-procedures.sql

sqlcmd -S $SqlServer -E -C -b `
  -i .\database\04-seed-data.sql

sqlcmd -S $SqlServer -E -C -b `
  -i .\database\05-verify-database.sql
```

If your local instance name is different, change `$SqlServer`. For example:

```powershell
$SqlServer = "localhost\SQL2025"
```

## sqlcmd Parameters

- `-S` Server or instance name
- `-E` Windows integrated authentication
- `-C` Trust the local server certificate
- `-b` Return a process error code when the SQL script fails
- `-i` Input script file

## Manual Procedure Checks

After running the scripts, you can test the procedures manually:

```powershell
$SqlServer = "localhost"

sqlcmd -S $SqlServer -E -C `
  -d TaskManagementDb `
  -Q "EXEC dbo.usp_Tasks_Get;"

sqlcmd -S $SqlServer -E -C `
  -d TaskManagementDb `
  -Q "EXEC dbo.usp_Tasks_Get @Status = 'Pending';"

sqlcmd -S $SqlServer -E -C `
  -d TaskManagementDb `
  -Q "EXEC dbo.usp_Tasks_Get @Priority = 'High';"

sqlcmd -S $SqlServer -E -C `
  -d TaskManagementDb `
  -Q "EXEC dbo.usp_Tasks_Get @Status = 'Pending', @Priority = 'High';"

sqlcmd -S $SqlServer -E -C `
  -d TaskManagementDb `
  -Q "EXEC dbo.usp_Tasks_GetById @Id = 1;"

sqlcmd -S $SqlServer -E -C `
  -d TaskManagementDb `
  -Q "EXEC dbo.usp_Tasks_GetById @Id = 999999;"
```

## Notes About Validation

The stored procedures do not validate unknown filter values. That responsibility belongs to `TaskManagement.Application`.

For example, a manual execution such as:

```sql
EXEC dbo.usp_Tasks_Get @Status = 'Cancelled';
```

will simply return zero rows. Later, the application layer will intercept invalid values and translate them into a controlled validation error before calling the repository.
