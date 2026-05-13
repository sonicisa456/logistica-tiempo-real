#!/usr/bin/env bash
set -euo pipefail

mkdir -p logs
touch logs/app.log
tail -f logs/app.log
