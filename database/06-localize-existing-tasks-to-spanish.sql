IF DB_ID(N'TaskManagementDb') IS NULL
BEGIN
    THROW 51000, 'TaskManagementDb no existe. Ejecuta primero 01-create-database.sql.', 1;
END;
GO

USE TaskManagementDb;
GO

UPDATE dbo.Tasks
SET
    Title = N'Revisar lista de incorporación',
    Description = N'Revisar los pendientes de incorporación del nuevo analista y confirmar qué tareas pueden iniciar esta semana.'
WHERE Id = 1;

UPDATE dbo.Tasks
SET
    Title = N'Preparar alcance del sprint',
    Description = N'Redactar el alcance del sprint para el equipo móvil y alinear el trabajo planificado con los objetivos de la entrega actual.'
WHERE Id = 2;

UPDATE dbo.Tasks
SET
    Title = N'Finalizar presentación ejecutiva',
    Description = N'Preparar la versión final de la presentación ejecutiva, confirmar las métricas con producto y operaciones, e incluir una sección narrativa más extensa que luego ayude a validar cómo se renderiza una descripción larga en la pantalla de detalle de React Native sin recortes ni comportamientos extraños de maquetación.'
WHERE Id = 3;

UPDATE dbo.Tasks
SET
    Title = N'Limpiar etiquetas antiguas del backlog',
    Description = N'Retirar las etiquetas obsoletas del backlog y conservar solo las categorías que el equipo sigue utilizando.'
WHERE Id = 4;

UPDATE dbo.Tasks
SET
    Title = N'Actualizar notas de regresión de QA',
    Description = N'Consolidar las notas actuales de regresión para que QA pueda reutilizar la misma lista de verificación en el siguiente ciclo.'
WHERE Id = 5;

UPDATE dbo.Tasks
SET
    Title = N'Coordinar hotfix de producción',
    Description = N'Coordinar el despliegue del hotfix, confirmar la ventana de liberación y hacer seguimiento a los pasos de validación posteriores.'
WHERE Id = 6;

UPDATE dbo.Tasks
SET
    Title = N'Archivar ticket de soporte resuelto',
    Description = N'Cerrar y archivar el ticket de soporte resuelto después de confirmar que no quedan acciones de seguimiento pendientes.'
WHERE Id = 7;

UPDATE dbo.Tasks
SET
    Title = N'Documentar lista de liberación',
    Description = N'Documentar la lista de liberación utilizada durante la última entrega y guardar la versión final para reutilizarla.'
WHERE Id = 8;

UPDATE dbo.Tasks
SET
    Title = N'Publicar resumen semanal de estado',
    Description = N'Publicar el resumen semanal final para los interesados y registrar los hitos completados para el informe.'
WHERE Id = 9;

PRINT N'Tareas existentes traducidas al español.';
GO
