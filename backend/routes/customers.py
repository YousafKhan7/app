from fastapi import APIRouter, Query
from models.customer import Customer, CustomerCreate, Supplier, SupplierCreate
from database import execute_query

router = APIRouter()

# Customers endpoints
@router.get("/customers")
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
    params = None

    if search:
        search_condition = " WHERE c.name ILIKE %s OR c.email ILIKE %s OR c.category ILIKE %s"
        search_param = f"%{search}%"
        base_query += search_condition
        count_query += search_condition
        params = (search_param, search_param, search_param)

    # Get total count
    total_result = execute_query(count_query, params, fetch_one=True)
    total = total_result['total'] if total_result else 0

    # Get paginated results
    paginated_query = f"{base_query} ORDER BY c.name LIMIT %s OFFSET %s"
    if params:
        final_params = params + (limit, offset)
    else:
        final_params = (limit, offset)
    customers = execute_query(paginated_query, final_params, fetch_all=True)

    return {
        "customers": customers,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }

@router.post("/customers")
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

@router.put("/customers/{customer_id}")
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

@router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: int):
    query = "DELETE FROM customers WHERE id=%s"
    execute_query(query, (customer_id,))
    return {"message": "Customer deleted successfully"}

# Customer Quotes endpoints
@router.get("/customers/{customer_id}/quotes")
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

# Suppliers endpoints
@router.get("/suppliers")
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

@router.post("/suppliers")
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

@router.put("/suppliers/{supplier_id}")
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

@router.delete("/suppliers/{supplier_id}")
async def delete_supplier(supplier_id: int):
    query = "DELETE FROM suppliers WHERE id=%s"
    execute_query(query, (supplier_id,))
    return {"message": "Supplier deleted successfully"}
