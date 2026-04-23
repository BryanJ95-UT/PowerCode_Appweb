const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [instituciones] = await db.query(`
      SELECT i.*, COUNT(b.id_beca) AS becas
      FROM instituciones_deportivas i
      LEFT JOIN becas b ON b.id_institucion = i.id_institucion
      GROUP BY i.id_institucion
      ORDER BY i.id_institucion DESC
    `);
    res.json(instituciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener instituciones" });
  }
});

router.post("/", async (req, res) => {
  const { nombre, contacto } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: "El nombre es obligatorio" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO instituciones_deportivas (nombre, contacto) VALUES (?, ?)",
      [nombre, contacto || null]
    );
    res.status(201).json({ message: "Institucion registrada", id_institucion: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar institucion" });
  }
});

module.exports = router;
