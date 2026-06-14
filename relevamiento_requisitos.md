# Documento de Relevamiento de Requisitos: VerdeMov S.A.

Este documento consolida y estructura la información del relevamiento de requisitos para el sistema de gestión de flota de VerdeMov S.A.

---

## 📌 Resumen Ejecutivo del Proyecto
* **Presupuesto Estimado**: **$15,000 USD**
* **Usuarios Iniciales**: ~120 usuarios activos en total:
  * **80** Choferes (acceso con credenciales propias).
  * **10** Usuarios de Flota (Administradores).
  * **20** Personal de Taller.
  * **10** Administrativos.
* **Infraestructura**: Servidores propios (On-Premise).
* **Frecuencia de Feedback**: Revisión quincenal.

---

## 🚗 1. Gestión de Flota y Vehículos

### Datos y Estados de los Vehículos
- Se deben registrar todos los datos específicos del vehículo (patente, modelo, capacidad, etc.).
- Se deben distinguir todos los estados operativos del vehículo (En ruta, Cargando, Crítico/Fuera de servicio).
- **Indicadores de Desgaste**: Se requiere monitorear kilometraje, horas de uso y ciclos de carga de batería para determinar la necesidad de mantenimiento.

### Documentación Asociada
Se debe asociar y controlar el vencimiento de la siguiente documentación por vehículo:
1. **Seguro**
2. **VTV (Verificación Técnica Vehicular)**
3. **Patente**

> [!IMPORTANT]
> **Alertas de Vencimiento**:
> Las alertas deben ser editables por el usuario administrador de flota y seguir la siguiente escala de tiempo por defecto:
> * 🔴 **Alerta Roja**: 15 días antes del vencimiento.
> * 🟡 **Alerta Amarilla**: 30 días antes del vencimiento.
> * 🟢 **Alerta Verde**: 60 días antes del vencimiento.

---

## 📦 2. Hojas de Ruta (HDR) y Entregas

* **Asignación de Rutas**: Las rutas ya están preestablecidas por la empresa. Su asignación se realiza **manualmente según la disponibilidad del chofer**.
* **Optimización**: No se requiere optimización automática de rutas por tráfico o autonomía en esta fase.
* **Registro de Entregas**: Solo se requiere que los choferes rindan la Hoja de Ruta (HDR) al finalizar para registrar:
  * Kilómetros recorridos.
  * Gastos a rendir/devolver.
* **Protocolo ante Batería Agotada**: Si un vehículo se queda sin batería en ruta, el chofer debe **cerrar la HDR actual y crear una nueva Novedad** (incidencia).

---

## 🔧 3. Carga y Mantenimiento

* **Registro de Cargas**: Se debe registrar el historial de recargas detallando:
  * Hora de inicio y fin.
  * kWh cargados.
  * Costo de la sesión.
  * Estación/Punto de recarga (asociado a la creación de un movimiento).
* **Registro de Mantenimientos**: Registrar fecha, tipo de mantenimiento, costo, repuestos utilizados y taller donde se realizó.
* **Historial y Auditoría Completa**: El sistema debe mantener una auditoría de:
  * Movimientos del vehículo.
  * Historial de novedades.
  * Cubiertas asignadas.
  * Mantenimientos preventivos ejecutados.
  * Registro de choferes que utilizaron cada unidad.

---

## 📊 4. Reportes e Integración

* **Formatos de Exportación**: **Excel y PDF**.
* **Tipos de Reportes**:
  * Reportes de eficiencia energética (por vehículo, conductor y ruta).
  * Comparativas históricas e indicadores mensuales/anuales (benchmarking entre vehículos y conductores).
  * **Preferencia de Visualización**: El Gerente General requiere **tanto gráficos visuales como tablas detalladas**.
* **Integraciones**: No se requieren integraciones con sistemas externos (ERP, contabilidad, RRHH) por el momento.

---

## 🚀 5. Funcionalidad Crítica e Hitos de Entrega

1. **Prioridad Máxima (Urgente para empezar a operar)**:
   * **ABM de Flota** (Alta, Baja y Modificación de vehículos y datos de flota).
   * **Carga de Hojas de Ruta (HDR)**.
2. **Puntos de dolor actuales**: La lentitud y complejidad en la carga de Hojas de Ruta y la carga de vehículos de la flota.
