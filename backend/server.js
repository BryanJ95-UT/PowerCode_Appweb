import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import membershipRoutes from './routes/memberships.routes.js';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ mensaje: 'Backend funcionando correctamente' });
});

app.get('/', (req, res) => {
  res.send('API Power Code funcionando');
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/memberships', membershipRoutes);

// Servidor (SOLO UNA VEZ)
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});