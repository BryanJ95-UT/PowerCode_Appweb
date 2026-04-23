async function cargarClientes() {
  try {
    const respuesta = await fetch('http://localhost:3000/api/clientes');
    const clientes = await respuesta.json();

    const tabla = document.getElementById('tabla-clientes');

    tabla.innerHTML = clientes.map(cliente => `
      <tr>
        <td>${cliente.nombre}</td>
        <td>${cliente.correo}</td>
        <td>${cliente.telefono}</td>
        <td>${cliente.direccion}</td>
        <td>${cliente.estado_membresia}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error al cargar clientes:', error);
  }
}

cargarClientes();
