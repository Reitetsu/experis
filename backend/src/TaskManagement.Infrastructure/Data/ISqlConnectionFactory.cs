using System.Data.Common;

namespace TaskManagement.Infrastructure.Data;

internal interface ISqlConnectionFactory
{
    DbConnection CreateConnection();
}
