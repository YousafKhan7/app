from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import mysql.connector
from mysql.connector import Error
import os
import shutil
from pathlib import Path
from dotenv import load_dotenv

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
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'app'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'port': int(os.getenv('DB_PORT', 3306))
}

# Pydantic models
class User(BaseModel):
    id: int = None
    name: str
    email: str

class UserCreate(BaseModel):
    name: str
    email: str

class ChartOfAccount(BaseModel):
    id: int = None
    number: str
    description: str
    inactive: bool = False
    sub_account: str = None
    type: str
    currency_id: int = None

class ChartOfAccountCreate(BaseModel):
    number: str
    description: str
    inactive: bool = False
    sub_account: str = None
    type: str
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

# Database connection helper
def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# API Routes
@app.get("/")
async def root():
    return {"message": "Welcome to Full Stack App API"}

@app.get("/health")
async def health_check():
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            connection.close()
            return {"status": "healthy", "database": "connected"}
        else:
            return {"status": "unhealthy", "database": "disconnected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/users")
async def get_users():
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return {"users": users}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/users")
async def create_user(user: UserCreate):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        query = "INSERT INTO users (name, email) VALUES (%s, %s)"
        cursor.execute(query, (user.name, user.email))
        connection.commit()

        user_id = cursor.lastrowid
        cursor.close()
        connection.close()

        return {"message": "User created successfully", "user_id": user_id}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.put("/users/{user_id}")
async def update_user(user_id: int, user: UserCreate):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        query = "UPDATE users SET name=%s, email=%s WHERE id=%s"
        cursor.execute(query, (user.name, user.email, user_id))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "User updated successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        cursor.execute("DELETE FROM users WHERE id=%s", (user_id,))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "User deleted successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Chart of Accounts endpoints
@app.get("/chart-of-accounts")
async def get_chart_of_accounts():
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM chart_of_accounts ORDER BY number")
        accounts = cursor.fetchall()

        cursor.close()
        connection.close()

        return {"accounts": accounts}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/chart-of-accounts")
async def create_chart_of_account(account: ChartOfAccountCreate):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        query = "INSERT INTO chart_of_accounts (number, description, inactive, sub_account, type, currency_id) VALUES (%s, %s, %s, %s, %s, %s)"
        cursor.execute(query, (account.number, account.description, account.inactive, account.sub_account, account.type, account.currency_id))
        connection.commit()

        account_id = cursor.lastrowid
        cursor.close()
        connection.close()

        return {"message": "Account created successfully", "account_id": account_id}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.put("/chart-of-accounts/{account_id}")
async def update_chart_of_account(account_id: int, account: ChartOfAccountCreate):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        query = "UPDATE chart_of_accounts SET number=%s, description=%s, inactive=%s, sub_account=%s, type=%s, currency_id=%s WHERE id=%s"
        cursor.execute(query, (account.number, account.description, account.inactive, account.sub_account, account.type, account.currency_id, account_id))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "Account updated successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/chart-of-accounts/{account_id}")
async def delete_chart_of_account(account_id: int):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        cursor.execute("DELETE FROM chart_of_accounts WHERE id=%s", (account_id,))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "Account deleted successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Departments endpoints
@app.get("/departments")
async def get_departments():
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM departments ORDER BY number")
        departments = cursor.fetchall()

        cursor.close()
        connection.close()

        return {"departments": departments}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/departments")
async def create_department(department: DepartmentCreate):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        query = "INSERT INTO departments (number, name) VALUES (%s, %s)"
        cursor.execute(query, (department.number, department.name))
        connection.commit()

        department_id = cursor.lastrowid
        cursor.close()
        connection.close()

        return {"message": "Department created successfully", "department_id": department_id}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.put("/departments/{department_id}")
async def update_department(department_id: int, department: DepartmentCreate):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        query = "UPDATE departments SET number=%s, name=%s WHERE id=%s"
        cursor.execute(query, (department.number, department.name, department_id))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "Department updated successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/departments/{department_id}")
async def delete_department(department_id: int):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        cursor.execute("DELETE FROM departments WHERE id=%s", (department_id,))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "Department deleted successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Currencies endpoints
@app.get("/currencies")
async def get_currencies():
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM currencies ORDER BY currency")
        currencies = cursor.fetchall()

        cursor.close()
        connection.close()

        return {"currencies": currencies}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/currencies")
async def create_currency(currency: CurrencyCreate):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        query = "INSERT INTO currencies (currency, rate, effective_date) VALUES (%s, %s, %s)"
        cursor.execute(query, (currency.currency, currency.rate, currency.effective_date))
        connection.commit()

        currency_id = cursor.lastrowid
        cursor.close()
        connection.close()

        return {"message": "Currency created successfully", "currency_id": currency_id}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.put("/currencies/{currency_id}")
async def update_currency(currency_id: int, currency: CurrencyCreate):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        query = "UPDATE currencies SET currency=%s, rate=%s, effective_date=%s WHERE id=%s"
        cursor.execute(query, (currency.currency, currency.rate, currency.effective_date, currency_id))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "Currency updated successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/currencies/{currency_id}")
