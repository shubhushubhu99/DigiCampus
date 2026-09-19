import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER = os.getenv("MYSQL_USER", "digiuser")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "digipass")
    MYSQL_DB = os.getenv("MYSQL_DB", "digicampus")
    SECRET_KEY = os.getenv("SECRET_KEY", "digicampus-secret-key-2026")
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
