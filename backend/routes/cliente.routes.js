const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/rutinas/:id_usuario", async (req, res) => {
  try {
    const [rutinas] = await db.query(`
      SELECT r.*, ue.nombre AS entrenador
      FROM rutinas r
      INNER JOIN clientes c ON c.id_cliente = r.id_cliente
      INNER JOIN entrenadores e ON e.id_entrenador = r.id_entrenador
      INNER JOIN usuarios ue ON ue.id_usuario = e.id_usuario
      WHERE c.id_usuario = ?
      ORDER BY r.id_rutina DESC
    `, [req.params.id_usuario]);
    res.json(rutinas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener rutinas del cliente" });
  }
});

router.get("/dietas/:id_usuario", async (req, res) => {
  try {
    const [dietas] = await db.query(`
      SELECT d.*, ue.nombre AS entrenador
      FROM dietas d
      INNER JOIN clientes c ON c.id_cliente = d.id_cliente
      INNER JOIN entrenadores e ON e.id_entrenador = d.id_entrenador
      INNER JOIN usuarios ue ON ue.id_usuario = e.id_usuario
      WHERE c.id_usuario = ?
      ORDER BY d.id_dieta DESC
    `, [req.params.id_usuario]);
    res.json(dietas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener dietas del cliente" });
  }
});

router.get("/asistencias/:id_usuario", async (req, res) => {
  try {
    const [asistencias] = await db.query(`
      SELECT a.*
      FROM asistencias a
      INNER JOIN clientes c ON c.id_cliente = a.id_cliente
      WHERE c.id_usuario = ?
      ORDER BY a.fecha DESC
    `, [req.params.id_usuario]);
    res.json(asistencias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener asistencias" });
  }
});

router.get("/pagos/:id_usuario", async (req, res) => {
  try {
    const [pagos] = await db.query(`
      SELECT p.*
      FROM pagos p
      INNER JOIN clientes c ON c.id_cliente = p.id_cliente
      WHERE c.id_usuario = ?
      ORDER BY p.fecha_pago DESC
    `, [req.params.id_usuario]);
    res.json(pagos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener pagos" });
  }
});

module.exports = router;
