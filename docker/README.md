# Docker y AWS

Arquitectura local preparada para AWS:

- `frontend-public`: sitio publico para clientes.
- `frontend-private`: intranet privada para empleados/admin.
- `backend-api`: API REST Node.js/Express.
- `database`: MySQL local. En AWS puede reemplazarse por RDS.

Puertos locales:

- Publico: `http://localhost:3000`
- Privado: `http://localhost:3001`
- Backend API: `http://localhost:5000`
- MySQL: `localhost:3306`

Mapping sugerido en AWS:

- EC2 publica o S3/CloudFront: `frontend-public`
- EC2 privada: `backend-api`
- EC2 privada o RDS: `database`
- Bastion Host: acceso administrativo SSH a recursos privados
- CloudWatch: logs de contenedores/API
- Lambda: tareas programadas o integraciones futuras
