const { pool } = require("../config/database");
const logger = require("../config/logger");

const getColumn = async (table, column) => {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0] || null;
};

const ensureColumn = async (table, column, definition) => {
  const existingColumn = await getColumn(table, column);
  if (!existingColumn) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
};

const modifyColumnIfExists = async (table, column, definition) => {
  const existingColumn = await getColumn(table, column);
  if (existingColumn) {
    await pool.query(`ALTER TABLE ${table} MODIFY COLUMN ${column} ${definition}`);
  }
};

const ensureSchemaCompatibility = async () => {
  await ensureColumn("usuarios", "correo", "VARCHAR(180) NULL");
  await ensureColumn("usuarios", "contrasena", "VARCHAR(255) NULL");
  await ensureColumn("usuarios", "rol", "VARCHAR(60) NOT NULL DEFAULT 'operador'");
  if (await getColumn("usuarios", "email")) {
    await pool.query("UPDATE usuarios SET correo = email WHERE correo IS NULL AND email IS NOT NULL");
  }
  if (await getColumn("usuarios", "password")) {
    await pool.query("UPDATE usuarios SET contrasena = password WHERE contrasena IS NULL AND password IS NOT NULL");
  }
  await modifyColumnIfExists("usuarios", "email", "VARCHAR(160) NULL");
  await modifyColumnIfExists("usuarios", "password", "VARCHAR(255) NULL");

  await ensureColumn("pedidos", "cliente", "VARCHAR(140) NULL");
  await ensureColumn("pedidos", "destino", "VARCHAR(180) NULL");
  await ensureColumn("pedidos", "fecha", "DATETIME DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn("pedidos", "conductor", "VARCHAR(140) NULL");
  await modifyColumnIfExists("pedidos", "usuario_id", "INT NULL");
  await modifyColumnIfExists("pedidos", "direccion_id", "INT NULL");
  await modifyColumnIfExists("pedidos", "total", "DECIMAL(10,2) NOT NULL DEFAULT 0");
  await modifyColumnIfExists("pedidos", "guia", "VARCHAR(120) NULL");
  await modifyColumnIfExists("pedidos", "fecha_entrega", "DATE NULL");

  await ensureColumn("productos", "categoria", "VARCHAR(100) NOT NULL DEFAULT 'General'");
  await ensureColumn("productos", "imagen", "VARCHAR(255) NULL");
  await modifyColumnIfExists("productos", "vendedor_id", "INT NULL");
  await modifyColumnIfExists("productos", "categoria_id", "INT NULL");
  await modifyColumnIfExists("productos", "descripcion", "TEXT NULL");
  await modifyColumnIfExists("productos", "precio", "DECIMAL(10,2) NOT NULL DEFAULT 0");
  await modifyColumnIfExists("productos", "envio", "VARCHAR(120) NULL");
};

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(120) NOT NULL,
      correo VARCHAR(180) NOT NULL UNIQUE,
      contrasena VARCHAR(255) NOT NULL,
      rol VARCHAR(60) NOT NULL DEFAULT 'operador',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cliente VARCHAR(140) NOT NULL,
      destino VARCHAR(180) NOT NULL,
      estado VARCHAR(60) NOT NULL DEFAULT 'pendiente',
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      conductor VARCHAR(140),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vehiculos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(120) NOT NULL,
      estado VARCHAR(60) NOT NULL DEFAULT 'disponible',
      ubicacion VARCHAR(180),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incidencias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      descripcion TEXT NOT NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      prioridad VARCHAR(60) NOT NULL DEFAULT 'media',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS conductores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(140) NOT NULL,
      telefono VARCHAR(40),
      ruta VARCHAR(180),
      estado VARCHAR(60) NOT NULL DEFAULT 'disponible',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS estados_entrega (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(80) NOT NULL UNIQUE,
      descripcion VARCHAR(180),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contactos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(140) NOT NULL,
      correo VARCHAR(180) NOT NULL,
      mensaje TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS productos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(140) NOT NULL,
      precio DECIMAL(10,2) NOT NULL DEFAULT 0,
      stock INT NOT NULL DEFAULT 0,
      categoria VARCHAR(100) NOT NULL,
      imagen VARCHAR(255),
      descripcion TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pedido_productos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pedido_id INT NOT NULL,
      producto_id INT,
      nombre VARCHAR(140) NOT NULL,
      cantidad INT NOT NULL DEFAULT 1,
      precio DECIMAL(10,2) NOT NULL DEFAULT 0,
      subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_pedido_productos_pedido (pedido_id)
    )
  `);

  await ensureSchemaCompatibility();
  await pool.query(`
    INSERT IGNORE INTO estados_entrega (nombre, descripcion) VALUES
    ('pendiente', 'Pedido creado por el cliente'),
    ('en almacen', 'Pedido recibido en almacen'),
    ('en transito', 'Pedido asignado y en ruta'),
    ('entregado', 'Pedido entregado al cliente'),
    ('incidencia', 'Pedido con alerta operativa')
  `);
  await pool.query(`
    INSERT IGNORE INTO productos (id, nombre, precio, stock, categoria, imagen, descripcion) VALUES
    (1, 'Audifonos Bluetooth Pro', 899.00, 18, 'Electronica', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80', 'Audio inalambrico para trabajo, escuela y viajes.'),
    (2, 'Mochila Urbana Antirrobo', 749.00, 25, 'Accesorios', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80', 'Mochila resistente con compartimentos para laptop y envios diarios.'),
    (3, 'Smartwatch Fit X', 1299.00, 12, 'Tecnologia', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80', 'Reloj inteligente con monitoreo de actividad y notificaciones.'),
    (4, 'Set Organizador de Oficina', 389.00, 40, 'Hogar', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80', 'Kit practico para escritorio, estudio o home office.')
  `);
  await pool.query(`
    UPDATE productos
    SET categoria = CASE id
      WHEN 1 THEN 'Tecnologia'
      WHEN 2 THEN 'Gaming'
      WHEN 3 THEN 'Moda'
      WHEN 4 THEN 'Hogar'
      ELSE categoria
    END,
    imagen = CASE id
      WHEN 1 THEN 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80'
      WHEN 2 THEN 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=80'
      WHEN 3 THEN 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
      WHEN 4 THEN 'https://images.unsplash.com/photo-1584990347449-a0f2f3f3c07d?auto=format&fit=crop&w=900&q=80'
      ELSE imagen
    END
    WHERE id IN (1, 2, 3, 4)
  `);
  logger.info("Tablas verificadas correctamente");
};

module.exports = createTables;
