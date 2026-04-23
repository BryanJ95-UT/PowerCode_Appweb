const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [clientes] = await db.query(`
      SELECT 
        c.id_cliente,
        c.id_usuario,
        u.nombre,
        u.correo,
        c.telefono,
        c.direccion,
        c.estado_membresia,
        m.tipo AS membresia,
        m.costo,
        m.duracion
      FROM clientes c
      INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
      LEFT JOIN membresias m ON c.id_membresia = m.id_membresia
    `);

    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener clientes' });
  }
});

router.get('/usuario/:id_usuario', async (req, res) => {
  try {
    const [clientes] = await db.query(`
      SELECT
        c.id_cliente,
        c.id_usuario,
        u.nombre,
        u.correo,
        c.telefono,
        c.direccion,
        c.estado_membresia,
        m.tipo AS membresia,
        m.costo,
        m.duracion
      FROM clientes c
      INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
      LEFT JOIN membresias m ON c.id_membresia = m.id_membresia
      WHERE c.id_usuario = ?
      LIMIT 1
    `, [req.params.id_usuario]);

    if (clientes.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontro informacion de cliente para este usuario' });
    }

    res.json(clientes[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener perfil del cliente' });
  }
});

router.get('/entrenador/:id_usuario', async (req, res) => {
  try {
    const [clientes] = await db.query(`
      SELECT DISTINCT
        c.id_cliente,
        c.id_usuario,
        u.nombre,
        u.correo,
        c.telefono,
        c.direccion,
        c.estado_membresia
      FROM entrenadores e
      INNER JOIN rutinas r ON r.id_entrenador = e.id_entrenador
      INNER JOIN clientes c ON c.id_cliente = r.id_cliente
      INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE e.id_usuario = ?
    `, [req.params.id_usuario]);

    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener clientes del entrenador' });
  }
});

router.patch('/:id_cliente', async (req, res) => {
  const { telefono, direccion, estado_membresia } = req.body;

  try {
    const [result] = await db.query(`
      UPDATE clientes
      SET
        telefono = COALESCE(?, telefono),
        direccion = COALESCE(?, direccion),
        estado_membresia = COALESCE(?, estado_membresia)
      WHERE id_cliente = ?
    `, [telefono || null, direccion || null, estado_membresia || null, req.params.id_cliente]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.json({ mensaje: 'Informacion actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar cliente' });
  }
});

module.exports = router;
