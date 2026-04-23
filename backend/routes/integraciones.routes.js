const express = require("express");
const router = express.Router();

router.get("/config", (req, res) => {
  res.json({
    maps: {
      provider: "google-maps",
      apiKeyConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    },
    youtube: {
      provider: "youtube",
      apiKeyConfigured: Boolean(process.env.YOUTUBE_API_KEY),
    },
    payments: {
      provider: process.env.PAYMENT_PROVIDER || "demo",
      configured: Boolean(process.env.PAYMENT_SECRET_KEY),
    },
  });
});

router.post("/pagos/checkout", (req, res) => {
  const { id_usuario, concepto, monto } = req.body;

  if (!id_usuario || !concepto || !monto) {
    return res.status(400).json({ message: "Usuario, concepto y monto son obligatorios" });
  }

  res.json({
    message: "Checkout demo generado. Configura PAYMENT_SECRET_KEY para conectar pasarela real.",
    checkout_url: `/pages/payments.html?demo=1&concepto=${encodeURIComponent(concepto)}&monto=${monto}`,
  });
});

module.exports = router;
