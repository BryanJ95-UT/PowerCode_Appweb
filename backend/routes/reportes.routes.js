const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  const { id_usuario, admin } = req.query;

  try {
    const params = [];
    let where = "";

    if (!admin && id_usuario) {
      where = "WHERE r.id_usuario = ?";
      params.push(id_usuario);
    }

    const [reportes] = await db.query(`
      SELECT r.*, u.nombre, u.correo
      FROM reportes r
      INNER JOIN usuarios u ON u.id_usuario = r.id_usuario
      ${where}
      ORDER BY r.fecha_creacion DESC
    `, params);

    res.json(reportes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener reportes" });
  }
});

router.post("/", async (req, res) => {
  const { id_usuario, asunto, mensaje } = req.body;

  if (!id_usuario || !asunto || !mensaje) {
    return res.status(400).json({ message: "Usuario, asunto y mensaje son obligatorios" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO reportes (id_usuario, asunto, mensaje) VALUES (?, ?, ?)",
      [id_usuario, asunto, mensaje]
    );
    res.status(201).json({ message: "Reporte enviado", id_reporte: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al enviar reporte" });
  }
});

router.patch("/:id_reporte", async (req, res) => {
  const { respuesta_admin, estado } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE reportes
       SET respuesta_admin = COALESCE(?, respuesta_admin),
           estado = COALESCE(?, estado)
       WHERE id_reporte = ?`,
      [respuesta_admin || null, estado || null, req.params.id_reporte]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    res.json({ message: "Reporte actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar reporte" });
  }
});

module.exports = router;
