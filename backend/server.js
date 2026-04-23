const express = require('express');
const app = express();

app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ mensaje: 'Backend funcionando correctamente' });
});

app.listen(3000, () => {
  console.log('Servidor activo en puerto 3000');
});

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Power Code funcionando ');
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});