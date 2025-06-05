-- PostgreSQL Schema for Supabase
-- Note: Supabase automatically creates the database, so no CREATE DATABASE needed

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Currencies table (must be created before chart_of_accounts due to foreign key)
CREATE TABLE IF NOT EXISTS currencies (
    id SERIAL PRIMARY KEY,
    currency VARCHAR(10) NOT NULL UNIQUE,
    rate DECIMAL(10, 4) NOT NULL DEFAULT 1.0000,
    effective_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Account Types table (must be created before chart_of_accounts due to foreign key)
CREATE TABLE IF NOT EXISTS account_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chart of Accounts table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id SERIAL PRIMARY KEY,
    number VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    inactive BOOLEAN DEFAULT FALSE,
    sub_account VARCHAR(100),
    type_id INTEGER NOT NULL,
    currency_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES account_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE SET NULL
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manufacturers table
CREATE TABLE IF NOT EXISTS manufacturers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_file VARCHAR(255),
    sorting INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouses table (Inventory Management)
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    warehouse_name VARCHAR(100) NOT NULL,
    number VARCHAR(20) NOT NULL UNIQUE,
    markup DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commissions table
CREATE TABLE IF NOT EXISTS commissions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    gp BOOLEAN DEFAULT FALSE,
    sales BOOLEAN DEFAULT FALSE,
    commercial_billing BOOLEAN DEFAULT FALSE,
    payment BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_currencies_updated_at BEFORE UPDATE ON currencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_account_types_updated_at BEFORE UPDATE ON account_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON chart_of_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_manufacturers_updated_at BEFORE UPDATE ON manufacturers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (PostgreSQL version)
INSERT INTO users (name, email) VALUES
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com'),
('Bob Johnson', 'bob@example.com')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO currencies (currency, rate, effective_date) VALUES
('CAD', 1.0000, '2024-01-01'),
('USD', 1.3500, '2024-01-01'),
('EUR', 1.5000, '2024-01-01')
ON CONFLICT (currency) DO UPDATE SET rate = EXCLUDED.rate, effective_date = EXCLUDED.effective_date;

INSERT INTO account_types (name, description) VALUES
('Asset', 'Resources owned by the company'),
('Liability', 'Debts and obligations of the company'),
('Equity', 'Owner''s interest in the company'),
('Revenue', 'Income generated from business operations'),
('Expense', 'Costs incurred in business operations')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO departments (number, name) VALUES
('001', 'Sales'),
('002', 'Marketing'),
('003', 'IT')
ON CONFLICT (number) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO locations (number, name) VALUES
('LOC001', 'Main Office'),
('LOC002', 'Warehouse A'),
('LOC003', 'Branch Office')
ON CONFLICT (number) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO chart_of_accounts (number, description, inactive, sub_account, type_id, currency_id) VALUES
('1000', 'Cash', FALSE, 'Assets', 1, 1),
('1100', 'Accounts Receivable', FALSE, 'Assets', 1, 1),
('2000', 'Accounts Payable', FALSE, 'Liabilities', 2, 1)
ON CONFLICT (number) DO UPDATE SET
    description = EXCLUDED.description,
    type_id = EXCLUDED.type_id,
    currency_id = EXCLUDED.currency_id;

INSERT INTO manufacturers (name, logo_file, sorting) VALUES
('Apple Inc.', 'apple_logo.png', 1),
('Microsoft Corp.', 'microsoft_logo.png', 2),
('Google LLC', 'google_logo.png', 3)
ON CONFLICT (name) DO UPDATE SET logo_file = EXCLUDED.logo_file, sorting = EXCLUDED.sorting;

INSERT INTO teams (name, description) VALUES
('Development Team', 'Software development and engineering'),
('Sales Team', 'Customer acquisition and sales'),
('Support Team', 'Customer support and service')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO warehouses (warehouse_name, number, markup) VALUES
('Main Warehouse', 'WH001', 15.00),
('Secondary Warehouse', 'WH002', 12.50),
('Distribution Center', 'WH003', 10.00)
ON CONFLICT (number) DO UPDATE SET warehouse_name = EXCLUDED.warehouse_name, markup = EXCLUDED.markup;

INSERT INTO commissions (type, percentage, gp, sales, commercial_billing, payment) VALUES
('Level A', 10.00, TRUE, TRUE, FALSE, FALSE),
('Level B', 12.00, TRUE, FALSE, TRUE, FALSE),
('Level C', 15.00, FALSE, TRUE, TRUE, FALSE),
('Level D', 20.00, TRUE, TRUE, TRUE, TRUE);
