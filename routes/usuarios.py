from flask import Blueprint, request
from models.usuarios import crear_usuario, obtener_usuario

usuarios_routes = Blueprint('usuarios_routes', __name__)

@usuarios_routes.route("/registro", methods=["POST"])
def registro():

    data = request.json

    nombre = data.get("nombre")
    email = data.get("email")
    password = data.get("password")

    crear_usuario(nombre, email, password)

    return {"mensaje": "Usuario creado"}, 201

@usuarios_routes.route("/login", methods=["POST"])
def login():

    data = request.json

    email = data.get("email")
    password = data.get("password")

    usuario = obtener_usuario(email, password)

    if not usuario:
        return {"error": "Credenciales incorrectas"}, 401

    return {
        "mensaje": "Login exitoso",
        "usuario": usuario
    }, 200