# Mortgage Platform Frontend

This is the frontend application for the Mortgage Platform built with Angular 17.

## Prerequisites

- Node.js (version 18 or higher)
- pnpm package manager
- Angular CLI

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Development Server

To start the development server:

```bash
pnpm start
```

The application will be available at `http://localhost:4200`

### 3. Build for Production

```bash
pnpm run build
```

The build artifacts will be stored in the `dist/` directory.

### 4. Run Tests

```bash
pnpm test
```

### 5. Code Linting

```bash
pnpm run lint
```

## Available Scripts

- `pnpm start` - Start development server
- `pnpm run build` - Build for production
- `pnpm run watch` - Build in watch mode
- `pnpm test` - Run unit tests

## Features

### Authentication
- User registration and login
- JWT token-based authentication
- Protected routes with guards

### Home Search
- Property search with filters
- Property details view
- Favorite properties management
- Pagination and sorting

### Mortgage Tools
- Mortgage payment calculator
- Pre-approval eligibility checker
- Amortization schedule generator

### Dashboard
- User profile management
- Loan application tracking
- Application status updates

### Admin Panel
- User management
- Loan application review
- Application approval/rejection

## Configuration

### Environment Variables

Update `src/environments/environment.ts` for development:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

### API Integration

The frontend connects to the backend API at the configured `apiUrl`. Ensure the backend is running and accessible.

## Project Structure

```
src/
├── app/
│   ├── auth/                # Authentication module
│   ├── home-search/         # Property search module
│   ├── mortgage-tools/      # Mortgage calculator module
│   ├── dashboard/           # User dashboard module
│   ├── shared/              # Shared components and services
│   ├── app.component.*      # Root component
│   ├── app.config.ts        # App configuration
│   └── app.routes.ts        # Routing configuration
├── assets/                  # Static assets
└── styles.scss              # Global styles
```

## Deployment

### Build for Production

```bash
pnpm run build --configuration production
```

### Deploy to Static Hosting

The built application can be deployed to any static hosting service like Netlify, Vercel, or AWS S3.

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Verify backend is running on correct port
   - Check CORS configuration in backend

2. **Authentication Issues**
   - Check JWT token storage
   - Verify token expiration handling

3. **Build Issues**
   - Clear node_modules and reinstall
   - Check Angular and dependency versions