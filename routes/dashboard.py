# routes/dashboard.py
from flask import Blueprint, jsonify
from db import get_connection

dashboard_routes = Blueprint('dashboard_routes', __name__)

@dashboard_routes.route("/dashboard", methods=["GET"])
def obtener_dashboard():
    conn = get_connection()
    cursor = conn.cursor()

    # Conteo de usuarios
    cursor.execute("SELECT COUNT(*) FROM usuarios")
    usuarios_count = cursor.fetchone()[0]

    # Conteo de productos
    cursor.execute("SELECT COUNT(*) FROM productos")
    productos_count = cursor.fetchone()[0]

    # Conteo de pedidos
    cursor.execute("SELECT COUNT(*) FROM pedidos")
    pedidos_count = cursor.fetchone()[0]

    conn.close()

    return jsonify({
        "usuarios": usuarios_count,
        "productos": productos_count,
        "pedidos": pedidos_count
    })