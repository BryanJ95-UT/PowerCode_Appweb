const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [gyms] = await db.query("SELECT * FROM gimnasios ORDER BY id_gym DESC");
    res.json(gyms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener gimnasios" });
  }
});

router.post("/", async (req, res) => {
  const { nombre, direccion, telefono, latitud, longitud, descripcion } = req.body;

  if (!nombre || !direccion) {
    return res.status(400).json({ message: "Nombre y direccion son obligatorios" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO gimnasios (nombre, direccion, telefono, latitud, longitud, descripcion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, direccion, telefono || null, latitud || null, longitud || null, descripcion || null]
    );
    res.status(201).json({ message: "Gimnasio registrado", id_gym: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar gimnasio" });
  }
});

module.exports = router;
