// Almacenamiento local (localStorage). Todo el estado de la app vive en un solo objeto.

const STORE_KEY = 'gimnasio.v1';

function estadoInicial() {
  return {
    version: 1,
    perfil: { altura: 182, peso: 88, edad: 24, sexo: 'm', objetivo: 'mantener', diasSemana: 5 },
    objetivoSemanal: Object.assign({}, OBJETIVO_SEMANAL_DEFAULT),
    // Ejercicios personalizados o modificados. Clave: id. Valor: campos que pisan al catálogo.
    ejercicios: {},
    dias: JSON.parse(JSON.stringify(DIAS_DEFAULT)),
    sesiones: [],
    enCurso: null,
    pesoCorporal: [],
  };
}

function cargarEstado() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return estadoInicial();
    const data = JSON.parse(raw);
    const estado = Object.assign(estadoInicial(), data);
    // Migración: versiones viejas de la rutina (con "slots") se reemplazan por la estructura nueva.
    if (!Array.isArray(estado.dias) || estado.dias.some(d => !Array.isArray(d.zonas))) {
      estado.dias = JSON.parse(JSON.stringify(DIAS_DEFAULT));
    }
    if (estado.enCurso && (!Array.isArray(estado.enCurso.zonas) || estado.enCurso.zonas.some(z => z.ejercicioId && !Array.isArray(z.bloques)))) estado.enCurso = null;
    return estado;
  } catch (e) {
    console.error('No se pudo leer el estado guardado', e);
    return estadoInicial();
  }
}

function guardarEstado(estado) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(estado));
  } catch (e) {
    console.error('No se pudo guardar', e);
    alert('No se pudo guardar. ¿El navegador está en modo incógnito?');
  }
}

function exportarEstado(estado) {
  const blob = new Blob([JSON.stringify(estado, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gimnasio-respaldo-' + hoyISO() + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importarEstado(archivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.sesiones)) throw new Error('El archivo no parece un respaldo de esta app.');
        resolve(Object.assign(estadoInicial(), data));
      } catch (e) { reject(e); }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(archivo);
  });
}

// ---------- utilidades de fecha ----------
function hoyISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Lunes de la semana a la que pertenece la fecha.
function lunesDe(iso) {
  const d = parseISO(iso);
  const dia = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - dia);
  return d;
}

function aISO(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function fechaCorta(iso) {
  const d = parseISO(iso);
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
}

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function fechaLarga(iso) {
  const d = parseISO(iso);
  const hoy = hoyISO();
  if (iso === hoy) return 'Hoy';
  const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
  if (iso === aISO(ayer)) return 'Ayer';
  return DIAS_SEMANA[(d.getDay() + 6) % 7] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()];
}

function diasEntre(isoA, isoB) {
  return Math.round((parseISO(isoB) - parseISO(isoA)) / 86400000);
}

function horaDe(ms) {
  const d = new Date(ms);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function fmtMin(min) {
  min = Math.round(min || 0);
  if (min < 60) return min + ' min';
  const h = Math.floor(min / 60), m = min % 60;
  return h + ' h' + (m ? ' ' + m + ' min' : '');
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
