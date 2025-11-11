#!/bin/bash

# Docker PostgreSQL Database Fix Script
# This script stops containers, removes the old volume, and restarts with fresh database

set -e

echo "🛑 Stopping Docker containers..."
docker-compose down

echo "🗑️  Removing old PostgreSQL volume (if exists)..."
docker volume rm bilan-101120251636_postgres_data 2>/dev/null || echo "Volume not found or already removed"

echo "🚀 Starting Docker containers with fresh database..."
docker-compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 5

echo "📋 Checking container status..."
docker-compose ps

echo "📊 Checking backend logs..."
docker-compose logs backend | tail -10

echo "📊 Checking PostgreSQL logs for errors..."
docker-compose logs postgres | grep -i "database\|error\|fatal" | tail -5 || echo "No errors found"

echo ""
echo "✅ Done! Check the logs above to verify everything is working."
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:3001/api"

