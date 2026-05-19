#!/bin/bash
# deploy.sh — Jalankan di VPS untuk deploy/update backend
#
# CARA PAKAI:
#   1. Clone repo ke VPS: git clone <repo-url> /opt/mental-health && cd /opt/mental-health
#   2. Copy .env: cp .env.example .env && nano .env  # isi API key
#   3. Jalankan: bash deploy.sh
#
# Prerequisite: Docker + Docker Compose sudah terinstall di VPS.
# Install Docker: curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker $USER

set -e

echo "=== Building Docker image ==="
docker compose build --no-cache

echo "=== Starting container ==="
docker compose up -d

echo "=== Waiting for health check ==="
sleep 5
if curl -sf http://localhost:8000/api/health > /dev/null; then
    echo "✅ Backend running on http://localhost:8000"
else
    echo "❌ Health check failed. Check logs: docker compose logs"
    exit 1
fi
