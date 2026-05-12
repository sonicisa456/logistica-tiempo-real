CREATE DATABASE IF NOT EXISTS logistica CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE logistica;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  es_vendedor BOOLEAN NOT NULL DEFAULT FALSE,
  session_token VARCHAR(255),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS modos_usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  modo VARCHAR(20) NOT NULL,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS direcciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  pais VARCHAR(80) NOT NULL,
  estado VARCHAR(80) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  detalle VARCHAR(255) NOT NULL,
  principal BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vendedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tienda VARCHAR(140) NOT NULL,
  rating DECIMAL(3,2) DEFAULT 4.80,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendedor_id INT NOT NULL,
  categoria_id INT NOT NULL,
  nombre VARCHAR(180) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  descuento INT DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  envio VARCHAR(120) NOT NULL,
  estado VARCHAR(80) NOT NULL DEFAULT 'Nuevo',
  destacado BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  vendido INT NOT NULL DEFAULT 0,
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS imagenes_productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  principal BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ofertas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  titulo VARCHAR(140) NOT NULL,
  descuento INT NOT NULL,
  tipo VARCHAR(80) NOT NULL,
  vencimiento DATE DEFAULT NULL,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS carrito (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS carrito_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  carrito_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  agregado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (carrito_id) REFERENCES carrito(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  direccion_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  estado VARCHAR(80) NOT NULL DEFAULT 'Pedido confirmado',
  guia VARCHAR(120) NOT NULL,
  fecha_entrega DATE NOT NULL,
  metodo_envio VARCHAR(120) NOT NULL DEFAULT 'Envío estándar',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (direccion_id) REFERENCES direcciones(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pedido_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rastreo_pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  paso VARCHAR(120) NOT NULL,
  estado VARCHAR(120) NOT NULL,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS favoritos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  producto_id INT NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS historial_busquedas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  termino VARCHAR(220) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO categorias (nombre, slug) VALUES
  ('Electrónica', 'electronica'),
  ('Videojuegos', 'videojuegos'),
  ('Moda', 'moda'),
  ('Hogar', 'hogar'),
  ('Accesorios', 'accesorios');

INSERT IGNORE INTO usuarios (nombre, email, password, es_vendedor) VALUES
  ('Mia Mercado', 'mia@marketplace.com', '$2b$12$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', TRUE),
  ('Pablo Comprador', 'pablo@marketplace.com', '$2b$12$BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', FALSE);

INSERT IGNORE INTO vendedores (usuario_id, tienda, rating) VALUES
  (1, 'ExpressTech Store', 4.95);

INSERT IGNORE INTO direcciones (usuario_id, pais, estado, ciudad, detalle, principal) VALUES
  (2, 'México', 'Nuevo León', 'Monterrey', 'Av. Insurgentes 1450, Col. Centro', TRUE);

INSERT IGNORE INTO productos (vendedor_id, categoria_id, nombre, descripcion, precio, descuento, stock, envio, estado, destacado, vendido) VALUES
  (1, 1, 'Smartphone Nova X', 'Pantalla AMOLED 6.7", 256GB, 5G, cámara triple', 8999.00, 20, 12, 'Envío express 24h', 'Nuevo', TRUE, 118),
  (1, 2, 'Consola Pulse One', 'Incluye control inalámbrico y 2 juegos descargables', 11999.00, 15, 7, 'Entrega en 48h', 'Nuevo', TRUE, 94),
  (1, 3, 'Tenis Urban Runner', 'Diseño deportivo con amortiguación adaptativa', 1599.00, 25, 3, 'Envío estándar', 'Nuevo', FALSE, 60),
  (1, 4, 'Equipo de cocina Titan', 'Set 10 piezas antiadherente con base de acero', 2599.00, 18, 5, 'Entrega en 2 días', 'Nuevo', FALSE, 21);

INSERT IGNORE INTO imagenes_productos (producto_id, url, principal) VALUES
  (1, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', TRUE),
  (2, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', TRUE),
  (3, 'https://images.unsplash.com/photo-1528701800489-20a0b180d0f2?auto=format&fit=crop&w=800&q=80', TRUE),
  (4, 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80', TRUE);

INSERT IGNORE INTO ofertas (producto_id, titulo, descuento, tipo, vencimiento) VALUES
  (1, 'Oferta relámpago', 20, 'Flash', DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY)),
  (2, 'Descuento exclusivo', 15, 'Día tech', DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY));
