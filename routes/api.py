import os
import uuid
from datetime import date, timedelta
from flask import Blueprint, request
from werkzeug.security import generate_password_hash, check_password_hash
from mysql.connector import IntegrityError
from db import get_connection

api = Blueprint('api', __name__, url_prefix='/api')

LOCATION_DATA = {
    'México': {
        'Nuevo León': ['Monterrey', 'Guadalupe', 'San Nicolás'],
        'Jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque'],
        'Ciudad de México': ['Coyoacán', 'Polanco', 'Condesa']
    },
    'Colombia': {
        'Bogotá D.C.': ['Chapinero', 'Suba', 'Usaquén'],
        'Antioquia': ['Medellín', 'Bello', 'Itagüí']
    }
}

TRACKING_STEPS = [
    ('Pedido confirmado', 'complete'),
    ('En almacén', 'complete'),
    ('En camino', 'active'),
    ('Repartidor cerca', 'pending'),
    ('Entregado', 'pending')
]


def db_query(query, params=(), one=False):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query, params)
    result = cursor.fetchone() if one else cursor.fetchall()
    cursor.close()
    conn.close()
    return result


def db_execute(query, params=()):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    conn.commit()
    last_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return last_id


def get_user_by_token(token):
    if not token:
        return None
    return db_query('SELECT id, nombre, email, es_vendedor FROM usuarios WHERE session_token = %s', (token,), one=True)


def get_or_create_cart(user_id):
    cart = db_query('SELECT id FROM carrito WHERE usuario_id = %s', (user_id,), one=True)
    if cart:
        return cart['id']
    return db_execute('INSERT INTO carrito (usuario_id) VALUES (%s)', (user_id,))


def build_product_result(product):
    stock_label = 'Agotado' if product['stock'] <= 0 else ('Últimas piezas disponibles' if product['stock'] <= 5 else 'Stock disponible')
    return {
        'id': product['id'],
        'nombre': product['nombre'],
        'descripcion': product['descripcion'],
        'precio': float(product['precio']),
        'descuento': product['descuento'],
        'stock': product['stock'],
        'stockLabel': stock_label,
        'vendedor': product['tienda'],
        'categoria': product['categoria'],
        'calificacion': float(product.get('rating') or 4.9),
        'envio': product['envio'],
        'estado': product['estado'],
        'imagen': product['imagen'] or 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
        'destacado': bool(product['destacado']),
        'vendido': product['vendido']
    }


@api.route('/locations', methods=['GET'])
def locations():
    return {'paises': LOCATION_DATA}


@api.route('/categories', methods=['GET'])
def categories():
    categories = db_query('SELECT id, nombre, slug FROM categorias ORDER BY nombre')
    return {'categorias': categories}


@api.route('/auth/register', methods=['POST'])
def register():
    payload = request.json or {}
    nombre = payload.get('nombre', '').strip()
    email = payload.get('email', '').strip().lower()
    password = payload.get('password', '')
    if not nombre or not email or not password or len(password) < 6:
        return {'error': 'Nombre, correo y contraseña válidos son obligatorios'}, 400
    try:
        hashed = generate_password_hash(password)
        user_id = db_execute('INSERT INTO usuarios (nombre, email, password) VALUES (%s, %s, %s)', (nombre, email, hashed))
        db_execute('INSERT INTO modos_usuario (usuario_id, modo) VALUES (%s, %s)', (user_id, 'dark'))
        token = uuid.uuid4().hex
        db_execute('UPDATE usuarios SET session_token = %s WHERE id = %s', (token, user_id))
        return {
            'mensaje': 'Cuenta creada',
            'usuario': {
                'id': user_id,
                'nombre': nombre,
                'email': email,
                'esVendedor': False,
                'token': token
            }
        }, 201
    except IntegrityError:
        return {'error': 'Ya existe una cuenta con este correo'}, 409


@api.route('/auth/login', methods=['POST'])
def login():
    payload = request.json or {}
    email = payload.get('email', '').strip().lower()
    password = payload.get('password', '')
    user = db_query('SELECT id, nombre, email, password, es_vendedor FROM usuarios WHERE email = %s', (email,), one=True)
    if not user or not check_password_hash(user['password'], password):
        return {'error': 'Correo o contraseña incorrectos'}, 401
    token = uuid.uuid4().hex
    db_execute('UPDATE usuarios SET session_token = %s WHERE id = %s', (token, user['id']))
    return {
        'usuario': {
            'id': user['id'],
            'nombre': user['nombre'],
            'email': user['email'],
            'esVendedor': bool(user['es_vendedor']),
            'token': token
        }
    }


