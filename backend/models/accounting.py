from pydantic import BaseModel
from typing import Optional

class AccountType(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None

class AccountTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ChartOfAccount(BaseModel):
    id: Optional[int] = None
    number: str
    description: str
    inactive: bool = False
    sub_account: Optional[str] = None
    type_id: int
    currency_id: Optional[int] = None

class ChartOfAccountCreate(BaseModel):
    number: str
    description: str
    inactive: bool = False
    sub_account: Optional[str] = None
    type_id: int
    currency_id: Optional[int] = None

class Currency(BaseModel):
    id: Optional[int] = None
    name: str  # This will be the currency name/code
    code: str  # This will be the same as name for now
    currency: str  # Keep for backward compatibility
    rate: float
    effective_date: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class CurrencyCreate(BaseModel):
    currency: str
    rate: float
    effective_date: str
