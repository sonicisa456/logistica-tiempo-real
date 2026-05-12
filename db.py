import os
import time

import mysql.connector


DB_NAME = os.getenv("DB_NAME", "logistica")


def _connection_kwargs(include_database=True):
    kwargs = {
        "host": os.getenv("DB_HOST", "db"),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", "1234"),
        "autocommit": False,
    }
    if include_database:
        kwargs["database"] = DB_NAME
    return kwargs


def get_connection():
    return mysql.connector.connect(**_connection_kwargs(True))


def _connect_without_database():
    return mysql.connector.connect(**_connection_kwargs(False))


def _ensure_schema_updates(cursor):
    cursor.execute(
        """
        SELECT COUNT(*) AS total
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'tema'
        """,
        (DB_NAME,),
    )
    has_theme = cursor.fetchone()["total"] > 0
    if not has_theme:
        cursor.execute("ALTER TABLE usuarios ADD COLUMN tema ENUM('dark', 'light') NOT NULL DEFAULT 'dark' AFTER reputacion")


def _ensure_wallet_schema(cursor):
    cursor.execute(
        """
        SELECT COUNT(*) AS total
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'billeteras'
        """,
        (DB_NAME,),
    )
    has_wallets = cursor.fetchone()["total"] > 0
    if not has_wallets:
        cursor.execute(
            """
            CREATE TABLE billeteras (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL UNIQUE,
                saldo DECIMAL(12,2) NOT NULL DEFAULT 0,
                moneda VARCHAR(10) NOT NULL DEFAULT 'MXN',
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_billeteras_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        )

    cursor.execute(
        """
        SELECT COUNT(*) AS total
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'movimientos_billetera'
        """,
        (DB_NAME,),
    )
    has_movements = cursor.fetchone()["total"] > 0
    if not has_movements:
        cursor.execute(
            """
            CREATE TABLE movimientos_billetera (
                id INT AUTO_INCREMENT PRIMARY KEY,
                billetera_id INT NOT NULL,
                tipo ENUM('ABONO', 'CARGO') NOT NULL,
                monto DECIMAL(12,2) NOT NULL,
                concepto VARCHAR(160) NOT NULL,
                referencia VARCHAR(80) DEFAULT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_movimientos_billetera FOREIGN KEY (billetera_id) REFERENCES billeteras(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        )


def _ensure_wallet_rows(cursor):
    cursor.execute(
        """
        INSERT INTO billeteras (usuario_id, saldo, moneda)
        SELECT u.id, 0, 'MXN'
        FROM usuarios u
        LEFT JOIN billeteras b ON b.usuario_id = u.id
        WHERE b.id IS NULL
        """
    )


SCHEMA_STATEMENTS = [
    f"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    f"USE {DB_NAME}",
    """
    CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(120) NOT NULL,
        correo VARCHAR(180) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        tipo ENUM('cliente', 'vendedor') NOT NULL DEFAULT 'cliente',
        reputacion DECIMAL(3,2) NOT NULL DEFAULT 0,
        tema ENUM('dark', 'light') NOT NULL DEFAULT 'dark',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS sesiones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(128) NOT NULL UNIQUE,
        usuario_id INT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_sesiones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS direcciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        pais VARCHAR(80) NOT NULL,
        estado VARCHAR(80) NOT NULL,
        ciudad VARCHAR(80) NOT NULL,
        colonia VARCHAR(120) NOT NULL,
        calle VARCHAR(120) NOT NULL,
        codigo_postal VARCHAR(15) NOT NULL,
        referencia VARCHAR(160) DEFAULT NULL,
        is_default TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_direcciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(160) NOT NULL,
        descripcion TEXT NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        imagen VARCHAR(255) DEFAULT NULL,
        vendedor_id INT NOT NULL,
        categoria VARCHAR(80) NOT NULL,
        entrega VARCHAR(120) DEFAULT 'Llega pronto',
        popular TINYINT(1) NOT NULL DEFAULT 0,
        nuevo TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_productos_vendedor FOREIGN KEY (vendedor_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS carrito (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL DEFAULT 1,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_carrito_usuario_producto (usuario_id, producto_id),
        CONSTRAINT fk_carrito_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        CONSTRAINT fk_carrito_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS pedidos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        direccion_id INT NOT NULL,
        total DECIMAL(10,2) NOT NULL DEFAULT 0,
        estado ENUM('EN_ALMACEN', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO') NOT NULL DEFAULT 'EN_ALMACEN',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_pedidos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        CONSTRAINT fk_pedidos_direccion FOREIGN KEY (direccion_id) REFERENCES direcciones(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS detalle_pedido (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pedido_id INT NOT NULL,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        CONSTRAINT fk_detalle_pedido_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
        CONSTRAINT fk_detalle_pedido_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS rastreo (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pedido_id INT NOT NULL,
        ubicacion VARCHAR(160) NOT NULL,
        estado ENUM('EN_ALMACEN', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO') NOT NULL,
        fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_rastreo_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS ofertas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        descuento DECIMAL(5,2) NOT NULL DEFAULT 0,
        titulo VARCHAR(120) DEFAULT 'Oferta del día',
        activa TINYINT(1) NOT NULL DEFAULT 1,
        CONSTRAINT fk_ofertas_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
]


def _seed_demo_data(cursor):
    cursor.execute("SELECT COUNT(*) AS total FROM usuarios")
    users_total = cursor.fetchone()["total"]
    if users_total == 0:
        cursor.executemany(
            "INSERT INTO usuarios (nombre, correo, password, tipo, reputacion) VALUES (%s, %s, %s, %s, %s)",
            [
                ("Gael", "gael@market.local", "123456", "cliente", 4.80),
                ("Tecno MX", "vendedor@market.local", "123456", "vendedor", 4.95),
                ("Zona Gamer", "gamer@market.local", "123456", "vendedor", 4.70),
            ],
        )

        cursor.executemany(
            """
            INSERT INTO direcciones (usuario_id, pais, estado, ciudad, colonia, calle, codigo_postal, referencia, is_default)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            [
                (1, "México", "Nuevo León", "San Nicolás", "Centro", "Av. Universidad 123", "66400", "Entre calles principales", 1),
                (1, "México", "Nuevo León", "Monterrey", "Del Valle", "Lázaro Cárdenas 456", "66220", "Departamento 2", 0),
            ],
        )

    _ensure_wallet_rows(cursor)

    demo_products = [
        ("Audífonos Gamer Pulse", "Sonido envolvente con micrófono de alta precisión", 1299.00, 18, "https://images.unsplash.com/photo-1518441902117-f0a7f9fb3da0?auto=format&fit=crop&w=1200&q=80", 3, "Audio", "Llega hoy", 1, 1),
        ("Teclado Mecánico Nova", "Switches táctiles y RGB personalizable para gaming", 1899.00, 11, None, 3, "Gaming", "Llega mañana", 1, 1),
        ("Laptop Gamer Titan", "Rendimiento fluido para trabajo, edición y juegos", 22999.00, 5, "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80", 2, "Tecnología", "Llega en 2 días", 1, 1),
        ("Figura Anime Collector", "Figura de colección con acabado premium", 899.00, 27, None, 3, "Coleccionables", "Llega hoy", 0, 1),
        ("Monitor 27 QHD", "Pantalla fluida con alta tasa de refresco", 4799.00, 9, "https://images.unsplash.com/photo-1593642702749-b7d2a804fbcf?auto=format&fit=crop&w=1200&q=80", 2, "Tecnología", "Llega mañana", 1, 1),
        ("Mouse RGB Pro", "Precisión ultrarrápida y diseño ergonómico", 599.00, 43, None, 3, "Gaming", "Llega hoy", 0, 1),
        ("Silla Gamer Prime", "Ergonómica, reclinable y con soporte lumbar", 4299.00, 14, "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80", 3, "Hogar", "Llega en 3 días", 0, 1),
        ("Smartwatch Nova", "Monitorea salud, deporte y notificaciones", 2499.00, 22, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80", 2, "Moda", "Llega mañana", 0, 1),
        ("TV 55 4K", "Pantalla UHD con HDR y modo gaming", 7499.00, 10, "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=80", 2, "Hogar", "Llega en 2 días", 1, 0),
        ("Mochila City Pack", "Ligera, resistente y perfecta para oficina o escuela", 799.00, 34, None, 2, "Accesorios", "Llega mañana", 0, 1),
        ("Taza Térmica Pro", "Mantiene bebidas calientes por más tiempo", 349.00, 16, None, 2, "Hogar", "Llega hoy", 0, 1),
        ("Controles Dual Pro", "Pack de controles para consola y PC", 1699.00, 7, None, 3, "Gaming", "Llega en 2 días", 1, 0),
    ]

    cursor.execute("SELECT nombre FROM productos")
    existing_products = {row["nombre"] for row in cursor.fetchall()}
    missing_products = [product for product in demo_products if product[0] not in existing_products]
    if missing_products:
        cursor.executemany(
            """
            INSERT INTO productos
            (nombre, descripcion, precio, stock, imagen, vendedor_id, categoria, entrega, popular, nuevo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            missing_products,
        )

    cursor.execute("SELECT COUNT(*) AS total FROM ofertas")
    if cursor.fetchone()["total"] == 0:
        cursor.executemany(
            "INSERT INTO ofertas (producto_id, descuento, titulo, activa) VALUES (%s, %s, %s, %s)",
            [
                (1, 12.0, "Oferta gamer", 1),
                (2, 8.0, "Oferta tecnología", 1),
                (3, 18.0, "Oferta audio", 1),
            ],
        )


def init_database(retries=12, delay_seconds=2):
    last_error = None
    for attempt in range(retries):
        try:
            connection = _connect_without_database()
            cursor = connection.cursor(dictionary=True)
            for statement in SCHEMA_STATEMENTS:
                cursor.execute(statement)
            _ensure_schema_updates(cursor)
            _ensure_wallet_schema(cursor)
            _seed_demo_data(cursor)
            connection.commit()
            cursor.close()
            connection.close()
            return
        except mysql.connector.Error as error:
            last_error = error
            if attempt == retries - 1:
                raise
            time.sleep(delay_seconds)

    if last_error:
        raise last_error