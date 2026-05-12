# models/pedidos.py
from db import get_connection

def crear_pedido(cliente):
    conn = get_connection()
    cursor = conn.cursor()
    query = "INSERT INTO pedidos (cliente, estado) VALUES (%s, %s)"
    cursor.execute(query, (cliente, "EN_ALMACEN"))
    conn.commit()
    conn.close()

def obtener_pedido(id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM pedidos WHERE id = %s", (id,))
    pedido = cursor.fetchone()
    conn.close()
    return pedido

def actualizar_estado(id, estado):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE pedidos SET estado = %s WHERE id = %s", (estado, id))
    conn.commit()
    conn.close()