#!/usr/bin/env bash
set -euo pipefail

docker compose up -d
echo "Aplicacion levantada en http://localhost:5000"
