IF DB_ID(N'TaskManagementDb') IS NULL
BEGIN
    THROW 51000, 'TaskManagementDb no existe. Ejecuta primero 01-create-database.sql.', 1;
END;
GO

USE TaskManagementDb;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Tasks)
BEGIN
    INSERT INTO dbo.Tasks
    (
        Title,
        Description,
        Priority,
        Status,
        CreatedAt
    )
    VALUES
    (
        N'Revisar lista de incorporación',
        N'Revisar los pendientes de incorporación del nuevo analista y confirmar qué tareas pueden iniciar esta semana.',
        'Low',
        'Pending',
        '2026-06-01T08:00:00'
    ),
    (
        N'Preparar alcance del sprint',
        N'Redactar el alcance del sprint para el equipo móvil y alinear el trabajo planificado con los objetivos de la entrega actual.',
        'Medium',
        'Pending',
        '2026-06-02T08:00:00'
    ),
    (
        N'Finalizar presentación ejecutiva',
        N'Preparar la versión final de la presentación ejecutiva, confirmar las métricas con producto y operaciones, e incluir una sección narrativa más extensa que luego ayude a validar cómo se renderiza una descripción larga en la pantalla de detalle de React Native sin recortes ni comportamientos extraños de maquetación.',
        'High',
        'Pending',
        '2026-06-03T08:00:00'
    ),
    (
        N'Limpiar etiquetas antiguas del backlog',
        N'Retirar las etiquetas obsoletas del backlog y conservar solo las categorías que el equipo sigue utilizando.',
        'Low',
        'InProgress',
        '2026-06-04T08:00:00'
    ),
    (
        N'Actualizar notas de regresión de QA',
        N'Consolidar las notas actuales de regresión para que QA pueda reutilizar la misma lista de verificación en el siguiente ciclo.',
        'Medium',
        'InProgress',
        '2026-06-05T08:00:00'
    ),
    (
        N'Coordinar hotfix de producción',
        N'Coordinar el despliegue del hotfix, confirmar la ventana de liberación y hacer seguimiento a los pasos de validación posteriores.',
        'High',
        'InProgress',
        '2026-06-06T08:00:00'
    ),
    (
        N'Archivar ticket de soporte resuelto',
        N'Cerrar y archivar el ticket de soporte resuelto después de confirmar que no quedan acciones de seguimiento pendientes.',
        'Low',
        'Completed',
        '2026-06-07T08:00:00'
    ),
    (
        N'Documentar lista de liberación',
        N'Documentar la lista de liberación utilizada durante la última entrega y guardar la versión final para reutilizarla.',
        'Medium',
        'Completed',
        '2026-06-08T08:00:00'
    ),
    (
        N'Publicar resumen semanal de estado',
        N'Publicar el resumen semanal final para los interesados y registrar los hitos completados para el informe.',
        'High',
        'Completed',
        '2026-06-09T08:00:00'
    );

    PRINT N'Datos iniciales de tareas insertados.';
END;
ELSE
BEGIN
    PRINT N'La tabla dbo.Tasks ya contiene datos. Seed omitido.';
END;
GO
