from fastapi import APIRouter
from models.business import (
    Department, DepartmentCreate, Location, LocationCreate, 
    Manufacturer, ManufacturerCreate, Team, TeamCreate, 
    Warehouse, WarehouseCreate, Commission, CommissionCreate
)
from database import execute_query

router = APIRouter()

# Departments endpoints
@router.get("/departments")
async def get_departments():
    departments = execute_query("SELECT * FROM departments ORDER BY number", fetch_all=True)
    return {"departments": departments}

@router.post("/departments")
async def create_department(department: DepartmentCreate):
    query = "INSERT INTO departments (number, name) VALUES (%s, %s) RETURNING id"
    result = execute_query(query, (department.number, department.name), fetch_one=True)
    return {"message": "Department created successfully", "department_id": result['id']}

@router.put("/departments/{department_id}")
async def update_department(department_id: int, department: DepartmentCreate):
    query = "UPDATE departments SET number=%s, name=%s WHERE id=%s"
    execute_query(query, (department.number, department.name, department_id))
    return {"message": "Department updated successfully"}

@router.delete("/departments/{department_id}")
async def delete_department(department_id: int):
    query = "DELETE FROM departments WHERE id=%s"
    execute_query(query, (department_id,))
    return {"message": "Department deleted successfully"}

# Locations endpoints
@router.get("/locations")
async def get_locations():
    locations = execute_query("SELECT * FROM locations ORDER BY number", fetch_all=True)
    return {"locations": locations}

@router.post("/locations")
async def create_location(location: LocationCreate):
    query = "INSERT INTO locations (number, name) VALUES (%s, %s) RETURNING id"
    result = execute_query(query, (location.number, location.name), fetch_one=True)
    return {"message": "Location created successfully", "location_id": result['id']}

@router.put("/locations/{location_id}")
async def update_location(location_id: int, location: LocationCreate):
    query = "UPDATE locations SET number=%s, name=%s WHERE id=%s"
    execute_query(query, (location.number, location.name, location_id))
    return {"message": "Location updated successfully"}

@router.delete("/locations/{location_id}")
async def delete_location(location_id: int):
    query = "DELETE FROM locations WHERE id=%s"
    execute_query(query, (location_id,))
    return {"message": "Location deleted successfully"}

# Manufacturers endpoints
@router.get("/manufacturers")
async def get_manufacturers():
    manufacturers = execute_query("SELECT * FROM manufacturers ORDER BY sorting", fetch_all=True)
    return {"manufacturers": manufacturers}

@router.post("/manufacturers")
async def create_manufacturer(manufacturer: ManufacturerCreate):
    query = "INSERT INTO manufacturers (name, logo_file, sorting) VALUES (%s, %s, %s) RETURNING id"
    result = execute_query(query, (manufacturer.name, manufacturer.logo_file, manufacturer.sorting), fetch_one=True)
    return {"message": "Manufacturer created successfully", "manufacturer_id": result['id']}

@router.put("/manufacturers/{manufacturer_id}")
async def update_manufacturer(manufacturer_id: int, manufacturer: ManufacturerCreate):
    query = "UPDATE manufacturers SET name=%s, logo_file=%s, sorting=%s WHERE id=%s"
    execute_query(query, (manufacturer.name, manufacturer.logo_file, manufacturer.sorting, manufacturer_id))
    return {"message": "Manufacturer updated successfully"}

@router.delete("/manufacturers/{manufacturer_id}")
async def delete_manufacturer(manufacturer_id: int):
    query = "DELETE FROM manufacturers WHERE id=%s"
    execute_query(query, (manufacturer_id,))
    return {"message": "Manufacturer deleted successfully"}

# Teams endpoints
@router.get("/teams")
async def get_teams():
    teams = execute_query("SELECT * FROM teams ORDER BY name", fetch_all=True)
    return {"teams": teams}

@router.post("/teams")
async def create_team(team: TeamCreate):
    query = "INSERT INTO teams (name, description) VALUES (%s, %s) RETURNING id"
    result = execute_query(query, (team.name, team.description), fetch_one=True)
    return {"message": "Team created successfully", "team_id": result['id']}

@router.put("/teams/{team_id}")
async def update_team(team_id: int, team: TeamCreate):
    query = "UPDATE teams SET name=%s, description=%s WHERE id=%s"
    execute_query(query, (team.name, team.description, team_id))
    return {"message": "Team updated successfully"}

@router.delete("/teams/{team_id}")
async def delete_team(team_id: int):
    query = "DELETE FROM teams WHERE id=%s"
    execute_query(query, (team_id,))
    return {"message": "Team deleted successfully"}

# Warehouses endpoints
@router.get("/warehouses")
async def get_warehouses():
    warehouses = execute_query("SELECT * FROM warehouses ORDER BY number", fetch_all=True)
    return {"warehouses": warehouses}

@router.post("/warehouses")
async def create_warehouse(warehouse: WarehouseCreate):
    query = "INSERT INTO warehouses (warehouse_name, number, markup) VALUES (%s, %s, %s) RETURNING id"
    result = execute_query(query, (warehouse.warehouse_name, warehouse.number, warehouse.markup), fetch_one=True)
    return {"message": "Warehouse created successfully", "warehouse_id": result['id']}

@router.put("/warehouses/{warehouse_id}")
async def update_warehouse(warehouse_id: int, warehouse: WarehouseCreate):
    query = "UPDATE warehouses SET warehouse_name=%s, number=%s, markup=%s WHERE id=%s"
    execute_query(query, (warehouse.warehouse_name, warehouse.number, warehouse.markup, warehouse_id))
    return {"message": "Warehouse updated successfully"}

@router.delete("/warehouses/{warehouse_id}")
async def delete_warehouse(warehouse_id: int):
    query = "DELETE FROM warehouses WHERE id=%s"
    execute_query(query, (warehouse_id,))
    return {"message": "Warehouse deleted successfully"}

# Commissions endpoints
@router.get("/commissions")
async def get_commissions():
    commissions = execute_query("SELECT * FROM commissions ORDER BY type", fetch_all=True)
    return {"commissions": commissions}

@router.post("/commissions")
async def create_commission(commission: CommissionCreate):
    query = """INSERT INTO commissions
               (type, percentage, gp, sales, commercial_billing, payment)
               VALUES (%s, %s, %s, %s, %s, %s) RETURNING id"""
    result = execute_query(query, (commission.type, commission.percentage, commission.gp,
                                 commission.sales, commission.commercial_billing, commission.payment), fetch_one=True)
    return {"message": "Commission created successfully", "commission_id": result['id']}

@router.put("/commissions/{commission_id}")
async def update_commission(commission_id: int, commission: CommissionCreate):
    query = """UPDATE commissions
               SET type=%s, percentage=%s, gp=%s, sales=%s, commercial_billing=%s, payment=%s
               WHERE id=%s"""
    execute_query(query, (commission.type, commission.percentage, commission.gp,
                         commission.sales, commission.commercial_billing, commission.payment, commission_id))
    return {"message": "Commission updated successfully"}

@router.delete("/commissions/{commission_id}")
async def delete_commission(commission_id: int):
    query = "DELETE FROM commissions WHERE id=%s"
    execute_query(query, (commission_id,))
    return {"message": "Commission deleted successfully"}
