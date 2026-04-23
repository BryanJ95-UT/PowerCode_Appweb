const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
const content = document.getElementById("rutinasContent");

function youtubeEmbed(url) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]+)/);
  if (!match) return `<a class="mini-btn" href="${url}" target="_blank" rel="noopener">Abrir video</a>`;
  return `<iframe class="video-frame" src="https://www.youtube.com/embed/${match[1]}" title="Video de rutina" allowfullscreen></iframe>`;
}

async function loadRutinas() {
  if (!usuario) {
    content.innerHTML = `<p class="empty-state">Inicia sesion para ver tus rutinas.</p>`;
    return;
  }

  const endpoint = usuario.id_rol === 3 ? `/api/entrenador/rutinas/${usuario.id}` : `/api/cliente/rutinas/${usuario.id}`;
  const response = await fetch(`http://localhost:3000${endpoint}`);
  const rutinas = await response.json();

  content.innerHTML = rutinas.length
    ? `<div class="module-grid">
        ${rutinas
          .map(
            (rutina) => `
              <article>
                <strong>${rutina.cliente || rutina.entrenador || "Rutina"}</strong>
                <span>${rutina.descripcion}</span>
                ${youtubeEmbed(rutina.video_url)}
              </article>
            `
          )
          .join("")}
      </div>`
    : `<p class="empty-state">No hay rutinas disponibles todavia.</p>`;
}

loadRutinas().catch(() => {
  content.innerHTML = `<p class="empty-state">No se pudieron cargar las rutinas.</p>`;
});
