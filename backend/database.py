"""
Database connection pool manager for PostgreSQL
"""
import os
import psycopg2
from psycopg2 import pool, Error
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from typing import Optional, Any, Dict, List, Union
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabasePool:
    """Singleton database connection pool manager"""

    _instance = None
    _pool = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabasePool, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        # Don't initialize pool in __init__ to avoid import-time errors
        pass
    
    def _initialize_pool(self):
        """Initialize the connection pool"""
        if self._initialized:
            return

        try:
            # Database configuration
            db_config = {
                'host': os.getenv('DB_HOST', 'localhost'),
                'database': os.getenv('DB_NAME', 'postgres'),
                'user': os.getenv('DB_USER', 'postgres'),
                'password': os.getenv('DB_PASSWORD', ''),
                'port': int(os.getenv('DB_PORT', 5432))
            }

            # Debug logging
            logger.info(f"Database config: host={db_config['host']}, database={db_config['database']}, user={db_config['user']}, port={db_config['port']}")
            logger.info(f"Password provided: {'Yes' if db_config['password'] else 'No'}")

            # Validate required configuration
            if not db_config['password']:
                logger.warning("No database password provided. This may cause connection failures.")

            # Pool configuration
            min_connections = int(os.getenv('DB_POOL_MIN', 2))
            max_connections = int(os.getenv('DB_POOL_MAX', 20))

            logger.info(f"Attempting to connect to database at {db_config['host']}:{db_config['port']}")

            self._pool = psycopg2.pool.ThreadedConnectionPool(
                minconn=min_connections,
                maxconn=max_connections,
                **db_config
            )

            self._initialized = True
            logger.info(f"Database pool initialized with {min_connections}-{max_connections} connections")

        except Exception as e:
            logger.error(f"Failed to initialize database pool: {e}")
            self._pool = None
            self._initialized = False
            raise
    
    def get_connection(self):
        """Get a connection from the pool"""
        # Initialize pool if not already done
        if not self._initialized:
            self._initialize_pool()

        if self._pool is None:
            raise Exception("Database pool not initialized")

        try:
            connection = self._pool.getconn()
            if connection:
                return connection
            else:
                raise Exception("Unable to get connection from pool")
        except Exception as e:
            logger.error(f"Error getting connection from pool: {e}")
            raise
    
    def return_connection(self, connection):
        """Return a connection to the pool"""
        if self._pool and connection:
            try:
                self._pool.putconn(connection)
            except Exception as e:
                logger.error(f"Error returning connection to pool: {e}")
    
    def close_all_connections(self):
        """Close all connections in the pool"""
        if self._pool:
            try:
                self._pool.closeall()
                logger.info("All database connections closed")
            except Exception as e:
                logger.error(f"Error closing connections: {e}")
    
    def get_pool_status(self) -> Dict[str, Any]:
        """Get current pool status"""
        if not self._initialized or not self._pool:
            return {"status": "not_initialized"}

        try:
            return {
                "status": "active",
                "min_connections": self._pool.minconn,
                "max_connections": self._pool.maxconn,
                "available_connections": len(self._pool._pool),
                "used_connections": len(self._pool._used)
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

# Global pool instance
db_pool = DatabasePool()

def get_direct_connection():
    """Get a direct database connection (fallback when pool fails)"""
    try:
        db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'database': os.getenv('DB_NAME', 'postgres'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', ''),
            'port': int(os.getenv('DB_PORT', 5432))
        }

        connection = psycopg2.connect(**db_config)
        return connection
    except Exception as e:
        logger.error(f"Failed to create direct connection: {e}")
        raise

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    connection = None
    use_pool = True

    try:
        # Try to get connection from pool first
        try:
            connection = db_pool.get_connection()
        except Exception as pool_error:
            logger.warning(f"Pool connection failed, using direct connection: {pool_error}")
            use_pool = False
            connection = get_direct_connection()

        yield connection

    except Exception as e:
        if connection:
            connection.rollback()
        logger.error(f"Database operation failed: {e}")
        raise
    finally:
        if connection:
            if use_pool:
                db_pool.return_connection(connection)
            else:
                connection.close()

def execute_query(
    query: str, 
    params: Optional[tuple] = None, 
    fetch_one: bool = False, 
    fetch_all: bool = False
) -> Union[Dict, List[Dict], None]:
    """
    Execute a database query with connection pooling
    
    Args:
        query: SQL query string
        params: Query parameters
        fetch_one: Return single row
        fetch_all: Return all rows
    
    Returns:
        Query result or None
    """
    try:
        with get_db_connection() as connection:
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(query, params)
            
            result = None
            if fetch_one:
                result = cursor.fetchone()
                result = dict(result) if result else None
            elif fetch_all:
                rows = cursor.fetchall()
                result = [dict(row) for row in rows] if rows else []
            
            connection.commit()
            cursor.close()
            
            return result
            
    except Error as e:
        logger.error(f"Database query failed: {e}")
        logger.error(f"Query: {query}")
        logger.error(f"Params: {params}")
        raise Exception(f"Database error: {str(e)}")

def execute_transaction(queries_and_params: List[tuple]) -> bool:
    """
    Execute multiple queries in a single transaction
    
    Args:
        queries_and_params: List of (query, params) tuples
    
    Returns:
        True if successful, raises exception if failed
    """
    try:
        with get_db_connection() as connection:
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            for query, params in queries_and_params:
                cursor.execute(query, params)
            
            connection.commit()
            cursor.close()
            
            return True
            
    except Error as e:
        logger.error(f"Transaction failed: {e}")
        raise Exception(f"Transaction error: {str(e)}")

def health_check() -> Dict[str, Any]:
    """
    Check database connectivity and pool status
    
    Returns:
        Health status dictionary
    """
    try:
        # Test connection
        result = execute_query("SELECT 1 as test", fetch_one=True)
        
        if result and result.get('test') == 1:
            pool_status = db_pool.get_pool_status()
            return {
                "status": "healthy",
                "database": "connected",
                "pool": pool_status
            }
        else:
            return {
                "status": "unhealthy",
                "database": "query_failed",
                "pool": db_pool.get_pool_status()
            }
            
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "pool": db_pool.get_pool_status()
        }

# Cleanup function for application shutdown
def cleanup_database():
    """Clean up database connections on application shutdown"""
    db_pool.close_all_connections()
