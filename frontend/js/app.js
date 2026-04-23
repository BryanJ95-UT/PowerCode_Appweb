document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nombre: document.getElementById("nombre").value,
    correo: document.getElementById("correo").value,
    password: document.getElementById("password").value
  };

  try {
    const res = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    console.log(result);
    alert(result.message);

  } catch (error) {
    console.error(error);
    alert("Error conectando con el servidor");
  }
});
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    correo: document.getElementById("correo").value,
    password: document.getElementById("password").value
  };

  try {
    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
      alert(result.message);

      // guardar usuario (opcional)
      localStorage.setItem("usuario", JSON.stringify(result.usuario));

      // redirigir
      window.location.href = "index.html";
    } else {
      alert(result.message);
    }

  } catch (error) {
    console.error(error);
    alert("Error conectando con el servidor");
  }
});