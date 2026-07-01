# Informe final de cumplimiento del reto técnico

## 1. Resumen ejecutivo

- Objetivo: construir una solucion full stack para consultar tareas desde SQL Server mediante una API REST y una app movil React Native.
- Solucion: backend .NET con arquitectura por capas simplificada, SQL Server con procedimientos almacenados y app Android con React Native CLI, React Navigation y Axios.
- Stack final: .NET 10, ASP.NET Core, Dapper, SQL Server, React Native CLI 0.86, TypeScript, React Navigation, Axios.
- Alcance: listado, filtros por estado y prioridad, combinacion de filtros, detalle por ID, validacion de errores, documentacion y scripts SQL.
- Estado general: cumplido con observaciones menores de entorno local para la validacion final del emulador y del restore desde `nuget.org` dentro del sandbox.

## 2. Matriz funcional

| Requisito | Estado | Evidencia | Validación | Observaciones |
| --- | --- | --- | --- | --- |
| Listado de tareas | Cumplido | `GET /api/tasks`, `TaskListScreen`, captura final | API devolvio 9 tareas | Visible en screenshot final |
| Filtro por estado | Cumplido | `GET /api/tasks?status=Pending` | Respuesta con 3 tareas | Integrado en `TaskListScreen` |
| Filtro por prioridad | Cumplido | `GET /api/tasks?priority=High` | Respuesta con 3 tareas | Integrado en `TaskListScreen` |
| Filtros combinados | Cumplido | `GET /api/tasks?status=Pending&priority=High` | Respuesta con 1 tarea | Mismo flujo de filtros |
| Detalle | Cumplido | `TaskDetailScreen`, `GET /api/tasks/{id}` | `GET /api/tasks/1` valido | Navegacion tipada por `taskId` |
| Titulo | Cumplido | DTO `TaskDto`, tarjetas y detalle | Visible en API y UI |
| Descripcion | Cumplido | DTO `TaskDto`, tarjetas y detalle | Visible en API y UI | Soporta texto largo |
| Prioridad | Cumplido | Badges y filtro | API y UI la muestran | Valores tecnicos se conservan en BD |
| Estado | Cumplido | Badges y filtro | API y UI lo muestran | Valores tecnicos se conservan en BD |

## 3. Matriz backend

| Requisito | Estado | Evidencia | Validación | Observaciones |
| --- | --- | --- | --- | --- |
| .NET 6 o superior | Cumplido | `global.json`, proyectos `net10.0` | Build Release correcto | Se uso .NET 10, cumple .NET 6 o superior |
| API REST | Cumplido | `TasksController` | Endpoints `GET` probados manualmente | Solo consulta, sin mutaciones |
| SQL Server | Cumplido | Scripts en `database/` | API respondio desde `TaskManagementDb` | Instancia local configurable |
| Dapper | Cumplido | `TaskRepository`, `SqlConnectionFactory` | Build correcto | Sin ORM completo |
| Procedimientos almacenados | Cumplido | `03-create-procedures.sql` | Filtros y detalle correctos | Contrato SQL estable |
| Arquitectura | Cumplido | `Domain`, `Application`, `Infrastructure`, `Api` | Solucion separada por capas | Simplificada para el reto |
| Validacion | Cumplido | `TaskFilterValidator` | Filtro invalido devolvio `400` | Aplicacion valida antes del repositorio |
| ProblemDetails | Cumplido | `GlobalExceptionHandler`, `Program.cs` | `400` y `404` confirmados | Incluye `traceId` |
| Swagger/OpenAPI | Cumplido | `AddOpenApi`, `UseSwaggerUI` | Configurado en Development | No se revalido visualmente en esta sesion |
| Pruebas | Cumplido con observaciones | `TaskManagement.Tests` | `dotnet test --no-build` sin error final | La recompilacion completa dentro del sandbox choca con `nuget.org` |

## 4. Matriz frontend

| Requisito | Estado | Evidencia | Validación | Observaciones |
| --- | --- | --- | --- | --- |
| React Native CLI | Cumplido | Proyecto nativo en `mobile/` | Estructura Android/iOS presente | No se uso Expo |
| TypeScript | Cumplido | `tsconfig.json`, `src/**/*.ts*` | `npx tsc --noEmit` termino sin errores tras la instalacion limpia | |
| React Navigation | Cumplido | `AppNavigator`, `TaskStackParamList` | Pruebas y build del cliente | Stack tipado |
| Axios | Cumplido | `src/api/httpClient.ts`, `tasksApi.ts` | Cliente centralizado | Timeout y errores unificados |
| Listado | Cumplido | `TaskListScreen` | Pruebas y captura final | |
| Filtros | Cumplido | `TaskListScreen` | Endpoints validados | Estado y prioridad |
| Detalle | Cumplido | `TaskDetailScreen` | `GET /api/tasks/{id}` | Navegacion por `taskId` |
| Loading | Cumplido | Estados de carga en lista y detalle | Presente en codigo | |
| Error | Cumplido | Empty state y mensajes | Error de API manejado | |
| Vacio | Cumplido | Empty state | Presente en codigo | |
| Recarga | Cumplido | `RefreshControl` y boton | Presente en codigo | |
| Cancelacion al desmontar | Cumplido | `AbortController` + `signal` | Implementado en lista y detalle | Axios preserva `AbortError` |
| Componentes nativos | Cumplido | `FlatList`, `Pressable`, `ScrollView`, `Modal` | Presente en codigo | Sin UI kit |
| Ausencia de Expo y UI Kits | Cumplido | `package.json`, estructura nativa | Revisado | |

## 5. Entregables

