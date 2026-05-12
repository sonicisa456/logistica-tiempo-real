from db import get_connection

def crear_usuario(nombre, email, password):

    conn = get_connection()

    cursor = conn.cursor()

    query = """
    INSERT INTO usuarios(nombre, email, password)
    VALUES(%s, %s, %s)
    """

    cursor.execute(query, (nombre, email, password))

    conn.commit()

    conn.close()

def obtener_usuario(email, password):

    conn = get_connection()

    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT * FROM usuarios
    WHERE email = %s AND password = %s
    """

    cursor.execute(query, (email, password))

    usuario = cursor.fetchone()

    conn.close()

    return usuario