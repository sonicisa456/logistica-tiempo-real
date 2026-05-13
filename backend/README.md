# Backend - Logistica en Tiempo Real

API REST con Node.js, Express, MySQL, JWT y logs internos.

## Estructura

- `src/config`: variables de entorno, conexion a MySQL y logger.
- `src/controllers`: entrada HTTP de cada recurso.
- `src/services`: reglas de negocio y validaciones.
- `src/models`: consultas SQL.
- `src/routes`: rutas REST.
- `src/middleware`: autenticacion, logs de peticiones y errores.
- `src/database`: creacion de tablas y seed de usuario admin.

## Rutas principales

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `/api/usuarios`
- `/api/pedidos`
- `/api/vehiculos`
- `/api/incidencias`

Las rutas CRUD requieren `Authorization: Bearer <token>`.

## Usuario inicial

El backend crea un admin si no existe:

- Correo: `admin@logistica.local`
- Contrasena: `Admin123!`

Estos valores se pueden cambiar con variables de entorno.
