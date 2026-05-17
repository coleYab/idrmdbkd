#!/bin/bash
# Quick Start Guide for ERT Team Tracking Module

set -e

echo "🚀 ERT Team Tracking Module - Quick Start"
echo ""
echo "This script will:"
echo "  1. Build the application"
echo "  2. Start Postgres+PostGIS database"
echo "  3. Run migrations to enable PostGIS and create tables"
echo "  4. Start dev server"
echo "  5. Test ERT API endpoints"
echo ""

# Step 1: Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating default..."
    cp .env.example .env 2>/dev/null || cat > .env << 'EOF'
APP_ENV=development
APP_PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=disaster_response_db
DB_USER=postgres
DB_PASS=postgres
JWT_ACCESS_TOKEN_EXP_IN_SEC=3600
JWT_REFRESH_TOKEN_EXP_IN_SEC=86400
JWT_PUBLIC_KEY_BASE64=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
JWT_PRIVATE_KEY_BASE64=MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCR...
DEFAULT_ADMIN_USER_PASSWORD=admin123
EOF
fi

# Step 2: Build
echo "📦 Building application..."
npm run build

# Step 3: Start docker services
echo "🐘 Starting Postgres+PostGIS..."
docker-compose up -d pgsqldb

# Wait for DB to be ready
echo "⏳ Waiting for database to be ready..."
for i in {1..30}; do
    if docker exec idrmdbkd-pgsqldb-1 pg_isready -U postgres &>/dev/null; then
        echo "✅ Database is ready!"
        break
    fi
    echo "  Attempt $i/30..."
    sleep 2
done

# Step 4: Run migrations
echo "🔧 Running migrations..."
npm run migration:run || true

# Step 5: Start dev server in background
echo "🚀 Starting dev server..."
npm run start:dev &
DEV_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
sleep 5

# Check if server is running
if ! kill -0 $DEV_PID 2>/dev/null; then
    echo "❌ Server failed to start"
    exit 1
fi

echo "✅ Server is running on http://localhost:3000"
echo ""

# Step 6: Run tests
echo "🧪 Running ERT API tests..."
sleep 2

if command -v node &> /dev/null; then
    node test-ert-api.js
else
    echo "⚠️  Node.js not found in PATH, skipping tests"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📚 Resources:"
echo "  - API Documentation: docs/ert-team-tracking.md"
echo "  - API Test Script: test-ert-api.js"
echo "  - View Database: http://localhost:8080 (Adminer)"
echo ""
echo "🛑 To stop the server, press Ctrl+C"
echo "   To stop database: docker-compose down"

wait $DEV_PID
