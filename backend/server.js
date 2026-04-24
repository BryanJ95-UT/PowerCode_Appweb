const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = 3000;
const frontendPath = path.join(__dirname, "../frontend");
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath));

const clientesRoutes = require("./routes/clientes.routes");
const adminRoutes = require("./routes/admin.routes");
const gymsRoutes = require("./routes/gyms.routes");
const institucionesRoutes = require("./routes/instituciones.routes");
const reportesRoutes = require("./routes/reportes.routes");
const entrenadorRoutes = require("./routes/entrenador.routes");
const clienteRoutes = require("./routes/cliente.routes");
const integracionesRoutes = require("./routes/integraciones.routes");

app.use("/api/clientes", clientesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/gyms", gymsRoutes);
app.use("/api/instituciones", institucionesRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/entrenador", entrenadorRoutes);
app.use("/api/cliente", clienteRoutes);
app.use("/api/integraciones", integracionesRoutes);

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "240078",
  database: "power_code",
});

db.connect((err) => {
  if (err) {
    console.log("Error conexion BD:", err);
  } else {
    console.log("Conectado a MySQL");
    ensureFeatureTables();
  }
});

function ensureFeatureTables() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS gimnasios (
      id_gym INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(120) NOT NULL,
      direccion VARCHAR(180) NOT NULL,
      telefono VARCHAR(30),
      latitud DECIMAL(10, 7),
      longitud DECIMAL(10, 7),
      descripcion TEXT,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS reportes (
      id_reporte INT AUTO_INCREMENT PRIMARY KEY,
      id_usuario INT NOT NULL,
      asunto VARCHAR(120) NOT NULL,
      mensaje TEXT NOT NULL,
      respuesta_admin TEXT,
      estado VARCHAR(30) DEFAULT 'abierto',
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    )`,
    `CREATE TABLE IF NOT EXISTS dietas (
      id_dieta INT AUTO_INCREMENT PRIMARY KEY,
      id_entrenador INT NOT NULL,
      id_cliente INT NOT NULL,
      objetivo VARCHAR(120) NOT NULL,
      descripcion TEXT NOT NULL,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_entrenador) REFERENCES entrenadores(id_entrenador),
      FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
    )`,
    `CREATE TABLE IF NOT EXISTS agenda_entrenador (
      id_evento INT AUTO_INCREMENT PRIMARY KEY,
      id_entrenador INT NOT NULL,
      id_cliente INT,
      titulo VARCHAR(140) NOT NULL,
      fecha DATE NOT NULL,
      hora TIME,
      estado VARCHAR(30) DEFAULT 'programado',
      FOREIGN KEY (id_entrenador) REFERENCES entrenadores(id_entrenador),
      FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
    )`,
    `ALTER TABLE rutinas ADD COLUMN video_url VARCHAR(255) NULL`,
    `ALTER TABLE asistencias ADD UNIQUE KEY unique_asistencia_dia (id_cliente, fecha)`,
  ];

  statements.forEach((statement) => {
    db.query(statement, (err) => {
      if (err && err.code !== "ER_DUP_FIELDNAME" && err.code !== "ER_DUP_KEYNAME") {
        console.log("Aviso al preparar tablas:", err.message);
      }
    });
  });
}

const mailTransporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE || "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendConfirmationEmail({ nombre, correo, token }) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.log("Correo no enviado: faltan MAIL_USER o MAIL_PASS en .env");
    return;
  }

  const confirmationUrl = `${APP_URL}/api/confirmar-cuenta?token=${token}`;

  await mailTransporter.sendMail({
    from: `"Power Code" <${process.env.MAIL_USER}>`,
    to: correo,
    subject: "Confirma tu cuenta de Power Code",
    html: `
      <h2>Hola, ${nombre}</h2>
      <p>Gracias por registrarte en Power Code.</p>
      <p>Confirma tu cuenta para poder iniciar sesion:</p>
      <p>
        <a href="${confirmationUrl}" style="background:#ff5f0f;color:#fff;padding:12px 18px;text-decoration:none;border-radius:8px;">
          Confirmar cuenta
        </a>
      </p>
      <p>Si el boton no funciona, copia este enlace:</p>
      <p>${confirmationUrl}</p>
    `,
  });
}

app.post("/api/register", async (req, res) => {
  const { nombre, correo, password, id_rol, admin_code, especialidad } = req.body;

  if (!nombre || !correo || !password) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  const selectedRole = Number(id_rol || 2);

  if (![1, 2, 3].includes(selectedRole)) {
    return res.status(400).json({ message: "Rol no valido" });
  }

  if (selectedRole === 1 && admin_code !== (process.env.ADMIN_REGISTER_CODE || "POWERADMIN2026")) {
    return res.status(403).json({ message: "Codigo de administrador incorrecto" });
  }

  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    return res.status(500).json({
      message: "Configura MAIL_USER y MAIL_PASS en backend/.env antes de registrar usuarios",
    });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");

    db.query(
      "INSERT INTO usuarios (nombre, correo, password, id_rol, estado, token_confirmacion) VALUES (?, ?, ?, ?, ?, ?)",
      [nombre, correo, hash, selectedRole, false, token],
      async (err, result) => {
        if (err) {
          console.log("ERROR BD:", err);

          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "El correo ya esta registrado" });
          }

          return res.status(500).json({ message: "Error en BD" });
        }

        try {
          const idUsuario = result.insertId;

          if (selectedRole === 2) {
            db.query(
              "INSERT INTO clientes (id_usuario, estado_membresia) VALUES (?, ?)",
              [idUsuario, "Pendiente"]
            );
          }

          if (selectedRole === 3) {
            db.query(
              "INSERT INTO entrenadores (id_usuario, especialidad) VALUES (?, ?)",
              [idUsuario, especialidad || "General"]
            );
          }

          await sendConfirmationEmail({ nombre, correo, token });
        } catch (emailError) {
          console.log("ERROR CORREO:", emailError);
          return res.status(500).json({
            message: "Usuario creado, pero no se pudo enviar el correo de confirmacion",
          });
        }

        res.json({
          message: "Usuario registrado. Revisa tu correo para confirmar la cuenta.",
        });
      }
    );
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

app.get("/api/confirmar-cuenta", (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Token no proporcionado");
  }

  db.query(
    "UPDATE usuarios SET estado = true, token_confirmacion = NULL WHERE token_confirmacion = ?",
    [token],
    (err, result) => {
      if (err) {
        console.log("ERROR BD:", err);
        return res.status(500).send("Error al confirmar la cuenta");
      }

      if (result.affectedRows === 0) {
        return res.status(400).send("Token invalido o cuenta ya confirmada");
      }

      return res.redirect("/pages/login.html?confirmada=1");
    }
  );
});

app.post("/api/login", (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ message: "Correo y contrasena son obligatorios" });
  }

  db.query("SELECT * FROM usuarios WHERE correo = ?", [correo], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error en BD" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const usuario = results[0];

    if (!usuario.estado) {
      return res.status(403).json({ message: "Primero confirma tu cuenta desde tu correo" });
    }

    const valid = await bcrypt.compare(password, usuario.password);

    if (!valid) {
      return res.status(401).json({ message: "Contrasena incorrecta" });
    }

    res.json({
      message: "Login exitoso",
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        id_rol: usuario.id_rol,
      },
    });
  });
});
app.post("/api/forgot-password", async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ message: "Correo requerido" });
  }

  try {
    db.query("SELECT * FROM usuarios WHERE correo = ?", [correo], async (err, results) => {
      if (err) return res.status(500).json({ message: "Error en BD" });

      if (results.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const usuario = results[0];

      const token = crypto.randomBytes(32).toString("hex");

      db.query(
        "UPDATE usuarios SET token_confirmacion = ? WHERE id_usuario = ?",
        [token, usuario.id_usuario],
        async (err) => {
          if (err) return res.status(500).json({ message: "Error al guardar token" });

          const resetUrl = `${APP_URL}/pages/reset-password.html?token=${token}`;

          try {
            await mailTransporter.sendMail({
              from: `"Power Code" <${process.env.MAIL_USER}>`,
              to: correo,
              subject: "Recuperar contraseña",
              html: `
                <h2>Recupera tu contraseña</h2>
                <p>Haz clic en el siguiente enlace:</p>
                <a href="${resetUrl}" style="background:#ff5f0f;color:#fff;padding:10px 15px;border-radius:6px;text-decoration:none;">
                  Restablecer contraseña
                </a>
                <p>O copia este link:</p>
                <p>${resetUrl}</p>
              `,
            });

            res.json({ message: "Correo de recuperación enviado" });

          } catch (error) {
            console.log("ERROR EMAIL:", error);
            res.status(500).json({ message: "Error enviando correo" });
          }
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});
app.post("/api/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  try {
    db.query(
      "SELECT * FROM usuarios WHERE token_confirmacion = ?",
      [token],
      async (err, results) => {
        if (err) return res.status(500).json({ message: "Error en BD" });

        if (results.length === 0) {
          return res.status(400).json({ message: "Token invalido o expirado" });
        }

        const hash = await bcrypt.hash(password, 10);

        db.query(
          "UPDATE usuarios SET password = ?, token_confirmacion = NULL WHERE token_confirmacion = ?",
          [hash, token],
          (err) => {
            if (err) return res.status(500).json({ message: "Error al actualizar contraseña" });

            res.json({ message: "Contraseña actualizada correctamente" });
          }
        );
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "Endpoint no encontrado" });
  }

  return res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
