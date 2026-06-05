#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔧 MaintainX Pro — Démarrage..."

# Backend
echo "📦 Démarrage du backend (port 3001)..."
cd "$PROJECT_DIR/backend"
node_modules/.bin/tsx src/index.ts &
BACKEND_PID=$!

# Frontend
echo "🎨 Démarrage du frontend (port 5173)..."
cd "$PROJECT_DIR/frontend"
node_modules/.bin/vite --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo ""
echo "✅ Projet lancé !"
echo "   Frontend : http://localhost:5173"
echo "   Backend  : http://localhost:3001"
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
