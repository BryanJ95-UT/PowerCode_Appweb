const content = document.getElementById("gymsContent");

function mapsLink(gym) {
  if (gym.latitud && gym.longitud) {
    return `https://www.google.com/maps?q=${gym.latitud},${gym.longitud}`;
  }

  return `https://www.google.com/maps/search/${encodeURIComponent(gym.direccion || gym.nombre)}`;
}

async function loadGyms() {
  const response = await fetch("http://localhost:3000/api/gyms");
  const gyms = await response.json();

  content.innerHTML = gyms.length
    ? `<div class="module-grid">
        ${gyms
          .map(
            (gym) => `
              <article>
                <strong>${gym.nombre}</strong>
                <span>${gym.direccion}</span>
                <span>${gym.telefono || "Sin telefono"}</span>
                <a class="mini-btn" href="${mapsLink(gym)}" target="_blank" rel="noopener">Ver mapa</a>
              </article>
            `
          )
          .join("")}
      </div>`
    : `<p class="empty-state">Aun no hay gimnasios registrados.</p>`;
}

loadGyms().catch(() => {
  content.innerHTML = `<p class="empty-state">No se pudieron cargar los gimnasios.</p>`;
});
