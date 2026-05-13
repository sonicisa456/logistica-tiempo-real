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
  (1, 4, 'Equipo de cocina Titan', 'Set 10 piezas antiadherente con base de acero', 2599.00, 18, 5, 'Entrega en 2 días', 'Nuevo', FALSE, 21),
  (1, 1, 'Smartwatch Vibe S', 'Controla tu salud y notificaciones con diseño deportivo', 2999.00, 10, 20, 'Envío 24h', 'Nuevo', FALSE, 45),
  (1, 2, 'Auriculares SonicBeat', 'Sonido inmersivo con cancelación de ruido', 2499.00, 22, 15, 'Entrega rápida', 'Nuevo', FALSE, 80),
  (1, 4, 'Cafetera DolcePro', 'Café espresso en casa con termo reutilizable', 3999.00, 15, 8, 'Envío en 2 días', 'Nuevo', FALSE, 35),
  (1, 5, 'Mochila TravelPro', 'Ligera, resistente al agua y con compartimento para laptop', 1299.00, 0, 30, 'Envío estándar', 'Nuevo', FALSE, 54),
  (1, 3, 'Sudadera Urban Lite', 'Tela suave y corte moderno para uso diario', 1299.00, 12, 18, 'Entrega estándar', 'Nuevo', FALSE, 40),
  (1, 5, 'Audífonos BassMax', 'Bajos profundos y batería hasta 30 horas', 1799.00, 18, 14, 'Envío 24h', 'Nuevo', FALSE, 25),
  (1, 1, 'Tablet Glide 10', 'Pantalla 10", 64GB, ideal para tareas y entretenimiento', 6499.00, 12, 10, 'Envío express', 'Nuevo', FALSE, 32),
  (1, 4, 'Set de Jardín Eco', 'Herramientas ergonómicas para jardinería en casa', 799.00, 0, 25, 'Envío estándar', 'Nuevo', FALSE, 18),
  (1, 2, 'Lámpara Aura Pro', 'Luz ambiental con control táctil y carga inalámbrica', 899.00, 10, 22, 'Envío estándar', 'Nuevo', FALSE, 12),
  (1, 3, 'Bolsa de gimnasio Flex', 'Compartimentos múltiples y forro repelente al agua', 1099.00, 5, 17, 'Entrega rápida', 'Nuevo', FALSE, 10),
  (1, 5, 'Mouse Gamer Storm', 'Alta precisión y botones programables', 1699.00, 20, 12, 'Envío express', 'Nuevo', FALSE, 28),
  (1, 1, 'Cámara Action X', '4K, resistente al agua y estabilización electrónica', 5499.00, 18, 9, 'Entrega en 48h', 'Nuevo', FALSE, 19),
  (1, 1, 'Altavoz portátil WaveBeat', 'Audio profundo y conexión Bluetooth 5.2', 1299.00, 15, 22, 'Entrega rápida', 'Nuevo', FALSE, 51),
  (1, 2, 'Volante Pro Racing', 'Volante con retroalimentación de fuerza para simuladores', 2499.00, 10, 5, 'Entrega en 48h', 'Nuevo', FALSE, 28),
  (1, 3, 'Chaqueta Fleece Run', 'Calidez ligera y estilo deportivo para el día a día', 1799.00, 12, 10, 'Entrega estándar', 'Nuevo', FALSE, 34),
  (1, 4, 'Licuadora TurboMix', 'Potente motor de 1200W con vaso de vidrio', 2199.00, 20, 12, 'Envío 24h', 'Nuevo', FALSE, 17),
  (1, 5, 'Batería externa PowerPlus', 'Carga rápida de 20000 mAh en tamaño compacto', 899.00, 15, 28, 'Envío express', 'Nuevo', FALSE, 62),
  (1, 1, 'Monitor UltraView 27"', 'Resolución QHD con panel IPS y 144Hz', 8499.00, 18, 6, 'Entrega en 48h', 'Nuevo', TRUE, 19),
  (1, 4, 'Funda de colchón SmartSleep', 'Protección anti-ácaros con textura suave', 1299.00, 0, 30, 'Envío estándar', 'Nuevo', FALSE, 12),
  (1, 3, 'Gafas de sol SolarFlex', 'Lentes polarizadas y marco ultraligero', 799.00, 20, 24, 'Entrega estándar', 'Nuevo', FALSE, 45),
  (1, 5, 'Bolsa bandolera CityMove', 'Diseño urbano con múltiples bolsillos', 999.00, 10, 16, 'Entrega rápida', 'Nuevo', FALSE, 20),
  (1, 2, 'Silla gamer TurboSeat', 'Soporte lumbar y iluminación RGB integrada', 4999.00, 22, 8, 'Envío express', 'Nuevo', TRUE, 8),
  (1, 4, 'Olla a presión ChefFast', 'Cocina rápida y segura para recetas diarias', 3299.00, 15, 14, 'Entrega en 2 días', 'Nuevo', FALSE, 14),
  (1, 1, 'Cargador inalámbrico QuickCharge', 'Carga rápida sin cables para dispositivos compatibles con Qi', 799.00, 10, 40, 'Envío express', 'Nuevo', FALSE, 6);

