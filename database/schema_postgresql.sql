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

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    sales_rep_id INTEGER,
    phone VARCHAR(50),
    email VARCHAR(200),
    address TEXT,
    contact_name VARCHAR(200),
    contact_title VARCHAR(100),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(200),
    currency_id INTEGER,
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    bank_name VARCHAR(200),
    file_format VARCHAR(50),
    account_number VARCHAR(100),
    institution VARCHAR(200),
    transit VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_rep_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE SET NULL
);

-- Quotes table (placeholder for future Quote module)
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    customer_id INTEGER,
    engineer_id INTEGER,
    salesman_id INTEGER,
    date DATE NOT NULL,
    sell_price DECIMAL(12, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (engineer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (salesman_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    customer_id INTEGER,
    engineer_id INTEGER,
    end_user VARCHAR(200),
    date DATE NOT NULL,
    salesman_id INTEGER,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (engineer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (salesman_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Accounts/Invoices table
CREATE TABLE IF NOT EXISTS customer_accounts (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    date DATE NOT NULL,
    project_id INTEGER,
    customer_id INTEGER,
    name VARCHAR(200) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    outstanding DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    reminder_date DATE,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Create suppliers table with same structure as customers table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    sales_rep_id INTEGER REFERENCES users(id),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    contact_name VARCHAR(255),
    contact_title VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    currency_id INTEGER REFERENCES currencies(id),
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    bank_name VARCHAR(255),
    file_format VARCHAR(100),
    account_number VARCHAR(100),
    institution VARCHAR(255),
    transit VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on supplier name for faster searches
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- Create index on sales_rep_id for faster joins
CREATE INDEX IF NOT EXISTS idx_suppliers_sales_rep_id ON suppliers(sales_rep_id);

-- Create index on currency_id for faster joins
CREATE INDEX IF NOT EXISTS idx_suppliers_currency_id ON suppliers(currency_id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_suppliers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_suppliers_updated_at();

-- Insert some sample suppliers for testing (optional)
INSERT INTO suppliers (name, category, tax_rate) VALUES 
('ABC Supply Co.', 'Hardware', 13.00),
('Tech Solutions Ltd.', 'Technology', 13.00),
('Global Materials Inc.', 'Materials', 13.00)
ON CONFLICT DO NOTHING;

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
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_accounts_updated_at BEFORE UPDATE ON customer_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Sample customer data
INSERT INTO customers (name, category, sales_rep_id, phone, email, address, contact_name, contact_title, contact_phone, contact_email, currency_id, tax_rate, bank_name, file_format, account_number, institution, transit) VALUES
('Acme Corporation', 'Manufacturing', 1, '555-0123', 'info@acme.com', '123 Business St, Toronto, ON M5V 3A8', 'John Smith', 'Purchasing Manager', '555-0124', 'john.smith@acme.com', 1, 13.00, 'TD Bank', 'CSV', '123456789', 'TD Bank Group', '12345'),
('Tech Solutions Inc', 'Technology', 2, '555-0456', 'contact@techsolutions.com', '456 Innovation Ave, Vancouver, BC V6B 1A1', 'Sarah Johnson', 'CTO', '555-0457', 'sarah.johnson@techsolutions.com', 1, 12.00, 'RBC', 'Excel', '987654321', 'Royal Bank of Canada', '67890'),
('Global Enterprises', 'Retail', 3, '555-0789', 'sales@global.com', '789 Commerce Blvd, Calgary, AB T2P 1J9', 'Mike Wilson', 'Operations Director', '555-0790', 'mike.wilson@global.com', 2, 15.00, 'BMO', 'PDF', '456789123', 'Bank of Montreal', '54321');

-- Sample quotes data
INSERT INTO quotes (job_id, name, customer_id, engineer_id, salesman_id, date, sell_price, status) VALUES
('Q2024-001', 'Office Renovation Project', 1, 1, 2, '2024-01-15', 25000.00, 'Approved'),
('Q2024-002', 'IT Infrastructure Upgrade', 2, 2, 1, '2024-01-20', 45000.00, 'Pending'),
('Q2024-003', 'Warehouse Automation', 3, 1, 3, '2024-02-01', 75000.00, 'Draft');

-- Sample projects data
INSERT INTO projects (project_id, name, customer_id, engineer_id, end_user, date, salesman_id, status) VALUES
('P2024-001', 'Office Renovation Implementation', 1, 1, 'Acme Head Office', '2024-02-01', 2, 'In Progress'),
('P2024-002', 'Server Room Setup', 2, 2, 'Tech Solutions Vancouver', '2024-02-15', 1, 'Planning'),
('P2024-003', 'Retail System Integration', 3, 1, 'Global Store Network', '2024-03-01', 3, 'Active');

-- Sample customer accounts data
INSERT INTO customer_accounts (invoice_number, date, project_id, customer_id, name, amount, outstanding, reminder_date, comments) VALUES
('INV-2024-001', '2024-02-01', 1, 1, 'Office Renovation - Phase 1', 12500.00, 5000.00, '2024-03-01', 'Partial payment received'),
('INV-2024-002', '2024-02-15', 2, 2, 'IT Infrastructure - Initial Setup', 22500.00, 22500.00, '2024-03-15', 'Awaiting approval'),
('INV-2024-003', '2024-03-01', 3, 3, 'Warehouse Automation - Consultation', 15000.00, 0.00, NULL, 'Paid in full');
