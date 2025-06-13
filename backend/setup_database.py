#!/usr/bin/env python3
"""
Complete database setup script for the Full Stack App.
This script creates all necessary tables and sample data.
"""

import psycopg2
from psycopg2 import Error
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'postgres'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', ''),
    'port': int(os.getenv('DB_PORT', 5432))
}

def execute_sql(cursor, sql, description):
    """Execute SQL with error handling."""
    try:
        cursor.execute(sql)
        print(f"✅ {description}")
        return True
    except Error as e:
        print(f"❌ Error in {description}: {e}")
        return False

def setup_database():
    """Set up the complete database schema."""
    try:
        print("Connecting to database...")
        connection = psycopg2.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Create tables in order of dependencies
        
        # 1. Users table
        users_sql = """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        execute_sql(cursor, users_sql, "Created users table")
        
        # 2. Account Types table
        account_types_sql = """
        CREATE TABLE IF NOT EXISTS account_types (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        execute_sql(cursor, account_types_sql, "Created account_types table")
        
        # 3. Currencies table
        currencies_sql = """
        CREATE TABLE IF NOT EXISTS currencies (
            id SERIAL PRIMARY KEY,
            currency VARCHAR(10) NOT NULL,
            rate DECIMAL(10,4) DEFAULT 1.0000,
            effective_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        execute_sql(cursor, currencies_sql, "Created currencies table")
        
        # 4. Chart of Accounts table
        chart_accounts_sql = """
        CREATE TABLE IF NOT EXISTS chart_of_accounts (
            id SERIAL PRIMARY KEY,
            number VARCHAR(50) NOT NULL,
            description VARCHAR(255) NOT NULL,
            inactive BOOLEAN DEFAULT FALSE,
            sub_account VARCHAR(255),
            type_id INTEGER REFERENCES account_types(id),
            currency_id INTEGER REFERENCES currencies(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        execute_sql(cursor, chart_accounts_sql, "Created chart_of_accounts table")
        
        # 5. Departments table
        departments_sql = """
        CREATE TABLE IF NOT EXISTS departments (
            id SERIAL PRIMARY KEY,
            number VARCHAR(50) NOT NULL,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        execute_sql(cursor, departments_sql, "Created departments table")
        
        # 6. Locations table
        locations_sql = """
        CREATE TABLE IF NOT EXISTS locations (
            id SERIAL PRIMARY KEY,
            number VARCHAR(50) NOT NULL,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        execute_sql(cursor, locations_sql, "Created locations table")
        
        # 7. Manufacturers table
        manufacturers_sql = """
        CREATE TABLE IF NOT EXISTS manufacturers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            logo_file VARCHAR(255),
            sorting INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        execute_sql(cursor, manufacturers_sql, "Created manufacturers table")
        
        # 8. Teams table
        teams_sql = """
        CREATE TABLE IF NOT EXISTS teams (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        execute_sql(cursor, teams_sql, "Created teams table")
        
        # 9. Warehouses table
        warehouses_sql = """
        CREATE TABLE IF NOT EXISTS warehouses (
            id SERIAL PRIMARY KEY,
            warehouse_name VARCHAR(255) NOT NULL,
            number VARCHAR(50) NOT NULL,
            markup DECIMAL(5,2) DEFAULT 0.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        execute_sql(cursor, warehouses_sql, "Created warehouses table")
        
        # 10. Commissions table
        commissions_sql = """
        CREATE TABLE IF NOT EXISTS commissions (
            id SERIAL PRIMARY KEY,
            type VARCHAR(255) NOT NULL,
            percentage DECIMAL(5,2) DEFAULT 0.00,
            gp BOOLEAN DEFAULT FALSE,
            sales BOOLEAN DEFAULT FALSE,
            commercial_billing BOOLEAN DEFAULT FALSE,
            payment BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        execute_sql(cursor, commissions_sql, "Created commissions table")
        
        # 11. Customers table
        customers_sql = """
        CREATE TABLE IF NOT EXISTS customers (
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
        """
        execute_sql(cursor, customers_sql, "Created customers table")
        
        # 12. Suppliers table (NEW)
        suppliers_sql = """
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
        """
        execute_sql(cursor, suppliers_sql, "Created suppliers table")
        
        # 13. Quotes table
        quotes_sql = """
        CREATE TABLE IF NOT EXISTS quotes (
            id SERIAL PRIMARY KEY,
            job_id VARCHAR(100) NOT NULL,
            name VARCHAR(255) NOT NULL,
            customer_id INTEGER REFERENCES customers(id),
            engineer_id INTEGER REFERENCES users(id),
            salesman_id INTEGER REFERENCES users(id),
            date DATE NOT NULL,
            sell_price DECIMAL(10,2) DEFAULT 0.00,
            status VARCHAR(50) DEFAULT 'Draft',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        execute_sql(cursor, quotes_sql, "Created quotes table")
        
        # 14. Projects table
        projects_sql = """
        CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            project_id VARCHAR(100) NOT NULL,
            name VARCHAR(255) NOT NULL,
            customer_id INTEGER REFERENCES customers(id),
            engineer_id INTEGER REFERENCES users(id),
            end_user VARCHAR(255),
            date DATE NOT NULL,
            salesman_id INTEGER REFERENCES users(id),
            status VARCHAR(50) DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        execute_sql(cursor, projects_sql, "Created projects table")
        
        # 15. Customer Accounts table
        customer_accounts_sql = """
        CREATE TABLE IF NOT EXISTS customer_accounts (
            id SERIAL PRIMARY KEY,
            invoice_number VARCHAR(100) NOT NULL,
            date DATE NOT NULL,
            project_id INTEGER REFERENCES projects(id),
            customer_id INTEGER REFERENCES customers(id),
            name VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) DEFAULT 0.00,
            outstanding DECIMAL(10,2) DEFAULT 0.00,
            reminder_date DATE,
            comments TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        execute_sql(cursor, customer_accounts_sql, "Created customer_accounts table")
        
        connection.commit()
        print("\n🎉 All tables created successfully!")
        
        return True
        
    except Error as e:
        print(f"❌ Database setup error: {e}")
        if connection:
            connection.rollback()
        return False
        
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        print("Database connection closed.")

if __name__ == "__main__":
    print("🚀 Starting complete database setup...")
    success = setup_database()
    
    if success:
        print("\n✅ Database setup completed successfully!")
        print("All tables are ready for use.")
    else:
        print("\n💥 Database setup failed!")
        print("Please check your database configuration and try again.")
