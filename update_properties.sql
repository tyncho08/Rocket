-- Backup existing properties and replace with new data
-- Generated on: 2025-08-26T13:37:15.952626

BEGIN;

-- Create backup table
CREATE TABLE IF NOT EXISTS "PropertiesBackup" AS SELECT * FROM "Properties";

-- Clear existing properties (favorites will be preserved via foreign key)
DELETE FROM "Properties";

-- Reset sequence
ALTER SEQUENCE "Properties_Id_seq" RESTART WITH 1;

-- Insert new properties
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '1984 Willow Brook Way',
    'San Antonio',
    'TX',
    '78279',
    305000,
    2,
    2,
    1351,
    'Single Family',
    'Charming single family with excellent location and access to local amenities and schools.',
    'https://images.unsplash.com/gKXKBY-C-Dk',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '4270 Pine St',
    'Nashville',
    'TN',
    '37245',
    575000,
    3,
    3,
    1433,
    'Single Family',
    'Stunning single family featuring spacious rooms and great natural light. Perfect for families.',
    'https://images.unsplash.com/zqH4QKW8yYE',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '1758 Birch Ct',
    'Nashville',
    'TN',
    '37242',
    515000,
    2,
    3,
    1371,
    'Townhouse',
    'Well-maintained townhouse with hardwood floors and updated fixtures throughout.',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '2984 Pine St',
    'Phoenix',
    'AZ',
    '85048',
    970000,
    3,
    4,
    1887,
    'Single Family',
    'Cozy single family perfect for first-time buyers or investors. Great neighborhood!',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '4606 Park View Dr',
    'Atlanta',
    'GA',
    '30337',
    630000,
    3,
    2,
    1794,
    'Single Family',
    'Well-maintained single family with hardwood floors and updated fixtures throughout.',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '7255 Oak Ridge Dr',
    'Charlotte',
    'NC',
    '28231',
    845000,
    5,
    1,
    2461,
    'Single Family',
    'Spacious single family offering comfort and convenience in prime Charlotte location.',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '3300 Willow Brook Way',
    'San Antonio',
    'TX',
    '78296',
    240000,
    2,
    2,
    1166,
    'Single Family',
    'Stunning single family featuring spacious rooms and great natural light. Perfect for families.',
    'https://images.unsplash.com/dBQQyDRWVAE',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '7419 Mountain View Dr',
    'Phoenix',
    'AZ',
    '85044',
    900000,
    4,
    2,
    2287,
    'Condo',
    'Charming condo with excellent location and access to local amenities and schools.',
    'https://images.unsplash.com/sR_24M8ZzHo',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '5839 Pine St',
    'Houston',
    'TX',
    '77065',
    605000,
    3,
    3,
    1715,
    'Single Family',
    'Spacious single family offering comfort and convenience in prime Houston location.',
    'https://images.unsplash.com/hV8zopbvSeY',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '7062 Pine St',
    'Miami',
    'FL',
    '33127',
    1010000,
    4,
    2,
    1644,
    'Single Family',
    'Stunning single family featuring spacious rooms and great natural light. Perfect for families.',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '4795 Elm Way',
    'Charlotte',
    'NC',
    '28211',
    445000,
    3,
    2,
    1109,
    'Single Family',
    'Well-maintained single family with hardwood floors and updated fixtures throughout.',
    'https://images.unsplash.com/hV8zopbvSeY',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '5834 Sunset Blvd',
    'Phoenix',
    'AZ',
    '85076',
    675000,
    3,
    2,
    1445,
    'Single Family',
    'Stunning single family featuring spacious rooms and great natural light. Perfect for families.',
    'https://images.unsplash.com/hV8zopbvSeY',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '5880 Forest Glen Way',
    'Miami',
    'FL',
    '33168',
    930000,
    5,
    2,
    2008,
    'Single Family',
    'Spacious single family offering comfort and convenience in prime Miami location.',
    'https://images.unsplash.com/gKXKBY-C-Dk',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '9493 Maple Ave',
    'Denver',
    'CO',
    '80296',
    590000,
    4,
    1,
    1931,
    'Condo',
    'Charming condo with excellent location and access to local amenities and schools.',
    'https://images.unsplash.com/YBYmlOyO8xc',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '6839 Birch Ct',
    'Atlanta',
    'GA',
    '30377',
    710000,
    3,
    3,
    1852,
    'Single Family',
    'Beautiful single family in desirable Atlanta neighborhood. Recently updated with modern finishes.',
    'https://images.unsplash.com/gKXKBY-C-Dk',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '3753 Park View Dr',
    'Phoenix',
    'AZ',
    '85083',
    505000,
    2,
    3,
    1510,
    'Single Family',
    'Beautiful single family in desirable Phoenix neighborhood. Recently updated with modern finishes.',
    'https://images.unsplash.com/hV8zopbvSeY',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '4627 Pine St',
    'Charlotte',
    'NC',
    '28270',
    305000,
    3,
    3,
    1386,
    'Condo',
    'Charming condo with excellent location and access to local amenities and schools.',
    'https://images.unsplash.com/dBQQyDRWVAE',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '8243 Maple Ave',
    'Nashville',
    'TN',
    '37291',
    1030000,
    4,
    4,
    2164,
    'Single Family',
    'Beautiful single family in desirable Nashville neighborhood. Recently updated with modern finishes.',
    'https://images.unsplash.com/gKXKBY-C-Dk',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '2369 Maple Ave',
    'San Antonio',
    'TX',
    '78240',
    575000,
    3,
    2,
    1588,
    'Condo',
    'Stunning condo featuring spacious rooms and great natural light. Perfect for families.',
    'https://images.unsplash.com/bWtd1ZyEy6w',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '5487 Birch Ct',
    'Dallas',
    'TX',
    '75259',
    340000,
    2,
    2,
    1115,
    'Loft',
    'Spacious loft offering comfort and convenience in prime Dallas location.',
    'https://images.unsplash.com/sR_24M8ZzHo',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '6259 Forest Glen Way',
    'Portland',
    'OR',
    '97260',
    790000,
    5,
    2,
    1970,
    'Single Family',
    'Stunning single family featuring spacious rooms and great natural light. Perfect for families.',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '4990 Oak Ridge Dr',
    'Denver',
    'CO',
    '80287',
    670000,
    3,
    4,
    1020,
    'Multi-Family',
    'Charming multi-family with excellent location and access to local amenities and schools.',
    'https://images.unsplash.com/bWtd1ZyEy6w',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '4695 Willow Brook Way',
    'Portland',
    'OR',
    '97219',
    1095000,
    4,
    3,
    1935,
    'Condo',
    'Charming condo with excellent location and access to local amenities and schools.',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '7727 Harbor Point Ln',
    'Portland',
    'OR',
    '97223',
    950000,
    5,
    3,
    1740,
    'Single Family',
    'Stunning single family featuring spacious rooms and great natural light. Perfect for families.',
    'https://images.unsplash.com/hV8zopbvSeY',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '2055 Forest Glen Way',
    'Seattle',
    'WA',
    '98115',
    1450000,
    4,
    2,
    1704,
    'Single Family',
    'Charming single family with excellent location and access to local amenities and schools.',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '9933 Willow Brook Way',
    'Denver',
    'CO',
    '80284',
    1200000,
    4,
    1,
    2118,
    'Townhouse',
    'Modern townhouse in Denver with updated kitchen and bathrooms. Move-in ready!',
    'https://images.unsplash.com/bWtd1ZyEy6w',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '6138 River Oaks Dr',
    'Charlotte',
    'NC',
    '28292',
    410000,
    3,
    2,
    1418,
    'Condo',
    'Spacious condo offering comfort and convenience in prime Charlotte location.',
    'https://images.unsplash.com/dBQQyDRWVAE',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '3195 Stone Creek Dr',
    'Denver',
    'CO',
    '80239',
    530000,
    3,
    3,
    1131,
    'Condo',
    'Modern condo in Denver with updated kitchen and bathrooms. Move-in ready!',
    'https://images.unsplash.com/gKXKBY-C-Dk',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '1808 Spring Valley Rd',
    'Dallas',
    'TX',
    '75257',
    695000,
    5,
    4,
    1801,
    'Single Family',
    'Spacious single family offering comfort and convenience in prime Dallas location.',
    'https://images.unsplash.com/dBQQyDRWVAE',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '1981 Birch Ct',
    'Miami',
    'FL',
    '33126',
    940000,
    3,
    3,
    1647,
    'Single Family',
    'Stunning single family featuring spacious rooms and great natural light. Perfect for families.',
    'https://images.unsplash.com/sR_24M8ZzHo',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '6247 Park View Dr',
    'Atlanta',
    'GA',
    '30336',
    530000,
    2,
    3,
    1515,
    'Multi-Family',
    'Spacious multi-family offering comfort and convenience in prime Atlanta location.',
    'https://images.unsplash.com/sR_24M8ZzHo',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '7072 Mountain View Dr',
    'Charlotte',
    'NC',
    '28254',
    555000,
    3,
    3,
    1468,
    'Single Family',
    'Elegant single family featuring open floor plan and premium upgrades in Charlotte.',
    'https://images.unsplash.com/gKXKBY-C-Dk',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '4081 Hill Country Ln',
    'Houston',
    'TX',
    '77089',
    500000,
    4,
    3,
    1868,
    'Single Family',
    'Spacious single family offering comfort and convenience in prime Houston location.',
    'https://images.unsplash.com/dBQQyDRWVAE',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '3828 Oak Ridge Dr',
    'Houston',
    'TX',
    '77059',
    770000,
    3,
    2,
    1379,
    'Condo',
    'Modern condo in Houston with updated kitchen and bathrooms. Move-in ready!',
    'https://images.unsplash.com/zqH4QKW8yYE',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '1866 Pine St',
    'Houston',
    'TX',
    '77084',
    805000,
    4,
    2,
    1448,
    'Single Family',
    'Cozy single family perfect for first-time buyers or investors. Great neighborhood!',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '302 Harbor Point Ln',
    'Charlotte',
    'NC',
    '28299',
    365000,
    2,
    2,
    1310,
    'Single Family',
    'Well-maintained single family with hardwood floors and updated fixtures throughout.',
    'https://images.unsplash.com/dBQQyDRWVAE',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '8632 Forest Glen Way',
    'Phoenix',
    'AZ',
    '85046',
    575000,
    3,
    2,
    1214,
    'Condo',
    'Cozy condo perfect for first-time buyers or investors. Great neighborhood!',
    'https://images.unsplash.com/sR_24M8ZzHo',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '1316 Forest Glen Way',
    'Charlotte',
    'NC',
    '28287',
    425000,
    3,
    2,
    1340,
    'Single Family',
    'Elegant single family featuring open floor plan and premium upgrades in Charlotte.',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '1275 Birch Ct',
    'Charlotte',
    'NC',
    '28277',
    290000,
    2,
    2,
    850,
    'Loft',
    'Charming loft with excellent location and access to local amenities and schools.',
    'https://images.unsplash.com/gKXKBY-C-Dk',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '4278 Garden Park Ave',
    'Austin',
    'TX',
    '78788',
    430000,
    3,
    1,
    1103,
    'Single Family',
    'Charming single family with excellent location and access to local amenities and schools.',
    'https://images.unsplash.com/sR_24M8ZzHo',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '2912 Garden Park Ave',
    'Miami',
    'FL',
    '33112',
    930000,
    3,
    3,
    1754,
    'Multi-Family',
    'Well-maintained multi-family with hardwood floors and updated fixtures throughout.',
    'https://images.unsplash.com/hV8zopbvSeY',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '1722 Forest Glen Way',
    'Miami',
    'FL',
    '33167',
    325000,
    2,
    2,
    878,
    'Single Family',
    'Modern single family in Miami with updated kitchen and bathrooms. Move-in ready!',
    'https://images.unsplash.com/gKXKBY-C-Dk',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '3244 Maple Ave',
    'Phoenix',
    'AZ',
    '85081',
    795000,
    4,
    2,
    1987,
    'Townhouse',
    'Well-maintained townhouse with hardwood floors and updated fixtures throughout.',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '6320 Hill Country Ln',
    'Nashville',
    'TN',
    '37255',
    535000,
    2,
    1,
    1395,
    'Single Family',
    'Spacious single family offering comfort and convenience in prime Nashville location.',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '4181 Maple Ave',
    'Dallas',
    'TX',
    '75297',
    435000,
    3,
    3,
    1024,
    'Townhouse',
    'Charming townhouse with excellent location and access to local amenities and schools.',
    'https://images.unsplash.com/sR_24M8ZzHo',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '9518 Birch Ct',
    'Seattle',
    'WA',
    '98116',
    1550000,
    3,
    2,
    2024,
    'Single Family',
    'Stunning single family featuring spacious rooms and great natural light. Perfect for families.',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '8572 Willow Brook Way',
    'Miami',
    'FL',
    '33175',
    550000,
    2,
    2,
    1215,
    'Single Family',
    'Cozy single family perfect for first-time buyers or investors. Great neighborhood!',
    'https://images.unsplash.com/zqH4QKW8yYE',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '6984 Garden Park Ave',
    'San Antonio',
    'TX',
    '78298',
    660000,
    4,
    2,
    1991,
    'Townhouse',
    'Well-maintained townhouse with hardwood floors and updated fixtures throughout.',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '2367 River Oaks Dr',
    'Seattle',
    'WA',
    '98197',
    1215000,
    5,
    2,
    2296,
    'Single Family',
    'Stunning single family featuring spacious rooms and great natural light. Perfect for families.',
    'https://images.unsplash.com/bWtd1ZyEy6w',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '2602 Birch Ct',
    'Portland',
    'OR',
    '97264',
    635000,
    3,
    3,
    1311,
    'Single Family',
    'Modern single family in Portland with updated kitchen and bathrooms. Move-in ready!',
    'https://images.unsplash.com/sR_24M8ZzHo',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '6985 Oak Ridge Dr',
    'Denver',
    'CO',
    '80248',
    1295000,
    3,
    2,
    1541,
    'Townhouse',
    'Modern townhouse in Denver with updated kitchen and bathrooms. Move-in ready!',
    'https://images.unsplash.com/hV8zopbvSeY',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '9568 Maple Ave',
    'Charlotte',
    'NC',
    '28253',
    365000,
    2,
    2,
    1060,
    'Single Family',
    'Stunning single family featuring spacious rooms and great natural light. Perfect for families.',
    'https://images.unsplash.com/bWtd1ZyEy6w',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '4698 River Oaks Dr',
    'Miami',
    'FL',
    '33121',
    600000,
    3,
    4,
    1686,
    'Multi-Family',
    'Well-maintained multi-family with hardwood floors and updated fixtures throughout.',
    'https://images.unsplash.com/dBQQyDRWVAE',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '1697 Pine St',
    'Atlanta',
    'GA',
    '30371',
    455000,
    3,
    3,
    1727,
    'Multi-Family',
    'Charming multi-family with excellent location and access to local amenities and schools.',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '7771 Spring Valley Rd',
    'Nashville',
    'TN',
    '37273',
    420000,
    2,
    1,
    1256,
    'Single Family',
    'Modern single family in Nashville with updated kitchen and bathrooms. Move-in ready!',
    'https://images.unsplash.com/sR_24M8ZzHo',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '1499 Forest Glen Way',
    'Seattle',
    'WA',
    '98126',
    1710000,
    4,
    2,
    1974,
    'Single Family',
    'Elegant single family featuring open floor plan and premium upgrades in Seattle.',
    'https://images.unsplash.com/sR_24M8ZzHo',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '2430 Oak Ridge Dr',
    'Miami',
    'FL',
    '33197',
    685000,
    3,
    2,
    1780,
    'Single Family',
    'Modern single family in Miami with updated kitchen and bathrooms. Move-in ready!',
    'https://images.unsplash.com/sR_24M8ZzHo',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '3622 Garden Park Ave',
    'Dallas',
    'TX',
    '75216',
    845000,
    4,
    3,
    1763,
    'Loft',
    'Well-maintained loft with hardwood floors and updated fixtures throughout.',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '1128 Willow Brook Way',
    'Seattle',
    'WA',
    '98188',
    940000,
    2,
    2,
    1029,
    'Multi-Family',
    'Cozy multi-family perfect for first-time buyers or investors. Great neighborhood!',
    'https://images.unsplash.com/zqH4QKW8yYE',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '3692 Sunset Blvd',
    'Denver',
    'CO',
    '80222',
    1040000,
    5,
    2,
    2041,
    'Single Family',
    'Beautiful single family in desirable Denver neighborhood. Recently updated with modern finishes.',
    'https://images.unsplash.com/hV8zopbvSeY',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '9771 Birch Ct',
    'Phoenix',
    'AZ',
    '85082',
    340000,
    2,
    2,
    1254,
    'Single Family',
    'Elegant single family featuring open floor plan and premium upgrades in Phoenix.',
    'https://images.unsplash.com/sR_24M8ZzHo',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '8335 Maple Ave',
    'Denver',
    'CO',
    '80251',
    1195000,
    4,
    2,
    1674,
    'Single Family',
    'Stunning single family featuring spacious rooms and great natural light. Perfect for families.',
    'https://images.unsplash.com/bWtd1ZyEy6w',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '1739 Sunset Blvd',
    'Phoenix',
    'AZ',
    '85063',
    545000,
    2,
    3,
    1515,
    'Single Family',
    'Well-maintained single family with hardwood floors and updated fixtures throughout.',
    'https://images.unsplash.com/gKXKBY-C-Dk',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '4269 Stone Creek Dr',
    'Atlanta',
    'GA',
    '30349',
    400000,
    3,
    2,
    2047,
    'Single Family',
    'Spacious single family offering comfort and convenience in prime Atlanta location.',
    'https://images.unsplash.com/sR_24M8ZzHo',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '2872 Birch Ct',
    'Houston',
    'TX',
    '77067',
    845000,
    3,
    2,
    1355,
    'Condo',
    'Beautiful condo in desirable Houston neighborhood. Recently updated with modern finishes.',
    'https://images.unsplash.com/zqH4QKW8yYE',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '5073 Spring Valley Rd',
    'Houston',
    'TX',
    '77049',
    1090000,
    4,
    3,
    2262,
    'Condo',
    'Spacious condo offering comfort and convenience in prime Houston location.',
    'https://images.unsplash.com/weHhGm-_p4E',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '7260 Mountain View Dr',
    'Denver',
    'CO',
    '80218',
    725000,
    3,
    1,
    1722,
    'Single Family',
    'Spacious single family offering comfort and convenience in prime Denver location.',
    'https://images.unsplash.com/gKXKBY-C-Dk',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '3566 Park View Dr',
    'Dallas',
    'TX',
    '75273',
    1075000,
    4,
    3,
    1802,
    'Condo',
    'Elegant condo featuring open floor plan and premium upgrades in Dallas.',
    'https://images.unsplash.com/hV8zopbvSeY',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '2945 Willow Brook Way',
    'San Antonio',
    'TX',
    '78266',
    285000,
    3,
    3,
    1288,
    'Single Family',
    'Cozy single family perfect for first-time buyers or investors. Great neighborhood!',
    'https://images.unsplash.com/bWtd1ZyEy6w',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '7691 Spring Valley Rd',
    'Phoenix',
    'AZ',
    '85036',
    305000,
    2,
    2,
    837,
    'Single Family',
    'Spacious single family offering comfort and convenience in prime Phoenix location.',
    'https://images.unsplash.com/sR_24M8ZzHo',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '7255 Oak Ridge Dr',
    'Austin',
    'TX',
    '78737',
    790000,
    3,
    2,
    1772,
    'Single Family',
    'Charming single family with excellent location and access to local amenities and schools.',
    'https://images.unsplash.com/sR_24M8ZzHo',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '9362 Elm Way',
    'San Antonio',
    'TX',
    '78215',
    610000,
    2,
    2,
    1504,
    'Single Family',
    'Modern single family in San Antonio with updated kitchen and bathrooms. Move-in ready!',
    'https://images.unsplash.com/gKXKBY-C-Dk',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '5679 Willow Brook Way',
    'Miami',
    'FL',
    '33181',
    500000,
    2,
    1,
    1144,
    'Loft',
    'Cozy loft perfect for first-time buyers or investors. Great neighborhood!',
    'https://images.unsplash.com/dBQQyDRWVAE',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '5011 Hill Country Ln',
    'San Antonio',
    'TX',
    '78241',
    650000,
    3,
    2,
    1574,
    'Single Family',
    'Beautiful single family in desirable San Antonio neighborhood. Recently updated with modern finishes.',
    'https://images.unsplash.com/hV8zopbvSeY',
    NOW(),
    true
);
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl", "ListedDate", "IsActive") VALUES (
    '7507 Stone Creek Dr',
    'Charlotte',
    'NC',
    '28233',
    370000,
    4,
    3,
    1816,
    'Single Family',
    'Elegant single family featuring open floor plan and premium upgrades in Charlotte.',
    'https://images.unsplash.com/zqH4QKW8yYE',
    NOW(),
    true
);

COMMIT;

-- Verify data
SELECT COUNT(*) as "New Property Count" FROM "Properties";
SELECT "City", COUNT(*) as "Count" FROM "Properties" GROUP BY "City" ORDER BY "Count" DESC;