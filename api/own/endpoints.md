# API PROPIA - POWER CODE

Base URL:
http://localhost:3000/api

---

#  AUTENTICACIÓN

## POST /api/register

Registro de usuario con confirmación por correo.

## GET /api/confirmar-cuenta

Confirmación de cuenta mediante token.

## POST /api/login

Inicio de sesión.

---

#  ADMIN

## GET /api/admin/usuarios

Lista todos los usuarios con su rol.

## GET /api/admin/resumen

Obtiene estadísticas generales del sistema.

---

#  CLIENTE

## GET /api/cliente/rutinas/:id_usuario

Obtiene rutinas del cliente.

## GET /api/cliente/dietas/:id_usuario

Obtiene dietas del cliente.

## GET /api/cliente/asistencias/:id_usuario

Historial de asistencias.

## POST /api/cliente/asistencias

Registrar asistencia.

Body:
{
"id_usuario": number
}

## GET /api/cliente/pagos/:id_usuario

Historial de pagos.

---

#  CLIENTES

## GET /api/clientes

Lista de clientes con información de membresía.

## GET /api/clientes/usuario/:id_usuario

Perfil del cliente.

## GET /api/clientes/entrenador/:id_usuario

Clientes asignados a un entrenador.

## PATCH /api/clientes/:id_cliente

Actualizar datos del cliente.

---

#  ENTRENADOR

## GET /api/entrenador/resumen/:id_usuario

Resumen del entrenador.

## GET /api/entrenador/rutinas/:id_usuario

Lista de rutinas creadas.

## POST /api/entrenador/rutinas

Crear rutina.

## GET /api/entrenador/dietas/:id_usuario

Lista de dietas.

## POST /api/entrenador/dietas

Crear dieta.

## GET /api/entrenador/agenda/:id_usuario

Agenda del entrenador.

## POST /api/entrenador/agenda

Crear evento en agenda.

---

#  GIMNASIOS

## GET /api/gyms

Lista de gimnasios.

## POST /api/gyms

Registrar gimnasio.

Body:
{
"nombre": "string",
"direccion": "string",
"telefono": "string",
"latitud": number,
"longitud": number,
"descripcion": "string"
}

---

#  INSTITUCIONES

## GET /api/instituciones

Lista de instituciones deportivas.

## POST /api/instituciones

Registrar institución.

---

#  REPORTES

## GET /api/reportes

Obtiene reportes (puede filtrar por usuario).

Query:
?id_usuario=number

## POST /api/reportes

Crear reporte.

## PATCH /api/reportes/:id_reporte

Actualizar reporte (respuesta o estado).

---

#  INTEGRACIONES (APIs EXTERNAS)

## GET /api/integraciones/config

Obtiene configuración de APIs externas:

* Google Maps
* YouTube
* Pagos

## POST /api/integraciones/pagos/checkout

Genera checkout de pago (modo demo).

Body:
{
"id_usuario": number,
"concepto": "string",
"monto": number
}

---

#  TECNOLOGÍAS

* Node.js + Express
* MySQL
* bcrypt (seguridad)
* nodemailer (emails)

---

#  OBSERVACIONES

✔ Se utilizan métodos GET, POST y PATCH
⚠ No hay endpoints DELETE
⚠ Uso parcial de REST

---

#  POSIBLES MEJORAS

* Agregar DELETE (ej: eliminar cliente)
* Agregar PUT para actualizaciones completas
* Implementar autenticación con tokens (JWT)
