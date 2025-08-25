# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Rocket Mortgage Platform - a full-stack mortgage application with property search, mortgage calculators, and loan management features.

**Tech Stack:**
- Backend: .NET Core 3.1 with C# (API at http://localhost:5000)
- Frontend: Angular 19 with TypeScript (UI at http://localhost:4200)
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
- **home-search/** - Property search and listing features
- **mortgage-tools/** - Calculators (payment, refinance, rent vs buy, etc.)
- **dashboard/** - User dashboard and loan management
- **admin/** - Administrative features for loan approval
- **shared/** - Common components, services, and utilities

Key patterns:
- Standalone components architecture
- Lazy loading for performance
- Angular Material for UI components
- Reactive forms and form validation
- Route guards for authentication
- Interceptors for API communication

### Database Schema
Main tables:
- Users - User accounts with roles (User/Admin)
- Properties - Property listings
- LoanApplications - Mortgage applications
- Documents - Uploaded documents
- Payments - Payment tracking
- FavoriteProperties - User favorites

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
- Regular User: user@example.com / password123
- Admin User: admin@example.com / admin123

### Key Features to Test
1. Property search with filters and pagination
2. Mortgage calculators (payment, refinance, amortization)
3. Loan application workflow
4. Document upload functionality
5. Admin loan approval process
6. User dashboard and favorites

### Common Development Tasks

When modifying the API:
1. Update the controller in `backend/MortgagePlatform.API/Controllers/`
2. Update corresponding service in `Services/`
3. Update DTOs if needed
4. Test with Swagger UI at http://localhost:5000/swagger

When modifying the UI:
1. Components are in `frontend/src/app/[module]/`
2. Services are typically in the same module directory
3. Use Angular Material components for consistency
4. Follow existing patterns for forms and validation

### Performance Considerations
- Frontend uses lazy loading - maintain module boundaries
- API uses pagination for large datasets
- Images are loaded lazily with skeleton loaders
- Consider using Angular's OnPush change detection for new components

### Security Notes
- Never store sensitive data in frontend code
- All user inputs are validated on both frontend and backend
- SQL injection protection via Entity Framework parameterized queries
- CORS is configured for localhost development