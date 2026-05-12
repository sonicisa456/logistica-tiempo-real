from datetime import datetime
import secrets

from flask import Blueprint, jsonify, make_response, request
import urllib.request
import urllib.parse
import json

from db import get_connection


api_blueprint = Blueprint("api", __name__)
SESSION_COOKIE_NAME = "flashgo_session"
SESSION_TTL_SECONDS = 60 * 60 * 24 * 14


def _rows(cursor):
    return cursor.fetchall()


def _row(cursor):
    return cursor.fetchone()


def _jsonify_rows(rows):
    return [dict(item) for item in rows]


def _cursor(dictionary=True):
    connection = get_connection()
    return connection, connection.cursor(dictionary=dictionary)


def _close(connection, cursor):
    cursor.close()
    connection.close()


def _parse_json():
    return request.get_json(silent=True) or {}


def _serialize_payload(payload):
    if isinstance(payload.get("created_at"), datetime):
        payload["created_at"] = payload["created_at"].isoformat()
    return payload


def _normalize_theme(raw_theme):
    return raw_theme if raw_theme in ("dark", "light") else "dark"


def _set_session_cookie(response, token):
    response.set_cookie(
        SESSION_COOKIE_NAME,
        token,
        max_age=SESSION_TTL_SECONDS,
        httponly=True,
        samesite="Lax",
        path="/",
    )


def _clear_session_cookie(response):
    response.delete_cookie(SESSION_COOKIE_NAME, path="/")


def _user_payload(user_row):
    payload = dict(user_row)
    payload.pop("password", None)
    return payload


def _wallet_payload(cursor, user_id):
    cursor.execute(
        "SELECT id, usuario_id, saldo, moneda, updated_at FROM billeteras WHERE usuario_id = %s",
        (user_id,),
    )
    wallet = _row(cursor)
    return dict(wallet) if wallet else None


def _ensure_wallet_for_user(connection, cursor, user_id):
    cursor.execute("SELECT id FROM billeteras WHERE usuario_id = %s", (user_id,))
    wallet = _row(cursor)
    if wallet:
        return wallet["id"]
    cursor.execute("INSERT INTO billeteras (usuario_id, saldo, moneda) VALUES (%s, 0, 'MXN')", (user_id,))
    connection.commit()
    return cursor.lastrowid


def _user_with_wallet(connection, cursor, user_id):
    cursor.execute("SELECT id, nombre, correo, tipo, reputacion, tema FROM usuarios WHERE id = %s", (user_id,))
    user = _row(cursor)
    if not user:
        return None
    payload = _user_payload(user)
    payload["billetera"] = _wallet_payload(cursor, user_id)
    return payload


def _register_wallet_movement(connection, cursor, wallet_id, movement_type, amount, concept, reference=None):
    cursor.execute(
        "INSERT INTO movimientos_billetera (billetera_id, tipo, monto, concepto, referencia) VALUES (%s, %s, %s, %s, %s)",
        (wallet_id, movement_type, amount, concept, reference),
    )
    connection.commit()


def _create_session(connection, cursor, user_id):
    token = secrets.token_urlsafe(32)
    cursor.execute(
        "INSERT INTO sesiones (token, usuario_id, expires_at) VALUES (%s, %s, DATE_ADD(NOW(), INTERVAL 14 DAY))",
        (token, user_id),
    )
    connection.commit()
    return token


def _current_user_from_session():
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        return None
    connection, cursor = _cursor()
    cursor.execute(
        """
        SELECT u.id, u.nombre, u.correo, u.tipo, u.reputacion, u.tema
        FROM sesiones s
        JOIN usuarios u ON u.id = s.usuario_id
        WHERE s.token = %s AND s.expires_at > NOW()
        """,
        (token,),
    )
    user = _row(cursor)
    _close(connection, cursor)
    return dict(user) if user else None


