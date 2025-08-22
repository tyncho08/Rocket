#!/bin/bash

# Verification script to check if everything is set up correctly
echo "🔍 Verifying Mortgage Platform Setup..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_passed=0
check_total=0

check_item() {
    local name="$1"
    local command="$2"
    check_total=$((check_total + 1))
    
    if eval "$command" &>/dev/null; then
        echo -e "✅ ${GREEN}$name${NC}"
        check_passed=$((check_passed + 1))
    else
        echo -e "❌ ${RED}$name${NC}"
    fi
}

echo "Checking prerequisites..."
check_item ".NET Core SDK" "dotnet --version"
check_item "Node.js" "node --version"
check_item "pnpm" "pnpm --version"
check_item "PostgreSQL" "psql --version"

echo ""
echo "Checking database..."
check_item "Database exists" "psql -d mortgage_platform -c 'SELECT 1' -t"
check_item "Users table exists" "psql -d mortgage_platform -c 'SELECT COUNT(*) FROM \"Users\"' -t"
check_item "Properties table has data" "psql -d mortgage_platform -c 'SELECT COUNT(*) FROM \"Properties\"' -t | grep -q '[1-9]'"

echo ""
echo "Checking backend..."
check_item "Backend builds" "cd backend && dotnet build"
check_item "Backend dependencies" "cd backend && dotnet restore --verbosity quiet"

echo ""
echo "Checking frontend..."
check_item "Frontend dependencies" "cd frontend && pnpm list > /dev/null"
check_item "Frontend builds" "cd frontend && pnpm run build > /dev/null"

echo ""
echo "📊 Verification Results:"
echo "   Passed: $check_passed/$check_total checks"

if [ $check_passed -eq $check_total ]; then
    echo -e "🎉 ${GREEN}All checks passed! Ready to run the application.${NC}"
    echo ""
    echo "Next steps:"
    echo "  ./start.sh    - Start the full application"
    echo "  ./dev.sh      - See all development commands"
else
    echo -e "⚠️  ${YELLOW}Some checks failed. Please review the output above.${NC}"
    if [ $check_passed -lt $((check_total / 2)) ]; then
        echo "Consider running ./setup.sh again"
    fi
fi