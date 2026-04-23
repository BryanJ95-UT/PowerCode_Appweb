const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/resumen/:id_usuario", async (req, res) => {
  try {
    const [[entrenador]] = await db.query(
      "SELECT id_entrenador, especialidad FROM entrenadores WHERE id_usuario = ? LIMIT 1",
      [req.params.id_usuario]
    );

    if (!entrenador) {
      return res.status(404).json({ message: "Entrenador no encontrado" });
    }

    const [[rutinas]] = await db.query("SELECT COUNT(*) AS total FROM rutinas WHERE id_entrenador = ?", [
      entrenador.id_entrenador,
    ]);
    const [[dietas]] = await db.query("SELECT COUNT(*) AS total FROM dietas WHERE id_entrenador = ?", [
      entrenador.id_entrenador,
    ]);
    const [[agenda]] = await db.query(
      "SELECT COUNT(*) AS total FROM agenda_entrenador WHERE id_entrenador = ? AND fecha >= CURDATE()",
      [entrenador.id_entrenador]
    );

    res.json({
      id_entrenador: entrenador.id_entrenador,
      especialidad: entrenador.especialidad,
      rutinas: rutinas.total,
      dietas: dietas.total,
      eventos_agenda: agenda.total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener resumen del entrenador" });
  }
});

router.get("/rutinas/:id_usuario", async (req, res) => {
  try {
    const [rutinas] = await db.query(`
      SELECT r.*, u.nombre AS cliente
      FROM rutinas r
      INNER JOIN entrenadores e ON e.id_entrenador = r.id_entrenador
      INNER JOIN clientes c ON c.id_cliente = r.id_cliente
      INNER JOIN usuarios u ON u.id_usuario = c.id_usuario
      WHERE e.id_usuario = ?
      ORDER BY r.id_rutina DESC
    `, [req.params.id_usuario]);
    res.json(rutinas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener rutinas" });
  }
});

router.post("/rutinas", async (req, res) => {
  const { id_entrenador, id_cliente, descripcion, video_url } = req.body;

  if (!id_entrenador || !id_cliente || !descripcion) {
    return res.status(400).json({ message: "Entrenador, cliente y descripcion son obligatorios" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO rutinas (id_entrenador, id_cliente, descripcion, video_url) VALUES (?, ?, ?, ?)",
      [id_entrenador, id_cliente, descripcion, video_url || null]
    );
    res.status(201).json({ message: "Rutina creada", id_rutina: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear rutina" });
  }
});

router.get("/dietas/:id_usuario", async (req, res) => {
  try {
    const [dietas] = await db.query(`
      SELECT d.*, u.nombre AS cliente
      FROM dietas d
      INNER JOIN entrenadores e ON e.id_entrenador = d.id_entrenador
      INNER JOIN clientes c ON c.id_cliente = d.id_cliente
      INNER JOIN usuarios u ON u.id_usuario = c.id_usuario
      WHERE e.id_usuario = ?
      ORDER BY d.id_dieta DESC
    `, [req.params.id_usuario]);
    res.json(dietas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener dietas" });
  }
});

router.post("/dietas", async (req, res) => {
  const { id_entrenador, id_cliente, objetivo, descripcion } = req.body;

  if (!id_entrenador || !id_cliente || !objetivo || !descripcion) {
    return res.status(400).json({ message: "Datos incompletos para crear dieta" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO dietas (id_entrenador, id_cliente, objetivo, descripcion) VALUES (?, ?, ?, ?)",
      [id_entrenador, id_cliente, objetivo, descripcion]
    );
    res.status(201).json({ message: "Dieta creada", id_dieta: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear dieta" });
  }
});

router.get("/agenda/:id_usuario", async (req, res) => {
  try {
    const [agenda] = await db.query(`
      SELECT a.*, u.nombre AS cliente
      FROM agenda_entrenador a
      INNER JOIN entrenadores e ON e.id_entrenador = a.id_entrenador
      LEFT JOIN clientes c ON c.id_cliente = a.id_cliente
      LEFT JOIN usuarios u ON u.id_usuario = c.id_usuario
      WHERE e.id_usuario = ?
      ORDER BY a.fecha ASC, a.hora ASC
    `, [req.params.id_usuario]);
    res.json(agenda);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener agenda" });
  }
});

router.post("/agenda", async (req, res) => {
  const { id_entrenador, id_cliente, titulo, fecha, hora } = req.body;

  if (!id_entrenador || !titulo || !fecha) {
    return res.status(400).json({ message: "Entrenador, titulo y fecha son obligatorios" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO agenda_entrenador (id_entrenador, id_cliente, titulo, fecha, hora) VALUES (?, ?, ?, ?, ?)",
      [id_entrenador, id_cliente || null, titulo, fecha, hora || null]
    );
    res.status(201).json({ message: "Evento agregado", id_evento: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al agregar evento" });
  }
});

module.exports = router;
