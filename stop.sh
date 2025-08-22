#!/bin/bash

# Mortgage Platform Stop Script
echo "🛑 Stopping Mortgage Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Kill processes by port
print_status "Stopping backend (port 5000)..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

print_status "Stopping frontend (port 4200)..."
lsof -ti:4200 | xargs kill -9 2>/dev/null || true

# Kill any remaining dotnet processes
print_status "Cleaning up dotnet processes..."
pkill -f "MortgagePlatform.API" 2>/dev/null || true

# Kill any remaining node processes related to Angular
print_status "Cleaning up Angular processes..."
pkill -f "ng serve" 2>/dev/null || true
pkill -f "@angular/cli" 2>/dev/null || true

print_success "🏁 All services stopped!"

# Optional: Stop PostgreSQL (commented out by default)
# Uncomment the next lines if you want to stop PostgreSQL as well
# print_status "Stopping PostgreSQL..."
# if command -v brew &> /dev/null; then
#     brew services stop postgresql@14 2>/dev/null || brew services stop postgresql 2>/dev/null || true
# else
#     sudo service postgresql stop 2>/dev/null || sudo systemctl stop postgresql 2>/dev/null || true
# fi