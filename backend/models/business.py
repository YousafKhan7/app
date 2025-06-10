from pydantic import BaseModel
from typing import Optional

class Department(BaseModel):
    id: Optional[int] = None
    number: str
    name: str

class DepartmentCreate(BaseModel):
    number: str
    name: str

class Location(BaseModel):
    id: Optional[int] = None
    number: str
    name: str

class LocationCreate(BaseModel):
    number: str
    name: str

class Manufacturer(BaseModel):
    id: Optional[int] = None
    name: str
    logo_file: Optional[str] = None
    sorting: int = 0

class ManufacturerCreate(BaseModel):
    name: str
    logo_file: Optional[str] = None
    sorting: int = 0

class Team(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None

class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None

class Warehouse(BaseModel):
    id: Optional[int] = None
    warehouse_name: str
    number: str
    markup: float = 0.00

class WarehouseCreate(BaseModel):
    warehouse_name: str
    number: str
    markup: float = 0.00

class Commission(BaseModel):
    id: Optional[int] = None
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
