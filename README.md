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

- **Hoy**: elegís el día (Pecho y tríceps, Espalda y bíceps, Piernas) u otra actividad. La app sugiere el que
  más te falta según el objetivo semanal (2 pecho, 2 espalda, 1 piernas) y lo que ya hiciste.
- **Sesión**: cada día tiene grupos desplegables y, dentro, zonas. En cada zona elegís un ejercicio y cargás
  bloques de series × reps × peso con botones de más y menos ("+ Más series" agrega otro bloque, por ejemplo
  1×8 con 10 kg de calentamiento y 3×6 con 40 kg). Al guardar, cada bloque se expande en series individuales.
  Se marca la hora de inicio al elegir el día y la de fin al tocar "Listo, bestia".
- **Rutinas**: editar zonas y opciones de cada día, catálogo con técnica, unidad por ejercicio y ejercicios propios.
- **Historial**: sesiones por semana con tiempo total.
- **Ajustes**: perfil, referencia de calorías (Mifflin-St Jeor), peso corporal, respaldo.

## Publicar para el celular

Subir la carpeta tal cual a cualquier hosting estático (GitHub Pages, Netlify, Cloudflare Pages).
Al abrir la URL en Chrome de Android: menú ⋮ > "Agregar a pantalla de inicio". Funciona sin internet después de la primera carga.

Si se cambia algún archivo, subir la carpeta de nuevo y cambiar el número de `CACHE` en `sw.js` para que el celular tome la versión nueva.
