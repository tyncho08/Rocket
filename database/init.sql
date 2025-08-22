-- Mortgage Platform Database Schema
-- PostgreSQL initialization script

-- Create database (run this separately if needed)
-- CREATE DATABASE mortgage_platform;

-- Connect to the database
\c mortgage_platform;

-- Create Users table
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

-- Create Properties table
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

-- Create LoanApplications table
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

-- Create Documents table
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

-- Create Payments table
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

-- Create FavoriteProperties table
CREATE TABLE IF NOT EXISTS "FavoriteProperties" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id"),
    "PropertyId" INTEGER NOT NULL REFERENCES "Properties"("Id"),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("UserId", "PropertyId")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "IX_Users_Email" ON "Users"("Email");
CREATE INDEX IF NOT EXISTS "IX_Properties_City_State" ON "Properties"("City", "State");
CREATE INDEX IF NOT EXISTS "IX_Properties_Price" ON "Properties"("Price");
CREATE INDEX IF NOT EXISTS "IX_LoanApplications_UserId" ON "LoanApplications"("UserId");
CREATE INDEX IF NOT EXISTS "IX_LoanApplications_Status" ON "LoanApplications"("Status");
CREATE INDEX IF NOT EXISTS "IX_Documents_LoanApplicationId" ON "Documents"("LoanApplicationId");
CREATE INDEX IF NOT EXISTS "IX_Payments_LoanApplicationId" ON "Payments"("LoanApplicationId");
CREATE INDEX IF NOT EXISTS "IX_FavoriteProperties_UserId" ON "FavoriteProperties"("UserId");
CREATE INDEX IF NOT EXISTS "IX_FavoriteProperties_PropertyId" ON "FavoriteProperties"("PropertyId");

-- Insert seed data

-- Insert admin user (password: admin123)
INSERT INTO "Users" ("FirstName", "LastName", "Email", "PasswordHash", "Role") VALUES 
('Admin', 'User', 'admin@mortgageplatform.com', '$2a$11$8H4Z0Z9Z0Z9Z0Z9Z0Z9Z0eHd7XdQ8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q', 'Admin')
ON CONFLICT ("Email") DO NOTHING;

-- Insert sample user (password: user123)
INSERT INTO "Users" ("FirstName", "LastName", "Email", "PasswordHash", "Role") VALUES 
('John', 'Doe', 'john.doe@email.com', '$2a$11$9I5A1A0A1A0A1A0A1A0A1fIe8YeR9R9R9R9R9R9R9R9R9R9R9R9R9R', 'User')
ON CONFLICT ("Email") DO NOTHING;

-- Insert sample properties
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl") VALUES 
('123 Main St', 'Austin', 'TX', '78701', 450000.00, 3, 2, 1800, 'Single Family', 'Beautiful home in downtown Austin with modern amenities', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994'),
('456 Oak Ave', 'Austin', 'TX', '78702', 325000.00, 2, 2, 1200, 'Condo', 'Modern condo with city views', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'),
('789 Pine St', 'Houston', 'TX', '77001', 520000.00, 4, 3, 2400, 'Single Family', 'Spacious family home with large yard', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'),
('321 Elm Dr', 'Dallas', 'TX', '75201', 380000.00, 3, 2, 1600, 'Townhouse', 'Modern townhouse in great neighborhood', 'https://images.unsplash.com/photo-1605146769289-440113cc3d00'),
('654 Maple Ln', 'San Antonio', 'TX', '78201', 295000.00, 2, 1, 1000, 'Condo', 'Cozy condo perfect for first-time buyers', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'),
('987 Cedar Blvd', 'Austin', 'TX', '78703', 675000.00, 4, 3, 2800, 'Single Family', 'Luxury home with pool and modern finishes', 'https://images.unsplash.com/photo-1613977257363-707ba9348227'),
('147 Birch Way', 'Houston', 'TX', '77002', 425000.00, 3, 2, 1900, 'Single Family', 'Charming home near downtown', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'),
('258 Spruce St', 'Dallas', 'TX', '75202', 340000.00, 2, 2, 1300, 'Condo', 'Contemporary condo with amenities', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13'),
('369 Willow Ave', 'San Antonio', 'TX', '78202', 275000.00, 2, 1, 950, 'Townhouse', 'Affordable townhouse in quiet area', 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c'),
('741 Ash Dr', 'Austin', 'TX', '78704', 550000.00, 3, 3, 2200, 'Single Family', 'Updated home with energy-efficient features', 'https://images.unsplash.com/photo-1582407947304-fd86f028f716');

-- Insert sample loan application
INSERT INTO "LoanApplications" ("UserId", "LoanAmount", "PropertyValue", "DownPayment", "InterestRate", "LoanTermYears", "AnnualIncome", "EmploymentStatus", "Employer", "Status", "Notes") VALUES 
(2, 360000.00, 450000.00, 90000.00, 6.5000, 30, 85000.00, 'Full-time', 'Tech Corp', 'Under Review', 'Initial application submitted');

-- Function to update UpdatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update UpdatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "Users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON "LoanApplications" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mortgage_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mortgage_user;