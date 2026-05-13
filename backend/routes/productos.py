from flask import Blueprint, jsonify
from models.productos import obtener_productos_db

productos_routes = Blueprint('productos_routes', __name__)

@productos_routes.route("/products", methods=["GET"])
def obtener_productos():

    productos = obtener_productos_db()

    return jsonify(productos)