#!/bin/bash

# Development helper script
echo "🔧 Mortgage Platform Development Helper"

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

show_help() {
    echo ""
    echo "Available commands:"
    echo "  ./dev.sh setup     - Run initial setup"
    echo "  ./dev.sh start     - Start both frontend and backend"
    echo "  ./dev.sh backend   - Start only backend"
    echo "  ./dev.sh frontend  - Start only frontend"
    echo "  ./dev.sh stop      - Stop all services"
    echo "  ./dev.sh build     - Build both projects"
    echo "  ./dev.sh test      - Run tests"
    echo "  ./dev.sh db        - Connect to database"
    echo "  ./dev.sh logs      - Show service logs"
    echo ""
}

case "$1" in
    "setup")
        echo -e "${BLUE}Running setup...${NC}"
        ./setup.sh
        ;;
    "start")
        echo -e "${BLUE}Starting full application...${NC}"
        ./start.sh
        ;;
    "backend")
        echo -e "${BLUE}Starting backend only...${NC}"
        cd backend
        echo "Backend will be available at: http://localhost:5000"
        echo "API Documentation at: http://localhost:5000/swagger"
        dotnet run --project MortgagePlatform.API
        ;;
    "frontend")
        echo -e "${BLUE}Starting frontend only...${NC}"
        cd frontend
        echo "Frontend will be available at: http://localhost:4200"
        pnpm start
        ;;
    "stop")
        echo -e "${BLUE}Stopping services...${NC}"
        ./stop.sh
        ;;
    "build")
        echo -e "${BLUE}Building projects...${NC}"
        echo "Building backend..."
        cd backend && dotnet build
        echo "Building frontend..."
        cd ../frontend && pnpm run build
        echo -e "${GREEN}Build complete!${NC}"
        ;;
    "test")
        echo -e "${BLUE}Running tests...${NC}"
        echo "Backend tests:"
        cd backend && dotnet test
        echo "Frontend tests:"
        cd ../frontend && pnpm test --watch=false
        ;;
    "db")
        echo -e "${BLUE}Connecting to database...${NC}"
        psql -d mortgage_platform
        ;;
    "logs")
        echo -e "${BLUE}Recent logs...${NC}"
        echo "Backend processes:"
        ps aux | grep -E "(dotnet|MortgagePlatform)" | grep -v grep
        echo "Frontend processes:"
        ps aux | grep -E "(node.*angular|ng serve)" | grep -v grep
        ;;
    *)
        echo -e "${YELLOW}Welcome to Mortgage Platform Development Helper!${NC}"
        show_help
        ;;
esac