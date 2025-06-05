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
