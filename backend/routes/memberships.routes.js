import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    planes: [
      { nombre: 'Básico', precio: 150 },
      { nombre: 'Intermedio', precio: 300 },
      { nombre: 'Premium', precio: 500 }
    ]
  });
});

export default router;