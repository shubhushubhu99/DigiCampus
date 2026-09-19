import pymysql
from pymysql.cursors import DictCursor
from config import Config
from contextlib import contextmanager
import logging

logger = logging.getLogger(__name__)

def get_db_connection():
    return pymysql.connect(
        host=Config.MYSQL_HOST,
        port=Config.MYSQL_PORT,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DB,
        cursorclass=DictCursor,
        autocommit=True
    )

@contextmanager
def get_db():
    conn = None
    try:
        conn = get_db_connection()
        yield conn
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {e}")
        raise e
    finally:
        if conn:
            conn.close()

def query_all(sql, params=None):
    with get_db() as conn:
        with conn.cursor() as cursor:
            cursor.execute(sql, params or ())
            return cursor.fetchall()

def query_one(sql, params=None):
    with get_db() as conn:
        with conn.cursor() as cursor:
            cursor.execute(sql, params or ())
            return cursor.fetchone()

def execute_write(sql, params=None):
    with get_db() as conn:
        with conn.cursor() as cursor:
            cursor.execute(sql, params or ())
            return cursor.lastrowid
