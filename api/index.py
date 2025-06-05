from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2 import Error
import os
import shutil
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Full Stack App API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "https://*.vercel.app",   # Vercel deployments
        "https://yourdomain.com", # Your custom domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration for PostgreSQL/Supabase
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'postgres'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', ''),
    'port': int(os.getenv('DB_PORT', 5432))
}

# Pydantic models
class User(BaseModel):
    id: int = None
    name: str
    email: str

class UserCreate(BaseModel):
    name: str
    email: str

class AccountType(BaseModel):
    id: int = None
    name: str
    description: str = None

class AccountTypeCreate(BaseModel):
    name: str
    description: str = None

class ChartOfAccount(BaseModel):
    id: int = None
    number: str
    description: str
    inactive: bool = False
    sub_account: str = None
    type_id: int
    currency_id: int = None

class ChartOfAccountCreate(BaseModel):
    number: str
    description: str
    inactive: bool = False
    sub_account: str = None
    type_id: int
    currency_id: int = None

class Department(BaseModel):
    id: int = None
    number: str
    name: str

class DepartmentCreate(BaseModel):
    number: str
    name: str

class Location(BaseModel):
    id: int = None
    number: str
    name: str

class LocationCreate(BaseModel):
    number: str
    name: str

class Currency(BaseModel):
    id: int = None
    currency: str
    rate: float
    effective_date: str

class CurrencyCreate(BaseModel):
    currency: str
    rate: float
    effective_date: str

class Manufacturer(BaseModel):
    id: int = None
    name: str
    logo_file: str = None
    sorting: int = 0

class ManufacturerCreate(BaseModel):
    name: str
    logo_file: str = None
    sorting: int = 0

class Team(BaseModel):
    id: int = None
    name: str
    description: str = None

class TeamCreate(BaseModel):
    name: str
    description: str = None

class Warehouse(BaseModel):
    id: int = None
    warehouse_name: str
    number: str
    markup: float = 0.00

class WarehouseCreate(BaseModel):
    warehouse_name: str
    number: str
    markup: float = 0.00

class Commission(BaseModel):
    id: int = None
    type: str
    percentage: float = 0.00
    gp: bool = False
    sales: bool = False
    commercial_billing: bool = False
    payment: bool = False

class CommissionCreate(BaseModel):
    type: str
    percentage: float = 0.00
    gp: bool = False
    sales: bool = False
    commercial_billing: bool = False
    payment: bool = False

# Database connection helper
def get_db_connection():
    try:
        connection = psycopg2.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to PostgreSQL: {e}")
        return None

# Helper function to execute queries with proper cursor
def execute_query(query, params=None, fetch_one=False, fetch_all=False):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        cursor = connection.cursor(cursor_factory=RealDictCursor)
        cursor.execute(query, params)
        
        result = None
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return result
    except Error as e:
        if connection:
            connection.rollback()
            connection.close()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# API Routes
@app.get("/")
async def root():
    return {"message": "Welcome to Full Stack App API"}

@app.get("/health")
async def health_check():
    try:
        connection = get_db_connection()
        if connection and not connection.closed:
            connection.close()
            return {"status": "healthy", "database": "connected"}
        else:
            return {"status": "unhealthy", "database": "disconnected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# Users endpoints
@app.get("/users")
async def get_users():
    users = execute_query("SELECT * FROM users", fetch_all=True)
    return {"users": users}

@app.post("/users")
async def create_user(user: UserCreate):
    query = "INSERT INTO users (name, email) VALUES (%s, %s) RETURNING id"
    result = execute_query(query, (user.name, user.email), fetch_one=True)
    return {"message": "User created successfully", "user_id": result['id']}

@app.put("/users/{user_id}")
async def update_user(user_id: int, user: UserCreate):
    query = "UPDATE users SET name=%s, email=%s WHERE id=%s"
    execute_query(query, (user.name, user.email, user_id))
    return {"message": "User updated successfully"}

@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
    query = "DELETE FROM users WHERE id=%s"
    execute_query(query, (user_id,))
    return {"message": "User deleted successfully"}

# Account Types endpoints
@app.get("/account-types")
async def get_account_types():
    account_types = execute_query("SELECT * FROM account_types ORDER BY name", fetch_all=True)
    return {"account_types": account_types}

@app.post("/account-types")
async def create_account_type(account_type: AccountTypeCreate):
    query = "INSERT INTO account_types (name, description) VALUES (%s, %s) RETURNING id"
    result = execute_query(query, (account_type.name, account_type.description), fetch_one=True)
    return {"message": "Account type created successfully", "account_type_id": result['id']}

# Chart of Accounts endpoints
@app.get("/chart-of-accounts")
async def get_chart_of_accounts():
    accounts = execute_query("SELECT * FROM chart_of_accounts ORDER BY number", fetch_all=True)
    return {"accounts": accounts}

@app.post("/chart-of-accounts")
async def create_chart_of_account(account: ChartOfAccountCreate):
    query = """INSERT INTO chart_of_accounts 
               (number, description, inactive, sub_account, type_id, currency_id) 
               VALUES (%s, %s, %s, %s, %s, %s) RETURNING id"""
    result = execute_query(query, (account.number, account.description, account.inactive, 
                                 account.sub_account, account.type_id, account.currency_id), fetch_one=True)
    return {"message": "Account created successfully", "account_id": result['id']}

@app.put("/chart-of-accounts/{account_id}")
async def update_chart_of_account(account_id: int, account: ChartOfAccountCreate):
    query = """UPDATE chart_of_accounts 
               SET number=%s, description=%s, inactive=%s, sub_account=%s, type_id=%s, currency_id=%s 
               WHERE id=%s"""
    execute_query(query, (account.number, account.description, account.inactive, 
                         account.sub_account, account.type_id, account.currency_id, account_id))
    return {"message": "Account updated successfully"}

@app.delete("/chart-of-accounts/{account_id}")
async def delete_chart_of_account(account_id: int):
    query = "DELETE FROM chart_of_accounts WHERE id=%s"
    execute_query(query, (account_id,))
    return {"message": "Account deleted successfully"}

# Departments endpoints
@app.get("/departments")
async def get_departments():
    departments = execute_query("SELECT * FROM departments ORDER BY number", fetch_all=True)
    return {"departments": departments}

@app.post("/departments")
async def create_department(department: DepartmentCreate):
    query = "INSERT INTO departments (number, name) VALUES (%s, %s) RETURNING id"
    result = execute_query(query, (department.number, department.name), fetch_one=True)
    return {"message": "Department created successfully", "department_id": result['id']}

@app.put("/departments/{department_id}")
async def update_department(department_id: int, department: DepartmentCreate):
    query = "UPDATE departments SET number=%s, name=%s WHERE id=%s"
    execute_query(query, (department.number, department.name, department_id))
    return {"message": "Department updated successfully"}

@app.delete("/departments/{department_id}")
async def delete_department(department_id: int):
    query = "DELETE FROM departments WHERE id=%s"
    execute_query(query, (department_id,))
    return {"message": "Department deleted successfully"}

# Locations endpoints
@app.get("/locations")
async def get_locations():
    locations = execute_query("SELECT * FROM locations ORDER BY number", fetch_all=True)
    return {"locations": locations}

@app.post("/locations")
async def create_location(location: LocationCreate):
    query = "INSERT INTO locations (number, name) VALUES (%s, %s) RETURNING id"
    result = execute_query(query, (location.number, location.name), fetch_one=True)
    return {"message": "Location created successfully", "location_id": result['id']}

@app.put("/locations/{location_id}")
async def update_location(location_id: int, location: LocationCreate):
    query = "UPDATE locations SET number=%s, name=%s WHERE id=%s"
    execute_query(query, (location.number, location.name, location_id))
    return {"message": "Location updated successfully"}

@app.delete("/locations/{location_id}")
async def delete_location(location_id: int):
    query = "DELETE FROM locations WHERE id=%s"
    execute_query(query, (location_id,))
    return {"message": "Location deleted successfully"}

# Currencies endpoints
@app.get("/currencies")
async def get_currencies():
    currencies = execute_query("SELECT * FROM currencies ORDER BY currency", fetch_all=True)
    return {"currencies": currencies}

@app.post("/currencies")
async def create_currency(currency: CurrencyCreate):
    query = "INSERT INTO currencies (currency, rate, effective_date) VALUES (%s, %s, %s) RETURNING id"
    result = execute_query(query, (currency.currency, currency.rate, currency.effective_date), fetch_one=True)
    return {"message": "Currency created successfully", "currency_id": result['id']}

@app.put("/currencies/{currency_id}")
async def update_currency(currency_id: int, currency: CurrencyCreate):
    query = "UPDATE currencies SET currency=%s, rate=%s, effective_date=%s WHERE id=%s"
    execute_query(query, (currency.currency, currency.rate, currency.effective_date, currency_id))
    return {"message": "Currency updated successfully"}

@app.delete("/currencies/{currency_id}")
async def delete_currency(currency_id: int):
    query = "DELETE FROM currencies WHERE id=%s"
    execute_query(query, (currency_id,))
    return {"message": "Currency deleted successfully"}

# Manufacturers endpoints
@app.get("/manufacturers")
async def get_manufacturers():
    manufacturers = execute_query("SELECT * FROM manufacturers ORDER BY sorting", fetch_all=True)
    return {"manufacturers": manufacturers}

@app.post("/manufacturers")
async def create_manufacturer(manufacturer: ManufacturerCreate):
    query = "INSERT INTO manufacturers (name, logo_file, sorting) VALUES (%s, %s, %s) RETURNING id"
    result = execute_query(query, (manufacturer.name, manufacturer.logo_file, manufacturer.sorting), fetch_one=True)
    return {"message": "Manufacturer created successfully", "manufacturer_id": result['id']}

@app.put("/manufacturers/{manufacturer_id}")
async def update_manufacturer(manufacturer_id: int, manufacturer: ManufacturerCreate):
    query = "UPDATE manufacturers SET name=%s, logo_file=%s, sorting=%s WHERE id=%s"
    execute_query(query, (manufacturer.name, manufacturer.logo_file, manufacturer.sorting, manufacturer_id))
    return {"message": "Manufacturer updated successfully"}

@app.delete("/manufacturers/{manufacturer_id}")
async def delete_manufacturer(manufacturer_id: int):
    query = "DELETE FROM manufacturers WHERE id=%s"
    execute_query(query, (manufacturer_id,))
    return {"message": "Manufacturer deleted successfully"}

# Teams endpoints
@app.get("/teams")
async def get_teams():
    teams = execute_query("SELECT * FROM teams ORDER BY name", fetch_all=True)
    return {"teams": teams}

@app.post("/teams")
async def create_team(team: TeamCreate):
    query = "INSERT INTO teams (name, description) VALUES (%s, %s) RETURNING id"
    result = execute_query(query, (team.name, team.description), fetch_one=True)
    return {"message": "Team created successfully", "team_id": result['id']}

@app.put("/teams/{team_id}")
async def update_team(team_id: int, team: TeamCreate):
    query = "UPDATE teams SET name=%s, description=%s WHERE id=%s"
    execute_query(query, (team.name, team.description, team_id))
    return {"message": "Team updated successfully"}

@app.delete("/teams/{team_id}")
async def delete_team(team_id: int):
    query = "DELETE FROM teams WHERE id=%s"
    execute_query(query, (team_id,))
    return {"message": "Team deleted successfully"}

# Warehouses endpoints
@app.get("/warehouses")
async def get_warehouses():
    warehouses = execute_query("SELECT * FROM warehouses ORDER BY number", fetch_all=True)
    return {"warehouses": warehouses}

@app.post("/warehouses")
async def create_warehouse(warehouse: WarehouseCreate):
    query = "INSERT INTO warehouses (warehouse_name, number, markup) VALUES (%s, %s, %s) RETURNING id"
    result = execute_query(query, (warehouse.warehouse_name, warehouse.number, warehouse.markup), fetch_one=True)
    return {"message": "Warehouse created successfully", "warehouse_id": result['id']}

@app.put("/warehouses/{warehouse_id}")
async def update_warehouse(warehouse_id: int, warehouse: WarehouseCreate):
    query = "UPDATE warehouses SET warehouse_name=%s, number=%s, markup=%s WHERE id=%s"
    execute_query(query, (warehouse.warehouse_name, warehouse.number, warehouse.markup, warehouse_id))
    return {"message": "Warehouse updated successfully"}

@app.delete("/warehouses/{warehouse_id}")
async def delete_warehouse(warehouse_id: int):
    query = "DELETE FROM warehouses WHERE id=%s"
    execute_query(query, (warehouse_id,))
    return {"message": "Warehouse deleted successfully"}

# Commissions endpoints
@app.get("/commissions")
async def get_commissions():
    commissions = execute_query("SELECT * FROM commissions ORDER BY type", fetch_all=True)
    return {"commissions": commissions}

@app.post("/commissions")
async def create_commission(commission: CommissionCreate):
    query = """INSERT INTO commissions
               (type, percentage, gp, sales, commercial_billing, payment)
               VALUES (%s, %s, %s, %s, %s, %s) RETURNING id"""
    result = execute_query(query, (commission.type, commission.percentage, commission.gp,
                                 commission.sales, commission.commercial_billing, commission.payment), fetch_one=True)
    return {"message": "Commission created successfully", "commission_id": result['id']}

@app.put("/commissions/{commission_id}")
async def update_commission(commission_id: int, commission: CommissionCreate):
    query = """UPDATE commissions
               SET type=%s, percentage=%s, gp=%s, sales=%s, commercial_billing=%s, payment=%s
               WHERE id=%s"""
    execute_query(query, (commission.type, commission.percentage, commission.gp,
                         commission.sales, commission.commercial_billing, commission.payment, commission_id))
    return {"message": "Commission updated successfully"}

@app.delete("/commissions/{commission_id}")
async def delete_commission(commission_id: int):
    query = "DELETE FROM commissions WHERE id=%s"
    execute_query(query, (commission_id,))
    return {"message": "Commission deleted successfully"}

# File upload endpoint (simplified for Vercel)
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # For Vercel, we'll return a placeholder since file storage is limited
        # In production, you'd want to use a service like AWS S3, Cloudinary, etc.
        import uuid
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        unique_filename = f"{uuid.uuid4()}.{file_extension}"

        # Return a placeholder response
        return {
            "filename": unique_filename,
            "url": f"/uploads/{unique_filename}",
            "message": "File upload simulated - integrate with cloud storage for production"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

# Vercel handler
handler = app
