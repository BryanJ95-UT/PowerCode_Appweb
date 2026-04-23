const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [clientes] = await db.query(`
      SELECT 
        c.id_cliente,
        u.nombre,
        u.correo,
        c.telefono,
        c.direccion,
        c.estado_membresia
      FROM clientes c
      INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
    `);

    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener clientes' });
  }
});

module.exports = router;
