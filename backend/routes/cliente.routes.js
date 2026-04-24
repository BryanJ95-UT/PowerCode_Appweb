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

router.post("/asistencias", async (req, res) => {
  const { id_usuario } = req.body;

  if (!id_usuario) {
    return res.status(400).json({ message: "El usuario es obligatorio" });
  }

  try {
    const [clientes] = await db.query(
      "SELECT id_cliente FROM clientes WHERE id_usuario = ? LIMIT 1",
      [id_usuario]
    );

    if (clientes.length === 0) {
      return res.status(404).json({ message: "No existe perfil de cliente para este usuario" });
    }

    const idCliente = clientes[0].id_cliente;

    await db.query(
      "INSERT INTO asistencias (id_cliente, fecha) VALUES (?, CURDATE())",
      [idCliente]
    );

    res.status(201).json({ message: "Asistencia registrada correctamente" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Ya registraste tu asistencia de hoy" });
    }

    console.error(error);
    res.status(500).json({ message: "Error al registrar asistencia" });
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
