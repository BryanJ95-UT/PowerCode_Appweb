const API_URL = "http://localhost:3000/api";
const tabs = document.querySelectorAll(".auth-tab");
const forms = document.querySelectorAll(".auth-form");
const switchButtons = document.querySelectorAll("[data-switch]");

function showForm(formId) {
  forms.forEach((form) => {
    form.classList.toggle("active", form.id === formId);
  });

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.target === formId);
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => showForm(tab.dataset.target));
});

switchButtons.forEach((button) => {
  button.addEventListener("click", () => showForm(button.dataset.switch));
});

if (new URLSearchParams(window.location.search).get("confirmada") === "1") {
  showToast(" Cuenta confirmada correctamente. Ya puedes iniciar sesión.");
  showForm("loginForm");
}

document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const correo = document.getElementById("correo").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "Error al iniciar sesion");
      return;
    }

    localStorage.setItem("usuario", JSON.stringify(result.usuario));
    window.location.href = "../index.html";
  } catch (error) {
    console.error(error);
    alert("Error conectando con el servidor");
  }
});

document.getElementById("registerForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nombre = document.getElementById("reg-nombre").value;
  const correo = document.getElementById("reg-correo").value;
  const id_rol = document.getElementById("reg-rol").value;
  const especialidad = document.getElementById("reg-especialidad").value;
  const password = document.getElementById("reg-password").value;
  const confirmPassword = document.getElementById("reg-password2").value;

  if (password !== confirmPassword) {
    alert("Las contrasenas no coinciden");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        correo,
        password,
        id_rol,
        especialidad: id_rol === "3" ? especialidad : undefined,
        admin_code: id_rol === "1" ? especialidad : undefined,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "Error al crear la cuenta");
      return;
    }

    alert(result.message || "Usuario registrado. Revisa tu correo para confirmar la cuenta.");
    showForm("loginForm");
  } catch (error) {
    console.error(error);
    alert("Error conectando con el servidor");
  }
});
// Recuperar contraseña
const modal = document.getElementById("modalForgot");
const openBtn = document.getElementById("forgotPassword");
const closeBtn = document.getElementById("closeModal");
const sendBtn = document.getElementById("sendRecovery");

openBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  modal.classList.add("active");
});

closeBtn?.addEventListener("click", () => {
  modal.classList.remove("active");
});

sendBtn?.addEventListener("click", async () => {
  const correo = document.getElementById("forgotEmail").value;

  if (!correo) {
    alert("Ingresa un correo");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message);
      return;
    }

    showToast("Revisa tu correo 📩");
    modal.classList.remove("active");

  } catch (error) {
    console.error(error);
    alert("Error conectando con el servidor");
  }
});
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}