INSERT IGNORE INTO imagenes_productos (producto_id, url, principal) VALUES
  (1, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', TRUE),
  (2, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', TRUE),
  (3, 'https://images.unsplash.com/photo-1528701800489-20a0b180d0f2?auto=format&fit=crop&w=800&q=80', TRUE),
  (4, 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80', TRUE),
  (5, 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=800&q=80', TRUE),
  (6, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', TRUE),
  (7, 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=800&q=80', TRUE),
  (8, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', TRUE),
  (9, 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80', TRUE),
  (10, 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80', TRUE),
  (11, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', TRUE),
  (12, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80', TRUE),
  (13, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80', TRUE),
  (14, 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80', TRUE),
  (15, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', TRUE),
  (16, 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80', TRUE),
  (17, 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=800&q=80', TRUE),
  (18, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', TRUE),
  (19, 'https://images.unsplash.com/photo-1505253212999-1cd1dcf0fe0c?auto=format&fit=crop&w=800&q=80', TRUE),
  (20, 'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=800&q=80', TRUE),
  (21, 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80', TRUE),
  (22, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80', TRUE),
  (23, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', TRUE),
  (24, 'https://images.unsplash.com/photo-1495433324511-bf8e92934d90?auto=format&fit=crop&w=800&q=80', TRUE),
  (25, 'https://images.unsplash.com/photo-1495121605193-b116b5b9c449?auto=format&fit=crop&w=800&q=80', TRUE),
  (26, 'https://images.unsplash.com/photo-1515859005217-58b2924bce98?auto=format&fit=crop&w=800&q=80', TRUE),
  (27, 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80', TRUE),
  (28, 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80', TRUE),
  (29, 'https://images.unsplash.com/photo-1517430816045-df4b7de163fa?auto=format&fit=crop&w=800&q=80', TRUE);

INSERT IGNORE INTO ofertas (producto_id, titulo, descuento, tipo, vencimiento) VALUES
  (1, 'Oferta relámpago', 20, 'Flash', DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY)),
  (2, 'Descuento exclusivo', 15, 'Día tech', DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY)),
  (5, 'Smartwatch en oferta', 10, 'Wearable', DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY)),
  (6, 'Audio con descuento', 18, 'Audio', DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY)),
  (12, 'Jardín Eco en promoción', 10, 'Hogar', DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)),
  (18, 'Altavoz portátil en promoción', 15, 'Audio', DATE_ADD(CURRENT_DATE, INTERVAL 6 DAY)),
  (23, 'Monitor UltraView con descuento', 18, 'Electrónica', DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY)),
  (27, 'Silla gamer en oferta', 22, 'Gaming', DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY)),
  (29, 'Carga rápida en oferta', 10, 'Accesorios', DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY));