async def delete_currency(currency_id: int):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        cursor.execute("DELETE FROM currencies WHERE id=%s", (currency_id,))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "Currency deleted successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Locations endpoints
@app.get("/locations")
async def get_locations():
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM locations ORDER BY number")
        locations = cursor.fetchall()

        cursor.close()
        connection.close()

        return {"locations": locations}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/locations")
async def create_location(location: LocationCreate):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        query = "INSERT INTO locations (number, name) VALUES (%s, %s)"
        cursor.execute(query, (location.number, location.name))
        connection.commit()

        location_id = cursor.lastrowid
        cursor.close()
        connection.close()

        return {"message": "Location created successfully", "location_id": location_id}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.put("/locations/{location_id}")
async def update_location(location_id: int, location: LocationCreate):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        query = "UPDATE locations SET number=%s, name=%s WHERE id=%s"
        cursor.execute(query, (location.number, location.name, location_id))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "Location updated successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/locations/{location_id}")
async def delete_location(location_id: int):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        cursor.execute("DELETE FROM locations WHERE id=%s", (location_id,))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "Location deleted successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Manufacturers endpoints
@app.get("/manufacturers")
async def get_manufacturers():
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM manufacturers ORDER BY sorting")
        manufacturers = cursor.fetchall()

        cursor.close()
        connection.close()

        return {"manufacturers": manufacturers}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/manufacturers")
async def create_manufacturer(manufacturer: ManufacturerCreate):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        query = "INSERT INTO manufacturers (name, logo_file, sorting) VALUES (%s, %s, %s)"
        cursor.execute(query, (manufacturer.name, manufacturer.logo_file, manufacturer.sorting))
        connection.commit()

        manufacturer_id = cursor.lastrowid
        cursor.close()
        connection.close()

        return {"message": "Manufacturer created successfully", "manufacturer_id": manufacturer_id}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.put("/manufacturers/{manufacturer_id}")
async def update_manufacturer(manufacturer_id: int, manufacturer: ManufacturerCreate):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        query = "UPDATE manufacturers SET name=%s, logo_file=%s, sorting=%s WHERE id=%s"
        cursor.execute(query, (manufacturer.name, manufacturer.logo_file, manufacturer.sorting, manufacturer_id))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "Manufacturer updated successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/manufacturers/{manufacturer_id}")
async def delete_manufacturer(manufacturer_id: int):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        cursor.execute("DELETE FROM manufacturers WHERE id=%s", (manufacturer_id,))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "Manufacturer deleted successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Teams endpoints
@app.get("/teams")
async def get_teams():
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM teams ORDER BY name")
        teams = cursor.fetchall()

        cursor.close()
        connection.close()

        return {"teams": teams}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/teams")
async def create_team(team: TeamCreate):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        query = "INSERT INTO teams (name, description) VALUES (%s, %s)"
        cursor.execute(query, (team.name, team.description))
        connection.commit()

        team_id = cursor.lastrowid
        cursor.close()
        connection.close()

        return {"message": "Team created successfully", "team_id": team_id}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.put("/teams/{team_id}")
async def update_team(team_id: int, team: TeamCreate):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        query = "UPDATE teams SET name=%s, description=%s WHERE id=%s"
        cursor.execute(query, (team.name, team.description, team_id))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "Team updated successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/teams/{team_id}")
async def delete_team(team_id: int):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        cursor.execute("DELETE FROM teams WHERE id=%s", (team_id,))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "Team deleted successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Warehouses endpoints
@app.get("/warehouses")
async def get_warehouses():
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM warehouses ORDER BY number")
        warehouses = cursor.fetchall()

        cursor.close()
        connection.close()

        return {"warehouses": warehouses}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/warehouses")
async def create_warehouse(warehouse: WarehouseCreate):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        query = "INSERT INTO warehouses (warehouse_name, number, markup) VALUES (%s, %s, %s)"
        cursor.execute(query, (warehouse.warehouse_name, warehouse.number, warehouse.markup))
        connection.commit()

        warehouse_id = cursor.lastrowid
        cursor.close()
        connection.close()

        return {"message": "Warehouse created successfully", "warehouse_id": warehouse_id}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.put("/warehouses/{warehouse_id}")
async def update_warehouse(warehouse_id: int, warehouse: WarehouseCreate):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        query = "UPDATE warehouses SET warehouse_name=%s, number=%s, markup=%s WHERE id=%s"
        cursor.execute(query, (warehouse.warehouse_name, warehouse.number, warehouse.markup, warehouse_id))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "Warehouse updated successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/warehouses/{warehouse_id}")
async def delete_warehouse(warehouse_id: int):
    try:
        connection = get_db_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")

        cursor = connection.cursor()
        cursor.execute("DELETE FROM warehouses WHERE id=%s", (warehouse_id,))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "Warehouse deleted successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

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
