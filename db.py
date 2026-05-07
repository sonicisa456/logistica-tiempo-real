import mysql.connector
import os

def get_connection():
    try:
        return mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "1234"),
            database=os.getenv("DB_NAME", "logistica")
        )
    except Exception as e:
        print("ERROR DE CONEXIÓN:", e)
        raise