@api.route('/auth/me', methods=['GET'])
def me():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    user = get_user_by_token(token)
    if not user:
        return {'usuario': None}, 200
    modo = db_query('SELECT modo FROM modos_usuario WHERE usuario_id = %s ORDER BY actualizado_en DESC LIMIT 1', (user['id'],), one=True)
    direccion = db_query('SELECT id, pais, estado, ciudad, detalle FROM direcciones WHERE usuario_id = %s ORDER BY principal DESC, id DESC LIMIT 1', (user['id'],), one=True)
    vendedor = None
    if user['es_vendedor']:
        vendedor = db_query('SELECT tienda FROM vendedores WHERE usuario_id = %s LIMIT 1', (user['id'],), one=True)
    return {
        'usuario': {
            'id': user['id'],
            'nombre': user['nombre'],
            'email': user['email'],
            'esVendedor': bool(user['es_vendedor']),
            'tienda': vendedor['tienda'] if vendedor else None,
            'modo': modo['modo'] if modo else 'dark',
            'direccion': direccion or {}
        }
    }


@api.route('/auth/logout', methods=['POST'])
def logout():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    user = get_user_by_token(token)
    if user:
        db_execute('UPDATE usuarios SET session_token = NULL WHERE id = %s', (user['id'],))
    return {'mensaje': 'Sesión cerrada'}


@api.route('/theme', methods=['POST'])
def save_theme():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    user = get_user_by_token(token)
    if not user:
        return {'error': 'No autorizado'}, 401
    payload = request.json or {}
    modo = payload.get('modo', 'dark')
    if modo not in ('dark', 'light'):
        return {'error': 'Modo desconocido'}, 400
    db_execute('INSERT INTO modos_usuario (usuario_id, modo) VALUES (%s, %s)', (user['id'], modo))
    return {'mensaje': 'Modo guardado', 'modo': modo}


@api.route('/address', methods=['POST'])
def save_address():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    user = get_user_by_token(token)
    if not user:
        return {'error': 'No autorizado'}, 401
    payload = request.json or {}
    pais = payload.get('pais', '').strip()
    estado = payload.get('estado', '').strip()
    ciudad = payload.get('ciudad', '').strip()
    detalle = payload.get('detalle', '').strip()
    if not pais or not estado or not ciudad or not detalle:
        return {'error': 'La dirección debe tener país, estado, ciudad y detalle'}, 400
    db_execute('UPDATE direcciones SET principal = FALSE WHERE usuario_id = %s', (user['id'],))
    address_id = db_execute(
        'INSERT INTO direcciones (usuario_id, pais, estado, ciudad, detalle, principal) VALUES (%s, %s, %s, %s, %s, TRUE)',
        (user['id'], pais, estado, ciudad, detalle)
    )
    return {'mensaje': 'Dirección guardada', 'direccion': {'id': address_id, 'pais': pais, 'estado': estado, 'ciudad': ciudad, 'detalle': detalle}}


@api.route('/search', methods=['GET'])
def search():
    termino = request.args.get('q', '').strip()
    if not termino:
        return {'productos': [], 'categorias': [], 'vendedores': []}
    patron = f'%{termino}%'
    is_offer_search = any(keyword in termino.lower() for keyword in ['oferta', 'ofertas', 'descuento', 'promo', 'promoción'])
    conditions = [
        'p.nombre LIKE %s',
        'p.descripcion LIKE %s',
        'c.nombre LIKE %s',
        'v.tienda LIKE %s'
    ]
    if is_offer_search:
        conditions.append('p.descuento > 0')
    where_clause = ' OR '.join(conditions)
    productos = db_query(
        f"""
        SELECT p.id, p.nombre, p.descripcion, p.precio, p.descuento, p.stock, p.envio, p.estado,
               p.destacado, p.vendido, c.nombre AS categoria, v.tienda, v.rating,
               ip.url AS imagen
        FROM productos p
        JOIN categorias c ON c.id = p.categoria_id
        JOIN vendedores v ON v.id = p.vendedor_id
        LEFT JOIN imagenes_productos ip ON ip.producto_id = p.id AND ip.principal = TRUE
        WHERE {where_clause}
        LIMIT 18
        """,
        tuple([patron, patron, patron, patron] + ([] if not is_offer_search else []))
    )
    categorias = db_query('SELECT nombre FROM categorias WHERE nombre LIKE %s LIMIT 8', (patron,))
    vendedores = db_query('SELECT tienda FROM vendedores WHERE tienda LIKE %s LIMIT 8', (patron,))
    return {
        'productos': [build_product_result(prod) for prod in productos],
        'categorias': [c['nombre'] for c in categorias],
        'vendedores': [v['tienda'] for v in vendedores]
    }


