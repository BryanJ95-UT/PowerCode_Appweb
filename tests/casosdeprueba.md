# Casos de Prueba - Power Code

## Objetivo

Validar las funcionalidades principales del sistema Power Code mediante pruebas manuales.

---

## TC-01 Registro de usuario

**Entrada:** Nombre, correo y contraseña válidos.  
**Resultado esperado:** Usuario registrado correctamente.

---

## TC-02 Inicio de sesión correcto

**Entrada:** Correo y contraseña válidos.  
**Resultado esperado:** Acceso al dashboard.

---

## TC-03 Inicio de sesión incorrecto

**Entrada:** Contraseña incorrecta.  
**Resultado esperado:** Mensaje de error.

---

## TC-04 Registro de asistencia

**Entrada:** Cliente autenticado registra asistencia.  
**Resultado esperado:** Asistencia guardada en base de datos.

---

## TC-05 Registro de pago

**Entrada:** Datos de pago válidos.  
**Resultado esperado:** Pago registrado correctamente.

---

## TC-06 Consulta de historial

**Entrada:** Cliente entra al módulo historial.  
**Resultado esperado:** Visualiza pagos y asistencias previas.

---

## TC-07 Visualización de rutinas

**Entrada:** Cliente entra a rutinas.  
**Resultado esperado:** Se muestran rutinas asignadas.

---

## TC-08 Validación de campos vacíos

**Entrada:** Formulario incompleto.  
**Resultado esperado:** Advertencia de campos requeridos.

---

## TC-09 Acceso sin autenticación

**Entrada:** Usuario entra manualmente a dashboard.  
**Resultado esperado:** Redirección al login.

---

## TC-10 Generación de reportes

**Entrada:** Administrador genera reporte.  
**Resultado esperado:** Reporte mostrado correctamente.