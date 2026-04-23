import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  res.json({ mensaje: 'Login funcionando' });
});

router.post('/registro', (req, res) => {
  res.json({ mensaje: 'Registro funcionando' });
});

export default router;