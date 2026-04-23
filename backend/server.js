const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

// conexión MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "240078",
  database: "power_code"
});

db.connect(err => {
  if (err) {
    console.log("Error conexión BD:", err);
  } else {
    console.log("Conectado a MySQL");
  }
});

// REGISTRO
app.post("/api/register", async (req, res) => {
  const { nombre, correo, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)",
    [nombre, correo, hash],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Usuario registrado" });
    }
  );
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { correo, password } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE correo = ?",
    [correo],
    async (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0)
        return res.status(404).json({ message: "Usuario no existe" });

      const valid = await bcrypt.compare(password, result[0].password);

      if (!valid)
        return res.status(401).json({ message: "Contraseña incorrecta" });

      res.json({ message: "Login correcto", user: result[0] });
    }
  );
});

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});