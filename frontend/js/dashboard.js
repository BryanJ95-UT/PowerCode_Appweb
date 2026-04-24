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

let currentRole = null;
let currentSection = localStorage.getItem("powerCodeSection") || "inicio";
let entrenadorId = null;
let clientesCache = [];
let clientesAsignados = [];

if (!usuario) {
  window.location.href = "./login.html";
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.mensaje || "Error de solicitud");
  return data;
}

function renderCards(cards) {
  summaryCards.innerHTML = cards
    .map((card) => `
      <article class="summary-card">
        <span>${card.label}</span>
        <strong>${card.value}</strong>
      </article>
    `)
    .join("");
}

function roleMenu(items) {
  return `
    <div class="role-menu">
      ${items
        .map(
          (item) => `
            <button class="${currentSection === item.id ? "active" : ""}" data-section="${item.id}" type="button">
              ${item.label}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function table(headers, rows) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map((head) => `<th>${head}</th>`).join("")}</tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>
  `;
}

function empty(message) {
  return `<p class="empty-state">${message}</p>`;
}

function bindRoleMenu() {
  content.querySelectorAll("[data-section]").forEach((button) => {
    button.addEventListener("click", () => {
      currentSection = button.dataset.section;
      localStorage.setItem("powerCodeSection", currentSection);
      loadDashboard();
    });
  });
}

function logout() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("powerCodeSection");
  window.location.href = "../index.html";
}

function clientSelect() {
  return `
    <select name="id_cliente" required>
      <option value="">Selecciona cliente</option>
      ${clientesCache.map((cliente) => `<option value="${cliente.id_cliente}">${cliente.nombre}</option>`).join("")}
    </select>
  `;
}

async function submitJson(form, path, message) {
  const payload = Object.fromEntries(new FormData(form));
  await api(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  alert(message);
  form.reset();
  loadDashboard();
}

async function renderAdmin(section = "inicio") {
  const menu = roleMenu([
  { id: "inicio", label: "Resumen" },
  { id: "usuarios", label: "Usuarios" },
  { id: "gyms", label: "Gimnasios" },
  { id: "instituciones", label: "Instituciones" },
  { id: "asignaciones", label: "Asignaciones" },
  { id: "reportes", label: "Reportes" },
  { id: "integraciones", label: "Integraciones" },
]);

  const resumen = await api("/admin/resumen");
  renderCards([
    { label: "Usuarios", value: resumen.usuarios },
    { label: "Clientes", value: resumen.clientes },
    { label: "Reportes abiertos", value: resumen.reportes_abiertos },
  ]);

  if (section === "usuarios") {
    const usuarios = await api("/admin/usuarios");
    content.innerHTML = menu + table(
      ["Nombre", "Correo", "Rol", "Estado"],
      usuarios.map((u) => `
        <tr>
          <td>${u.nombre}</td>
          <td>${u.correo}</td>
          <td><span class="status">${u.rol || roleNames[u.id_rol] || "Sin rol"}</span></td>
          <td>${u.estado ? "Confirmado" : "Pendiente"}</td>
        </tr>
      `)
    );
  } else if (section === "gyms") {
  const gyms = await api("/gyms");

  content.innerHTML = menu + `
    <form class="inline-form" id="gymForm">
      <input name="nombre" placeholder="Nombre del gimnasio" required>
      <input name="direccion" placeholder="Direccion" required>
      <input 
       name="telefono"
       placeholder="Telefono (10 digitos)"
       maxlength="10"
       pattern="[0-9]{10}"
       inputmode="numeric"
       required
