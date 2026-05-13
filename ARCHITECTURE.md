# Logistica en Tiempo Real - Arquitectura AWS-ready

## Separacion de servicios

```txt
logistica-tiempo-real/
├── frontend-public/   # Sitio publico: landing, catalogo, carrito, rastreo
├── frontend-private/  # Intranet: login admin, dashboard, pedidos, stock
├── backend-api/       # API REST Node.js + Express + JWT
├── database/          # Documentacion de MySQL/RDS
├── docker/            # Documentacion de despliegue Docker/AWS
└── docker-compose.yml # Orquestacion local por servicio
```

## Puertos locales

- Publico: `http://localhost:3000`
- Privado: `http://localhost:3001`
- API: `http://localhost:5000`
- MySQL: `localhost:3306`

## Flujo del sistema

```txt
Cliente publico
  -> frontend-public
  -> backend-api
  -> database
  -> frontend-private
  -> admin cambia estado/stock
  -> backend-api
  -> frontend-public ve rastreo/stock actualizado
```

## Preparacion para AWS

- `frontend-public` puede ir en EC2 publica, S3 + CloudFront, o contenedor publico.
- `frontend-private` puede ir en EC2 privada con acceso por VPN/bastion o detras de un ALB protegido.
- `backend-api` debe vivir en subnet privada y exponer solo lo necesario por balanceador/API gateway.
- `database` puede reemplazarse por RDS MySQL.
- Logs actuales van a `logs/app.log`; en AWS pueden enviarse a CloudWatch.
