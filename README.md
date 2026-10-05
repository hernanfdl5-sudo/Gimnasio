# Gimnasio

App personal para registrar entrenamientos. HTML, CSS y JavaScript puros: no hay que instalar ni compilar nada.

## Archivos

- `index.html`: la página. Abrirla con doble clic en la PC, o publicarla para usarla en el celular.
- `data.js`: catálogo de ejercicios (nombre, zona, unidad, técnica, errores) y rutinas por defecto.
- `store.js`: guardado en `localStorage`, exportar/importar respaldo, utilidades de fecha.
- `animaciones.js`: muñequito de palitos por ejercicio (poses de inicio y fin en SVG).
- `app.js`: pantallas (Hoy, Rutinas, Historial, Ajustes) y lógica.
- `styles.css`, `manifest.json`, `sw.js`, `icon.png`: estilos y lo necesario para instalarla como app en Android.

## Cómo funciona

- **Hoy**: lista de días (Pecho y tríceps, Espalda y bíceps, Piernas) y otra actividad. La app marca "Te toca"
  según el objetivo semanal (2 pecho, 2 espalda, 1 piernas) y lo que ya hiciste. Tocar un día solo lo abre para mirar.
- **Día abierto**: grupos desplegables > partes > ejercicios. Tocar el nombre de una parte la abre. Dentro, los
  ejercicios vienen ordenados con los de la última vez primero. Tocar el nombre de un ejercicio muestra u oculta su
  técnica; el tilde de la derecha lo marca como "lo hago" y abre los bloques de series × reps × carga (botones +/−,
  "+ Más series", "Listo ✓" lo deja como hecho). Puede haber varios ejercicios por parte. La parte tiene su propio
  tilde de "completada": la cierra y abre la siguiente. La carga se elige en Kg o Discos y la app se acuerda por
  ejercicio. Las elecciones quedan guardadas como borrador por día (S.borradores[diaId]).
- **Listo, bestia** confirma que ese es el día de hoy y arranca el reloj. Mientras está en curso, el botón pasa a
  **Ya está, bestia**, que guarda la sesión (cada bloque se expande en series individuales) con hora de inicio y fin.
- **Rutinas**: editar zonas y opciones de cada día, catálogo con técnica, unidad por ejercicio y ejercicios propios.
- **Historial**: sesiones por semana con tiempo total.
- **Ajustes**: perfil, referencia de calorías (Mifflin-St Jeor), peso corporal, respaldo.

## Publicar para el celular

Subir la carpeta tal cual a cualquier hosting estático (GitHub Pages, Netlify, Cloudflare Pages).
Al abrir la URL en Chrome de Android: menú ⋮ > "Agregar a pantalla de inicio". Funciona sin internet después de la primera carga.

Para publicar cambios: subir `VERSION_APP` en `data.js` y `CACHE` en `sw.js`, y correr `deploy.ps1` (hace un solo commit con todo lo que cambió y pide la construcción de Pages). En el celular, tocar "Actualizar".
