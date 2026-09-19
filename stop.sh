#!/usr/bin/env bash

echo "Stopping DigiCampus services..."

# Stop frontend
pkill -f "vite.*--port 3000" || true
echo "  ✔ Frontend stopped"

# Stop backend
pkill -f "gunicorn.*app:app" || true
echo "  ✔ Backend stopped"

echo "DigiCampus services stopped cleanly. (MySQL container remains available)"
