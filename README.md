# Mortgage Platform

A comprehensive web application that combines **Home Search**, **Mortgage Tools**, and **Mortgage Management** in a single platform. This production-ready MVP is built with modern technologies and provides a complete solution for home buyers and mortgage professionals.

## 🏗️ Architecture

- **Backend:** .NET Core 3.1, C#, REST API
- **Frontend:** Angular 19, TypeScript
- **Database:** PostgreSQL (latest stable)
- **Package Manager:** pnpm

## 🚀 Features

### 🏠 Home Search
- Advanced property search with multiple filters (location, price, bedrooms, etc.)
- Property detail views with high-quality images
- Save favorite properties
- Pagination and sorting capabilities
- Responsive design for mobile and desktop

### 🧮 Mortgage Tools
- **Mortgage Calculator:** Calculate monthly payments with detailed breakdowns
- **Pre-approval Checker:** Assess loan eligibility based on income and debt
- **Amortization Schedule:** Generate complete payment schedules
- **Refinance Calculator:** Compare refinancing options and savings
- **Rent vs Buy Calculator:** Financial analysis for renting vs purchasing
- **Extra Payment Calculator:** Calculate impact of additional payments
- Real-time calculations with interactive controls

### 📋 Mortgage Management
- **User Authentication:** Secure JWT-based login and registration
- **Loan Applications:** Complete application workflow with document upload
- **Application Tracking:** Real-time status updates and notifications
- **User Dashboard:** Centralized view of all applications and payments
- **Admin Panel:** Comprehensive management for loan officers and administrators
- **Market Trends:** Price history charts and market analysis
- **Property Comparison:** Side-by-side property feature comparison

## 📁 Project Structure

```
mortgage-platform/
├── backend/                 # .NET Core 3.1 API
│   ├── MortgagePlatform.API/
│   │   ├── Controllers/     # API endpoints
│   │   ├── Services/        # Business logic
│   │   ├── Models/          # Data models
│   │   ├── DTOs/            # Data transfer objects
│   │   └── Data/            # Entity Framework context
│   └── README.md
├── frontend/                # Angular 19 application
│   ├── src/app/
│   │   ├── auth/            # Authentication module
│   │   ├── home-search/     # Property search module
│   │   ├── mortgage-tools/  # Calculator and tools
│   │   ├── dashboard/       # User dashboard
│   │   ├── market-trends/   # Market analysis and price charts
│   │   ├── comparison/      # Property comparison features
│   │   ├── loan-application/ # Loan application forms
│   │   └── shared/          # Shared components
│   └── README.md
├── database/                # PostgreSQL scripts
│   ├── init.sql            # Database initialization
│   └── migrations/         # Schema migrations
├── docs/                   # Documentation
└── README.md
```

## 🛠️ Quick Start

### Prerequisites

- .NET Core 3.1 SDK
- Node.js (18+)
- PostgreSQL
- pnpm package manager

### ⚡ One-Command Setup & Start

```bash
# Initial setup (run once)
./setup.sh

# Start the application
./start.sh
```

That's it! The application will be available at:
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:5000  
- **API Docs:** http://localhost:5000/swagger

### 🧰 Development Commands

```bash
./dev.sh setup     # Run initial setup
./dev.sh start     # Start both frontend and backend
./dev.sh backend   # Start only backend
./dev.sh frontend  # Start only frontend  
./dev.sh stop      # Stop all services
./dev.sh build     # Build both projects
./dev.sh test      # Run tests
./dev.sh db        # Connect to database
```

### 👤 Test Accounts

- **Admin:** admin@mortgageplatform.com (password: admin123)
- **User:** john.doe@email.com (password: user123)

## 🔧 Configuration

### Backend Configuration

Update `backend/MortgagePlatform.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=mortgage_platform;Username=postgres;Password=your_password"
  },
  "Jwt": {
    "Key": "your-secret-key",
    "Issuer": "MortgagePlatformAPI",
    "Audience": "MortgagePlatformClient"
  }
}
```

### Frontend Configuration

The frontend automatically connects to the backend API. No additional configuration needed for development.

## 📊 API Documentation

Once the backend is running, visit `http://localhost:5000/swagger` for interactive API documentation.

### Key Endpoints

- **Authentication:** `/api/auth/login`, `/api/auth/register`
- **Properties:** `/api/properties/search`, `/api/properties/{id}`, `/api/properties/locations`
- **Mortgage Tools:** `/api/mortgage/calculate`, `/api/mortgage/preapproval`, `/api/mortgage/refinance`
- **Loans:** `/api/loans`, `/api/loans/{id}/status`
- **Market Data:** `/api/market-trends`, `/api/price-history`

## 🧪 Testing

### Backend Tests
```bash
cd backend
dotnet test
```

### Frontend Tests
```bash
cd frontend
pnpm test
```

## 🚀 Deployment

### Backend Deployment

```bash
cd backend
dotnet publish -c Release
# Deploy to your hosting platform
```

### Frontend Deployment

```bash
cd frontend
pnpm run build --configuration production
# Deploy dist/ folder to static hosting
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with BCrypt
- SQL injection protection via Entity Framework
- CORS configuration for secure cross-origin requests
- Input validation and sanitization
- Role-based access control (User/Admin)

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## 🔍 Key Components

### Backend Services
- **AuthService:** Handle user authentication and JWT tokens
- **PropertyService:** Manage property search and favorites
- **MortgageService:** Calculate payments and pre-approvals
- **LoanService:** Process loan applications and tracking

### Frontend Modules
- **Auth Module:** Login, registration, and authentication guards
- **Home Search Module:** Property search and filtering with advanced filters
- **Mortgage Tools Module:** Comprehensive calculators and financial tools
- **Dashboard Module:** User interface and loan management
- **Market Trends Module:** Market analysis with interactive charts
- **Comparison Module:** Property comparison functionality
- **Admin Module:** Administrative features for loan management
- **Loan Application Module:** Structured loan application forms

## 📈 Performance Features

- Lazy loading for Angular modules
- Database indexing for fast queries
- Pagination for large data sets
- Optimized API responses with realistic property data
- Caching strategies
- Efficient component architecture
- Interactive charts with optimized rendering
- Skeleton loaders for improved perceived performance
- Multi-state property dataset for comprehensive testing

## 🛡️ Data Models

### Core Entities
- **Users:** Authentication and profile management
- **Properties:** Real estate listings and details
- **LoanApplications:** Mortgage applications and tracking
- **Documents:** File upload and management
- **Payments:** Payment history and scheduling

## 🔧 Development Tools

- **Swagger:** API documentation and testing
- **Entity Framework:** Database ORM and migrations
- **Angular CLI:** Development and build tools
- **TypeScript:** Type-safe development (v5.7.2)
- **SCSS:** Advanced styling capabilities
- **Angular Material:** UI component library (v20.2.0)
- **Chart.js/D3:** Interactive data visualization
- **PostgreSQL:** Advanced database features with UUID support

## 📋 Production Readiness

This application includes:
- ✅ Error handling and logging
- ✅ Input validation
- ✅ Security best practices
- ✅ Database migrations
- ✅ Environment configuration
- ✅ API documentation
- ✅ Responsive design
- ✅ Test coverage
- ✅ Build and deployment scripts

## 📞 Support

For questions or issues:

1. Check the individual README files in `/backend/` and `/frontend/`
2. Review the API documentation at `/swagger`
3. Examine the database schema in `/database/init.sql`

## 📄 License

This project is available for demonstration purposes. Please ensure proper licensing for production use.

---

**Built with ❤️ using .NET Core, Angular, and PostgreSQL**