from pydantic import BaseModel, Field, field_validator
from typing import Optional
import re

class Customer(BaseModel):
    id: Optional[int] = None
    name: str
    category: Optional[str] = None
    sales_rep_id: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    contact_name: Optional[str] = None
    contact_title: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    currency_id: Optional[int] = None
    tax_rate: float = 0.00
    bank_name: Optional[str] = None
    file_format: Optional[str] = None
    account_number: Optional[str] = None
    institution: Optional[str] = None
    transit: Optional[str] = None

class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    category: Optional[str] = None
    sales_rep_id: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    contact_name: Optional[str] = None
    contact_title: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    currency_id: Optional[int] = None
    tax_rate: float = Field(default=0.00, ge=0, le=100)
    bank_name: Optional[str] = None
    file_format: Optional[str] = None
    account_number: Optional[str] = None
    institution: Optional[str] = None
    transit: Optional[str] = None

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
    id: Optional[int] = None
    name: str
    category: Optional[str] = None
    sales_rep_id: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    contact_name: Optional[str] = None
    contact_title: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    currency_id: Optional[int] = None
    tax_rate: float = 0.00
    bank_name: Optional[str] = None
    file_format: Optional[str] = None
    account_number: Optional[str] = None
    institution: Optional[str] = None
    transit: Optional[str] = None

class SupplierCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    category: Optional[str] = None
    sales_rep_id: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    contact_name: Optional[str] = None
    contact_title: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    currency_id: Optional[int] = None
    tax_rate: float = Field(default=0.00, ge=0, le=100)
    bank_name: Optional[str] = None
    file_format: Optional[str] = None
    account_number: Optional[str] = None
    institution: Optional[str] = None
    transit: Optional[str] = None

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
