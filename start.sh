#!/bin/bash

# Mortgage Platform Start Script
echo "🚀 Starting Mortgage Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to cleanup background processes
cleanup() {
    print_warning "Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Check if setup was run
if [ ! -f "backend/bin/Debug/netcoreapp3.1/MortgagePlatform.API.dll" ]; then
    print_warning "Backend not built. Running setup first..."
    ./setup.sh
fi

# Start PostgreSQL if not running
print_status "Ensuring PostgreSQL is running..."
if command -v brew &> /dev/null; then
    brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
else
    sudo service postgresql start 2>/dev/null || sudo systemctl start postgresql 2>/dev/null || true
fi

# Wait for PostgreSQL
sleep 2

# Start Backend
print_status "Starting backend server..."
cd backend
dotnet run --project MortgagePlatform.API &
BACKEND_PID=$!
cd ..

print_success "Backend started (PID: $BACKEND_PID)"
print_status "Backend URL: http://localhost:5000"
print_status "API Docs: http://localhost:5000/swagger"

# Wait for backend to start
print_status "Waiting for backend to initialize..."
sleep 10

# Start Frontend
print_status "Starting frontend server..."
cd frontend
pnpm start &
FRONTEND_PID=$!
cd ..

print_success "Frontend started (PID: $FRONTEND_PID)"
print_status "Frontend URL: http://localhost:4200"

print_success "🎉 Mortgage Platform is running!"
echo ""
echo "📝 Available URLs:"
echo "   🌐 Frontend:        http://localhost:4200"
echo "   🔧 Backend API:     http://localhost:5000"
echo "   📚 API Docs:        http://localhost:5000/swagger"
echo ""
echo "👤 Test Accounts:"
echo "   📧 Admin:          admin@mortgageplatform.com (password: admin123)"
echo "   👨‍💼 User:           john.doe@email.com (password: user123)"
echo ""
echo "💡 Features to try:"
echo "   🏠 Search properties"
echo "   🧮 Calculate mortgage payments"
echo "   📋 Apply for loans"
echo "   👔 Admin panel (with admin account)"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait