from fastapi import FastAPI, HTTPException, File, UploadFile, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator
import re
import os
import shutil
from pathlib import Path
from dotenv import load_dotenv
from database import execute_query, health_check, cleanup_database
import atexit
import json
from datetime import datetime
from typing import List


# Load environment variables
load_dotenv()

app = FastAPI(title="Full Stack App API", version="1.0.0")

# Create uploads directory if it doesn't exist
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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

# Register cleanup function for application shutdown
atexit.register(cleanup_database)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove dead connections
                self.active_connections.remove(connection)

    async def broadcast_event(self, event_type: str, data: dict):
        message = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(json.dumps(message))

manager = ConnectionManager()

# Pydantic models
class User(BaseModel):
    id: int = None
    name: str
    email: str
    active: bool = True

class UserCreate(BaseModel):
    name: str
    email: str
    active: bool = True

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
    name: str  # This will be the currency name/code
    code: str  # This will be the same as name for now
    currency: str  # Keep for backward compatibility
    rate: float
    effective_date: str
    created_at: str = None
    updated_at: str = None

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

class Customer(BaseModel):
    id: int = None
    name: str
    category: str = None
    sales_rep_id: int = None
    phone: str = None
    email: str = None
    address: str = None
    contact_name: str = None
    contact_title: str = None
    contact_phone: str = None
    contact_email: str = None
    currency_id: int = None
    tax_rate: float = 0.00
    bank_name: str = None
    file_format: str = None
    account_number: str = None
    institution: str = None
    transit: str = None

class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    category: str = None
    sales_rep_id: int = None
    phone: str = None
    email: str = None
    address: str = None
    contact_name: str = None
    contact_title: str = None
    contact_phone: str = None
    contact_email: str = None
    currency_id: int = None
    tax_rate: float = Field(default=0.00, ge=0, le=100)
    bank_name: str = None
    file_format: str = None
    account_number: str = None
    institution: str = None
    transit: str = None

    @field_validator('email', 'contact_email')
    @classmethod
    def validate_email(cls, v):
        if v and v.strip():
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, v):
                raise ValueError('Invalid email format')
        return v

    @field_validator('phone', 'contact_phone')
    @classmethod
    def validate_phone(cls, v):
        if v and v.strip():
            # Remove all non-digit characters
            cleaned = re.sub(r'\D', '', v)
            if len(cleaned) < 7 or len(cleaned) > 15:
                raise ValueError('Phone number must be 7-15 digits')
        return v

    @field_validator('name', 'contact_name')
    @classmethod
    def validate_name(cls, v):
        if v and v.strip():
            if len(v.strip()) < 2:
                raise ValueError('Name must be at least 2 characters long')
            # Allow letters, spaces, hyphens, apostrophes, and periods
            if not re.match(r"^[a-zA-Z\s\-'\.]+$", v.strip()):
                raise ValueError('Name contains invalid characters')
        return v

class Supplier(BaseModel):
    id: int = None
    name: str
    category: str = None
    sales_rep_id: int = None
    phone: str = None
    email: str = None
    address: str = None
    contact_name: str = None
    contact_title: str = None
    contact_phone: str = None
    contact_email: str = None
    currency_id: int = None
    tax_rate: float = 0.00
    bank_name: str = None
    file_format: str = None
    account_number: str = None
    institution: str = None
    transit: str = None

class SupplierCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    category: str = None
    sales_rep_id: int = None
    phone: str = None
    email: str = None
    address: str = None
    contact_name: str = None
    contact_title: str = None
    contact_phone: str = None
    contact_email: str = None
    currency_id: int = None
    tax_rate: float = Field(default=0.00, ge=0, le=100)
    bank_name: str = None
    file_format: str = None
    account_number: str = None
    institution: str = None
    transit: str = None

    @field_validator('email', 'contact_email')
    @classmethod
    def validate_email(cls, v):
        if v and v.strip():
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, v):
                raise ValueError('Invalid email format')
        return v

    @field_validator('phone', 'contact_phone')
    @classmethod
    def validate_phone(cls, v):
        if v and v.strip():
            # Remove all non-digit characters
            cleaned = re.sub(r'\D', '', v)
            if len(cleaned) < 7 or len(cleaned) > 15:
                raise ValueError('Phone number must be 7-15 digits')
        return v

    @field_validator('name', 'contact_name')
    @classmethod
    def validate_name(cls, v):
        if v and v.strip():
            if len(v.strip()) < 2:
                raise ValueError('Name must be at least 2 characters long')
            # Allow letters, spaces, hyphens, apostrophes, and periods
            if not re.match(r"^[a-zA-Z\s\-'\.]+$", v.strip()):
                raise ValueError('Name contains invalid characters')
        return v

class Quote(BaseModel):
    id: int = None
    job_id: str
    name: str
    customer_id: int = None
    engineer_id: int = None
    salesman_id: int = None
    date: str
    sell_price: float = 0.00
    status: str = "Draft"

class QuoteCreate(BaseModel):
    job_id: str
    name: str
    customer_id: int = None
    engineer_id: int = None
    salesman_id: int = None
    date: str
    sell_price: float = 0.00
    status: str = "Draft"

class Project(BaseModel):
    id: int = None
    project_id: str
    name: str
    customer_id: int = None
    engineer_id: int = None
    end_user: str = None
    date: str
    salesman_id: int = None
    status: str = "Active"

class ProjectCreate(BaseModel):
    project_id: str
    name: str
    customer_id: int = None
    engineer_id: int = None
    end_user: str = None
    date: str
    salesman_id: int = None
    status: str = "Active"

class CustomerAccount(BaseModel):
    id: int = None
    invoice_number: str
    date: str
    project_id: int = None
    customer_id: int = None
    name: str
    amount: float = 0.00
    outstanding: float = 0.00
    reminder_date: str = None
    comments: str = None

class CustomerAccountCreate(BaseModel):
    invoice_number: str
    date: str
    project_id: int = None
    customer_id: int = None
    name: str
    amount: float = 0.00
    outstanding: float = 0.00
    reminder_date: str = None
    comments: str = None

# API Routes
@app.get("/")
async def root():
    return {"message": "Welcome to Full Stack App API"}

@app.get("/health")
async def health_check_endpoint():
    return health_check()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for now - can be extended for client messages
            await manager.send_personal_message(f"Message received: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Users endpoints
@app.get("/users")
async def get_users(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: str = Query(None, description="Search by name or email")
):
    offset = (page - 1) * limit

    # Build query with optional search
    base_query = "SELECT * FROM users"
    count_query = "SELECT COUNT(*) as total FROM users"
    params = []

    if search:
        search_condition = " WHERE name ILIKE %s OR email ILIKE %s"
        search_param = f"%{search}%"
        base_query += search_condition
        count_query += search_condition
        params = [search_param, search_param]

    # Get total count
    total_result = execute_query(count_query, params, fetch_one=True)
    total = total_result['total'] if total_result else 0

    # Get paginated results
    paginated_query = f"{base_query} ORDER BY name LIMIT %s OFFSET %s"
    users = execute_query(paginated_query, params + [limit, offset], fetch_all=True)

    return {
        "users": users,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }

@app.get("/users/active-count")
async def get_active_users_count():
    result = execute_query("SELECT COUNT(*) as count FROM users WHERE active = TRUE", fetch_one=True)
    return {"active_users_count": result['count']}

@app.post("/users")
async def create_user(user: UserCreate):
    query = "INSERT INTO users (name, email, active) VALUES (%s, %s, %s) RETURNING id"
    result = execute_query(query, (user.name, user.email, user.active), fetch_one=True)

    # Broadcast the event
    await manager.broadcast_event("user_created", {"id": result['id'], **user.model_dump()})

    return {"message": "User created successfully", "user_id": result['id']}

@app.put("/users/{user_id}")
async def update_user(user_id: int, user: UserCreate):
    query = "UPDATE users SET name=%s, email=%s, active=%s WHERE id=%s"
    execute_query(query, (user.name, user.email, user.active, user_id))

    # Broadcast the event
    await manager.broadcast_event("user_updated", {"id": user_id, **user.model_dump()})

    return {"message": "User updated successfully"}

@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
    query = "DELETE FROM users WHERE id=%s"
    execute_query(query, (user_id,))

    # Broadcast the event
    await manager.broadcast_event("user_deleted", {"id": user_id})

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
    query = """
    SELECT id, currency, currency as name, currency as code, rate, effective_date,
           CURRENT_TIMESTAMP as created_at, CURRENT_TIMESTAMP as updated_at
    FROM currencies ORDER BY currency
    """
    currencies = execute_query(query, fetch_all=True)
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

# Customers endpoints
@app.get("/customers")
async def get_customers(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: str = Query(None, description="Search by name, email, or category")
):
    offset = (page - 1) * limit

    # Build base queries
    base_query = """
    SELECT c.*, u.name as sales_rep_name, cur.currency as currency_name
    FROM customers c
    LEFT JOIN users u ON c.sales_rep_id = u.id
    LEFT JOIN currencies cur ON c.currency_id = cur.id
    """

    count_query = "SELECT COUNT(*) as total FROM customers c"
    params = []

    if search:
        search_condition = " WHERE c.name ILIKE %s OR c.email ILIKE %s OR c.category ILIKE %s"
        search_param = f"%{search}%"
        base_query += search_condition
        count_query += search_condition
        params = [search_param, search_param, search_param]

    # Get total count
    total_result = execute_query(count_query, params, fetch_one=True)
    total = total_result['total'] if total_result else 0

    # Get paginated results
    paginated_query = f"{base_query} ORDER BY c.name LIMIT %s OFFSET %s"
    customers = execute_query(paginated_query, params + [limit, offset], fetch_all=True)

    return {
        "customers": customers,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }

@app.post("/customers")
async def create_customer(customer: CustomerCreate):
    query = """INSERT INTO customers
               (name, category, sales_rep_id, phone, email, address, contact_name, contact_title,
                contact_phone, contact_email, currency_id, tax_rate, bank_name, file_format,
                account_number, institution, transit)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id"""
    result = execute_query(query, (
        customer.name, customer.category, customer.sales_rep_id, customer.phone, customer.email,
        customer.address, customer.contact_name, customer.contact_title, customer.contact_phone,
        customer.contact_email, customer.currency_id, customer.tax_rate, customer.bank_name,
        customer.file_format, customer.account_number, customer.institution, customer.transit
    ), fetch_one=True)
    return {"message": "Customer created successfully", "customer_id": result['id']}

@app.put("/customers/{customer_id}")
async def update_customer(customer_id: int, customer: CustomerCreate):
    query = """UPDATE customers
               SET name=%s, category=%s, sales_rep_id=%s, phone=%s, email=%s, address=%s,
                   contact_name=%s, contact_title=%s, contact_phone=%s, contact_email=%s,
                   currency_id=%s, tax_rate=%s, bank_name=%s, file_format=%s, account_number=%s,
                   institution=%s, transit=%s
               WHERE id=%s"""
    execute_query(query, (
        customer.name, customer.category, customer.sales_rep_id, customer.phone, customer.email,
        customer.address, customer.contact_name, customer.contact_title, customer.contact_phone,
        customer.contact_email, customer.currency_id, customer.tax_rate, customer.bank_name,
        customer.file_format, customer.account_number, customer.institution, customer.transit,
        customer_id
    ))
    return {"message": "Customer updated successfully"}

@app.delete("/customers/{customer_id}")
async def delete_customer(customer_id: int):
    query = "DELETE FROM customers WHERE id=%s"
    execute_query(query, (customer_id,))
    return {"message": "Customer deleted successfully"}

# Suppliers endpoints
@app.get("/suppliers")
async def get_suppliers():
    query = """
    SELECT s.*, u.name as sales_rep_name, cur.currency as currency_name
    FROM suppliers s
    LEFT JOIN users u ON s.sales_rep_id = u.id
    LEFT JOIN currencies cur ON s.currency_id = cur.id
    ORDER BY s.name
    """
    suppliers = execute_query(query, fetch_all=True)
    return {"suppliers": suppliers}

@app.post("/suppliers")
async def create_supplier(supplier: SupplierCreate):
    query = """INSERT INTO suppliers
               (name, category, sales_rep_id, phone, email, address, contact_name, contact_title,
                contact_phone, contact_email, currency_id, tax_rate, bank_name, file_format,
                account_number, institution, transit)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id"""
    result = execute_query(query, (
        supplier.name, supplier.category, supplier.sales_rep_id, supplier.phone, supplier.email,
        supplier.address, supplier.contact_name, supplier.contact_title, supplier.contact_phone,
        supplier.contact_email, supplier.currency_id, supplier.tax_rate, supplier.bank_name,
        supplier.file_format, supplier.account_number, supplier.institution, supplier.transit
    ), fetch_one=True)
    return {"message": "Supplier created successfully", "supplier_id": result['id'], "supplier": {"id": result['id'], **supplier.model_dump()}}

@app.put("/suppliers/{supplier_id}")
async def update_supplier(supplier_id: int, supplier: SupplierCreate):
    query = """UPDATE suppliers
               SET name=%s, category=%s, sales_rep_id=%s, phone=%s, email=%s, address=%s,
                   contact_name=%s, contact_title=%s, contact_phone=%s, contact_email=%s,
                   currency_id=%s, tax_rate=%s, bank_name=%s, file_format=%s, account_number=%s,
                   institution=%s, transit=%s
               WHERE id=%s"""
    execute_query(query, (
        supplier.name, supplier.category, supplier.sales_rep_id, supplier.phone, supplier.email,
        supplier.address, supplier.contact_name, supplier.contact_title, supplier.contact_phone,
        supplier.contact_email, supplier.currency_id, supplier.tax_rate, supplier.bank_name,
        supplier.file_format, supplier.account_number, supplier.institution, supplier.transit,
        supplier_id
    ))
    return {"message": "Supplier updated successfully"}

@app.delete("/suppliers/{supplier_id}")
async def delete_supplier(supplier_id: int):
    query = "DELETE FROM suppliers WHERE id=%s"
    execute_query(query, (supplier_id,))
    return {"message": "Supplier deleted successfully"}

# Customer Quotes endpoints
@app.get("/customers/{customer_id}/quotes")
async def get_customer_quotes(customer_id: int):
    query = """
    SELECT q.*, e.name as engineer_name, s.name as salesman_name
    FROM quotes q
    LEFT JOIN users e ON q.engineer_id = e.id
    LEFT JOIN users s ON q.salesman_id = s.id
    WHERE q.customer_id = %s
    ORDER BY q.date DESC
    """
    quotes = execute_query(query, (customer_id,), fetch_all=True)
    return {"quotes": quotes}

# Projects endpoints
@app.get("/projects")
async def get_projects():
    query = """
    SELECT p.*, c.name as customer_name, e.name as engineer_name, s.name as salesman_name
    FROM projects p
    LEFT JOIN customers c ON p.customer_id = c.id
    LEFT JOIN users e ON p.engineer_id = e.id
    LEFT JOIN users s ON p.salesman_id = s.id
    ORDER BY p.date DESC
    """
    projects = execute_query(query, fetch_all=True)
    return {"projects": projects}

@app.post("/projects")
async def create_project(project: ProjectCreate):
    query = """
    INSERT INTO projects (project_id, name, customer_id, engineer_id, end_user, date, salesman_id, status)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
    """
    result = execute_query(query, (
        project.project_id, project.name, project.customer_id, project.engineer_id,
        project.end_user, project.date, project.salesman_id, project.status
    ), fetch_one=True)
    return {"message": "Project created successfully", "project_id": result['id']}

@app.put("/projects/{project_id}")
async def update_project(project_id: int, project: ProjectCreate):
    query = """
    UPDATE projects SET project_id=%s, name=%s, customer_id=%s, engineer_id=%s,
    end_user=%s, date=%s, salesman_id=%s, status=%s WHERE id=%s
    """
    execute_query(query, (
        project.project_id, project.name, project.customer_id, project.engineer_id,
        project.end_user, project.date, project.salesman_id, project.status, project_id
    ))
    return {"message": "Project updated successfully"}

@app.delete("/projects/{project_id}")
async def delete_project(project_id: int):
    query = "DELETE FROM projects WHERE id=%s"
    execute_query(query, (project_id,))
    return {"message": "Project deleted successfully"}

@app.get("/projects/{project_id}")
async def get_project(project_id: int):
    query = """
    SELECT p.*, c.name as customer_name, e.name as engineer_name, s.name as salesman_name
    FROM projects p
    LEFT JOIN customers c ON p.customer_id = c.id
    LEFT JOIN users e ON p.engineer_id = e.id
    LEFT JOIN users s ON p.salesman_id = s.id
    WHERE p.id = %s
    """
    project = execute_query(query, (project_id,), fetch_one=True)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"project": project}

# Customer Projects endpoints
@app.get("/customers/{customer_id}/projects")
async def get_customer_projects(customer_id: int):
    query = """
    SELECT p.*, e.name as engineer_name, s.name as salesman_name
    FROM projects p
    LEFT JOIN users e ON p.engineer_id = e.id
    LEFT JOIN users s ON p.salesman_id = s.id
    WHERE p.customer_id = %s
    ORDER BY p.date DESC
    """
    projects = execute_query(query, (customer_id,), fetch_all=True)
    return {"projects": projects}

# Accounts endpoints
@app.get("/accounts")
async def get_accounts():
    query = """
    SELECT ca.*, c.name as customer_name, p.name as project_name
    FROM customer_accounts ca
    LEFT JOIN customers c ON ca.customer_id = c.id
    LEFT JOIN projects p ON ca.project_id = p.id
    ORDER BY ca.date DESC
    """
    accounts = execute_query(query, fetch_all=True)
    return {"accounts": accounts}

@app.post("/accounts")
async def create_account(account: CustomerAccountCreate):
    query = """
    INSERT INTO customer_accounts (invoice_number, date, project_id, customer_id, name, amount, outstanding, reminder_date, comments)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
    """
    result = execute_query(query, (
        account.invoice_number, account.date, account.project_id, account.customer_id,
        account.name, account.amount, account.outstanding, account.reminder_date, account.comments
    ), fetch_one=True)
    return {"message": "Account created successfully", "account_id": result['id']}

@app.put("/accounts/{account_id}")
async def update_account(account_id: int, account: CustomerAccountCreate):
    query = """
    UPDATE customer_accounts SET invoice_number=%s, date=%s, project_id=%s, customer_id=%s,
    name=%s, amount=%s, outstanding=%s, reminder_date=%s, comments=%s WHERE id=%s
    """
    execute_query(query, (
        account.invoice_number, account.date, account.project_id, account.customer_id,
        account.name, account.amount, account.outstanding, account.reminder_date, account.comments, account_id
    ))
    return {"message": "Account updated successfully"}

@app.delete("/accounts/{account_id}")
async def delete_account(account_id: int):
    query = "DELETE FROM customer_accounts WHERE id=%s"
    execute_query(query, (account_id,))
    return {"message": "Account deleted successfully"}

@app.get("/accounts/{account_id}")
async def get_account(account_id: int):
    query = """
    SELECT ca.*, c.name as customer_name, p.name as project_name
    FROM customer_accounts ca
    LEFT JOIN customers c ON ca.customer_id = c.id
    LEFT JOIN projects p ON ca.project_id = p.id
    WHERE ca.id = %s
    """
    account = execute_query(query, (account_id,), fetch_one=True)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"account": account}

# Customer Accounts endpoints
@app.get("/customers/{customer_id}/accounts")
async def get_customer_accounts(customer_id: int):
    query = """
    SELECT ca.*, p.name as project_name
    FROM customer_accounts ca
    LEFT JOIN projects p ON ca.project_id = p.id
    WHERE ca.customer_id = %s
    ORDER BY ca.date DESC
    """
    accounts = execute_query(query, (customer_id,), fetch_all=True)
    return {"accounts": accounts}

# Quotes endpoints
@app.get("/quotes")
async def get_quotes():
    query = """
    SELECT q.*, c.name as customer_name, e.name as engineer_name, s.name as salesman_name
    FROM quotes q
    LEFT JOIN customers c ON q.customer_id = c.id
    LEFT JOIN users e ON q.engineer_id = e.id
    LEFT JOIN users s ON q.salesman_id = s.id
    ORDER BY q.date DESC
    """
    quotes = execute_query(query, fetch_all=True)
    return {"quotes": quotes}

@app.post("/quotes")
async def create_quote(quote: QuoteCreate):
    query = """INSERT INTO quotes
               (job_id, name, customer_id, engineer_id, salesman_id, date, sell_price, status)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id"""
    result = execute_query(query, (
        quote.job_id, quote.name, quote.customer_id, quote.engineer_id,
        quote.salesman_id, quote.date, quote.sell_price, quote.status
    ), fetch_one=True)
    return {"message": "Quote created successfully", "quote_id": result['id']}

@app.put("/quotes/{quote_id}")
async def update_quote(quote_id: int, quote: QuoteCreate):
    query = """UPDATE quotes
               SET job_id=%s, name=%s, customer_id=%s, engineer_id=%s, salesman_id=%s,
                   date=%s, sell_price=%s, status=%s
               WHERE id=%s"""
    execute_query(query, (
        quote.job_id, quote.name, quote.customer_id, quote.engineer_id,
        quote.salesman_id, quote.date, quote.sell_price, quote.status, quote_id
    ))
    return {"message": "Quote updated successfully"}

@app.delete("/quotes/{quote_id}")
async def delete_quote(quote_id: int):
    query = "DELETE FROM quotes WHERE id=%s"
    execute_query(query, (quote_id,))
    return {"message": "Quote deleted successfully"}

@app.get("/quotes/{quote_id}")
async def get_quote(quote_id: int):
    query = """
    SELECT q.*, c.name as customer_name, e.name as engineer_name, s.name as salesman_name
    FROM quotes q
    LEFT JOIN customers c ON q.customer_id = c.id
    LEFT JOIN users e ON q.engineer_id = e.id
    LEFT JOIN users s ON q.salesman_id = s.id
    WHERE q.id = %s
    """
    quote = execute_query(query, (quote_id,), fetch_one=True)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"quote": quote}

# File upload endpoint
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Generate unique filename
        import uuid
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = uploads_dir / unique_filename

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {"filename": unique_filename, "url": f"/uploads/{unique_filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
