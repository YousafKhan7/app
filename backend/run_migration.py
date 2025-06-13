#!/usr/bin/env python3
"""
Simple migration runner for the suppliers table.
Run this script to create the suppliers table in your database.
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

def run_migration():
    """Run the suppliers table migration."""
    try:
        # Connect to database
        print("Connecting to database...")
        connection = psycopg2.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Read migration file
        migration_file = os.path.join(os.path.dirname(__file__), 'migrations', 'create_suppliers_table.sql')
        
        if not os.path.exists(migration_file):
            print(f"Migration file not found: {migration_file}")
            return False
            
        with open(migration_file, 'r') as file:
            migration_sql = file.read()
        
        print("Running suppliers table migration...")
        
        # Execute migration
        cursor.execute(migration_sql)
        connection.commit()
        
        print("✅ Suppliers table migration completed successfully!")
        
        # Verify table was created
        cursor.execute("SELECT COUNT(*) FROM suppliers;")
        count = cursor.fetchone()[0]
        print(f"✅ Suppliers table created with {count} sample records")
        
        return True
        
    except Error as e:
        print(f"❌ Error running migration: {e}")
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
    print("🚀 Starting suppliers table migration...")
    success = run_migration()
    
    if success:
        print("\n🎉 Migration completed successfully!")
        print("You can now use the suppliers API endpoints.")
    else:
        print("\n💥 Migration failed!")
        print("Please check your database configuration and try again.")
