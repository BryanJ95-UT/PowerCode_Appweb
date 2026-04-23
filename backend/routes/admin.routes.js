const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/usuarios", async (req, res) => {
  try {
    const [usuarios] = await db.query(`
      SELECT u.id_usuario, u.nombre, u.correo, u.id_rol, r.nombre AS rol, u.estado
      FROM usuarios u
      LEFT JOIN roles r ON r.id_rol = u.id_rol
      ORDER BY u.id_usuario DESC
    `);
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

router.get("/resumen", async (req, res) => {
  try {
    const [[usuarios]] = await db.query("SELECT COUNT(*) AS total FROM usuarios");
    const [[clientes]] = await db.query("SELECT COUNT(*) AS total FROM clientes");
    const [[entrenadores]] = await db.query("SELECT COUNT(*) AS total FROM entrenadores");
    const [[reportes]] = await db.query("SELECT COUNT(*) AS total FROM reportes WHERE estado <> 'cerrado'");

    res.json({
      usuarios: usuarios.total,
      clientes: clientes.total,
      entrenadores: entrenadores.total,
      reportes_abiertos: reportes.total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener resumen" });
  }
});

module.exports = router;
