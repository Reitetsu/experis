# Decisiones Tecnicas

## Clean Architecture Simplificada

- Problema que resuelve: separar API, casos de uso, dominio e infraestructura para mantener bajo acoplamiento.
- Razon de eleccion: permite probar la aplicacion sin depender de SQL Server ni de ASP.NET Core en cada prueba.
- Alternativa: arquitectura por capas tradicional.
- Desventaja: agrega mas proyectos y contratos para un reto pequeno.

## Dapper Frente A Entity Framework

- Problema que resuelve: ejecutar consultas simples con poco overhead y control explicito del acceso a datos.
- Razon de eleccion: el reto se apoya en procedimientos almacenados y lecturas directas, donde Dapper encaja bien.
- Alternativa: Entity Framework Core.
- Desventaja: requiere mapear manualmente y no aporta seguimiento de cambios.

## Procedimientos Almacenados

- Problema que resuelve: centralizar el contrato SQL de lectura y los filtros por estado y prioridad.
- Razon de eleccion: simplifica el consumo desde infraestructura y deja una interfaz clara entre app y base de datos.
- Alternativa: consultas SQL inline desde el repositorio.
- Desventaja: la evolucion del esquema y de los procedimientos debe coordinarse con mas cuidado.

## React Native CLI Frente A Expo

- Problema que resuelve: usar un proyecto nativo completo compatible con configuraciones Android reales y dependencias nativas.
- Razon de eleccion: el reto pedia control de entorno Android, Gradle, SDK y NDK.
- Alternativa: Expo.
- Desventaja: el setup local es mas pesado y sensible a la configuracion de la maquina.

## React Navigation

- Problema que resuelve: separar el listado y el detalle en pantallas distintas con navegacion tipada.
- Razon de eleccion: es la libreria estandar del ecosistema React Native para stacks y navegacion declarativa.
- Alternativa: manejar el detalle con modales y estado local.
- Desventaja: agrega dependencias y configuracion adicional en pruebas.

## Axios Frente A Fetch Nativo

- Problema que resuelve: centralizar la configuracion HTTP, el timeout, los encabezados y el manejo uniforme de errores.
- Razon de eleccion: Axios forma parte del stack solicitado y simplifica el tratamiento consistente de timeout, red, cancelacion y `ProblemDetails`.
- Alternativa: fetch nativo.
- Desventaja: agrega una dependencia externa al cliente movil.

## Estado Local Frente A Redux

- Problema que resuelve: manejar filtros, carga, error, recarga y detalle sin introducir una capa global innecesaria.
- Razon de eleccion: el flujo actual es pequeno y esta acotado a dos pantallas conectadas.
- Alternativa: Redux Toolkit.
- Desventaja: si el flujo crece mucho, el estado distribuido entre pantallas exigira una refactorizacion.

## User Secrets

- Problema que resuelve: separar la cadena de conexion local del codigo versionado.
- Razon de eleccion: evita subir configuracion privada al repositorio y mantiene la API portable.
- Alternativa: appsettings de desarrollo versionado.
- Desventaja: agrega un paso manual al onboarding local.

## DTO Separados De Entidades

- Problema que resuelve: aislar el contrato HTTP del modelo de dominio.
- Razon de eleccion: permite evolucionar la API sin exponer directamente las entidades internas.
- Alternativa: devolver entidades del dominio desde los controladores.
- Desventaja: requiere mapeos adicionales y mas tipos por mantener.
