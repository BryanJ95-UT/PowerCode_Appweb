const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
const cta = document.querySelector(".cta");
const menu = document.querySelector(".menu");
const heroCopy = document.querySelector(".hero-copy");

if (usuario) {
  if (cta) {
    cta.textContent = "MI PANEL ->";
    cta.href = "./pages/dashboard.html";
  }

  if (menu && !document.querySelector(".logout-link")) {
    const logout = document.createElement("button");
    logout.type = "button";
    logout.className = "logout-link";
    logout.textContent = "Cerrar sesion";
    logout.addEventListener("click", () => {
      localStorage.removeItem("usuario");
      window.location.href = "./index.html";
    });
    menu.appendChild(logout);
  }

  if (heroCopy && !document.querySelector(".welcome-user")) {
    const welcome = document.createElement("p");
    welcome.className = "welcome-user";
    welcome.textContent = `Bienvenido, ${usuario.nombre}.`;
    heroCopy.prepend(welcome);
  }
}
