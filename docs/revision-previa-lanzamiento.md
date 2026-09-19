# Revisión previa al lanzamiento — 19 de septiembre de 2026

## Correcciones aplicadas

- Lecturas y escrituras limitadas al equipo asignado mediante políticas de base de datos, incluso en consultas directas a la API. El administrador global conserva su acceso.
- Una temporada activa por equipo. Activar una temporada ya no desactiva las de otros equipos; la interfaz actualiza también Temporadas y Partidos.
- Asignación de invitados mediante una función exclusiva del servidor que valida al invitador, el equipo y la cuenta invitada. Un reintento de asignación no vuelve a enviar el correo.
- Procesamiento del enlace de invitación incluso cuando el navegador conserva una sesión anterior. Destinos de invitación restringidos al dominio configurado o a direcciones locales de desarrollo.
- Verificación de seis dígitos protegida contra solicitudes simultáneas, con recuperación ante errores de conexión y botón para reintentar. La configuración elimina factores TOTP incompletos antes de volver a generar el QR.
- Goles y asistencias de otros jugadores protegidos por el permiso de consulta en la base de datos. La lista de nombres para registrar partidos se obtiene por separado. El Dashboard también respeta ese permiso para mostrar rendimiento individual.
- Edición de cifras propias para jugadores con membresía vigente; el administrador global conserva la edición. Poder ver otras estadísticas no concede permiso para editarlas.
- Ajustes de ancho para tablas y formularios. Inicio de sesión con nombre correcto, autocompletado y mensaje de error visible.

El historial de partidos del equipo sigue siendo compartido: sus resultados y participantes permiten deducir totales de partidos. El permiso de estadísticas protege las cifras individuales guardadas y su presentación, no oculta ese historial compartido.

## Verificación realizada

- `npm test`: 61 pruebas aprobadas.
- `npm run lint`: aprobado.
- `npm run build -- --webpack`: compilación de producción y TypeScript aprobados. La compilación con Turbopack encontró una restricción del entorno al abrir un puerto; no se ha validado ese compilador de producción en este entorno.
- Pruebas SQL en la base vinculada, con usuarios autenticados y fixtures dentro de transacciones que terminan con `ROLLBACK`: `prelaunch_access.sql`, `player_stat_visibility.sql` y `match_participants.sql`. Cubren aislamiento, permisos, invitaciones, MFA, temporadas y participaciones. No envían correos ni conservan datos de prueba.
- Inicio de sesión comprobado en navegador local a 390 y 768 píxeles, sin desbordamiento horizontal. Acceder a Partidos sin sesión redirige a inicio de sesión.

## Pendiente antes de publicar

1. Prueba completa con una invitación real y el autenticador del usuario: nombre, contraseña, alta 2FA, verificación automática, acceso al equipo correcto y nuevo inicio de sesión. Repetir en Safari de iPhone y iPad. La revisión visual por tamaño no equivale a probar esos dispositivos.
2. Elegir el dominio y configurar `NEXT_PUBLIC_APP_URL` con su origen HTTPS. Registrar el callback exacto `/auth/callback` en las URL de redirección autorizadas de Supabase y revisar Site URL. Para pruebas LAN, autorizar también el callback de la dirección local utilizada.
3. Revisar en Supabase la configuración de registro exclusivamente por invitación, recuperación de acceso y entrega de correo antes de abrir el servicio a usuarios reales.

La web no se ha publicado como parte de esta revisión.
