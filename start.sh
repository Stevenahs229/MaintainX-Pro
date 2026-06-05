#!/usr/bin/env bash
set -o pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  echo "⏹️  Arrêt des serveurs..."
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
  wait 2>/dev/null
  echo "✓ Arrêté"
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "🔧 MaintainX Pro — Démarrage..."

# Backend
if [ -f "$PROJECT_DIR/backend/node_modules/.bin/tsx" ]; then
  echo "📦 Démarrage du backend (port 3001)..."
  cd "$PROJECT_DIR/backend"
  node_modules/.bin/tsx src/index.ts &
  BACKEND_PID=$!
else
  echo "❌ Backend introuvable — lance d'abord : cd backend && npm install"
fi

# Frontend
if [ -f "$PROJECT_DIR/frontend/node_modules/.bin/vite" ]; then
  echo "🎨 Démarrage du frontend (port 5173)..."
  cd "$PROJECT_DIR/frontend"
  node_modules/.bin/vite --host 0.0.0.0 --port 5173 &
  FRONTEND_PID=$!
else
  echo "❌ Frontend introuvable — lance d'abord : cd frontend && npm install"
fi

echo ""
echo "✅ Projet lancé !"
echo "   Frontend : http://localhost:5173"
echo "   Backend  : http://localhost:3001"
echo ""
echo "   Ctrl+C pour tout arrêter"
echo ""

wait
