from flask import Blueprint, request, jsonify
from models.usuarios import crear_usuario, obtener_usuario, obtener_usuario_por_token

usuarios_routes = Blueprint('usuarios_routes', __name__)

@usuarios_routes.route("/auth/register", methods=["POST"])
def registro():

    data = request.json

    nombre = data.get("nombre")
    email = data.get("email")
    password = data.get("password")

    try:
        usuario = crear_usuario(nombre, email, password)
        return {"mensaje": "Usuario creado", "usuario": usuario}, 201
    except Exception as e:
        if "Duplicate entry" in str(e):
            return {"error": "El email ya está registrado"}, 400
        return {"error": "Error al crear usuario"}, 400

@usuarios_routes.route("/auth/login", methods=["POST"])
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

@usuarios_routes.route("/auth/me", methods=["GET"])
def me():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return {"error": "Token requerido"}, 401

    token = auth_header.split(" ")[1]
    usuario = obtener_usuario_por_token(token)
    if not usuario:
        return {"error": "Token inválido"}, 401

    return {"usuario": usuario}, 200

@usuarios_routes.route("/auth/logout", methods=["POST"])
def logout():
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        # Could invalidate token here, but for simplicity, just return ok
    return {"mensaje": "Sesión cerrada"}, 200