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

app.use("/api/clientes", clientesRoutes);

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
  }
});

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
  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
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
      [nombre, correo, hash, 2, false, token],
      async (err) => {
        if (err) {
          console.log("ERROR BD:", err);

          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "El correo ya esta registrado" });
          }

          return res.status(500).json({ message: "Error en BD" });
        }

        try {
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