>

      <input name="latitud" id="latitud" placeholder="Latitud" readonly>
      <input name="longitud" id="longitud" placeholder="Longitud" readonly>

      <button type="submit">Agregar gym</button>
    </form>

    <div id="map" style="height:400px;border-radius:16px;margin-bottom:20px;"></div>
      ${gyms.length ? table(
        ["Gimnasio", "Direccion", "Telefono", "Maps"],
        gyms.map((gym) => `
          <tr>
            <td>${gym.nombre}</td>
            <td>${gym.direccion}</td>
            <td>${gym.telefono || "Sin telefono"}</td>
            <td>${gym.latitud && gym.longitud ? `${gym.latitud}, ${gym.longitud}` : "Pendiente"}</td>
          </tr>
        `)
      ) : empty("Aun no hay gimnasios registrados.")}
    `;
   document.getElementById("gymForm").addEventListener("submit", (event) => {
  event.preventDefault();
  submitJson(event.currentTarget, "/gyms", "Gimnasio registrado");
});
setTimeout(() => {
  initGymMap();
}, 300);
const phoneInput = document.querySelector('#gymForm input[name="telefono"]');

phoneInput.addEventListener("input", () => {
  phoneInput.value = phoneInput.value
    .replace(/\D/g, "")
    .slice(0, 10);
});
  } else if (section === "instituciones") {
    const instituciones = await api("/instituciones");
    content.innerHTML = menu + `
      <form class="inline-form" id="institucionForm">
        <input name="nombre" placeholder="Institucion deportiva" required>
        <input name="contacto" placeholder="Contacto">
        <button type="submit">Agregar institucion</button>
      </form>
      ${instituciones.length ? table(
        ["Institucion", "Contacto", "Becas"],
        instituciones.map((inst) => `
          <tr>
            <td>${inst.nombre}</td>
            <td>${inst.contacto || "Sin contacto"}</td>
            <td>${inst.becas || 0}</td>
          </tr>
        `)
      ) : empty("Aun no hay instituciones registradas.")}
    `;
    document.getElementById("institucionForm").addEventListener("submit", (event) => {
      event.preventDefault();
      submitJson(event.currentTarget, "/instituciones", "Institucion registrada");
    });
    } else if (section === "asignaciones") {

  const data = await api("/admin/asignaciones-data");
  const lista = await api("/admin/asignaciones");

  content.innerHTML = menu + `
    <form class="inline-form" id="assignForm">

      <select name="id_cliente" required>
        <option value="">Selecciona cliente</option>
        ${data.clientes.map(c => `
          <option value="${c.id_cliente}">${c.nombre}</option>
        `).join("")}
      </select>

      <select name="id_entrenador" required>
        <option value="">Selecciona entrenador</option>
        ${data.entrenadores.map(e => `
          <option value="${e.id_entrenador}">${e.nombre}</option>
        `).join("")}
      </select>

      <button type="submit">Asignar</button>

    </form>

    ${lista.length ? table(
      ["Cliente", "Entrenador"],
      lista.map(a => `
        <tr>
          <td>${a.cliente}</td>
          <td>${a.entrenador}</td>
        </tr>
      `)
    ) : empty("No hay asignaciones registradas.")}
  `;

  document.getElementById("assignForm").addEventListener("submit", (event) => {
    event.preventDefault();
    submitJson(
      event.currentTarget,
      "/admin/asignar-cliente",
      "Cliente asignado"
    );
  });

} else if (section === "reportes") {
    const reportes = await api("/reportes?admin=1");
    content.innerHTML = menu + (reportes.length ? table(
      ["Usuario", "Asunto", "Mensaje", "Estado", "Respuesta"],
      reportes.map((reporte) => `
        <tr>
          <td>${reporte.nombre}</td>
          <td>${reporte.asunto}</td>
          <td>${reporte.mensaje}</td>
          <td><span class="status">${reporte.estado}</span></td>
          <td><button class="mini-btn" data-reporte="${reporte.id_reporte}">Responder</button></td>
        </tr>
      `)
      
    ) : empty("No hay reportes por responder."));
    content.querySelectorAll("[data-reporte]").forEach((button) => {
      button.addEventListener("click", async () => {
        const respuesta_admin = prompt("Respuesta para el usuario:");
        if (!respuesta_admin) return;
        await api(`/reportes/${button.dataset.reporte}`, {
          method: "PATCH",
          body: JSON.stringify({ respuesta_admin, estado: "respondido" }),
        });
        loadDashboard();
      });
    });
  } else if (section === "integraciones") {
    const config = await api("/integraciones/config");
    content.innerHTML = menu + `
      <div class="integration-grid">
        <article><strong>Google Maps</strong><span>${config.maps.apiKeyConfigured ? "Configurado" : "Pendiente de API key"}</span></article>
        <article><strong>YouTube</strong><span>${config.youtube.apiKeyConfigured ? "Configurado" : "Pendiente de API key"}</span></article>
        <article><strong>Pagos</strong><span>${config.payments.configured ? config.payments.provider : "Modo demo"}</span></article>
      </div>
    `;
  } else {
    content.innerHTML = menu + `
      <div class="module-grid">
        <article><strong>Gestiona gimnasios</strong><span>Agrega sedes y coordenadas para Maps.</span></article>
        <article><strong>Instituciones</strong><span>Registra aliados para becas y apoyos.</span></article>
        <article><strong>Reportes</strong><span>Responde solicitudes de usuarios.</span></article>
      </div>
    `;
  }

  bindRoleMenu();
}

async function renderEntrenador(section = "inicio") {
  const menu = roleMenu([
    { id: "inicio", label: "Resumen" },
    { id: "rutinas", label: "Rutinas" },
    { id: "dietas", label: "Dietas" },
    { id: "agenda", label: "Agenda" },
    { id: "alumnos", label: "Alumnos" },
  ]);

  const resumen = await api(`/entrenador/resumen/${usuario.id}`);
  entrenadorId = resumen.id_entrenador;
  clientesAsignados = await api(`/clientes/entrenador/${usuario.id}`);
clientesCache = clientesAsignados;

  renderCards([
    { label: "Rutinas", value: resumen.rutinas },
    { label: "Dietas", value: resumen.dietas },
    { label: "Agenda", value: resumen.eventos_agenda },
  ]);

  if (section === "rutinas") {
    const rutinas = await api(`/entrenador/rutinas/${usuario.id}`);
    content.innerHTML = menu + `
      <form class="inline-form" id="rutinaForm">
        <input type="hidden" name="id_entrenador" value="${entrenadorId}">
        ${clientSelect()}
        <input name="descripcion" placeholder="Descripcion de rutina" required>
        <input name="video_url" placeholder="URL de video de YouTube">
        <button type="submit">Crear rutina</button>
      </form>
      ${rutinas.length ? table(
        ["Cliente", "Rutina", "Video"],
        rutinas.map((r) => `
          <tr>
            <td>${r.cliente}</td>
            <td>${r.descripcion}</td>
            <td>${r.video_url ? `<a href="${r.video_url}" target="_blank">Ver video</a>` : "Sin video"}</td>
          </tr>
        `)
      ) : empty("Aun no tienes rutinas registradas.")}
    `;
    document.getElementById("rutinaForm").addEventListener("submit", (event) => {
      event.preventDefault();
      submitJson(event.currentTarget, "/entrenador/rutinas", "Rutina creada");
    });
  } else if (section === "dietas") {
    const dietas = await api(`/entrenador/dietas/${usuario.id}`);
    content.innerHTML = menu + `
      <form class="inline-form" id="dietaForm">
        <input type="hidden" name="id_entrenador" value="${entrenadorId}">
        ${clientSelect()}
        <input name="objetivo" placeholder="Objetivo nutricional" required>
        <input name="descripcion" placeholder="Descripcion de dieta" required>
        <button type="submit">Crear dieta</button>
      </form>
      ${dietas.length ? table(
        ["Cliente", "Objetivo", "Dieta"],
        dietas.map((d) => `<tr><td>${d.cliente}</td><td>${d.objetivo}</td><td>${d.descripcion}</td></tr>`)
      ) : empty("Aun no tienes dietas registradas.")}
    `;
    document.getElementById("dietaForm").addEventListener("submit", (event) => {
      event.preventDefault();
      submitJson(event.currentTarget, "/entrenador/dietas", "Dieta creada");
    });
  } else if (section === "agenda") {
    const agenda = await api(`/entrenador/agenda/${usuario.id}`);
    content.innerHTML = menu + `
      <form class="inline-form" id="agendaForm">
        <input type="hidden" name="id_entrenador" value="${entrenadorId}">
        ${clientSelect()}
        <input name="titulo" placeholder="Titulo del evento" required>
        <input type="date" name="fecha" required>
        <input type="time" name="hora">
        <button type="submit">Agendar</button>
      </form>
      ${agenda.length ? table(
        ["Fecha", "Hora", "Cliente", "Evento", "Estado"],
        agenda.map((a) => `<tr><td>${a.fecha}</td><td>${a.hora || "-"}</td><td>${a.cliente || "General"}</td><td>${a.titulo}</td><td>${a.estado}</td></tr>`)
      ) : empty("Tu agenda esta libre.")}
    `;
    document.getElementById("agendaForm").addEventListener("submit", (event) => {
      event.preventDefault();
      submitJson(event.currentTarget, "/entrenador/agenda", "Evento agregado");
    });
  } else if (section === "alumnos") {
  content.innerHTML = menu + (clientesCache.length ? table(
    ["Alumno", "Correo", "Telefono", "Membresia"],
    clientesCache.map((c) => `
      <tr>
        <td>${c.nombre}</td>
        <td>${c.correo}</td>
        <td>${c.telefono || "-"}</td>
        <td>${c.estado_membresia || "-"}</td>
      </tr>
    `)
  ) : empty("No hay clientes registrados."));
} else {
    content.innerHTML = menu + `
      <div class="module-grid">
        <article><strong>Rutinas con video</strong><span>Agrega links de YouTube para guiar ejercicios.</span></article>
        <article><strong>Dietas</strong><span>Registra planes por objetivo.</span></article>
        <article><strong>Agenda</strong><span>Organiza sesiones y evaluaciones.</span></article>
      </div>
    `;
  }

  bindRoleMenu();
}

async function renderCliente(section = "inicio") {
  const menu = roleMenu([
    { id: "inicio", label: "Mi perfil" },
    { id: "rutinas", label: "Rutinas" },
    { id: "dietas", label: "Dietas" },
    { id: "asistencias", label: "Asistencias" },
    { id: "pagos", label: "Pagos" },
    { id: "reportes", label: "Reportes" },
  ]);

  renderCards([
    { label: "Rol", value: "Cliente" },
    { label: "Cuenta", value: "Confirmada" },
    { label: "Menu", value: "Personal" },
  ]);

  if (section === "rutinas") {
    const rutinas = await api(`/cliente/rutinas/${usuario.id}`);
    content.innerHTML = menu + (rutinas.length ? table(
      ["Entrenador", "Rutina", "Video"],
      rutinas.map((r) => `<tr><td>${r.entrenador}</td><td>${r.descripcion}</td><td>${r.video_url ? `<a href="${r.video_url}" target="_blank">Ver video</a>` : "Sin video"}</td></tr>`)
    ) : empty("Todavia no tienes rutinas asignadas."));
  } else if (section === "dietas") {
    const dietas = await api(`/cliente/dietas/${usuario.id}`);
    content.innerHTML = menu + (dietas.length ? table(
      ["Entrenador", "Objetivo", "Dieta"],
      dietas.map((d) => `<tr><td>${d.entrenador}</td><td>${d.objetivo}</td><td>${d.descripcion}</td></tr>`)
    ) : empty("Todavia no tienes dietas asignadas."));
  } else if (section === "asistencias") {
    const asistencias = await api(`/cliente/asistencias/${usuario.id}`);
    content.innerHTML = menu + `
      <div class="attendance-actions">
        <button class="save-btn" id="attendanceBtn" type="button">Registrar asistencia de hoy</button>
        <span>Solo puedes registrar una asistencia por dia.</span>
      </div>
      ${asistencias.length ? table(
        ["Fecha"],
        asistencias.map((a) => `<tr><td>${a.fecha}</td></tr>`)
      ) : empty("No hay asistencias registradas.")}
    `;

    document.getElementById("attendanceBtn").addEventListener("click", async () => {
      try {
        const result = await api("/cliente/asistencias", {
          method: "POST",
          body: JSON.stringify({ id_usuario: usuario.id }),
        });
        alert(result.message);
        loadDashboard();
      } catch (error) {
        alert(error.message);
      }
    });
  } else if (section === "pagos") {
    const pagos = await api(`/cliente/pagos/${usuario.id}`);
    content.innerHTML = menu + `
      <button class="save-btn" id="payDemo" type="button">Pagar membresia demo</button>
      ${pagos.length ? table(
        ["Monto", "Fecha", "Metodo"],
        pagos.map((p) => `<tr><td>$${p.monto}</td><td>${p.fecha_pago}</td><td>${p.metodo_pago}</td></tr>`)
      ) : empty("No hay pagos registrados.")}
    `;
    document.getElementById("payDemo").addEventListener("click", async () => {
      const checkout = await api("/integraciones/pagos/checkout", {
        method: "POST",
        body: JSON.stringify({ id_usuario: usuario.id, concepto: "Membresia Power Code", monto: 399 }),
      });
      alert(checkout.message);
    });
  } else if (section === "reportes") {
    const reportes = await api(`/reportes?id_usuario=${usuario.id}`);
    content.innerHTML = menu + `
      <form class="inline-form" id="reporteForm">
        <input type="hidden" name="id_usuario" value="${usuario.id}">
        <input name="asunto" placeholder="Asunto" required>
        <input name="mensaje" placeholder="Describe tu reporte" required>
        <button type="submit">Enviar reporte</button>
      </form>
      ${reportes.length ? table(
        ["Asunto", "Mensaje", "Estado", "Respuesta"],
        reportes.map((r) => `<tr><td>${r.asunto}</td><td>${r.mensaje}</td><td>${r.estado}</td><td>${r.respuesta_admin || "Pendiente"}</td></tr>`)
      ) : empty("No has enviado reportes.")}
    `;
    document.getElementById("reporteForm").addEventListener("submit", (event) => {
      event.preventDefault();
      submitJson(event.currentTarget, "/reportes", "Reporte enviado");
    });
  } else {
    const perfil = await api(`/clientes/usuario/${usuario.id}`).catch(() => null);
    content.innerHTML = menu + (perfil ? `
      <form class="profile-form" id="profileForm">
        <label>Nombre<input value="${perfil.nombre || ""}" disabled></label>
        <label>Correo<input value="${perfil.correo || ""}" disabled></label>
        <label>Telefono<input id="telefono" value="${perfil.telefono || ""}" placeholder="Agrega telefono"></label>
        <label>Direccion<input id="direccion" value="${perfil.direccion || ""}" placeholder="Agrega direccion"></label>
        <label>Preferencia visual<input value="Tema Power Code oscuro" disabled></label>
        <label>Membresia<input value="${perfil.estado_membresia || "Pendiente"}" disabled></label>
        <button class="save-btn" type="submit">Guardar perfil</button>
      </form>
    ` : empty("Tu usuario aun no tiene perfil de cliente."));
    document.getElementById("profileForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      await api(`/clientes/${perfil.id_cliente}`, {
        method: "PATCH",
        body: JSON.stringify({
          telefono: document.getElementById("telefono").value,
          direccion: document.getElementById("direccion").value,
        }),
      });
      alert("Perfil actualizado");
    });
  }

  bindRoleMenu();
}

async function loadDashboard() {
  currentRole = Number(usuario.id_rol);

  setText("roleLabel", roleNames[currentRole] || "Usuario");
  setText("welcomeTitle", `Hola, ${usuario.nombre}`);
  setText("welcomeText", "Esta es tu experiencia personalizada dentro de Power Code.");
  setText("userEmail", usuario.correo);
  setText("panelTitle", roleNames[currentRole] ? `Panel de ${roleNames[currentRole].toLowerCase()}` : "Mi panel");

  try {
    if (currentRole === 1) await renderAdmin(currentSection);
    else if (currentRole === 2) await renderCliente(currentSection);
    else if (currentRole === 3) await renderEntrenador(currentSection);
    else content.innerHTML = empty("Tu rol no esta configurado.");
  } catch (error) {
    console.error(error);
    content.innerHTML = empty(error.message || "No se pudo cargar la informacion del dashboard.");
  }
}

refreshBtn.addEventListener("click", loadDashboard);
logoutBtn.addEventListener("click", logout);

loadDashboard();

function initGymMap() {
  if (!window.google) return;

  const center = { lat: 20.1772, lng: -98.0524 };

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center
  });

  const marker = new google.maps.Marker({
    position: center,
    map,
    draggable: true
  });

  document.getElementById("latitud").value = center.lat;
  document.getElementById("longitud").value = center.lng;

  map.addListener("click", (e) => {
    marker.setPosition(e.latLng);

    document.getElementById("latitud").value = e.latLng.lat();
    document.getElementById("longitud").value = e.latLng.lng();
  });

  marker.addListener("dragend", () => {
    const pos = marker.getPosition();

    document.getElementById("latitud").value = pos.lat();
    document.getElementById("longitud").value = pos.lng();
  });
}
