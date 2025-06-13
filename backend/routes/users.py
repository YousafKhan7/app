from fastapi import APIRouter, Query
from models.user import User, UserCreate
from database import execute_query
from websocket_manager import manager

router = APIRouter()

@router.get("/users")
async def get_users(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: str = Query(None, description="Search by name or email")
):
    offset = (page - 1) * limit

    # Build query with optional search
    base_query = "SELECT * FROM users"
    count_query = "SELECT COUNT(*) as total FROM users"
    params = None

    if search:
        search_condition = " WHERE name ILIKE %s OR email ILIKE %s"
        search_param = f"%{search}%"
        base_query += search_condition
        count_query += search_condition
        params = (search_param, search_param)

    # Get total count
    total_result = execute_query(count_query, params, fetch_one=True)
    total = total_result['total'] if total_result else 0

    # Get paginated results
    paginated_query = f"{base_query} ORDER BY name LIMIT %s OFFSET %s"
    if params:
        final_params = params + (limit, offset)
    else:
        final_params = (limit, offset)
    users = execute_query(paginated_query, final_params, fetch_all=True)

    return {
        "users": users,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }

@router.get("/users/active-count")
async def get_active_users_count():
    result = execute_query("SELECT COUNT(*) as count FROM users WHERE active = TRUE", fetch_one=True)
    return {"active_users_count": result['count']}

@router.post("/users")
async def create_user(user: UserCreate):
    query = "INSERT INTO users (name, email, active) VALUES (%s, %s, %s) RETURNING id"
    result = execute_query(query, (user.name, user.email, user.active), fetch_one=True)

    # Broadcast the event
    await manager.broadcast_event("user_created", {"id": result['id'], **user.model_dump()})

    return {"message": "User created successfully", "user_id": result['id']}

@router.put("/users/{user_id}")
async def update_user(user_id: int, user: UserCreate):
    query = "UPDATE users SET name=%s, email=%s, active=%s WHERE id=%s"
    execute_query(query, (user.name, user.email, user.active, user_id))

    # Broadcast the event
    await manager.broadcast_event("user_updated", {"id": user_id, **user.model_dump()})

    return {"message": "User updated successfully"}

@router.delete("/users/{user_id}")
async def delete_user(user_id: int):
    query = "DELETE FROM users WHERE id=%s"
    execute_query(query, (user_id,))

    # Broadcast the event
    await manager.broadcast_event("user_deleted", {"id": user_id})

    return {"message": "User deleted successfully"}