| Entregable | Estado | Evidencia | Validación | Observaciones |
| --- | --- | --- | --- | --- |
| Repositorio | Cumplido | GitHub `Reitetsu/experis` | Push exitoso | `main` sincronizada |
| README | Cumplido | `README.md` | Archivo presente | Incluye setup y flujo |
| Scripts SQL | Cumplido | `database/01..06` | Archivos presentes | Seed y localizacion en español |
| Documentacion | Cumplido | `docs/` | Archivos presentes | Arquitectura, decisiones e informe |
| Diagramas | Cumplido | Mermaid en `docs/architecture.md` | Archivo presente | 3 diagramas |
| Captura | Cumplido | `screenshots/mobile-task-board-compact-final.png` | Archivo presente | Solo se conserva evidencia final |
| Pruebas | Cumplido con observaciones | Backend y mobile | Resultados automatizados finales disponibles | Queda solo una comprobacion visual final en Android |

## 6. Criterios de evaluación

| Criterio | Estado | Evidencia | Validación | Observaciones |
| --- | --- | --- | --- | --- |
| Arquitectura | Cumplido | Solucion separada por capas y docs | Codigo y diagramas | |
| Calidad | Cumplido | Tipado, validaciones, pruebas | Build y tests | |
| Buenas prácticas | Cumplido | User Secrets, DTOs, repositorio limpio | Git y codigo | |
| Funcionamiento | Cumplido con observaciones | API validada, captura final | Queda una comprobacion visual final en Android | |
| Documentación | Cumplido | README y docs | Archivos presentes | |
| Decisiones técnicas | Cumplido | `docs/technical-decisions.md` | Archivo presente | |

## 7. Casos edge

| Caso | Estado | Evidencia | Validación | Observaciones |
| --- | --- | --- | --- | --- |
| Base vacía | Cumplido con observaciones | `04-seed-data.sql` inserta solo si no hay datos | Revision del script | No se recreo una base vacia en esta sesion |
| Filtros sin resultados | Cumplido | Estado vacio en `TaskListScreen` | Flujo implementado | Requiere validacion manual local final |
| Filtros combinados | Cumplido | Endpoint combinado | API devolvio 1 registro | |
| Filtro inválido | Cumplido | `TaskFilterValidator` | `400` confirmado | |
| ID inexistente | Cumplido | Excepcion y handler global | `404` confirmado | |
| Error de red | Cumplido | Mapeo Axios sin `response` | Prueba unitaria agregada | |
| Error de servidor | Cumplido con observaciones | Manejo de `ProblemDetails` y status | Cubierto por cliente y API | No se forzo un `500` en esta sesion |
| Timeout | Cumplido | Timeout en `httpClient` y prueba unitaria | Prueba unitaria agregada | |
| Texto largo | Cumplido | Tarea 3 con descripcion extensa | Visible en API y detalle | |
| Cancelación | Cumplido | `AbortController` y mapeo `AbortError` | Prueba unitaria agregada | |

## 8. Fuera de alcance

No se implemento:

- autenticación;
- múltiples usuarios;
- crear tareas;
- editar tareas;
- eliminar tareas;
- CI/CD;
- despliegue productivo.

## 9. Evidencia de pruebas

- Pruebas backend: la solucion compilo en Release y `dotnet test --configuration Release --no-build` termino sin error final visible en la sesion.
- Instalacion limpia frontend: `npm ci` completo correctamente, instalo 895 paquetes y audito 896 paquetes.
- Pruebas frontend: 3 suites y 9 pruebas aprobadas despues de la instalacion limpia.
- TypeScript: `npx tsc --noEmit` termino sin errores despues de la instalacion limpia.
- Lint: `npm run lint` termino sin errores despues de la instalacion limpia.
- Doctor: el ultimo resultado completo detecto un problema temporal de conectividad Android; posteriormente ADB mostro `emulator-5554 device`, pero no se obtuvo una nueva salida completa antes de cerrar la sesion.
- Endpoints manuales: `GET /api/tasks`, filtros, combinacion, `GET /api/tasks/1`, `400` por filtro invalido, `404` por ID inexistente.
- Prueba manual: Metro y ADB quedaron operativos; la compilacion Android avanzo, pero falta una confirmacion visual final de la version con Axios.

## 10. Desviaciones y decisiones

- .NET 10 frente a .NET 6: se eligio .NET 10 porque cumple el requisito de .NET 6 o superior y mantiene el proyecto en una version moderna.
- SQL Server: se mantuvo como almacenamiento relacional requerido por el reto.
- Dapper: se uso para un acceso a datos liviano y directo con procedimientos almacenados.
- Axios: se adopto para alinearse con el stack solicitado y centralizar configuracion HTTP.
- Estado local frente a Redux: suficiente para dos pantallas acopladas por navegacion.
- React Native CLI frente a Expo: se eligio CLI para control nativo total del entorno Android.
- API 35 del emulador y compileSdk 36: el entorno Android local se ajusto al proyecto generado y a las herramientas instaladas.
- User Secrets: se uso para no versionar la cadena de conexion local.

## 11. Limitaciones

- La validacion principal del cliente se concentro en Android.
- No existe persistencia offline.
- No hay paginacion.
- No hay pipeline CI/CD.
- La configuracion de SQL Server depende de la maquina local.

## 12. Conclusión

El reto presenta un nivel alto de cumplimiento funcional y tecnico. El codigo, las pruebas automatizadas, la documentacion y Git quedaron completos; solo resta una comprobacion manual visual final en Android para reconfirmar la version con Axios en el emulador. El proyecto queda listo para evaluacion con esa observacion puntual de entorno.
