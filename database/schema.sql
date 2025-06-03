-- Create database
CREATE DATABASE IF NOT EXISTS app;
USE app;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Currencies table (must be created before chart_of_accounts due to foreign key)
CREATE TABLE IF NOT EXISTS currencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    currency VARCHAR(10) NOT NULL UNIQUE,
    rate DECIMAL(10, 4) NOT NULL DEFAULT 1.0000,
    effective_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Chart of Accounts table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    inactive BOOLEAN DEFAULT FALSE,
    sub_account VARCHAR(100),
    type VARCHAR(50) NOT NULL,
    currency_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE SET NULL
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Manufacturers table
CREATE TABLE IF NOT EXISTS manufacturers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo_file VARCHAR(255),
    sorting INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Warehouses table (Inventory Management)
CREATE TABLE IF NOT EXISTS warehouses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_name VARCHAR(100) NOT NULL,
    number VARCHAR(20) NOT NULL UNIQUE,
    markup DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email) VALUES
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com'),
('Bob Johnson', 'bob@example.com')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO currencies (currency, rate, effective_date) VALUES
('CAD', 1.0000, '2024-01-01'),
('USD', 1.3500, '2024-01-01'),
('EUR', 1.5000, '2024-01-01')
ON DUPLICATE KEY UPDATE rate=VALUES(rate), effective_date=VALUES(effective_date);

INSERT INTO departments (number, name) VALUES
('001', 'Sales'),
('002', 'Marketing'),
('003', 'IT')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO locations (number, name) VALUES
('LOC001', 'Main Office'),
('LOC002', 'Warehouse A'),
('LOC003', 'Branch Office')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO chart_of_accounts (number, description, inactive, sub_account, type, currency_id) VALUES
('1000', 'Cash', FALSE, 'Assets', 'Asset', 1),
('1100', 'Accounts Receivable', FALSE, 'Assets', 'Asset', 1),
('2000', 'Accounts Payable', FALSE, 'Liabilities', 'Liability', 1)
ON DUPLICATE KEY UPDATE description=VALUES(description), type=VALUES(type), currency_id=VALUES(currency_id);

INSERT INTO manufacturers (name, logo_file, sorting) VALUES
('Apple Inc.', 'apple_logo.png', 1),
('Microsoft Corp.', 'microsoft_logo.png', 2),
('Google LLC', 'google_logo.png', 3)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO teams (name, description) VALUES
('Development Team', 'Software development and engineering'),
('Sales Team', 'Customer acquisition and sales'),
('Support Team', 'Customer support and service')
ON DUPLICATE KEY UPDATE description=VALUES(description);

INSERT INTO warehouses (warehouse_name, number, markup) VALUES
('Main Warehouse', 'WH001', 15.00),
('Secondary Warehouse', 'WH002', 12.50),
('Distribution Center', 'WH003', 10.00)
ON DUPLICATE KEY UPDATE warehouse_name=VALUES(warehouse_name);
