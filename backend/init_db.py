import os
import mysql.connector

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '1234')
DB_NAME = os.getenv('DB_NAME', 'logistica')
SCHEMA_FILE = os.path.join(os.path.dirname(__file__), 'schema.sql')

if __name__ == '__main__':
    connection = mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD)
    cursor = connection.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    connection.commit()
    connection.close()

    connection = mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME)
    cursor = connection.cursor()

    with open(SCHEMA_FILE, 'r', encoding='utf-8') as schema:
        sql = schema.read()
    statements = [stmt.strip() for stmt in sql.split(';') if stmt.strip()]
    for statement in statements:
        cursor.execute(statement)
    connection.commit()
    cursor.close()
    connection.close()
    print(f'Database "{DB_NAME}" initialized successfully.')