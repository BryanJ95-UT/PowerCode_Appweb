const content = document.getElementById("gymsContent");

function mapsLink(gym) {
  if (gym.latitud && gym.longitud) {
    return `https://www.google.com/maps?q=${gym.latitud},${gym.longitud}`;
  }

  return `https://www.google.com/maps/search/${encodeURIComponent(gym.direccion || gym.nombre)}`;
}

function mapEmbed(gym) {
  if (gym.latitud && gym.longitud) {
    return `https://www.google.com/maps?q=${gym.latitud},${gym.longitud}&output=embed`;
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(gym.direccion || gym.nombre)}&output=embed`;
}

async function loadGyms() {
  const response = await fetch("http://localhost:3000/api/gyms");
  const gyms = await response.json();

  content.innerHTML = gyms.length
    ? `<div class="maps-grid">
        ${gyms
          .map(
            (gym) => `
              <article class="map-card">
                <iframe
                  class="map-frame"
                  src="${mapEmbed(gym)}"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  title="Mapa de ${gym.nombre}">
                </iframe>
                <div class="map-info">
                  <strong>${gym.nombre}</strong>
                  <span>${gym.direccion}</span>
                  <span>${gym.telefono || "Sin telefono"}</span>
                  <a class="mini-btn" href="${mapsLink(gym)}" target="_blank" rel="noopener">Abrir en Google Maps</a>
                </div>
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

document.getElementById("searchGym")?.addEventListener("input", function () {
  const text = this.value.toLowerCase();
  const cards = document.querySelectorAll(".gym-card");

  cards.forEach(card => {
    const contenido = card.textContent.toLowerCase();

    if (contenido.includes(text)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});