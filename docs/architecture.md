# Arquitectura

## Backend

```mermaid
flowchart LR
    Client[Cliente HTTP] --> Api[TaskManagement.Api]
    Api --> App[TaskManagement.Application]
    App --> Domain[TaskManagement.Domain]
    App --> Infra[TaskManagement.Infrastructure]
    Infra --> Sql[(SQL Server)]
```

## Flujo Mobile A API A SQL Server

```mermaid
sequenceDiagram
    participant Mobile as React Native Mobile
    participant Api as TaskManagement.Api
    participant App as Application
    participant Infra as Infrastructure
    participant Sql as SQL Server

    Mobile->>Api: GET /api/tasks o /api/tasks/{id}
    Api->>App: DTO de filtro o ID
    App->>Infra: Consulta al repositorio
    Infra->>Sql: EXEC dbo.usp_Tasks_Get / GetById
    Sql-->>Infra: Filas de tareas
    Infra-->>App: Entidades de dominio
    App-->>Api: DTOs
    Api-->>Mobile: JSON + ProblemDetails cuando aplica
```

## Flujo De Listado Y Filtrado

```mermaid
flowchart TD
    Start[Usuario abre TaskListScreen] --> Load[Solicitar tareas]
    Load --> Filters{Hay filtros activos?}
    Filters -- No --> All[GET /api/tasks]
    Filters -- Si --> Query[GET /api/tasks?status=...&priority=...]
    All --> Render[Renderizar tarjetas]
    Query --> Render
    Render --> Tap[Usuario toca una tarjeta]
    Tap --> Detail[Navegar a TaskDetailScreen]
    Detail --> ById[GET /api/tasks/{id}]
    ById --> Show[Mostrar detalle]
```
