import mysql.connector
import os

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "db"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "1234"),
        database="logistica"
    )