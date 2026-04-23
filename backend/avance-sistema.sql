USE power_code;

CREATE TABLE IF NOT EXISTS gimnasios (
  id_gym INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  direccion VARCHAR(180) NOT NULL,
  telefono VARCHAR(30),
  latitud DECIMAL(10, 7),
  longitud DECIMAL(10, 7),
  descripcion TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reportes (
  id_reporte INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  asunto VARCHAR(120) NOT NULL,
  mensaje TEXT NOT NULL,
  respuesta_admin TEXT,
  estado VARCHAR(30) DEFAULT 'abierto',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS dietas (
  id_dieta INT AUTO_INCREMENT PRIMARY KEY,
  id_entrenador INT NOT NULL,
  id_cliente INT NOT NULL,
  objetivo VARCHAR(120) NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_entrenador) REFERENCES entrenadores(id_entrenador),
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);

CREATE TABLE IF NOT EXISTS agenda_entrenador (
  id_evento INT AUTO_INCREMENT PRIMARY KEY,
  id_entrenador INT NOT NULL,
  id_cliente INT,
  titulo VARCHAR(140) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME,
  estado VARCHAR(30) DEFAULT 'programado',
  FOREIGN KEY (id_entrenador) REFERENCES entrenadores(id_entrenador),
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);

ALTER TABLE rutinas
ADD COLUMN video_url VARCHAR(255) NULL;
