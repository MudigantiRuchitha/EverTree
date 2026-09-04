
-- Evertree PostgreSQL Database Schema with Legal Verification & Verification ID

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('buyer', 'seller', 'broker', 'admin')),
    phone VARCHAR(20) NOT NULL,
    verification_id VARCHAR(50) UNIQUE NOT NULL,
    phone_verified BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT TRUE,
    approval_status VARCHAR(30) DEFAULT 'approved' CHECK (approval_status IN ('approved', 'pending_admin_verification', 'rejected')),
    
    -- Legal Compliance Fields for Sellers & Brokers
    govt_id_type VARCHAR(50),        -- Aadhaar, PAN, Passport, GSTIN
    govt_id_number VARCHAR(100),
    rera_number VARCHAR(100),        -- Mandatory for Brokers (Real Estate Regulatory Authority)
    agency_license VARCHAR(100),     -- Broker Agency License
    ownership_proof_ref VARCHAR(100),-- Seller Property Ownership Khata / Deed Reference
    
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('buy', 'sell', 'rent', 'commercial', 'agricultural')),
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('apartment', 'villa', 'independent_house', 'plot', 'commercial_office', 'commercial_shop', 'agricultural_land')),
    bhk INT DEFAULT 0,
    price NUMERIC(12, 2) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    seller_id INT REFERENCES users(id) ON DELETE CASCADE,
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS property_media (
    id SERIAL PRIMARY KEY,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    file_url VARCHAR(255) NOT NULL,
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'video'))
);

CREATE TABLE IF NOT EXISTS property_docs (
    id SERIAL PRIMARY KEY,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    file_url VARCHAR(255) NOT NULL,
    title VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS property_amenities (
    id SERIAL PRIMARY KEY,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    amenity_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS enquiries (
    id SERIAL PRIMARY KEY,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id INT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
    property_id INT REFERENCES properties(id) ON DELETE SET NULL,
    message TEXT,
    media_url VARCHAR(255),
    media_type VARCHAR(20) DEFAULT 'text' CHECK (media_type IN ('text', 'image', 'file', 'voice')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_leads (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('loan', 'legal', 'interior')),
    details JSONB,
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
