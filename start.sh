#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "=================================================="
echo "    Starting DigiCampus Digital Twin Platform     "
echo "=================================================="

# 1. Ensure MySQL is running
echo "[1/3] Checking MySQL database..."
if docker ps | grep -q "digicampus-mysql"; then
    echo "  ✔ MySQL container is running on port 3306"
elif docker ps -a | grep -q "digicampus-mysql"; then
    echo "  ▶ Starting existing MySQL container..."
    docker start digicampus-mysql
else
    echo "  ▶ Launching new MySQL container..."
    docker run -d --name digicampus-mysql \
      -e MYSQL_ROOT_PASSWORD=digiroot \
      -e MYSQL_DATABASE=digicampus \
      -e MYSQL_USER=digiuser \
      -e MYSQL_PASSWORD=digipass \
      -p 3306:3306 mysql:8.0
fi

# Wait for MySQL to accept connection
until mysql -h 127.0.0.1 -P 3306 -u digiuser -pdigipass digicampus -e "SELECT 1;" >/dev/null 2>&1; do
    echo "  ... waiting for MySQL to accept connections..."
    sleep 2
done
echo "  ✔ MySQL connected successfully!"

# 2. Start Backend
echo "[2/3] Starting Flask Gunicorn Backend..."
pkill -f "gunicorn.*app:app" || true
cd "$DIR/backend"
"$DIR/backend/venv/bin/gunicorn" -D --bind 0.0.0.0:5000 --threads 4 --timeout 60 app:app
sleep 1
curl -s http://127.0.0.1:5000/api/health >/dev/null && echo "  ✔ Flask Backend active on http://localhost:5000"

# 3. Start Frontend
echo "[3/3] Starting React TypeScript Vite Frontend..."
pkill -f "vite.*--port 3000" || true
cd "$DIR/frontend"
node start-vite-daemon.js
sleep 2

echo ""
echo "=================================================="
echo "  🚀 DigiCampus is LIVE!"
echo "  🌐 Frontend:  http://localhost:3000"
echo "  📡 Backend:   http://localhost:5000"
echo "  🗄️  Database:  MySQL (port 3306, db: digicampus)"
echo "=================================================="
