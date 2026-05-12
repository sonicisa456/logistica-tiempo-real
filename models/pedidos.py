# models/pedidos.py
from db import get_connection

def crear_pedido(usuario_id, total, productos):

    conn = get_connection()

    cursor = conn.cursor()

    # Crear pedido
    query = """
    INSERT INTO pedidos(usuario_id, total, estado)
    VALUES(%s, %s, %s)
    """

    cursor.execute(query, (usuario_id, total, "EN_ALMACEN"))

    pedido_id = cursor.lastrowid

    # Guardar productos del pedido
    for producto in productos:

        query_item = """
        INSERT INTO pedido_items(pedido_id, producto_id, cantidad)
        VALUES(%s, %s, %s)
        """

        cursor.execute(
            query_item,
            (
                pedido_id,
                producto["producto_id"],
                producto["cantidad"]
            )
        )

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