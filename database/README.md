# Database

Este directorio documenta la capa de datos del proyecto.

En local se usa MySQL 8 desde `docker-compose.yml` con el servicio `database`.
El backend crea y actualiza las tablas necesarias al iniciar:

- `usuarios`
- `productos`
- `pedidos`
- `pedido_productos`
- `conductores`
- `vehiculos`
- `incidencias`
- `estados_entrega`
- `contactos`

Para AWS, esta capa puede migrarse a RDS MySQL. En ese caso, el backend solo necesita cambiar:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
