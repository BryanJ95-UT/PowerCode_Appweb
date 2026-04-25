# CONTEXTO GENERAL DEL SISTEMA

## Proyecto: Power Code

## 1. Descripción General

Power Code es una plataforma web orientada a la administración de gimnasios y seguimiento deportivo. El sistema permite la interacción entre administradores, entrenadores y clientes mediante módulos especializados para gestión de usuarios, rutinas, dietas, pagos, asistencia, reportes y consultas deportivas.

Su propósito es digitalizar procesos tradicionales dentro de gimnasios e instituciones deportivas, mejorando la organización, comunicación y experiencia del usuario.

---

# 2. Requerimientos Funcionales (FR)

### FR-01 Registro de usuarios

El sistema permitirá registrar usuarios como administrador, cliente o entrenador.

### FR-02 Inicio de sesión

Los usuarios podrán iniciar sesión con correo y contraseña.

### FR-03 Confirmación por correo

El sistema enviará un correo electrónico para activar cuentas nuevas.

### FR-04 Gestión de clientes

El administrador podrá consultar, editar y administrar clientes registrados.

### FR-05 Gestión de entrenadores

El sistema permitirá asignar entrenadores y consultar su información.

### FR-06 Rutinas personalizadas

Los entrenadores podrán crear rutinas para clientes.

### FR-07 Dietas

Los entrenadores podrán asignar planes alimenticios.

### FR-08 Asistencia

Los clientes podrán registrar asistencia diaria.

### FR-09 Reportes

Los usuarios podrán enviar reportes o incidencias.

### FR-10 Pagos

El sistema permitirá gestionar pagos o membresías.

---

# 3. Requerimientos No Funcionales (NFR)

### NFR-01 Seguridad

Las contraseñas deberán almacenarse encriptadas con bcrypt.

### NFR-02 Disponibilidad

El sistema estará disponible en entorno web 24/7.

### NFR-03 Rendimiento

Las consultas deberán responder en tiempos adecuados.

### NFR-04 Escalabilidad

El sistema permitirá agregar nuevos módulos futuros.

### NFR-05 Usabilidad

La interfaz será clara, moderna y adaptable.

### NFR-06 Compatibilidad

Funcionará en navegadores modernos.

---

# 4. Reglas de Negocio (BR)

### BR-01

Todo usuario debe confirmar su cuenta por correo antes de iniciar sesión.

### BR-02

No se permitirá registrar correos duplicados.

### BR-03

Solo administradores pueden acceder al panel administrativo.

### BR-04

Solo entrenadores pueden crear rutinas y dietas.

### BR-05

Un cliente solo podrá registrar una asistencia por día.

### BR-06

Los pagos deberán estar asociados a un cliente.

---

# 5. Historias de Usuario (HU)

### HU-01 Cliente

Como cliente, quiero iniciar sesión para consultar mis rutinas y pagos.

### HU-02 Cliente

Como cliente, quiero registrar mi asistencia diaria para controlar mi progreso.

### HU-03 Entrenador

Como entrenador, quiero crear rutinas para mis clientes.

### HU-04 Entrenador

Como entrenador, quiero administrar dietas personalizadas.

### HU-05 Administrador

Como administrador, quiero visualizar estadísticas generales del sistema.

### HU-06 Administrador

Como administrador, quiero responder reportes enviados por usuarios.

---

# 6. Requerimientos de Usuario (UR)

### UR-01

El usuario desea registrarse fácilmente.

### UR-02

El usuario desea una plataforma rápida y sencilla.

### UR-03

El cliente desea consultar su progreso.

### UR-04

El entrenador desea administrar varios clientes.

### UR-05

El administrador desea controlar todo el sistema desde un panel central.

---

# 7. Problema que Resuelve

Muchos gimnasios administran clientes, pagos y rutinas manualmente. Esto provoca errores, pérdida de información y mala organización. Power Code centraliza todos los procesos en una sola plataforma digital.

---

# 8. Solución Propuesta

Implementar una aplicación web moderna con Node.js, MySQL y frontend responsivo que permita administrar procesos deportivos de forma eficiente.
