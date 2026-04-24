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

router.get("/asignaciones", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        ec.id,
        uc.nombre AS cliente,
        ue.nombre AS entrenador
      FROM entrenador_clientes ec

      INNER JOIN clientes c
        ON c.id_cliente = ec.id_cliente

      INNER JOIN usuarios uc
        ON uc.id_usuario = c.id_usuario

      INNER JOIN entrenadores e
        ON e.id_entrenador = ec.id_entrenador

      INNER JOIN usuarios ue
        ON ue.id_usuario = e.id_usuario

      ORDER BY ec.id DESC
    `);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al cargar asignaciones"
    });
  }
});




router.post("/asignar-cliente", async (req, res) => {
  const { id_cliente, id_entrenador } = req.body;
  
  if (!id_cliente || !id_entrenador) {
  return res.status(400).json({
    message: "Cliente y entrenador son obligatorios"
  });
}

  try {

    await db.query(`
      INSERT IGNORE INTO entrenador_clientes (id_cliente, id_entrenador)
      VALUES (?, ?)
    `, [id_cliente, id_entrenador]);

    res.json({ message: "Cliente asignado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al asignar cliente" });
  }
});



router.delete("/asignaciones/:id", async (req, res) => {
  try {
    await db.query(
      "DELETE FROM entrenador_clientes WHERE id = ?",
      [req.params.id]
    );

    res.json({ message: "Asignacion eliminada" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar" });
  }
});

router.get("/asignaciones-data", async (req, res) => {
  try {
    const [clientes] = await db.query(`
      SELECT
        c.id_cliente,
        u.nombre
      FROM clientes c
      INNER JOIN usuarios u
        ON u.id_usuario = c.id_usuario
      ORDER BY u.nombre ASC
    `);

    const [entrenadores] = await db.query(`
      SELECT
        e.id_entrenador,
        u.nombre
      FROM entrenadores e
      INNER JOIN usuarios u
        ON u.id_usuario = e.id_usuario
      ORDER BY u.nombre ASC
    `);

    res.json({
      clientes,
      entrenadores
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al cargar datos"
    });
  }
});

module.exports = router;