@api_blueprint.get("/productos")
def listar_productos():
    search = request.args.get("search", "").strip()
    categoria = request.args.get("categoria", "").strip()
    destacado = request.args.get("destacado", "").strip()
    vendedor_id = request.args.get("vendedor_id", "").strip()
    connection, cursor = _cursor()
    query = """
        SELECT p.*, u.nombre AS vendedor_nombre, u.reputacion AS vendedor_reputacion
        FROM productos p
        JOIN usuarios u ON u.id = p.vendedor_id
        WHERE 1 = 1
    """
    params = []
    if search:
        query += " AND (p.nombre LIKE %s OR p.descripcion LIKE %s OR p.categoria LIKE %s)"
        like = f"%{search}%"
        params.extend([like, like, like])
    if categoria:
        query += " AND p.categoria = %s"
        params.append(categoria)
    if vendedor_id:
        query += " AND p.vendedor_id = %s"
        params.append(vendedor_id)
    if destacado == "popular":
        query += " AND p.popular = 1"
    elif destacado == "nuevo":
        query += " AND p.nuevo = 1"
    query += " ORDER BY p.created_at DESC"
    cursor.execute(query, params)
    products = _jsonify_rows(_rows(cursor))
    _close(connection, cursor)
    return jsonify(products)


@api_blueprint.get("/convert")
def convertir_moneda():
    """Endpoint simple que devuelve la tasa de conversión entre dos monedas.
    Query params: from (ej. MXN), to (ej. USD), amount (opcional, default 1)
    """
    frm = request.args.get("from", "MXN").upper()
    to = request.args.get("to", "USD").upper()
    amount = float(request.args.get("amount", "1"))

    # Use exchangerate.host public API (no key required)
    try:
        query = urllib.parse.urlencode({"from": frm, "to": to, "amount": amount})
        url = f"https://api.exchangerate.host/convert?{query}"
        with urllib.request.urlopen(url, timeout=6) as resp:
            data = json.load(resp)
        # data example: {"motd":..., "success":true, "query":{...}, "info": {"rate": 0.05}, "result": ...}
        rate = data.get("info", {}).get("rate")
        result = data.get("result")
        return jsonify({"from": frm, "to": to, "rate": rate, "result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@api_blueprint.get("/productos/<int:product_id>")
def obtener_producto(product_id):
    connection, cursor = _cursor()
    cursor.execute(
        """
        SELECT p.*, u.nombre AS vendedor_nombre, u.reputacion AS vendedor_reputacion
        FROM productos p
        JOIN usuarios u ON u.id = p.vendedor_id
        WHERE p.id = %s
        """,
        (product_id,),
    )
    product = _row(cursor)
    _close(connection, cursor)
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404
    payload = _serialize_payload(dict(product))
    return jsonify(payload)


@api_blueprint.post("/productos")
def crear_producto():
    data = _parse_json()
    required = ["nombre", "descripcion", "precio", "stock", "vendedor_id", "categoria"]
    missing = [field for field in required if data.get(field) in (None, "")]
    if missing:
        return jsonify({"error": "Faltan campos", "campos": missing}), 400

    connection, cursor = _cursor()
    cursor.execute(
        """
        INSERT INTO productos (nombre, descripcion, precio, stock, imagen, vendedor_id, categoria, entrega, popular, nuevo)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            data["nombre"],
            data["descripcion"],
            data["precio"],
            data["stock"],
            data.get("imagen"),
            data["vendedor_id"],
            data["categoria"],
            data.get("entrega", "Llega pronto"),
            int(bool(data.get("popular", False))),
            int(bool(data.get("nuevo", True))),
        ),
    )
    connection.commit()
    product_id = cursor.lastrowid
    _close(connection, cursor)
    return jsonify({"id": product_id}), 201


@api_blueprint.put("/productos/<int:product_id>")
def actualizar_producto(product_id):
    data = _parse_json()
    fields = ["nombre", "descripcion", "precio", "stock", "imagen", "categoria", "entrega", "popular", "nuevo"]
    updates = []
    params = []
    for field in fields:
        if field in data:
            updates.append(f"{field} = %s")
            params.append(data[field])
    if not updates:
        return jsonify({"error": "No hay campos para actualizar"}), 400

    connection, cursor = _cursor()
    params.append(product_id)
    cursor.execute(f"UPDATE productos SET {', '.join(updates)} WHERE id = %s", params)
    connection.commit()
    _close(connection, cursor)
    return jsonify({"mensaje": "Producto actualizado"})


@api_blueprint.get("/ofertas")
def listar_ofertas():
    connection, cursor = _cursor()
    cursor.execute(
        """
        SELECT o.id, o.descuento, o.titulo, o.activa, p.id AS producto_id, p.nombre, p.descripcion, p.precio,
               p.stock, p.imagen, p.categoria, p.entrega, u.nombre AS vendedor_nombre
        FROM ofertas o
        JOIN productos p ON p.id = o.producto_id
        JOIN usuarios u ON u.id = p.vendedor_id
        WHERE o.activa = 1
        ORDER BY o.id DESC
        """
    )
    offers = _jsonify_rows(_rows(cursor))
    _close(connection, cursor)
    return jsonify(offers)


@api_blueprint.get("/usuarios")
def listar_usuarios():
    connection, cursor = _cursor()
    cursor.execute("SELECT id, nombre, correo, tipo, reputacion, tema, created_at FROM usuarios ORDER BY id DESC")
    users = _jsonify_rows(_rows(cursor))
    _close(connection, cursor)
    return jsonify(users)


@api_blueprint.post("/usuarios")
def registrar_usuario():
    data = _parse_json()
    required = ["nombre", "correo", "password"]
    missing = [field for field in required if not data.get(field)]
    if missing:
        return jsonify({"error": "Faltan campos", "campos": missing}), 400

    connection, cursor = _cursor()
    try:
        cursor.execute(
            "INSERT INTO usuarios (nombre, correo, password, tipo, reputacion, tema) VALUES (%s, %s, %s, %s, %s, %s)",
            (
                data["nombre"],
                data["correo"],
                data["password"],
                data.get("tipo", "cliente"),
                data.get("reputacion", 0),
                _normalize_theme(data.get("tema")),
            ),
        )
        connection.commit()
        user_id = cursor.lastrowid
        cursor.execute(
            "SELECT id, nombre, correo, tipo, reputacion, tema FROM usuarios WHERE id = %s",
            (user_id,),
        )
        user = _row(cursor)
        wallet_id = _ensure_wallet_for_user(connection, cursor, user_id)
        cursor.execute("SELECT id, usuario_id, saldo, moneda, updated_at FROM billeteras WHERE id = %s", (wallet_id,))
        wallet = _row(cursor)
        token = _create_session(connection, cursor, user_id)
        _close(connection, cursor)
        payload = _user_payload(user)
        payload["billetera"] = dict(wallet) if wallet else None
        response = make_response(jsonify(payload), 201)
        _set_session_cookie(response, token)
        return response
    except Exception as error:
        connection.rollback()
        _close(connection, cursor)
        return jsonify({"error": str(error)}), 400


@api_blueprint.post("/usuarios/login")
def login_usuario():
    data = _parse_json()
    connection, cursor = _cursor()
    cursor.execute(
        "SELECT id, nombre, correo, tipo, reputacion, tema FROM usuarios WHERE correo = %s AND password = %s",
        (data.get("correo"), data.get("password")),
    )
    user = _row(cursor)
    if not user:
        _close(connection, cursor)
        return jsonify({"error": "Credenciales inválidas"}), 401
    token = _create_session(connection, cursor, user["id"])
    _close(connection, cursor)
    connection, cursor = _cursor()
    payload = _user_payload(user)
    payload["billetera"] = _wallet_payload(cursor, user["id"])
    _close(connection, cursor)
    response = make_response(jsonify(payload))
    _set_session_cookie(response, token)
    return response


@api_blueprint.get("/usuarios/sesion")
def obtener_sesion_actual():
    user = _current_user_from_session()
    if not user:
        return jsonify({"error": "No hay sesión activa"}), 401
    connection, cursor = _cursor()
    user["billetera"] = _wallet_payload(cursor, user["id"])
    _close(connection, cursor)
    return jsonify(user)


@api_blueprint.post("/usuarios/salir")
def cerrar_sesion():
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if token:
        connection, cursor = _cursor()
        cursor.execute("DELETE FROM sesiones WHERE token = %s", (token,))
        connection.commit()
        _close(connection, cursor)
    response = make_response(jsonify({"mensaje": "Sesión cerrada"}))
    _clear_session_cookie(response)
    return response


@api_blueprint.get("/vendedores")
def listar_vendedores():
    connection, cursor = _cursor()
    cursor.execute("SELECT id, nombre, correo, reputacion, created_at FROM usuarios WHERE tipo = 'vendedor' ORDER BY id DESC")
    sellers = _jsonify_rows(_rows(cursor))
    for seller in sellers:
        seller["productos_publicados"] = 0
        seller["ventas"] = 0
    _close(connection, cursor)
    return jsonify(sellers)


@api_blueprint.post("/vendedores")
def registrar_vendedor():
    data = _parse_json()
    data["tipo"] = "vendedor"
    required = ["nombre", "correo", "password"]
    missing = [field for field in required if not data.get(field)]
    if missing:
        return jsonify({"error": "Faltan campos", "campos": missing}), 400

    connection, cursor = _cursor()
    try:
        cursor.execute(
            "INSERT INTO usuarios (nombre, correo, password, tipo, reputacion, tema) VALUES (%s, %s, %s, %s, %s, %s)",
            (
                data["nombre"],
                data["correo"],
                data["password"],
                "vendedor",
                data.get("reputacion", 0),
                _normalize_theme(data.get("tema")),
            ),
        )
        connection.commit()
        seller_id = cursor.lastrowid
        cursor.execute(
            "SELECT id, nombre, correo, tipo, reputacion, tema FROM usuarios WHERE id = %s",
            (seller_id,),
        )
        seller = _row(cursor)
        wallet_id = _ensure_wallet_for_user(connection, cursor, seller_id)
        cursor.execute("SELECT id, usuario_id, saldo, moneda, updated_at FROM billeteras WHERE id = %s", (wallet_id,))
        wallet = _row(cursor)
        token = _create_session(connection, cursor, seller_id)
        _close(connection, cursor)
        payload = _user_payload(seller)
        payload["billetera"] = dict(wallet) if wallet else None
        response = make_response(jsonify(payload), 201)
        _set_session_cookie(response, token)
        return response
    except Exception as error:
        connection.rollback()
        _close(connection, cursor)
        return jsonify({"error": str(error)}), 400


@api_blueprint.put("/usuarios/<int:user_id>/tema")
def actualizar_tema_usuario(user_id):
    data = _parse_json()
    tema = data.get("tema")
    if tema not in ("dark", "light"):
        return jsonify({"error": "Tema inválido, usa 'dark' o 'light'"}), 400

    connection, cursor = _cursor()
    cursor.execute("UPDATE usuarios SET tema = %s WHERE id = %s", (tema, user_id))
    connection.commit()
    updated_rows = cursor.rowcount
    _close(connection, cursor)

    if updated_rows == 0:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return jsonify({"id": user_id, "tema": tema})


@api_blueprint.put("/usuarios/<int:user_id>/vendedor")
def convertir_usuario_a_vendedor(user_id):
    connection, cursor = _cursor()
    cursor.execute("UPDATE usuarios SET tipo = 'vendedor' WHERE id = %s", (user_id,))
    connection.commit()
    if cursor.rowcount == 0:
        _close(connection, cursor)
        return jsonify({"error": "Usuario no encontrado"}), 404
    cursor.execute(
        "SELECT id, nombre, correo, tipo, reputacion, tema FROM usuarios WHERE id = %s",
        (user_id,),
    )
    user = _row(cursor)
    wallet = _wallet_payload(cursor, user_id)
    _close(connection, cursor)
    payload = _user_payload(user)
    payload["billetera"] = wallet
    return jsonify(payload)


@api_blueprint.get("/billetera")
def obtener_billetera():
    user = _current_user_from_session()
    if not user:
        return jsonify({"error": "No hay sesión activa"}), 401
    connection, cursor = _cursor()
    wallet = _wallet_payload(cursor, user["id"])
    _close(connection, cursor)
    if not wallet:
        return jsonify({"error": "Billetera no encontrada"}), 404
    return jsonify(wallet)


@api_blueprint.post("/billetera/abonar")
def abonar_billetera():
    user = _current_user_from_session()
    if not user:
        return jsonify({"error": "No hay sesión activa"}), 401
    data = _parse_json()
    amount = float(data.get("monto", 0))
    concept = data.get("concepto", "Abono a billetera")
    if amount <= 0:
        return jsonify({"error": "Monto inválido"}), 400
    connection, cursor = _cursor()
    wallet_id = _ensure_wallet_for_user(connection, cursor, user["id"])
    cursor.execute("UPDATE billeteras SET saldo = saldo + %s WHERE id = %s", (amount, wallet_id))
    _register_wallet_movement(connection, cursor, wallet_id, "ABONO", amount, concept)
    cursor.execute("SELECT id, usuario_id, saldo, moneda, updated_at FROM billeteras WHERE id = %s", (wallet_id,))
    wallet = _row(cursor)
    _close(connection, cursor)
    return jsonify(dict(wallet))


@api_blueprint.post("/billetera/cargar-compra")
def cargar_compra_billetera():
    user = _current_user_from_session()
    if not user:
        return jsonify({"error": "No hay sesión activa"}), 401
    data = _parse_json()
    amount = float(data.get("monto", 0))
    concept = data.get("concepto", "Compra")
    reference = data.get("referencia")
    if amount <= 0:
        return jsonify({"error": "Monto inválido"}), 400
    connection, cursor = _cursor()
    wallet_id = _ensure_wallet_for_user(connection, cursor, user["id"])
    cursor.execute("SELECT saldo FROM billeteras WHERE id = %s FOR UPDATE", (wallet_id,))
    wallet = _row(cursor)
    if float(wallet["saldo"]) < amount:
        _close(connection, cursor)
        return jsonify({"error": "Saldo insuficiente"}), 400
    cursor.execute("UPDATE billeteras SET saldo = saldo - %s WHERE id = %s", (amount, wallet_id))
    _register_wallet_movement(connection, cursor, wallet_id, "CARGO", amount, concept, reference)
    cursor.execute("SELECT id, usuario_id, saldo, moneda, updated_at FROM billeteras WHERE id = %s", (wallet_id,))
    updated_wallet = _row(cursor)
    _close(connection, cursor)
    return jsonify(dict(updated_wallet))


@api_blueprint.get("/direcciones")
def listar_direcciones():
    usuario_id = request.args.get("usuario_id")
    connection, cursor = _cursor()
    query = "SELECT * FROM direcciones"
    params = []
    if usuario_id:
        query += " WHERE usuario_id = %s"
        params.append(usuario_id)
    query += " ORDER BY is_default DESC, id DESC"
    cursor.execute(query, params)
    addresses = _jsonify_rows(_rows(cursor))
    _close(connection, cursor)
    return jsonify(addresses)


@api_blueprint.post("/direcciones")
def crear_direccion():
    data = _parse_json()
    required = ["usuario_id", "pais", "estado", "ciudad", "colonia", "calle", "codigo_postal"]
    missing = [field for field in required if not data.get(field)]
    if missing:
        return jsonify({"error": "Faltan campos", "campos": missing}), 400

    connection, cursor = _cursor()
    if data.get("is_default"):
        cursor.execute("UPDATE direcciones SET is_default = 0 WHERE usuario_id = %s", (data["usuario_id"],))
    cursor.execute(
        """
        INSERT INTO direcciones
        (usuario_id, pais, estado, ciudad, colonia, calle, codigo_postal, referencia, is_default)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            data["usuario_id"],
            data["pais"],
            data["estado"],
            data["ciudad"],
            data["colonia"],
            data["calle"],
            data["codigo_postal"],
            data.get("referencia"),
            int(bool(data.get("is_default", False))),
        ),
    )
    connection.commit()
    address_id = cursor.lastrowid
    _close(connection, cursor)
    return jsonify({"id": address_id}), 201


@api_blueprint.put("/direcciones/<int:address_id>")
def actualizar_direccion(address_id):
    data = _parse_json()
    fields = ["pais", "estado", "ciudad", "colonia", "calle", "codigo_postal", "referencia", "is_default"]
    updates = []
    params = []
    for field in fields:
        if field in data:
            updates.append(f"{field} = %s")
            params.append(data[field])
    if not updates:
        return jsonify({"error": "No hay campos para actualizar"}), 400
    connection, cursor = _cursor()
    if data.get("is_default"):
        cursor.execute(
            "UPDATE direcciones SET is_default = 0 WHERE usuario_id = (SELECT usuario_id FROM direcciones WHERE id = %s)",
            (address_id,),
        )
    params.append(address_id)
    cursor.execute(f"UPDATE direcciones SET {', '.join(updates)} WHERE id = %s", params)
    connection.commit()
    _close(connection, cursor)
    return jsonify({"mensaje": "Dirección actualizada"})


@api_blueprint.get("/carrito")
def listar_carrito():
    usuario_id = request.args.get("usuario_id")
    if not usuario_id:
        return jsonify({"error": "usuario_id es requerido"}), 400
    connection, cursor = _cursor()
    cursor.execute(
        """
        SELECT c.id, c.usuario_id, c.producto_id, c.cantidad, p.nombre, p.precio, p.imagen, p.stock,
               p.entrega, p.categoria, u.nombre AS vendedor_nombre
        FROM carrito c
        JOIN productos p ON p.id = c.producto_id
        JOIN usuarios u ON u.id = p.vendedor_id
        WHERE c.usuario_id = %s
        ORDER BY c.updated_at DESC
        """,
        (usuario_id,),
    )
    items = _jsonify_rows(_rows(cursor))
    _close(connection, cursor)
    total = sum(float(item["precio"]) * int(item["cantidad"]) for item in items)
    return jsonify({"items": items, "total": round(total, 2)})


@api_blueprint.post("/carrito")
def agregar_carrito():
    data = _parse_json()
    required = ["usuario_id", "producto_id", "cantidad"]
    missing = [field for field in required if data.get(field) in (None, "")]
    if missing:
        return jsonify({"error": "Faltan campos", "campos": missing}), 400

    connection, cursor = _cursor()
    cursor.execute(
        """
        INSERT INTO carrito (usuario_id, producto_id, cantidad)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)
        """,
        (data["usuario_id"], data["producto_id"], data["cantidad"]),
    )
    connection.commit()
    _close(connection, cursor)
    return jsonify({"mensaje": "Producto agregado al carrito"}), 201


@api_blueprint.patch("/carrito/<int:item_id>")
def actualizar_carrito(item_id):
    data = _parse_json()
    cantidad = data.get("cantidad")
    if cantidad is None:
        return jsonify({"error": "cantidad es requerida"}), 400
    connection, cursor = _cursor()
    cursor.execute("UPDATE carrito SET cantidad = %s WHERE id = %s", (cantidad, item_id))
    connection.commit()
    _close(connection, cursor)
    return jsonify({"mensaje": "Carrito actualizado"})


@api_blueprint.delete("/carrito/<int:item_id>")
def eliminar_carrito(item_id):
    connection, cursor = _cursor()
    cursor.execute("DELETE FROM carrito WHERE id = %s", (item_id,))
    connection.commit()
    _close(connection, cursor)
    return jsonify({"mensaje": "Producto eliminado del carrito"})


@api_blueprint.delete("/carrito")
def vaciar_carrito():
    usuario_id = request.args.get("usuario_id")
    if not usuario_id:
        return jsonify({"error": "usuario_id es requerido"}), 400
    connection, cursor = _cursor()
    cursor.execute("DELETE FROM carrito WHERE usuario_id = %s", (usuario_id,))
    connection.commit()
    _close(connection, cursor)
    return jsonify({"mensaje": "Carrito vaciado"})


def _crear_rastreo(cursor, pedido_id, estado):
    ubicaciones = {
        "EN_ALMACEN": "Pedido en almacén",
        "PREPARANDO": "Pedido en preparación",
        "EN_CAMINO": "Pedido en camino",
        "ENTREGADO": "Pedido entregado",
    }
    cursor.execute(
        "INSERT INTO rastreo (pedido_id, ubicacion, estado) VALUES (%s, %s, %s)",
        (pedido_id, ubicaciones.get(estado, "Pedido en almacén"), estado),
    )


@api_blueprint.get("/pedidos")
def listar_pedidos():
    usuario_id = request.args.get("usuario_id")
    connection, cursor = _cursor()
    query = "SELECT p.*, d.pais, d.estado AS estado_direccion, d.ciudad, d.colonia, d.calle, d.codigo_postal FROM pedidos p JOIN direcciones d ON d.id = p.direccion_id"
    params = []
    if usuario_id:
        query += " WHERE p.usuario_id = %s"
        params.append(usuario_id)
    query += " ORDER BY p.created_at DESC"
    cursor.execute(query, params)
    orders = _jsonify_rows(_rows(cursor))
    for order in orders:
        cursor.execute(
            """
            SELECT dp.*, pr.nombre, pr.imagen
            FROM detalle_pedido dp
            JOIN productos pr ON pr.id = dp.producto_id
            WHERE dp.pedido_id = %s
            """,
            (order["id"],),
        )
        order["items"] = _jsonify_rows(_rows(cursor))
        cursor.execute(
            "SELECT estado, ubicacion, fecha FROM rastreo WHERE pedido_id = %s ORDER BY fecha ASC",
            (order["id"],),
        )
        order["rastreo"] = _jsonify_rows(_rows(cursor))
    _close(connection, cursor)
    return jsonify(orders)


@api_blueprint.get("/pedidos/<int:pedido_id>")
def obtener_pedido(pedido_id):
    connection, cursor = _cursor()
    cursor.execute("SELECT * FROM pedidos WHERE id = %s", (pedido_id,))
    order = _row(cursor)
    if not order:
        _close(connection, cursor)
        return jsonify({"error": "Pedido no encontrado"}), 404
    order = dict(order)
    cursor.execute(
        """
        SELECT dp.*, pr.nombre, pr.imagen
        FROM detalle_pedido dp
        JOIN productos pr ON pr.id = dp.producto_id
        WHERE dp.pedido_id = %s
        """,
        (pedido_id,),
    )
    order["items"] = _jsonify_rows(_rows(cursor))
    cursor.execute("SELECT estado, ubicacion, fecha FROM rastreo WHERE pedido_id = %s ORDER BY fecha ASC", (pedido_id,))
    order["rastreo"] = _jsonify_rows(_rows(cursor))
    _close(connection, cursor)
    return jsonify(order)


@api_blueprint.post("/pedidos")
def crear_pedido():
    data = _parse_json()
    usuario_id = data.get("usuario_id")
    direccion_id = data.get("direccion_id")
    items = data.get("items")

    if not usuario_id or not direccion_id:
        return jsonify({"error": "usuario_id y direccion_id son requeridos"}), 400

    connection, cursor = _cursor()
    try:
        cursor.execute(
            "SELECT c.id, c.producto_id, c.cantidad, p.precio, p.stock FROM carrito c JOIN productos p ON p.id = c.producto_id WHERE c.usuario_id = %s",
            (usuario_id,),
        )
        cart_items = _jsonify_rows(_rows(cursor))
        source_items = items or cart_items
        if not source_items:
            return jsonify({"error": "No hay productos para comprar"}), 400

        normalized = []
        for item in source_items:
            producto_id = item.get("producto_id") or item.get("id")
            cantidad = int(item.get("cantidad", 1))
            cursor.execute("SELECT precio, stock FROM productos WHERE id = %s", (producto_id,))
            product = _row(cursor)
            if not product:
                return jsonify({"error": f"Producto {producto_id} no existe"}), 404
            if int(product["stock"]) < cantidad:
                return jsonify({"error": f"Stock insuficiente para producto {producto_id}"}), 400
            normalized.append((producto_id, cantidad, float(product["precio"])))

        total = round(sum(cantidad * precio for _, cantidad, precio in normalized), 2)
        cursor.execute(
            "INSERT INTO pedidos (usuario_id, direccion_id, total, estado) VALUES (%s, %s, %s, %s)",
            (usuario_id, direccion_id, total, "EN_ALMACEN"),
        )
        pedido_id = cursor.lastrowid

        for producto_id, cantidad, precio in normalized:
            cursor.execute(
                "INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio) VALUES (%s, %s, %s, %s)",
                (pedido_id, producto_id, cantidad, precio),
            )
            cursor.execute("UPDATE productos SET stock = stock - %s WHERE id = %s", (cantidad, producto_id))

        _crear_rastreo(cursor, pedido_id, "EN_ALMACEN")
        _crear_rastreo(cursor, pedido_id, "PREPARANDO")
        _crear_rastreo(cursor, pedido_id, "EN_CAMINO")

        if not items:
            cursor.execute("DELETE FROM carrito WHERE usuario_id = %s", (usuario_id,))

        connection.commit()
        cursor.execute("SELECT * FROM pedidos WHERE id = %s", (pedido_id,))
        order = dict(_row(cursor))
        cursor.execute("SELECT * FROM detalle_pedido WHERE pedido_id = %s", (pedido_id,))
        order["items"] = _jsonify_rows(_rows(cursor))
        _close(connection, cursor)
        return jsonify(order), 201
    except Exception as error:
        connection.rollback()
        _close(connection, cursor)
        return jsonify({"error": str(error)}), 400


@api_blueprint.get("/rastreo")
def rastreo_por_pedido():
    pedido_id = request.args.get("pedido_id")
    if not pedido_id:
        return jsonify({"error": "pedido_id es requerido"}), 400
    connection, cursor = _cursor()
    cursor.execute(
        "SELECT estado, ubicacion, fecha FROM rastreo WHERE pedido_id = %s ORDER BY fecha ASC",
        (pedido_id,),
    )
    tracking = _jsonify_rows(_rows(cursor))
    _close(connection, cursor)
    return jsonify(tracking)


@api_blueprint.get("/rastreo/<int:pedido_id>")
def rastreo_pedido(pedido_id):
    connection, cursor = _cursor()
    cursor.execute(
        "SELECT estado, ubicacion, fecha FROM rastreo WHERE pedido_id = %s ORDER BY fecha ASC",
        (pedido_id,),
    )
    tracking = _jsonify_rows(_rows(cursor))
    _close(connection, cursor)
    return jsonify(tracking)