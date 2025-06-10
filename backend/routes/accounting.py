from fastapi import APIRouter
from models.accounting import AccountType, AccountTypeCreate, ChartOfAccount, ChartOfAccountCreate, Currency, CurrencyCreate
from database import execute_query

router = APIRouter()

# Account Types endpoints
@router.get("/account-types")
async def get_account_types():
    account_types = execute_query("SELECT * FROM account_types ORDER BY name", fetch_all=True)
    return {"account_types": account_types}

@router.post("/account-types")
async def create_account_type(account_type: AccountTypeCreate):
    query = "INSERT INTO account_types (name, description) VALUES (%s, %s) RETURNING id"
    result = execute_query(query, (account_type.name, account_type.description), fetch_one=True)
    return {"message": "Account type created successfully", "account_type_id": result['id']}

# Chart of Accounts endpoints
@router.get("/chart-of-accounts")
async def get_chart_of_accounts():
    accounts = execute_query("SELECT * FROM chart_of_accounts ORDER BY number", fetch_all=True)
    return {"accounts": accounts}

@router.post("/chart-of-accounts")
async def create_chart_of_account(account: ChartOfAccountCreate):
    query = """INSERT INTO chart_of_accounts 
               (number, description, inactive, sub_account, type_id, currency_id) 
               VALUES (%s, %s, %s, %s, %s, %s) RETURNING id"""
    result = execute_query(query, (account.number, account.description, account.inactive, 
                                 account.sub_account, account.type_id, account.currency_id), fetch_one=True)
    return {"message": "Account created successfully", "account_id": result['id']}

@router.put("/chart-of-accounts/{account_id}")
async def update_chart_of_account(account_id: int, account: ChartOfAccountCreate):
    query = """UPDATE chart_of_accounts 
               SET number=%s, description=%s, inactive=%s, sub_account=%s, type_id=%s, currency_id=%s 
               WHERE id=%s"""
    execute_query(query, (account.number, account.description, account.inactive, 
                         account.sub_account, account.type_id, account.currency_id, account_id))
    return {"message": "Account updated successfully"}

@router.delete("/chart-of-accounts/{account_id}")
async def delete_chart_of_account(account_id: int):
    query = "DELETE FROM chart_of_accounts WHERE id=%s"
    execute_query(query, (account_id,))
    return {"message": "Account deleted successfully"}

# Currencies endpoints
@router.get("/currencies")
async def get_currencies():
    query = """
    SELECT id, currency, currency as name, currency as code, rate, effective_date,
           CURRENT_TIMESTAMP as created_at, CURRENT_TIMESTAMP as updated_at
    FROM currencies ORDER BY currency
    """
    currencies = execute_query(query, fetch_all=True)
    return {"currencies": currencies}

@router.post("/currencies")
async def create_currency(currency: CurrencyCreate):
    query = "INSERT INTO currencies (currency, rate, effective_date) VALUES (%s, %s, %s) RETURNING id"
    result = execute_query(query, (currency.currency, currency.rate, currency.effective_date), fetch_one=True)
    return {"message": "Currency created successfully", "currency_id": result['id']}

@router.put("/currencies/{currency_id}")
async def update_currency(currency_id: int, currency: CurrencyCreate):
    query = "UPDATE currencies SET currency=%s, rate=%s, effective_date=%s WHERE id=%s"
    execute_query(query, (currency.currency, currency.rate, currency.effective_date, currency_id))
    return {"message": "Currency updated successfully"}

@router.delete("/currencies/{currency_id}")
async def delete_currency(currency_id: int):
    query = "DELETE FROM currencies WHERE id=%s"
    execute_query(query, (currency_id,))
    return {"message": "Currency deleted successfully"}