@api.route('/products', methods=['GET'])
def products():
    productos = db_query(
        """
        SELECT p.id, p.nombre, p.descripcion, p.precio, p.descuento, p.stock, p.envio, p.estado, p.destacado, p.vendido,
               c.nombre AS categoria, v.tienda, v.rating, ip.url AS imagen
        FROM productos p
        JOIN categorias c ON c.id = p.categoria_id
        JOIN vendedores v ON v.id = p.vendedor_id
        LEFT JOIN imagenes_productos ip ON ip.producto_id = p.id AND ip.principal = TRUE
        ORDER BY p.destacado DESC, p.vendido DESC, p.id DESC
        LIMIT 40
        """
    )
    return {'productos': [build_product_result(prod) for prod in productos]}


@api.route('/offers', methods=['GET'])
def offers():
    productos = db_query(
        """
        SELECT p.id, p.nombre, p.descripcion, p.precio, p.descuento, p.stock, p.envio, p.estado, p.destacado, p.vendido,
               c.nombre AS categoria, v.tienda, v.rating, ip.url AS imagen, o.titulo AS oferta, o.vencimiento
        FROM ofertas o
        JOIN productos p ON p.id = o.producto_id
        JOIN categorias c ON c.id = p.categoria_id
        JOIN vendedores v ON v.id = p.vendedor_id
        LEFT JOIN imagenes_productos ip ON ip.producto_id = p.id AND ip.principal = TRUE
        WHERE o.vencimiento IS NULL OR o.vencimiento >= CURRENT_DATE()
        ORDER BY o.descuento DESC, o.id DESC
        LIMIT 20
        """
    )
    return {'ofertas': [build_product_result(prod) for prod in productos]}


@api.route('/cart', methods=['GET', 'POST'])
def cart():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    user = get_user_by_token(token)
    if not user:
        return {'error': 'No autorizado'}, 401
    if request.method == 'GET':
        return _get_cart(user['id'])
    payload = request.json or {}
    producto_id = payload.get('productoId')
    cantidad = int(payload.get('cantidad', 1))
    if not producto_id or cantidad < 1:
        return {'error': 'Producto y cantidad válidos son obligatorios'}, 400
    product = db_query('SELECT id, stock FROM productos WHERE id = %s', (producto_id,), one=True)
    if not product:
        return {'error': 'Producto no existe'}, 404
    if product['stock'] <= 0:
        return {'error': 'Producto agotado'}, 400
    cart_id = get_or_create_cart(user['id'])
    item = db_query('SELECT id, cantidad FROM carrito_items WHERE carrito_id = %s AND producto_id = %s', (cart_id, producto_id), one=True)
    if item:
        cantidad_total = item['cantidad'] + cantidad
        db_execute('UPDATE carrito_items SET cantidad = %s WHERE id = %s', (cantidad_total, item['id']))
    else:
        db_execute('INSERT INTO carrito_items (carrito_id, producto_id, cantidad) VALUES (%s, %s, %s)', (cart_id, producto_id, cantidad))
    return _get_cart(user['id'])


