# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Rocket Mortgage Platform - a full-stack mortgage application with property search, mortgage calculators, and loan management features.

**Tech Stack:**
- Backend: .NET Core 3.1 with C# (API at http://localhost:5000)
- Frontend: Angular 19.2 with TypeScript 5.7.2 (UI at http://localhost:4200)
- Database: PostgreSQL
- Package Manager: pnpm (frontend), dotnet CLI (backend)

## Essential Commands

### Development Workflow
```bash
# Initial setup (only needed once)
./setup.sh

# Start full application (frontend + backend + database)
./start.sh
# or
./dev.sh start

# Start individual services
./dev.sh backend    # Backend only
./dev.sh frontend   # Frontend only

# Stop all services
./stop.sh
# or
./dev.sh stop

# Run tests
./dev.sh test

# Build both projects
./dev.sh build

# Connect to database
./dev.sh db

# View logs
./dev.sh logs
```

### Frontend-Specific Commands
```bash
cd frontend
pnpm install      # Install dependencies
pnpm start        # Start dev server
pnpm build        # Production build
pnpm test         # Run tests
pnpm lint         # Run linter
pnpm typecheck    # TypeScript type checking
```

### Backend-Specific Commands
```bash
cd backend/MortgagePlatform.API
dotnet restore    # Restore dependencies
dotnet build      # Build project
dotnet run        # Run the API
dotnet test       # Run tests (if test project exists)
```

## Architecture Overview

### Backend Structure
The backend follows a layered architecture:
- **Controllers/** - REST API endpoints (AuthController, PropertiesController, MortgageController, etc.)
- **Services/** - Business logic layer with interface-based design (IAuthService, IPropertyService, etc.)
- **Models/** - Domain entities (User, Property, LoanApplication, etc.)
- **DTOs/** - Data transfer objects for API communication
- **Data/** - Entity Framework context and database configuration

Key patterns:
- Dependency injection for all services
- JWT authentication with BCrypt password hashing
- Entity Framework Core for database operations
- Swagger documentation at /swagger

### Frontend Structure
Angular application with modular design:
- **auth/** - Authentication module with login/register components
- **home-search/** - Property search and listing features with advanced filtering
- **mortgage-tools/** - Comprehensive calculators (payment, refinance, rent vs buy, extra payments)
- **dashboard/** - User dashboard and loan management
- **admin/** - Administrative features for loan approval and management
- **market-trends/** - Market analysis with interactive price history charts
- **comparison/** - Property comparison functionality
- **loan-application/** - Structured loan application forms
- **shared/** - Common components, services, and utilities

Key patterns:
- Standalone components architecture
- Lazy loading for performance optimization
- Angular Material 20.2.0 for consistent UI components
- Reactive forms with comprehensive validation
- Route guards for authentication and authorization
- HTTP interceptors for API communication and error handling
- Interactive data visualization with charts
- Skeleton loaders for improved user experience
- Professional styling with enhanced visual design

### Database Schema
**Database**: PostgreSQL (`mortgage_platform`)
**Connection**: Host=localhost, Username=MartinGonella, Password=(empty), Port=5432

Main tables:
- Users - User accounts with roles (User/Admin)
- Properties - Property listings
- LoanApplications - Mortgage applications
- Documents - Uploaded documents
- Payments - Payment tracking
- FavoriteProperties - User favorites

**Database Management**:
- Schema initialization via `database/init.sql`
- No EF migrations - uses manual SQL schema files
- Data stored in PostgreSQL default directory (`/usr/local/var/postgres`)
- Access via DBeaver: localhost:5432, database=mortgage_platform, user=MartinGonella

## Important Development Notes

### API Communication
- Base API URL: `http://localhost:5000/api`
- All API calls require JWT token in Authorization header (except auth endpoints)
- Token storage: localStorage (key: 'token')
- Session timeout: 60 minutes

### Authentication Flow
1. User registers/logs in via `/api/auth/login` or `/api/auth/register`
2. Backend returns JWT token
3. Frontend stores token and includes in subsequent requests
4. Route guards protect authenticated routes

### Testing Accounts
- Regular User: john.doe@email.com / user123
- Admin User: admin@mortgageplatform.com / admin123

### Key Features to Test
1. Property search with advanced filters and pagination
2. Comprehensive mortgage calculators (payment, refinance, rent vs buy, extra payments, amortization)
3. Market trends dashboard with interactive price history charts
4. Property comparison functionality
5. Loan application workflow with structured forms
6. Document upload functionality
7. Admin loan approval and management process
8. User dashboard with favorites and loan tracking
9. Multi-state property dataset with realistic data
10. Enhanced UI with professional styling and animations

### Common Development Tasks

When modifying the API:
1. Update the controller in `backend/MortgagePlatform.API/Controllers/`
2. Update corresponding service in `Services/`
3. Update DTOs if needed
4. Test with Swagger UI at http://localhost:5000/swagger

When modifying the UI:
1. Components are in `frontend/src/app/[module]/`
2. Services are typically in the same module directory
3. Use Angular Material 20.2.0 components for consistency
4. Follow existing patterns for forms and validation
5. Maintain professional styling and visual design standards
6. Use interactive charts for data visualization where appropriate
7. Implement skeleton loaders for better user experience
8. Follow accessibility best practices with proper ARIA attributes

### Performance Considerations
- Frontend uses lazy loading - maintain module boundaries
- API uses pagination for large datasets with realistic multi-state property data
- Images are loaded lazily with skeleton loaders for improved perceived performance
- Interactive charts are optimized for smooth rendering
- Consider using Angular's OnPush change detection for new components
- Database queries are optimized with proper indexing
- UUID generation functions are properly configured in PostgreSQL
- Professional styling is optimized for cross-browser compatibility

### Security Notes
- Never store sensitive data in frontend code
- All user inputs are validated on both frontend and backend
- SQL injection protection via Entity Framework parameterized queries
- CORS is configured for localhost development