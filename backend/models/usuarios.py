from backend.db import get_connection
import uuid

def crear_usuario(nombre, email, password):
    token = str(uuid.uuid4())

    conn = get_connection()

    cursor = conn.cursor()

    query = """
    INSERT INTO usuarios(nombre, email, password, session_token)
    VALUES(%s, %s, %s, %s)
    """

    cursor.execute(query, (nombre, email, password, token))

    conn.commit()

    usuario_id = cursor.lastrowid

    conn.close()

    return {
        "id": usuario_id,
        "nombre": nombre,
        "email": email,
        "token": token,
        "esVendedor": False
    }

def obtener_usuario(email, password):

    conn = get_connection()

    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT id, nombre, email, es_vendedor as esVendedor
    FROM usuarios
    WHERE email = %s AND password = %s
    """

    cursor.execute(query, (email, password))

    usuario = cursor.fetchone()

    if usuario:
        token = str(uuid.uuid4())
        update_query = """
        UPDATE usuarios SET session_token = %s WHERE id = %s
        """
        cursor.execute(update_query, (token, usuario['id']))
        conn.commit()
        usuario['token'] = token

def obtener_usuario_por_token(token):

    conn = get_connection()

    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT id, nombre, email, es_vendedor as esVendedor
    FROM usuarios
    WHERE session_token = %s
    """

    cursor.execute(query, (token,))

    usuario = cursor.fetchone()

    conn.close()

    return usuario