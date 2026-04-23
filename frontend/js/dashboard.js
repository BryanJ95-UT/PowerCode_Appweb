const API_URL = "http://localhost:3000/api";
const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

const roleNames = {
  1: "Administrador",
  2: "Cliente",
  3: "Entrenador",
};

const content = document.getElementById("dashboardContent");
const summaryCards = document.getElementById("summaryCards");
const refreshBtn = document.getElementById("refreshBtn");
const logoutBtn = document.getElementById("logoutBtn");

if (!usuario) {
  window.location.href = "./login.html";
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderCards(cards) {
  summaryCards.innerHTML = cards
    .map(
      (card) => `
        <article class="summary-card">
          <span>${card.label}</span>
          <strong>${card.value}</strong>
        </article>
      `
    )
    .join("");
}

function clienteRows(clientes, editable = false) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Telefono</th>
            <th>Direccion</th>
            <th>Membresia</th>
            ${editable ? "<th>Accion</th>" : ""}
          </tr>
        </thead>
        <tbody>
          ${clientes
            .map(
              (cliente) => `
                <tr>
                  <td>${cliente.nombre || "Sin nombre"}</td>
                  <td>${cliente.correo || "Sin correo"}</td>
                  <td>${cliente.telefono || "Sin telefono"}</td>
                  <td>${cliente.direccion || "Sin direccion"}</td>
                  <td><span class="status">${cliente.estado_membresia || cliente.membresia || "Sin membresia"}</span></td>
                  ${
                    editable
                      ? `<td><button class="mini-btn" data-edit="${cliente.id_cliente}">Editar</button></td>`
                      : ""
                  }
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderClienteProfile(cliente) {
  content.innerHTML = `
    <form class="profile-form" id="profileForm">
      <input type="hidden" id="clienteId" value="${cliente.id_cliente}">

      <label>
        Nombre
        <input value="${cliente.nombre || ""}" disabled>
      </label>

      <label>
        Correo
        <input value="${cliente.correo || ""}" disabled>
      </label>

      <label>
        Telefono
        <input id="telefono" value="${cliente.telefono || ""}" placeholder="Agrega tu telefono">
      </label>

      <label>
        Direccion
        <input id="direccion" value="${cliente.direccion || ""}" placeholder="Agrega tu direccion">
      </label>

      <label>
        Estado de membresia
        <input value="${cliente.estado_membresia || "Sin membresia"}" disabled>
      </label>

      <button class="save-btn" type="submit">Guardar cambios</button>
    </form>
  `;

  document.getElementById("profileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await updateCliente(cliente.id_cliente, {
      telefono: document.getElementById("telefono").value,
      direccion: document.getElementById("direccion").value,
    });
    alert("Informacion actualizada");
    loadDashboard();
  });
}

async function updateCliente(id, payload) {
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.mensaje || "No se pudo actualizar");
}

async function loadAdmin() {
  setText("panelKicker", "Administracion");
  setText("panelTitle", "Clientes registrados");

  const response = await fetch(`${API_URL}/clientes`);
  const clientes = await response.json();

  renderCards([
    { label: "Clientes", value: clientes.length },
    { label: "Activos", value: clientes.filter((c) => c.estado_membresia === "Activa").length },
    { label: "Inactivos", value: clientes.filter((c) => c.estado_membresia === "Inactiva").length },
  ]);

  content.innerHTML = clienteRows(clientes, true);

  content.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", async () => {
      const estado_membresia = prompt("Nuevo estado de membresia:", "Activa");
      if (!estado_membresia) return;
      await updateCliente(button.dataset.edit, { estado_membresia });
      loadDashboard();
    });
  });
}

async function loadCliente() {
  setText("panelKicker", "Mi informacion");
  setText("panelTitle", "Perfil del cliente");

  const response = await fetch(`${API_URL}/clientes/usuario/${usuario.id}`);

  if (!response.ok) {
    renderCards([{ label: "Perfil", value: "Pendiente" }]);
    content.innerHTML = `<p class="empty-state">Tu usuario existe, pero aun no tiene registro en la tabla clientes.</p>`;
    return;
  }

  const cliente = await response.json();
  renderCards([
    { label: "Membresia", value: cliente.estado_membresia || "Sin estado" },
    { label: "Plan", value: cliente.membresia || "Sin plan" },
    { label: "Telefono", value: cliente.telefono || "Pendiente" },
  ]);
  renderClienteProfile(cliente);
}

async function loadEntrenador() {
  setText("panelKicker", "Entrenamiento");
  setText("panelTitle", "Clientes asignados");

  const response = await fetch(`${API_URL}/clientes/entrenador/${usuario.id}`);
  const clientes = await response.json();

  renderCards([
    { label: "Clientes asignados", value: clientes.length },
    { label: "Rutinas", value: "Ver modulo" },
    { label: "Rol", value: "Entrenador" },
  ]);

  content.innerHTML = clientes.length
    ? clienteRows(clientes, false)
    : `<p class="empty-state">Aun no tienes clientes asignados mediante rutinas.</p>`;
}

async function loadDashboard() {
  const rol = Number(usuario.id_rol);

  setText("roleLabel", roleNames[rol] || "Usuario");
  setText("welcomeTitle", `Hola, ${usuario.nombre}`);
  setText("welcomeText", "Esta es tu experiencia personalizada dentro de Power Code.");
  setText("userEmail", usuario.correo);

  try {
    if (rol === 1) await loadAdmin();
    else if (rol === 2) await loadCliente();
    else if (rol === 3) await loadEntrenador();
    else content.innerHTML = `<p class="empty-state">Tu rol no esta configurado.</p>`;
  } catch (error) {
    console.error(error);
    content.innerHTML = `<p class="empty-state">No se pudo cargar la informacion del dashboard.</p>`;
  }
}

refreshBtn.addEventListener("click", loadDashboard);
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("usuario");
  window.location.href = "../index.html";
});

loadDashboard();