def _get_cart(user_id):
    cart_id = get_or_create_cart(user_id)
    items = db_query(
        """
        SELECT ci.id AS item_id, ci.cantidad, p.id AS producto_id, p.nombre, p.precio, p.descuento, p.stock,
               p.envio, v.tienda AS vendedor, ip.url AS imagen
        FROM carrito_items ci
        JOIN productos p ON p.id = ci.producto_id
        JOIN vendedores v ON v.id = p.vendedor_id
        LEFT JOIN imagenes_productos ip ON ip.producto_id = p.id AND ip.principal = TRUE
        WHERE ci.carrito_id = %s
        """,
        (cart_id,)
    )
    subtotal = 0.0
    for item in items:
        price = float(item['precio'])
        discount = item['descuento'] / 100.0
        item['precioFinal'] = round(price * (1 - discount) * item['cantidad'], 2)
        subtotal += item['precioFinal']
    return {'carrito': {'items': items, 'subtotal': round(subtotal, 2), 'total': round(subtotal + 49.0, 2)}}


@api.route('/cart/item/<int:item_id>', methods=['PUT', 'DELETE'])
def cart_item(item_id):
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    user = get_user_by_token(token)
    if not user:
        return {'error': 'No autorizado'}, 401
    cart_id = get_or_create_cart(user['id'])
    item = db_query('SELECT id, cantidad FROM carrito_items WHERE id = %s AND carrito_id = %s', (item_id, cart_id), one=True)
    if not item:
        return {'error': 'Elemento no encontrado'}, 404
    if request.method == 'DELETE':
        db_execute('DELETE FROM carrito_items WHERE id = %s', (item_id,))
        return _get_cart(user['id'])
    payload = request.json or {}
    cantidad = int(payload.get('cantidad', item['cantidad']))
    if cantidad < 1:
        db_execute('DELETE FROM carrito_items WHERE id = %s', (item_id,))
    else:
        db_execute('UPDATE carrito_items SET cantidad = %s WHERE id = %s', (cantidad, item_id))
    return _get_cart(user['id'])


@api.route('/checkout', methods=['POST'])
def checkout():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    user = get_user_by_token(token)
    if not user:
        return {'error': 'No autorizado'}, 401
    payload = request.json or {}
    direccion_id = payload.get('direccionId')
    cart_id = get_or_create_cart(user['id'])
    items = db_query(
        """
        SELECT ci.cantidad, p.id AS producto_id, p.nombre, p.precio, p.descuento, p.stock
        FROM carrito_items ci
        JOIN productos p ON p.id = ci.producto_id
        WHERE ci.carrito_id = %s
        """,
        (cart_id,)
    )
    if not items:
        return {'error': 'El carrito está vacío'}, 400
    if not direccion_id:
        address = db_query('SELECT id FROM direcciones WHERE usuario_id = %s ORDER BY principal DESC LIMIT 1', (user['id'],), one=True)
        if not address:
            return {'error': 'Debe guardar una dirección antes de comprar'}, 400
        direccion_id = address['id']
    subtotal = 0.0
    for item in items:
        if item['stock'] < item['cantidad']:
            return {'error': f"No hay stock suficiente de {item['nombre']}"}, 400
        subtotal += float(item['precio']) * (1 - item['descuento'] / 100.0) * item['cantidad']
    metodo_envio = payload.get('metodoEnvio', 'standard')
    shipping_cost = 49.0 if metodo_envio == 'standard' else 99.0
    total = round(subtotal + shipping_cost, 2)
    guia = f"ML-{uuid.uuid4().hex[:8].upper()}"
    fecha_entrega = date.today() + timedelta(days=3)
    pedido_id = db_execute(
        'INSERT INTO pedidos (usuario_id, direccion_id, total, estado, guia, fecha_entrega, metodo_envio) VALUES (%s, %s, %s, %s, %s, %s, %s)',
        (user['id'], direccion_id, total, 'Pedido confirmado', guia, fecha_entrega, metodo_envio)
    )
    for item in items:
        db_execute('INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES (%s, %s, %s, %s)',
                   (pedido_id, item['producto_id'], item['cantidad'], float(item['precio']) * (1 - item['descuento'] / 100.0)))
        db_execute('UPDATE productos SET stock = stock - %s, vendido = vendido + %s WHERE id = %s',
                   (item['cantidad'], item['cantidad'], item['producto_id']))
    db_execute('DELETE FROM carrito_items WHERE carrito_id = %s', (cart_id,))
    for step, status in TRACKING_STEPS:
        db_execute('INSERT INTO rastreo_pedidos (pedido_id, paso, estado) VALUES (%s, %s, %s)', (pedido_id, step, status))
    return {'mensaje': 'Compra completada', 'pedidoId': pedido_id, 'guia': guia}


