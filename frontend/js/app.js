const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
const cta = document.querySelector(".cta");
const menu = document.querySelector(".menu");
const heroCopy = document.querySelector(".hero-copy");
const roleNames = {
  1: "admin",
  2: "cliente",
  3: "entrenador",
};

if (usuario) {
  if (cta) {
    cta.textContent = usuario.id_rol === 1 ? "ADMIN ->" : usuario.id_rol === 3 ? "ENTRENADOR ->" : "MI PANEL ->";
    cta.href = "./pages/dashboard.html";
  }

  if (menu && !document.querySelector(".logout-link")) {
    const dashboard = document.createElement("a");
    dashboard.href = "./pages/dashboard.html";
    dashboard.textContent =
      usuario.id_rol === 1 ? "Administracion" : usuario.id_rol === 3 ? "Entrenador" : "Mi espacio";
    menu.appendChild(dashboard);

    if (usuario.id_rol === 1) {
      const reports = document.createElement("a");
      reports.href = "./pages/dashboard.html";
      reports.textContent = "Reportes";
      reports.addEventListener("click", () => localStorage.setItem("powerCodeSection", "reportes"));
      menu.appendChild(reports);
    }

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
    welcome.textContent = `Bienvenido, ${usuario.nombre}. Perfil: ${roleNames[usuario.id_rol] || "usuario"}.`;
    heroCopy.prepend(welcome);
  }
}
