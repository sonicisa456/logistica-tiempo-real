from backend.db import get_connection

def obtener_productos_db():
    conn = get_connection()

    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM productos")

    productos = cursor.fetchall()

    conn.close()

    return productos