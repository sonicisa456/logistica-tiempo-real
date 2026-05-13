# Logistica en Tiempo Real - Arquitectura AWS-ready

## Separacion de servicios

```txt
logistica-tiempo-real/
├── frontend-public/   # Sitio publico: landing, catalogo, carrito, rastreo
├── frontend-private/  # Intranet: login admin, dashboard, pedidos, stock
├── backend-api/       # API REST Node.js + Express + JWT
├── database/          # Documentacion de MySQL/RDS
├── docker/            # Documentacion de despliegue Docker/AWS
└── docker-compose.yml # Orquestacion local con networking Docker
```

## Puertos locales (desarrollo)

- Publico: `http://localhost:3000`
- Privado: `http://localhost:3001`
- API: `http://localhost:5000`
- MySQL: `localhost:3306`

## Networking Docker (producción/contenedores)

Los servicios se comunican usando nombres internos:

- `frontend-public` → `http://backend-api:5000/api` (porta interna 5000)
- `frontend-private` → `http://backend-api:5000/api` (porta interna 5000)
- `backend-api` → `database:3306` (porta interna 3306)
- Red Docker: `logistica_network` (bridge)

## Flujo del sistema

```txt
Cliente publico
  -> frontend-public (puerto 3000)
  -> backend-api (puerto 5000, comunicacion interna por docker network)
  -> database (puerto 3306, comunicacion interna)
  
Admin accede via
  -> frontend-private (puerto 3001)
  -> backend-api (puerto 5000, comunicacion interna por docker network)
  -> actualiza stock/estado
  -> frontend-public ve cambios sincronizados
```

## Preparacion para AWS

- `frontend-public` puede ir en EC2 publica, S3 + CloudFront, o contenedor publico.
- `frontend-private` puede ir en EC2 privada con acceso por VPN/bastion o detras de un ALB protegido.
- `backend-api` debe vivir en subnet privada y exponer solo lo necesario por balanceador/API gateway.
- `database` puede reemplazarse por RDS MySQL.
- Logs actuales van a `logs/app.log`; en AWS pueden enviarse a CloudWatch.

## Variables de entorno Docker

### Frontend (VITE build-time)
- `VITE_API_URL`: URL del backend (ej: `http://backend-api:5000/api`)
- `VITE_PRIVATE_URL`: URL del frontend privado (ej: `http://frontend-private:80/login`)

### Backend API
- `DB_HOST`: nombre del servicio DB (ej: `database`)
- `DB_PORT`: 3306
- `CORS_ORIGIN`: origen permitido (ej: `http://frontend-public:80`)

## Limpieza realizadas (Mayo 2026)

✅ Eliminada carpeta redundante `frontend/frontend-app/`
✅ Configurado docker-compose.yml con networking Docker
✅ Actualizado Dockerfiles para usar variables de entorno correctas
✅ Corregido CORS para aceptar nombres de servicios Docker
✅ Actualizado .env.example y .gitignore
