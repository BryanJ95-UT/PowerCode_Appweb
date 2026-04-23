const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
const content = document.getElementById("paymentsContent");

async function loadPayments() {
  if (!usuario) {
    content.innerHTML = `<p class="empty-state">Inicia sesion para consultar tus pagos.</p>`;
    return;
  }

  const response = await fetch(`http://localhost:3000/api/cliente/pagos/${usuario.id}`);
  const pagos = await response.json();

  content.innerHTML = `
    <div class="module-grid">
      <article>
        <strong>Membresia Power Code</strong>
        <span>Pago demo listo para conectar con Stripe, PayPal o Mercado Pago.</span>
        <button class="save-btn" id="checkoutBtn" type="button">Generar checkout demo</button>
      </article>
    </div>
    ${
      pagos.length
        ? `<div class="table-wrap"><table><thead><tr><th>Monto</th><th>Fecha</th><th>Metodo</th></tr></thead><tbody>${pagos
            .map((p) => `<tr><td>$${p.monto}</td><td>${p.fecha_pago}</td><td>${p.metodo_pago}</td></tr>`)
            .join("")}</tbody></table></div>`
        : `<p class="empty-state">No hay pagos registrados.</p>`
    }
  `;

  document.getElementById("checkoutBtn").addEventListener("click", async () => {
    const checkout = await fetch("http://localhost:3000/api/integraciones/pagos/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario: usuario.id, concepto: "Membresia Power Code", monto: 399 }),
    }).then((res) => res.json());

    alert(checkout.message);
  });
}

loadPayments().catch(() => {
  content.innerHTML = `<p class="empty-state">No se pudieron cargar los pagos.</p>`;
});
