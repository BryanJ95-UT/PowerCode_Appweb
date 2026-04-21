const express = require('express');
const app = express();

app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ mensaje: 'Backend funcionando correctamente' });
});

app.listen(3000, () => {
  console.log('Servidor activo en puerto 3000');
});
