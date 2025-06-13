from pydantic import BaseModel
from typing import Optional

class Quote(BaseModel):
    id: Optional[int] = None
    job_id: str
    name: str
    customer_id: Optional[int] = None
    engineer_id: Optional[int] = None
    salesman_id: Optional[int] = None
    date: str
    sell_price: float = 0.00
    status: str = "Draft"

class QuoteCreate(BaseModel):
    job_id: str
    name: str
    customer_id: Optional[int] = None
    engineer_id: Optional[int] = None
    salesman_id: Optional[int] = None
    date: str
    sell_price: float = 0.00
    status: str = "Draft"

class Project(BaseModel):
    id: Optional[int] = None
    project_id: str
    name: str
    customer_id: Optional[int] = None
    engineer_id: Optional[int] = None
    end_user: Optional[str] = None
    date: str
    salesman_id: Optional[int] = None
    status: str = "Active"

class ProjectCreate(BaseModel):
    project_id: str
    name: str
    customer_id: Optional[int] = None
    engineer_id: Optional[int] = None
    end_user: Optional[str] = None
    date: str
    salesman_id: Optional[int] = None
    status: str = "Active"

class CustomerAccount(BaseModel):
    id: Optional[int] = None
    invoice_number: str
    date: str
    project_id: Optional[int] = None
    customer_id: Optional[int] = None
    name: str
    amount: float = 0.00
    outstanding: float = 0.00
    reminder_date: Optional[str] = None
    comments: Optional[str] = None

class CustomerAccountCreate(BaseModel):
    invoice_number: str
    date: str
    project_id: Optional[int] = None
    customer_id: Optional[int] = None
    name: str
    amount: float = 0.00
    outstanding: float = 0.00
    reminder_date: Optional[str] = None
    comments: Optional[str] = None
