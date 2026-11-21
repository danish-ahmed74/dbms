-- ============================================================
-- RedPulse: Blood Bank Management System
-- Relational Database Schema & Data Dictionary (MySQL / XAMPP)
-- Team Members: Atharv Malviya (0827CS241044), Danish Ahmed (0827CS241062)
-- ============================================================

CREATE DATABASE IF NOT EXISTS redpulse_db;
USE redpulse_db;

-- 1. ADMINISTRATORS Table
CREATE TABLE IF NOT EXISTS ADMINISTRATORS (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. BLOOD_INVENTORY Table
CREATE TABLE IF NOT EXISTS BLOOD_INVENTORY (
    inventory_id INT PRIMARY KEY AUTO_INCREMENT,
    blood_group VARCHAR(5) UNIQUE NOT NULL,
    available_units INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. DONORS Table
CREATE TABLE IF NOT EXISTS DONORS (
    donor_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    contact_no VARCHAR(15) NOT NULL,
    city VARCHAR(50) NOT NULL,
    last_donation_date DATE NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. BLOOD_REQUESTS Table
CREATE TABLE IF NOT EXISTS BLOOD_REQUESTS (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_name VARCHAR(100) NOT NULL,
    blood_group_needed VARCHAR(5) NOT NULL,
    units_requested INT NOT NULL,
    hospital_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    contact_no VARCHAR(15) NOT NULL,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Approved', 'Rejected', 'Fulfilled') DEFAULT 'Pending',
    admin_notes VARCHAR(255) NULL
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Seed Administrators (Default password is 'admin123')
INSERT INTO ADMINISTRATORS (username, password_hash) VALUES 
('admin', '$2b$10$wT8m9V4r2GqPqfO.u1i4yeYnCsmv4jP6XF4rA6CgE6.1w6K8fO8eG'),
('danish', '$2b$10$wT8m9V4r2GqPqfO.u1i4yeYnCsmv4jP6XF4rA6CgE6.1w6K8fO8eG'),
('atharv', '$2b$10$wT8m9V4r2GqPqfO.u1i4yeYnCsmv4jP6XF4rA6CgE6.1w6K8fO8eG')
ON DUPLICATE KEY UPDATE username=username;

-- Seed Initial Blood Inventory (All 8 blood groups)
INSERT INTO BLOOD_INVENTORY (blood_group, available_units) VALUES
('A+', 24),
('A-', 8),
('B+', 32),
('B-', 6),
('AB+', 14),
('AB-', 4),
('O+', 45),
('O-', 9)
ON DUPLICATE KEY UPDATE available_units=VALUES(available_units);

-- Seed Donors (varied last_donation_dates to test 90-day cooldown)
INSERT INTO DONORS (full_name, blood_group, age, gender, contact_no, city, last_donation_date) VALUES
('Rahul Sharma', 'O+', 28, 'Male', '+91 9876543210', 'Bhopal', '2026-08-10'),
('Priya Verma', 'A+', 24, 'Female', '+91 9823456781', 'Indore', '2026-11-05'),
('Amit Patel', 'B+', 34, 'Male', '+91 9812345672', 'Bhopal', '2026-07-15'),
('Sneha Kulkarni', 'AB-', 29, 'Female', '+91 9898765433', 'Jabalpur', '2026-06-20'),
('Mohit Saxena', 'O-', 31, 'Male', '+91 9755512344', 'Gwalior', NULL),
('Ananya Gupta', 'B-', 22, 'Female', '+91 9826098765', 'Bhopal', '2026-10-18'),
('Rohan Malhotra', 'AB+', 27, 'Male', '+91 9988776655', 'Indore', '2026-05-12'),
('Vikram Singh', 'A-', 38, 'Male', '+91 9123456789', 'Ujjain', '2026-08-01');

-- Seed Requests
INSERT INTO BLOOD_REQUESTS (patient_name, blood_group_needed, units_requested, hospital_name, contact_person, contact_no, status, request_date) VALUES
('Ramesh Chandra', 'O+', 2, 'AIIMS Bhopal', 'Dr. Alok Sen', '+91 9827011223', 'Pending', '2026-11-21 10:15:00'),
('Kavita Joshi', 'B+', 3, 'Chirayu Medical College', 'Dr. Meena Nair', '+91 9893044556', 'Approved', '2026-11-20 16:40:00'),
('Sunil Yadav', 'AB-', 1, 'Bansal Hospital', 'Sister Neha', '+91 9425088990', 'Fulfilled', '2026-11-19 11:20:00'),
('Deepak Lodhi', 'O-', 2, 'Hamidia Hospital', 'Rajesh Lodhi', '+91 9752033445', 'Pending', '2026-11-21 14:05:00');
