-- ============================================================
-- RedPulse: Blood Bank Management System
-- Supabase (PostgreSQL) Database Schema & Seed Data
-- ============================================================

-- Drop existing tables if re-running
DROP TABLE IF EXISTS blood_requests CASCADE;
DROP TABLE IF EXISTS donors CASCADE;
DROP TABLE IF EXISTS blood_inventory CASCADE;
DROP TABLE IF EXISTS administrators CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;

-- 0. Custom Enum for Request Status
CREATE TYPE request_status AS ENUM ('Pending', 'Approved', 'Rejected', 'Fulfilled');

-- 1. ADMINISTRATORS Table
CREATE TABLE administrators (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BLOOD_INVENTORY Table
CREATE TABLE blood_inventory (
    inventory_id SERIAL PRIMARY KEY,
    blood_group VARCHAR(5) UNIQUE NOT NULL,
    available_units INT DEFAULT 0 CHECK (available_units >= 0),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DONORS Table
CREATE TABLE donors (
    donor_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    age INT NOT NULL CHECK (age >= 18 AND age <= 65),
    gender VARCHAR(10) NOT NULL,
    contact_no VARCHAR(15) NOT NULL,
    city VARCHAR(50) NOT NULL,
    last_donation_date DATE NULL,
    registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BLOOD_REQUESTS Table
CREATE TABLE blood_requests (
    request_id SERIAL PRIMARY KEY,
    patient_name VARCHAR(100) NOT NULL,
    blood_group_needed VARCHAR(5) NOT NULL,
    units_requested INT NOT NULL CHECK (units_requested > 0),
    hospital_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    contact_no VARCHAR(15) NOT NULL,
    request_date TIMESTAMPTZ DEFAULT NOW(),
    status request_status DEFAULT 'Pending',
    admin_notes TEXT NULL
);

-- Auto-update trigger for last_updated in blood_inventory
CREATE OR REPLACE FUNCTION update_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_blood_inventory_timestamp ON blood_inventory;
CREATE TRIGGER trg_update_blood_inventory_timestamp
BEFORE UPDATE ON blood_inventory
FOR EACH ROW
EXECUTE FUNCTION update_inventory_timestamp();

-- Enable Row Level Security (RLS) & Grant Public Access
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access to administrators" ON administrators FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to blood_inventory" ON blood_inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to donors" ON donors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to blood_requests" ON blood_requests FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Seed Administrators (password: admin123)
INSERT INTO administrators (username, password_hash) VALUES 
('admin', '$2b$10$wT8m9V4r2GqPqfO.u1i4yeYnCsmv4jP6XF4rA6CgE6.1w6K8fO8eG'),
('danish', '$2b$10$wT8m9V4r2GqPqfO.u1i4yeYnCsmv4jP6XF4rA6CgE6.1w6K8fO8eG'),
('atharv', '$2b$10$wT8m9V4r2GqPqfO.u1i4yeYnCsmv4jP6XF4rA6CgE6.1w6K8fO8eG')
ON CONFLICT (username) DO NOTHING;

-- Seed Initial Blood Inventory (All 8 blood groups)
INSERT INTO blood_inventory (blood_group, available_units) VALUES
('A+', 24),
('A-', 8),
('B+', 32),
('B-', 6),
('AB+', 14),
('AB-', 4),
('O+', 45),
('O-', 9)
ON CONFLICT (blood_group) DO UPDATE SET available_units = EXCLUDED.available_units;

-- Seed Donors
INSERT INTO donors (full_name, blood_group, age, gender, contact_no, city, last_donation_date) VALUES
('Rahul Sharma', 'O+', 28, 'Male', '+91 9876543210', 'Bhopal', '2026-08-10'),
('Priya Verma', 'A+', 24, 'Female', '+91 9823456781', 'Indore', '2026-11-05'),
('Amit Patel', 'B+', 34, 'Male', '+91 9812345672', 'Bhopal', '2026-07-15'),
('Sneha Kulkarni', 'AB-', 29, 'Female', '+91 9898765433', 'Jabalpur', '2026-06-20'),
('Mohit Saxena', 'O-', 31, 'Male', '+91 9755512344', 'Gwalior', NULL),
('Ananya Gupta', 'B-', 22, 'Female', '+91 9826098765', 'Bhopal', '2026-10-18'),
('Rohan Malhotra', 'AB+', 27, 'Male', '+91 9988776655', 'Indore', '2026-05-12'),
('Vikram Singh', 'A-', 38, 'Male', '+91 9123456789', 'Ujjain', '2026-08-01');

-- Seed Blood Requests
INSERT INTO blood_requests (patient_name, blood_group_needed, units_requested, hospital_name, contact_person, contact_no, status, request_date) VALUES
('Ramesh Chandra', 'O+', 2, 'AIIMS Bhopal', 'Dr. Alok Sen', '+91 9827011223', 'Pending', '2026-11-21 10:15:00+05:30'),
('Kavita Joshi', 'B+', 3, 'Chirayu Medical College', 'Dr. Meena Nair', '+91 9893044556', 'Approved', '2026-11-20 16:40:00+05:30'),
('Sunil Yadav', 'AB-', 1, 'Bansal Hospital', 'Sister Neha', '+91 9425088990', 'Fulfilled', '2026-11-19 11:20:00+05:30'),
('Deepak Lodhi', 'O-', 2, 'Hamidia Hospital', 'Rajesh Lodhi', '+91 9752033445', 'Pending', '2026-11-21 14:05:00+05:30');
