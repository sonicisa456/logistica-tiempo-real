# app.py
from backend.db import get_connection
import logging
from flask import Flask, render_template
from flask_cors import CORS

from backend.routes.api import api as api_routes
from backend.routes.pedidos import routes
from backend.routes.usuarios import usuarios_routes
from backend.routes.dashboard import dashboard_routes

app = Flask(__name__)

# ACTIVAR CORS
CORS(app)

logging.basicConfig(
    filename="logs/app.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

app.register_blueprint(routes, url_prefix="/api")
app.register_blueprint(api_routes)
app.register_blueprint(usuarios_routes, url_prefix="/api")
app.register_blueprint(dashboard_routes, url_prefix="/api")

@app.route("/")
def home():
    return {"mensaje": "Marketplace Flask funcionando"}

@app.route('/admin')
def admin_page():

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # TOTAL USUARIOS
    cursor.execute("SELECT COUNT(*) as total FROM usuarios")
    total_usuarios = cursor.fetchone()["total"]

    # TOTAL PRODUCTOS
    cursor.execute("SELECT COUNT(*) as total FROM productos")
    total_productos = cursor.fetchone()["total"]

    # TOTAL PEDIDOS
    cursor.execute("SELECT COUNT(*) as total FROM pedidos")
    total_pedidos = cursor.fetchone()["total"]

    # LISTA DE USUARIOS
    cursor.execute("SELECT id, nombre, email FROM usuarios")
    usuarios = cursor.fetchall()

    cursor.close()
    conn.close()

    return render_template(
        'admin.html',
        total_usuarios=total_usuarios,
        total_productos=total_productos,
        total_pedidos=total_pedidos,
        usuarios=usuarios
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

