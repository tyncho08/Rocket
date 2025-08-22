#!/bin/bash

# Mortgage Platform Setup Script
echo "🏠 Setting up Mortgage Platform..."

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

# Check prerequisites
print_status "Checking prerequisites..."

# Check .NET
if ! command -v dotnet &> /dev/null; then
    print_error ".NET Core SDK not found. Please install .NET Core 3.1 or later."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 18 or later."
    exit 1
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm not found. Please install pnpm: npm install -g pnpm"
    exit 1
fi

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL not found. Please install PostgreSQL."
    exit 1
fi

print_success "All prerequisites found!"

# Start PostgreSQL if not running
print_status "Starting PostgreSQL service..."
if command -v brew &> /dev/null; then
    brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
else
    sudo service postgresql start 2>/dev/null || sudo systemctl start postgresql 2>/dev/null || true
fi

# Wait a moment for PostgreSQL to start
sleep 2

# Setup Database
print_status "Setting up database..."

# Create database if it doesn't exist
createdb mortgage_platform 2>/dev/null || true

# Initialize database
if psql -d mortgage_platform -f database/init.sql > /dev/null 2>&1; then
    print_success "Database initialized successfully!"
else
    print_warning "Database may already be initialized or there was an error."
fi

# Setup Backend
print_status "Setting up backend dependencies..."
cd backend
if dotnet restore > /dev/null 2>&1; then
    print_success "Backend dependencies restored!"
else
    print_error "Failed to restore backend dependencies"
    exit 1
fi

# Build backend
print_status "Building backend..."
if dotnet build > /dev/null 2>&1; then
    print_success "Backend built successfully!"
else
    print_error "Failed to build backend"
    exit 1
fi

cd ..

# Setup Frontend
print_status "Setting up frontend dependencies..."
cd frontend
if pnpm install > /dev/null 2>&1; then
    print_success "Frontend dependencies installed!"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

print_success "🎉 Setup complete! Use './start.sh' to run the application."
print_status "Backend will run on: http://localhost:5000"
print_status "Frontend will run on: http://localhost:4200"
print_status "API Documentation: http://localhost:5000/swagger"