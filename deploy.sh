#!/usr/bin/env bash
set -euo pipefail

echo "Construyendo y levantando infraestructura local..."
docker compose up --build -d
echo "Backend: http://localhost:5000"
echo "Healthcheck: http://localhost:5000/api/health"
