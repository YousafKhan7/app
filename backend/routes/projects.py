from fastapi import APIRouter, HTTPException
from models.project import Quote, QuoteCreate, Project, ProjectCreate, CustomerAccount, CustomerAccountCreate
from database import execute_query

router = APIRouter()

# Projects endpoints
@router.get("/projects")
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

@router.post("/projects")
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

@router.put("/projects/{project_id}")
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

@router.delete("/projects/{project_id}")
async def delete_project(project_id: int):
    query = "DELETE FROM projects WHERE id=%s"
    execute_query(query, (project_id,))
    return {"message": "Project deleted successfully"}

@router.get("/projects/{project_id}")
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
@router.get("/customers/{customer_id}/projects")
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

# Quotes endpoints
@router.get("/quotes")
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

@router.post("/quotes")
async def create_quote(quote: QuoteCreate):
    query = """INSERT INTO quotes
               (job_id, name, customer_id, engineer_id, salesman_id, date, sell_price, status)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id"""
    result = execute_query(query, (
        quote.job_id, quote.name, quote.customer_id, quote.engineer_id,
        quote.salesman_id, quote.date, quote.sell_price, quote.status
    ), fetch_one=True)
    return {"message": "Quote created successfully", "quote_id": result['id']}

@router.put("/quotes/{quote_id}")
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

@router.delete("/quotes/{quote_id}")
async def delete_quote(quote_id: int):
    query = "DELETE FROM quotes WHERE id=%s"
    execute_query(query, (quote_id,))
    return {"message": "Quote deleted successfully"}

@router.get("/quotes/{quote_id}")
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

# Accounts endpoints
@router.get("/accounts")
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

@router.post("/accounts")
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

@router.put("/accounts/{account_id}")
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

@router.delete("/accounts/{account_id}")
async def delete_account(account_id: int):
    query = "DELETE FROM customer_accounts WHERE id=%s"
    execute_query(query, (account_id,))
    return {"message": "Account deleted successfully"}

@router.get("/accounts/{account_id}")
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
@router.get("/customers/{customer_id}/accounts")
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