@api.route('/orders', methods=['GET'])
def orders():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    user = get_user_by_token(token)
    if not user:
        return {'error': 'No autorizado'}, 401
    pedidos = db_query(
        """
        SELECT pe.id, pe.guia, pe.estado, pe.total, pe.fecha_entrega, pe.creado_en, pe.metodo_envio,
               d.pais, d.estado, d.ciudad, d.detalle
        FROM pedidos pe
        JOIN direcciones d ON d.id = pe.direccion_id
        WHERE pe.usuario_id = %s
        ORDER BY pe.creado_en DESC
        """,
        (user['id'],)
    )
    for pedido in pedidos:
        items = db_query(
            """
            SELECT pi.cantidad, pi.precio_unitario, p.nombre, ip.url AS imagen, v.tienda AS vendedor
            FROM pedido_items pi
            JOIN productos p ON p.id = pi.producto_id
            JOIN vendedores v ON v.id = p.vendedor_id
            LEFT JOIN imagenes_productos ip ON ip.producto_id = p.id AND ip.principal = TRUE
            WHERE pi.pedido_id = %s
            """,
            (pedido['id'],)
        )
        pedido['items'] = items
    return {'pedidos': pedidos}


@api.route('/tracking/<int:pedido_id>', methods=['GET'])
def tracking(pedido_id):
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    user = get_user_by_token(token)
    if not user:
        return {'error': 'No autorizado'}, 401
    pedido = db_query('SELECT id FROM pedidos WHERE id = %s AND usuario_id = %s', (pedido_id, user['id']), one=True)
    if not pedido:
        return {'error': 'Pedido no encontrado'}, 404
    pasos = db_query('SELECT paso, estado, actualizado_en FROM rastreo_pedidos WHERE pedido_id = %s ORDER BY id', (pedido_id,))
    return {'rastreo': pasos}


@api.route('/seller/register', methods=['POST'])
def seller_register():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    user = get_user_by_token(token)
    if not user:
        return {'error': 'No autorizado'}, 401
    payload = request.json or {}
    tienda = payload.get('tienda', '').strip()
    if not tienda:
        return {'error': 'El nombre de tienda es obligatorio'}, 400
    existing = db_query('SELECT id FROM vendedores WHERE usuario_id = %s', (user['id'],), one=True)
    if existing:
        return {'error': 'Ya eres vendedor'}, 400
    db_execute('INSERT INTO vendedores (usuario_id, tienda) VALUES (%s, %s)', (user['id'], tienda))
    db_execute('UPDATE usuarios SET es_vendedor = TRUE WHERE id = %s', (user['id'],))
    return {'mensaje': 'Cuenta de vendedor creada', 'tienda': tienda}


@api.route('/seller/product', methods=['POST'])
def seller_product():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    user = get_user_by_token(token)
    if not user:
        return {'error': 'No autorizado'}, 401
    vendedor = db_query('SELECT id, tienda FROM vendedores WHERE usuario_id = %s', (user['id'],), one=True)
    if not vendedor:
        return {'error': 'Debes ser vendedor para publicar productos'}, 403
    payload = request.json or {}
    categoria_id = payload.get('categoriaId')
    nombre = payload.get('nombre', '').strip()
    descripcion = payload.get('descripcion', '').strip()
    precio = payload.get('precio')
    descuento = payload.get('descuento', 0)
    stock = payload.get('stock', 0)
    envio = payload.get('envio', '').strip()
    estado = payload.get('estado', 'Nuevo').strip()
    imagen = payload.get('imagen', '').strip()
    if not all([categoria_id, nombre, descripcion, precio, envio]):
        return {'error': 'Todos los campos obligatorios deben ser llenados'}, 400
    producto_id = db_execute(
        'INSERT INTO productos (vendedor_id, categoria_id, nombre, descripcion, precio, descuento, stock, envio, estado, destacado) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, FALSE)',
        (vendedor['id'], categoria_id, nombre, descripcion, float(precio), int(descuento), int(stock), envio, estado)
    )
    if imagen:
        db_execute('INSERT INTO imagenes_productos (producto_id, url, principal) VALUES (%s, %s, TRUE)', (producto_id, imagen))
    return {'mensaje': 'Producto publicado', 'productoId': producto_id}
