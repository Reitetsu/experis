# Guia Del Proyecto Movil

## Requisitos

- Node 22.22.0
- JDK 17
- Android SDK Platform 35 y 36
- Android Build Tools 36.0.0
- Android NDK 27.1.12297006

## Instalacion

```powershell
cd D:\Trabajo\Plaza\mobile
npm ci
```

## Iniciar Metro

```powershell
cd D:\Trabajo\Plaza\mobile
npm start
```

Si Metro pierde conexion desde el emulador, reestablece el puente:

```powershell
adb reverse tcp:8081 tcp:8081
```

## Ejecutar Android

Con el emulador encendido:

```powershell
cd D:\Trabajo\Plaza\mobile
npm run android
```

## Timeout De ADB

Si `adb` no detecta el emulador o queda lento:

```powershell
adb kill-server
adb start-server
adb devices
adb reverse tcp:8081 tcp:8081
```

## URL De API Para El Emulador

La app usa:

```text
http://10.0.2.2:5080
```

Ese valor esta centralizado en `src/config/apiConfig.ts`.
Las solicitudes HTTP se centralizan en `src/api/httpClient.ts` mediante Axios.

## Pruebas

```powershell
cd D:\Trabajo\Plaza\mobile

npm test -- --runInBand
npx tsc --noEmit
npm run lint
npx react-native doctor
```

## Flujo Implementado

- Listado de tareas.
- Filtros por estado.
- Filtros por prioridad.
- Combinacion de filtros.
- Recarga manual.
- Pantalla de detalle con `taskId`.
- Manejo de loading, error y estado vacio.
- Cliente HTTP centralizado con Axios y cancelacion por `AbortSignal`.
