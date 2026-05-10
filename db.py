import mysql.connector
import os

def get_connection():
    try:
        return mysql.connector.connect(
            host="db",
            user="root",
            password="1234",
            database="logistica"
        )
    except Exception as e:
        print("ERROR DE CONEXIÓN:", e)
        raise