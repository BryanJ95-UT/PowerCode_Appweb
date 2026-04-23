const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = 3000;
const frontendPath = path.join(__dirname, "../frontend");

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

app.post("/api/register", async (req, res) => {
  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO usuarios (nombre, correo, password, id_rol) VALUES (?, ?, ?, ?)",
      [nombre, correo, hash, 2],
      (err) => {
        if (err) {
          console.log("ERROR BD:", err);

          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "El correo ya esta registrado" });
          }

          return res.status(500).json({ message: "Error en BD" });
        }

        res.json({ message: "Usuario registrado correctamente" });
      }
    );
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
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
