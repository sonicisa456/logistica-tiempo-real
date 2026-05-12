# routes/pedidos.py
from flask import Blueprint, request
from models.pedidos import crear_pedido, obtener_pedido, actualizar_estado
import logging

routes = Blueprint('routes', __name__)

@routes.route("/pedido", methods=["POST"])
def crear():
    data = request.json
    cliente = data.get("cliente")
    crear_pedido(cliente)
    logging.info(f"Pedido creado por {cliente}")
    return {"mensaje": "Pedido creado"}, 201

@routes.route("/pedido/<int:id>", methods=["PUT"])
def actualizar(id):
    data = request.json
    estado = data.get("estado")

    pedido = obtener_pedido(id)
    if not pedido:
        logging.error("Pedido no encontrado")
        return {"error": "No existe"}, 404

    actualizar_estado(id, estado)
    logging.info(f"Pedido {id} actualizado a {estado}")
    return {"mensaje": "Estado actualizado"}, 200