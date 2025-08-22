-- Migration 001: Initial Schema
-- Created: 2024-01-01
-- Description: Create initial database schema for Mortgage Platform

-- Users table
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" SERIAL PRIMARY KEY,
    "FirstName" VARCHAR(100) NOT NULL,
    "LastName" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(255) NOT NULL UNIQUE,
    "PasswordHash" TEXT NOT NULL,
    "Role" VARCHAR(20) NOT NULL DEFAULT 'User',
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE IF NOT EXISTS "Properties" (
    "Id" SERIAL PRIMARY KEY,
    "Address" VARCHAR(500) NOT NULL,
    "City" VARCHAR(100) NOT NULL,
    "State" VARCHAR(100) NOT NULL,
    "ZipCode" VARCHAR(10) NOT NULL,
    "Price" DECIMAL(18,2) NOT NULL,
    "Bedrooms" INTEGER NOT NULL DEFAULT 0,
    "Bathrooms" INTEGER NOT NULL DEFAULT 0,
    "SquareFeet" INTEGER NOT NULL DEFAULT 0,
    "PropertyType" VARCHAR(50),
    "Description" TEXT,
    "ImageUrl" VARCHAR(500),
    "ListedDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE
);

-- LoanApplications table
CREATE TABLE IF NOT EXISTS "LoanApplications" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id"),
    "LoanAmount" DECIMAL(18,2) NOT NULL,
    "PropertyValue" DECIMAL(18,2) NOT NULL,
    "DownPayment" DECIMAL(18,2) NOT NULL,
    "InterestRate" DECIMAL(5,4) NOT NULL,
    "LoanTermYears" INTEGER NOT NULL,
    "AnnualIncome" DECIMAL(18,2) NOT NULL,
    "EmploymentStatus" VARCHAR(50),
    "Employer" VARCHAR(100),
    "Status" VARCHAR(50) NOT NULL DEFAULT 'Pending',
    "Notes" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE IF NOT EXISTS "Documents" (
    "Id" SERIAL PRIMARY KEY,
    "LoanApplicationId" INTEGER NOT NULL REFERENCES "LoanApplications"("Id"),
    "FileName" VARCHAR(255) NOT NULL,
    "FilePath" VARCHAR(500) NOT NULL,
    "DocumentType" VARCHAR(100) NOT NULL,
    "FileSize" BIGINT NOT NULL DEFAULT 0,
    "ContentType" VARCHAR(100),
    "UploadedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS "Payments" (
    "Id" SERIAL PRIMARY KEY,
    "LoanApplicationId" INTEGER NOT NULL REFERENCES "LoanApplications"("Id"),
    "Amount" DECIMAL(18,2) NOT NULL,
    "PaymentDate" TIMESTAMP NOT NULL,
    "DueDate" TIMESTAMP NOT NULL,
    "Status" VARCHAR(50) NOT NULL,
    "PaymentMethod" VARCHAR(50),
    "TransactionId" VARCHAR(100),
    "PrincipalAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "InterestAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "RemainingBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "Notes" VARCHAR(500),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- FavoriteProperties table
CREATE TABLE IF NOT EXISTS "FavoriteProperties" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id"),
    "PropertyId" INTEGER NOT NULL REFERENCES "Properties"("Id"),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("UserId", "PropertyId")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "IX_Users_Email" ON "Users"("Email");
CREATE INDEX IF NOT EXISTS "IX_Properties_City_State" ON "Properties"("City", "State");
CREATE INDEX IF NOT EXISTS "IX_Properties_Price" ON "Properties"("Price");
CREATE INDEX IF NOT EXISTS "IX_LoanApplications_UserId" ON "LoanApplications"("UserId");
CREATE INDEX IF NOT EXISTS "IX_LoanApplications_Status" ON "LoanApplications"("Status");
CREATE INDEX IF NOT EXISTS "IX_Documents_LoanApplicationId" ON "Documents"("LoanApplicationId");
CREATE INDEX IF NOT EXISTS "IX_Payments_LoanApplicationId" ON "Payments"("LoanApplicationId");
CREATE INDEX IF NOT EXISTS "IX_FavoriteProperties_UserId" ON "FavoriteProperties"("UserId");
CREATE INDEX IF NOT EXISTS "IX_FavoriteProperties_PropertyId" ON "FavoriteProperties"("PropertyId");