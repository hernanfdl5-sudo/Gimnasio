// Lógica de la app. Render con plantillas de texto y delegación de eventos.

let S = cargarEstado();

// Estado de la interfaz (no se guarda).
const V = {
  tab: 'hoy',
  otraActividad: null,     // {actividad, duracion, nota, fecha} cuando está abierto el formulario
  rutinas: { diaId: null, catalogo: false, ejercicioId: null, nuevo: null, busqueda: '' },
  hist: { abierto: null, filtro: 'todo' },
  picker: null,            // { titulo, grupo, busqueda, onPick(id), excluir:[] }
};

function save() { guardarEstado(S); }

// ---------- helpers ----------
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function ej(id) {
  const base = CATALOGO.find(e => e.id === id);
  const extra = S.ejercicios[id];
  if (!base && !extra) return { id, nombre: '(ejercicio eliminado)', grupo: 'pecho', zona: '', unidad: 'kg', tecnica: [], errores: [] };
  return Object.assign({}, base || {}, extra || {});
}

function todosEjercicios() {
  const ids = new Set(CATALOGO.map(e => e.id));
  Object.keys(S.ejercicios).forEach(id => ids.add(id));
  return [...ids].map(ej).filter(e => !e.eliminado);
}

function unidadCorta(e) { return (UNIDADES[e.unidad] || UNIDADES.kg).corto; }

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('visible'), 2200);
}

function hablar(texto) {
  if (!('speechSynthesis' in window)) { alert('Este navegador no tiene voz.'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = 'es-AR';
  const voces = speechSynthesis.getVoices();
  const v = voces.find(x => x.lang === 'es-AR') || voces.find(x => x.lang && x.lang.startsWith('es'));
  if (v) u.voice = v;
  u.rate = 1;
  speechSynthesis.speak(u);
}

function textoTecnica(e) {
  let t = e.nombre + '. ';
  (e.tecnica || []).forEach(p => t += p + ' ');
  if ((e.errores || []).length) t += 'Errores comunes: ' + e.errores.join(' ');
  return t;
}

function urlVideo(e) {
  return 'https://www.youtube.com/results?search_query=' + encodeURIComponent((e.tecnico || e.nombre) + ' técnica correcta');
}

// ---------- consultas sobre sesiones ----------
function sesionesGym() { return S.sesiones.filter(s => s.tipo === 'gym'); }

function sesionesSemana(iso) {
  const lunes = lunesDe(iso);
  const dom = new Date(lunes); dom.setDate(dom.getDate() + 6);
  const a = aISO(lunes), b = aISO(dom);
  return S.sesiones.filter(s => s.fecha >= a && s.fecha <= b);
}

function grupoDeDia(diaId) {
  const d = S.dias.find(x => x.id === diaId);
  return d ? d.grupo : null;
}

function ultimaSesionDeGrupo(grupo) {
  return sesionesGym().filter(s => grupoDeDia(s.diaId) === grupo).sort((a, b) => b.fecha.localeCompare(a.fecha))[0] || null;
}

function ultimaSesionDeDia(diaId) {
  return sesionesGym().filter(s => s.diaId === diaId).sort((a, b) => b.fecha.localeCompare(a.fecha))[0] || null;
}

// Última vez que se hizo este ejercicio (cualquier día). Devuelve {fecha, series}.
function ultimaVezEjercicio(ejercicioId) {
  const ses = sesionesGym().slice().sort((a, b) => b.fecha.localeCompare(a.fecha));
  for (const s of ses) {
    const e = s.ejercicios.find(x => x.ejercicioId === ejercicioId);
    if (e && e.series.length) return { fecha: s.fecha, series: e.series };
  }
  return null;
}

function historialEjercicio(ejercicioId, n) {
  const out = [];
  const ses = sesionesGym().slice().sort((a, b) => b.fecha.localeCompare(a.fecha));
  for (const s of ses) {
    const e = s.ejercicios.find(x => x.ejercicioId === ejercicioId);
    if (e && e.series.length) out.push({ fecha: s.fecha, series: e.series });
    if (out.length >= n) break;
  }
  return out;
}

function mejorMarca(ejercicioId) {
  let mejor = null;
  sesionesGym().forEach(s => {
    const e = s.ejercicios.find(x => x.ejercicioId === ejercicioId);
    if (!e) return;
    e.series.forEach(sr => {
      const p = Number(sr.peso) || 0;
      if (!mejor || p > mejor.peso || (p === mejor.peso && sr.reps > mejor.reps)) mejor = { peso: p, reps: sr.reps, fecha: s.fecha };
    });
  });
  return mejor;
}

// Sugerencia de qué entrenar hoy.
function sugerencia() {
  const hoy = hoyISO();
  const semana = sesionesSemana(hoy).filter(s => s.tipo === 'gym');
  const grupos = Object.keys(S.objetivoSemanal);
  const hechos = {};
  grupos.forEach(g => hechos[g] = semana.filter(s => grupoDeDia(s.diaId) === g).length);
  const restantes = grupos.map(g => ({ g, r: S.objetivoSemanal[g] - hechos[g] }));
  let cand = restantes.filter(x => x.r > 0);
  if (!cand.length) cand = restantes; // semana cumplida: se sigue rotando igual
  const antiguedad = g => { const u = ultimaSesionDeGrupo(g); return u ? diasEntre(u.fecha, hoy) : 9999; };
  cand.sort((a, b) => (b.r - a.r) || (antiguedad(b.g) - antiguedad(a.g)));
  const grupo = cand[0].g;
  const dias = S.dias.filter(d => d.grupo === grupo);
  if (!dias.length) return null;
  const antDia = d => { const u = ultimaSesionDeDia(d.id); return u ? diasEntre(u.fecha, hoy) : 9999; };
  dias.sort((a, b) => antDia(b) - antDia(a));
  const motivo = grupos.map(g => GRUPOS[g] + ' ' + hechos[g] + '/' + S.objetivoSemanal[g]).join(' · ');
  return { diaId: dias[0].id, motivo, hechos };
}

// ---------- sesión en curso ----------
function iniciarSesion(diaId) {
  const dia = S.dias.find(d => d.id === diaId);
  if (!dia) return;
  const zonas = dia.zonas.map(z => ({ zonaId: z.id, grupo: z.grupo, zona: z.zona, ejercicioId: null, series: [], nota: '', tecnica: false }));
  const grupos = gruposDeDia(dia);
  S.enCurso = { diaId, nombreDia: dia.nombre, fecha: hoyISO(), inicio: Date.now(), zonas, grupoAbierto: grupos[0] || null };
  save();
  V.tab = 'hoy';
  render();
  window.scrollTo(0, 0);
}

// Grupos (secciones) de un día, en orden: primero los declarados, después cualquier otro que aparezca en sus zonas.
function gruposDeDia(dia) {
  const out = [];
  (dia.grupos || []).forEach(g => { if (dia.zonas.some(z => z.grupo === g) && !out.includes(g)) out.push(g); });
  dia.zonas.forEach(z => { if (!out.includes(z.grupo)) out.push(z.grupo); });
  return out;
}

// Qué ejercicio se eligió la última vez en esta zona de este día.
function ultimaEleccion(diaId, zonaId) {
  const previa = ultimaSesionDeDia(diaId);
  if (!previa) return null;
  const p = previa.ejercicios.find(x => x.zonaId === zonaId);
  return p ? p.ejercicioId : null;
}

function elegirEjercicioZona(i, ejercicioId) {
  const z = S.enCurso.zonas[i];
  z.ejercicioId = ejercicioId;
  z.bloques = bloquesIniciales(ejercicioId);
  z.tecnica = false;
}

// Agrupa series iguales consecutivas en bloques: [{series, reps, peso}].
function aBloques(series) {
  const out = [];
  series.forEach(s => {
    const ult = out[out.length - 1];
    if (ult && ult.reps === s.reps && ult.peso === s.peso) ult.series++;
    else out.push({ series: 1, reps: s.reps, peso: s.peso });
  });
  return out;
}

function bloquesIniciales(ejercicioId) {
  if (!ejercicioId) return [];
  const u = ultimaVezEjercicio(ejercicioId);
  if (u) return aBloques(u.series).map(b => ({ series: b.series, reps: b.reps, peso: b.peso }));
  return [{ series: 3, reps: 10, peso: 0 }];
}

function fmtBloque(b, e) {
  const u = e.unidad === 'corporal' ? (Number(b.peso) ? ' +' + b.peso : '') : ' ' + b.peso + ' ' + unidadCorta(e);
  return b.series + '×' + b.reps + u;
}

function fmtSeries(series, e) {
  return aBloques(series).map(b => fmtBloque(b, e)).join(' · ');
}

// Cuánto suma o resta el botón de peso según el ejercicio.
function pasoPeso(e) {
  if (e.unidad === 'kg' && /barra/i.test(e.equipo || '')) return 2.5;
  if (e.unidad === 'kg' || e.unidad === 'corporal') return 2;
  return 1;
}

function terminarSesion() {
  const c = S.enCurso;
  const ejercicios = c.zonas.map(z => {
    const series = [];
    (z.bloques || []).forEach(b => {
      const n = Number(b.series) || 0, reps = Number(b.reps) || 0, peso = Number(String(b.peso).replace(',', '.')) || 0;
      if (n > 0 && reps > 0) for (let k = 0; k < n; k++) series.push({ peso, reps });
    });
    return { zonaId: z.zonaId, ejercicioId: z.ejercicioId, nota: z.nota || '', series };
  }).filter(e => e.ejercicioId && e.series.length);
  if (!ejercicios.length && !confirm('No cargaste ninguna serie. ¿Guardar la sesión vacía igual?')) return;
  const fin = Date.now();
  const inicio = c.inicio || fin;
  const duracionMin = Math.max(1, Math.round((fin - inicio) / 60000));
  S.sesiones.push({ id: uid(), tipo: 'gym', fecha: c.fecha, diaId: c.diaId, nombreDia: c.nombreDia, ejercicios, duracionMin, horaInicio: horaDe(inicio), horaFin: horaDe(fin) });
  S.enCurso = null;
  save();
  toast('Guardado. ¡Bien ahí, bestia!');
  render();
  window.scrollTo(0, 0);
}

// ---------- render raíz ----------
function render() {
  const app = document.getElementById('app');
  let html = '';
  if (V.tab === 'hoy') html = S.enCurso ? vistaSesion() : vistaHoy();
  else if (V.tab === 'rutinas') html = vistaRutinas();
  else if (V.tab === 'historial') html = vistaHistorial();
  else if (V.tab === 'ajustes') html = vistaAjustes();
  app.innerHTML = html + (V.picker ? vistaPicker() : '');
  document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('activo', b.dataset.tab === V.tab));
  document.body.classList.toggle('con-modal', !!V.picker);
  if (typeof montarAnimaciones === 'function') montarAnimaciones();
}

// ---------- HOY ----------
function vistaHoy() {
  const hoy = hoyISO();
  const sug = sugerencia();
  const lunes = lunesDe(hoy);
  const semana = sesionesSemana(hoy);
  let strip = '<div class="semana">';
  for (let i = 0; i < 7; i++) {
    const d = new Date(lunes); d.setDate(d.getDate() + i);
    const iso = aISO(d);
    const ses = semana.filter(s => s.fecha === iso);
    const etiqueta = ses.map(s => s.tipo === 'gym' ? GRUPOS[grupoDeDia(s.diaId)] || 'Gym' : s.actividad).map(x => (x || '?')[0]).join('');
    strip += `<div class="semana-dia ${iso === hoy ? 'hoy' : ''} ${ses.length ? 'hecho' : ''}"><span>${DIAS_SEMANA[i]}</span><b>${esc(etiqueta) || '·'}</b></div>`;
  }
  strip += '</div>';

  const diasHtml = S.dias.map(d => {
    const u = ultimaSesionDeDia(d.id);
    const esSug = sug && sug.diaId === d.id;
    return `<button class="card dia-card ${esSug ? 'sugerido' : ''}" data-action="iniciar" data-dia="${d.id}">
      <div><div class="titulo">${esc(d.nombre)}</div>
      <div class="sub">${gruposDeDia(d).map(g => GRUPOS[g]).join(', ')} · ${u ? 'última vez ' + fechaCorta(u.fecha) : 'nunca hecho'}</div></div>
      <div class="chip ${esSug ? 'chip-acento' : ''}">${esSug ? 'Te toca' : 'Empezar'}</div>
    </button>`;
  }).join('');

  const otra = V.otraActividad ? formOtraActividad() : `<button class="card dia-card" data-action="abrir-otra"><div><div class="titulo">Otra actividad</div><div class="sub">Pádel, boxeo, natación...</div></div><div class="chip">Anotar</div></button>`;

  const ult = S.sesiones.slice().sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  const ultHtml = ult ? `<p class="nota-pie">Última: ${fechaLarga(ult.fecha)}, ${esc(ult.tipo === 'gym' ? ult.nombreDia : ult.actividad)}.</p>` : '<p class="nota-pie">Todavía no registraste nada. Empezá por el día que te toca.</p>';

  return `<header class="encabezado"><h1>¿Qué hacés hoy?</h1><div class="fecha">${fechaLarga(hoy)}</div></header>
    ${strip}
    ${sug ? `<p class="motivo">Esta semana: ${esc(sug.motivo)} · ${fmtMin(semana.filter(s => s.tipo === 'gym').reduce((n, s) => n + (s.duracionMin || 0), 0))} de gym</p>` : ''}
    ${diasHtml}
    ${otra}
    ${ultHtml}`;
}

function formOtraActividad() {
  const o = V.otraActividad;
  const chips = ACTIVIDADES.map(a => `<button class="chip ${o.actividad === a ? 'chip-acento' : ''}" data-action="otra-act" data-val="${esc(a)}">${esc(a)}</button>`).join('');
  return `<div class="card">
    <div class="titulo">Otra actividad</div>
    <div class="chips">${chips}</div>
    ${o.actividad === 'Otra' ? `<label>¿Cuál?<input type="text" data-campo-otra="nombre" value="${esc(o.nombre || '')}" placeholder="Nombre de la actividad"></label>` : ''}
    <div class="fila">
      <label>Fecha<input type="date" data-campo-otra="fecha" value="${o.fecha}"></label>
      <label>Minutos<input type="number" inputmode="numeric" data-campo-otra="duracion" value="${esc(o.duracion)}" placeholder="60"></label>
    </div>
    <label>Nota<input type="text" data-campo-otra="nota" value="${esc(o.nota)}" placeholder="Opcional"></label>
    <div class="fila">
      <button class="btn secundario" data-action="cerrar-otra">Cancelar</button>
      <button class="btn" data-action="guardar-otra">Guardar</button>
    </div>
  </div>`;
}

// ---------- SESIÓN ----------
function vistaSesion() {
  const c = S.enCurso;
  const dia = S.dias.find(d => d.id === c.diaId) || { grupos: [], zonas: [] };
  const grupos = [];
  gruposDeDia(dia).forEach(g => grupos.push(g));
  c.zonas.forEach(z => { if (!grupos.includes(z.grupo)) grupos.push(z.grupo); });
  const previa = ultimaSesionDeDia(c.diaId);
  const elegidos = c.zonas.filter(z => z.ejercicioId).length;

  const secciones = grupos.map(g => {
    const idx = c.zonas.map((z, i) => z.grupo === g ? i : -1).filter(i => i >= 0);
    if (!idx.length) return '';
    const elegidas = idx.filter(i => c.zonas[i].ejercicioId).length;
    const abierto = c.grupoAbierto === g;
    const puedeRepetir = previa && idx.some(i => { const p = previa.ejercicios.find(x => x.zonaId === c.zonas[i].zonaId); return p && !c.zonas[i].ejercicioId; });
    return `<button class="card grupo-cab ${abierto ? 'abierto' : ''}" data-action="toggle-grupo" data-g="${g}">
        <span class="titulo">${esc(GRUPOS[g] || g)}</span>
        <span class="sub">${elegidas}/${idx.length} zonas ${abierto ? '▲' : '▼'}</span>
      </button>
      ${abierto ? (puedeRepetir ? `<button class="link repetir" data-action="repetir-ultima" data-g="${g}">Repetir lo de la última vez (${fechaCorta(previa.fecha)})</button>` : '') + idx.map(i => cardZona(c.zonas[i], i)).join('') : ''}`;
  }).join('');

  const transcurrido = Math.round((Date.now() - (c.inicio || Date.now())) / 60000);
  return `<header class="encabezado sesion-top">
      <div><h1>${esc(c.nombreDia)}</h1><div class="fecha">Empezaste ${horaDe(c.inicio || Date.now())} · <span id="transcurrido">${fmtMin(transcurrido)}</span> · ${elegidos} ejercicios</div></div>
    </header>
    ${secciones}
    <div class="fila fin-sesion">
      <button class="btn secundario" data-action="cancelar-sesion">Cancelar</button>
      <button class="btn" data-action="terminar-sesion">Listo, bestia 💪</button>
    </div>`;
}

function cardZona(z, i) {
  const dia = S.dias.find(d => d.id === S.enCurso.diaId);
  const def = dia && dia.zonas.find(x => x.id === z.zonaId);
  const opciones = def ? def.opciones.slice() : [];
  const ultimaId = ultimaEleccion(S.enCurso.diaId, z.zonaId);

  // Zona sin ejercicio elegido: se muestran las opciones.
  if (!z.ejercicioId) {
    const lista = opciones.map(id => {
      const o = ej(id);
      const u = ultimaVezEjercicio(id);
      return `<button class="opcion ${id === ultimaId ? 'activa' : ''}" data-action="elegir-ejercicio" data-i="${i}" data-id="${id}">
        <span>${esc(o.nombre)}${o.evitar ? ' <span class="aviso">evitar</span>' : ''}${id === ultimaId ? ' <span class="tag">última vez</span>' : ''}</span>
        <small>${u ? 'Última vez: ' + fmtSeries(u.series, o) : 'Nunca hecho'}</small></button>`;
    }).join('');
    return `<div class="card zona-card">
      <div class="zona">${esc(z.zona)}</div>
      <div class="opciones">${lista}
        <button class="opcion tenue" data-action="buscar-ejercicio-zona" data-i="${i}"><span>Buscar otro en el catálogo…</span></button>
      </div>
    </div>`;
  }

  const e = ej(z.ejercicioId);
  const u = e.unidad === 'corporal' ? '+kg' : unidadCorta(e);
  const ultima = ultimaVezEjercicio(e.id);
  const ultimaHtml = ultima ? `<div class="sub">Última vez (${fechaCorta(ultima.fecha)}): ${fmtSeries(ultima.series, e)}</div>` : '';

  const stepper = (k, campo, valor, etiqueta) => `<div class="stepper">
      <span class="etq">${etiqueta}</span>
      <div class="ctrl">
        <button data-action="bloque-step" data-i="${i}" data-k="${k}" data-campo="${campo}" data-dir="-1" aria-label="Menos">−</button>
        <input type="text" inputmode="decimal" data-zona="${i}" data-bloque="${k}" data-campo="${campo}" value="${esc(valor)}">
        <button data-action="bloque-step" data-i="${i}" data-k="${k}" data-campo="${campo}" data-dir="1" aria-label="Más">+</button>
      </div>
    </div>`;
  const bloques = (z.bloques || []).map((b, k) => `<div class="bloque">
      ${stepper(k, 'series', b.series, 'Series')}
      <span class="x">×</span>
      ${stepper(k, 'reps', b.reps, 'Reps')}
      ${stepper(k, 'peso', b.peso, u)}
      <button class="quitar-bloque" data-action="quitar-bloque" data-i="${i}" data-k="${k}" aria-label="Quitar">×</button>
    </div>`).join('');

  const tecnica = z.tecnica ? `<div class="tecnica">
      ${animacionDe(e.id) ? `<div class="anim" data-anim="${e.id}"></div>` : ''}
      <ol>${(e.tecnica || []).map(p => `<li>${esc(p)}</li>`).join('')}</ol>
      ${(e.errores || []).length ? `<div class="errores"><b>Errores comunes</b><ul>${e.errores.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>` : ''}
      <div class="fila">
        <button class="btn secundario chico" data-action="hablar" data-id="${e.id}">🔊 Escuchar</button>
        <a class="btn secundario chico" href="${urlVideo(e)}" target="_blank" rel="noopener">▶ Video</a>
      </div>
    </div>` : '';

  return `<div class="card zona-card elegida">
    <div class="zona">${esc(z.zona)} ✓</div>
    <div class="slot-cab">
      <div class="titulo">${esc(e.nombre)}${e.evitar ? ' <span class="aviso">evitar</span>' : ''}</div>
      <div class="acciones">
        <button class="link" data-action="toggle-tecnica" data-i="${i}">${z.tecnica ? 'Ocultar' : 'Técnica'}</button>
        <button class="link" data-action="cambiar-ejercicio" data-i="${i}">Cambiar</button>
      </div>
    </div>
    ${tecnica}
    ${ultimaHtml}
    <div class="bloques">${bloques}</div>
    <button class="btn secundario chico ancho" data-action="agregar-bloque" data-i="${i}">+ Más series</button>
    <input class="nota" type="text" data-zona="${i}" data-campo="nota" value="${esc(z.nota || '')}" placeholder="Nota (opcional)">
  </div>`;
}

// ---------- RUTINAS ----------
function vistaRutinas() {
  const r = V.rutinas;
  if (r.nuevo) return formNuevoEjercicio();
  if (r.ejercicioId) return vistaEjercicio(r.ejercicioId);
  if (r.catalogo) return vistaCatalogo();
  if (r.diaId) return vistaDia(r.diaId);

  const dias = S.dias.map(d => `<button class="card dia-card" data-action="abrir-dia" data-dia="${d.id}">
      <div><div class="titulo">${esc(d.nombre)}</div><div class="sub">${gruposDeDia(d).map(g => GRUPOS[g]).join(', ')} · ${d.zonas.length} zonas</div></div>
      <div class="chip">Editar</div></button>`).join('');
  return `<header class="encabezado"><h1>Rutinas</h1><div class="fecha">Cada día tiene grupos con zonas a cubrir. En cada zona elegís uno de los ejercicios.</div></header>
    ${dias}
    <button class="card dia-card" data-action="abrir-catalogo"><div><div class="titulo">Catálogo de ejercicios</div><div class="sub">${todosEjercicios().length} ejercicios · técnica, unidad, historial</div></div><div class="chip">Ver</div></button>
    <button class="btn secundario" data-action="nuevo-dia">+ Agregar día</button>`;
}

function vistaDia(diaId) {
  const d = S.dias.find(x => x.id === diaId);
  if (!d) { V.rutinas.diaId = null; return vistaRutinas(); }
  const zonasTodas = Object.keys(ZONAS).flatMap(g => ZONAS[g].map(z => ({ g, z })));
  const grupos = gruposDeDia(d);
  const secciones = grupos.map(g => {
    const zonas = d.zonas.map((z, i) => ({ z, i })).filter(x => x.z.grupo === g);
    const cards = zonas.map(({ z, i }) => `<div class="card">
      <div class="fila entre">
        <select data-zona-sel="${i}">${zonasTodas.map(o => `<option value="${o.g}|${esc(o.z)}" ${o.z === z.zona && o.g === z.grupo ? 'selected' : ''}>${esc(GRUPOS[o.g])}: ${esc(o.z)}</option>`).join('')}</select>
        <button class="link peligro" data-action="quitar-zona" data-i="${i}">Quitar</button>
      </div>
      <div class="chips">
        ${z.opciones.map(id => { const e = ej(id); return `<span class="chip chip-opcion"><button class="link" data-action="ver-ejercicio" data-id="${id}">${esc(e.nombre)}</button><button class="quitar" data-action="quitar-opcion" data-i="${i}" data-id="${id}" aria-label="Quitar">×</button></span>`; }).join('')}
        <button class="chip chip-acento" data-action="agregar-opcion" data-i="${i}">+ opción</button>
      </div>
      <div class="fila chica">
        <button class="link" data-action="mover-zona" data-i="${i}" data-dir="-1">↑</button>
        <button class="link" data-action="mover-zona" data-i="${i}" data-dir="1">↓</button>
      </div>
    </div>`).join('');
    return `<h2>${esc(GRUPOS[g] || g)}</h2>${cards}`;
  }).join('');
  return `<header class="encabezado"><button class="link" data-action="volver-rutinas">← Rutinas</button>
      <input class="titulo-input" type="text" data-dia-nombre="${d.id}" value="${esc(d.nombre)}">
      <label class="inline">Cuenta como
        <select data-dia-grupo="${d.id}">${['pecho', 'espalda', 'piernas'].map(g => `<option value="${g}" ${g === d.grupo ? 'selected' : ''}>${GRUPOS[g]}</option>`).join('')}</select>
      </label>
      <div class="sub">Para el objetivo semanal. Las secciones se arman solas según las zonas que agregues.</div>
    </header>
    ${secciones}
    <button class="btn secundario" data-action="agregar-zona" data-dia="${d.id}">+ Agregar zona</button>
    <button class="btn peligro-borde" data-action="borrar-dia" data-dia="${d.id}">Borrar este día</button>`;
}

function vistaCatalogo() {
  const q = V.rutinas.busqueda.trim().toLowerCase();
  const lista = todosEjercicios().filter(e => !q || (e.nombre + ' ' + (e.tecnico || '') + ' ' + e.zona).toLowerCase().includes(q));
  let html = '';
  Object.keys(GRUPOS).forEach(g => {
    const del = lista.filter(e => e.grupo === g);
    if (!del.length) return;
    html += `<h2>${GRUPOS[g]}</h2>`;
    (ZONAS[g] || []).concat(['otra']).forEach(z => {
      const dz = del.filter(e => z === 'otra' ? !ZONAS[g].includes(e.zona) : e.zona === z);
      if (!dz.length) return;
      html += `<div class="zona">${esc(z === 'otra' ? 'Otras zonas' : z)}</div>`;
      html += dz.map(e => `<button class="card fila-ej" data-action="ver-ejercicio" data-id="${e.id}"><span>${esc(e.nombre)}${e.evitar ? ' <span class="aviso">evitar</span>' : ''}</span><small>${unidadCorta(e)}</small></button>`).join('');
    });
  });
  return `<header class="encabezado"><button class="link" data-action="volver-rutinas">← Rutinas</button><h1>Catálogo</h1>
      <input type="search" data-busqueda="catalogo" value="${esc(V.rutinas.busqueda)}" placeholder="Buscar ejercicio o zona">
    </header>
    <button class="btn secundario" data-action="nuevo-ejercicio">+ Nuevo ejercicio</button>
    ${html || '<p class="nota-pie">Nada con ese nombre.</p>'}`;
}

function vistaEjercicio(id) {
  const e = ej(id);
  const hist = historialEjercicio(id, 10);
  const mejor = mejorMarca(id);
  const histHtml = hist.length ? hist.map(h => `<div class="hist-fila"><span>${fechaCorta(h.fecha)}</span><span>${fmtSeries(h.series, e)}</span></div>`).join('') : '<p class="sub">Todavía no lo hiciste.</p>';
  return `<header class="encabezado"><button class="link" data-action="cerrar-ejercicio">← Volver</button>
      <h1>${esc(e.nombre)}</h1><div class="fecha">${esc(e.tecnico || '')}</div></header>
    <div class="card">
      <div class="sub">${esc(GRUPOS[e.grupo] || '')} · ${esc(e.zona)}${e.equipo ? ' · ' + esc(e.equipo) : ''}</div>
      <div class="fila">
        <label>Unidad<select data-ej-unidad="${e.id}">${Object.keys(UNIDADES).map(u => `<option value="${u}" ${u === e.unidad ? 'selected' : ''}>${UNIDADES[u].label}</option>`).join('')}</select></label>
        <label class="check-label"><input type="checkbox" data-ej-evitar="${e.id}" ${e.evitar ? 'checked' : ''}> Evitar por ahora (lesión)</label>
      </div>
    </div>
    <div class="card">
      <div class="titulo">Cómo se hace</div>
      ${animacionDe(e.id) ? `<div class="anim" data-anim="${e.id}"></div>` : ''}
      <ol>${(e.tecnica || []).map(p => `<li>${esc(p)}</li>`).join('')}</ol>
      ${(e.errores || []).length ? `<div class="errores"><b>Errores comunes</b><ul>${e.errores.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>` : ''}
      <div class="fila">
        <button class="btn secundario chico" data-action="hablar" data-id="${e.id}">🔊 Escuchar</button>
        <a class="btn secundario chico" href="${urlVideo(e)}" target="_blank" rel="noopener">▶ Video</a>
      </div>
    </div>
    <div class="card">
      <div class="titulo">Historial</div>
      ${mejor ? `<div class="sub">Mejor marca: ${mejor.peso} ${unidadCorta(e)} × ${mejor.reps} (${fechaCorta(mejor.fecha)})</div>` : ''}
      ${histHtml}
    </div>
    ${e.personalizado ? `<button class="btn peligro-borde" data-action="borrar-ejercicio" data-id="${e.id}">Borrar ejercicio</button>` : ''}`;
}

function formNuevoEjercicio() {
  const n = V.rutinas.nuevo;
  const zonas = ZONAS[n.grupo] || [];
  if (!zonas.includes(n.zona)) n.zona = zonas[0] || '';
  return `<header class="encabezado"><button class="link" data-action="cancelar-nuevo">← Cancelar</button><h1>Nuevo ejercicio</h1></header>
    <div class="card">
      <label>Nombre<input type="text" data-nuevo="nombre" value="${esc(n.nombre)}" placeholder="Como le decís vos"></label>
      <label>Grupo<select data-nuevo="grupo">${Object.keys(GRUPOS).map(g => `<option value="${g}" ${g === n.grupo ? 'selected' : ''}>${GRUPOS[g]}</option>`).join('')}</select></label>
      <label>Zona<select data-nuevo="zona">${zonas.map(z => `<option value="${esc(z)}" ${z === n.zona ? 'selected' : ''}>${esc(z)}</option>`).join('')}</select></label>
      <label>Unidad<select data-nuevo="unidad">${Object.keys(UNIDADES).map(u => `<option value="${u}" ${u === n.unidad ? 'selected' : ''}>${UNIDADES[u].label}</option>`).join('')}</select></label>
      <label>Equipo<input type="text" data-nuevo="equipo" value="${esc(n.equipo)}" placeholder="Máquina, mancuernas..."></label>
      <label>Cómo se hace (un paso por línea)<textarea rows="4" data-nuevo="tecnica">${esc(n.tecnica)}</textarea></label>
      <label>Errores comunes (uno por línea)<textarea rows="3" data-nuevo="errores">${esc(n.errores)}</textarea></label>
      <button class="btn" data-action="guardar-nuevo">Guardar ejercicio</button>
    </div>`;
}

// ---------- PICKER (modal para elegir ejercicio del catálogo) ----------
function vistaPicker() {
  const p = V.picker;
  const q = (p.busqueda || '').trim().toLowerCase();
  let lista = todosEjercicios().filter(e => !(p.excluir || []).includes(e.id));
  if (p.grupo) lista = lista.filter(e => e.grupo === p.grupo);
  if (q) lista = lista.filter(e => (e.nombre + ' ' + (e.tecnico || '') + ' ' + e.zona).toLowerCase().includes(q));
  const grupos = ['', ...Object.keys(GRUPOS)];
  const filtros = grupos.map(g => `<button class="chip ${p.grupo === g ? 'chip-acento' : ''}" data-action="picker-grupo" data-val="${g}">${g ? GRUPOS[g] : 'Todos'}</button>`).join('');
  const items = lista.map(e => `<button class="card fila-ej" data-action="picker-elegir" data-id="${e.id}"><span>${esc(e.nombre)}</span><small>${esc(e.zona)}</small></button>`).join('');
  return `<div class="modal-fondo" data-action="picker-cerrar"></div>
    <div class="modal">
      <div class="fila entre"><b>${esc(p.titulo)}</b><button class="link" data-action="picker-cerrar">Cerrar</button></div>
      <input type="search" data-busqueda="picker" value="${esc(p.busqueda || '')}" placeholder="Buscar" autofocus>
      <div class="chips">${filtros}</div>
      <div class="modal-lista">${items || '<p class="sub">Nada.</p>'}</div>
    </div>`;
}

function abrirPicker(titulo, grupo, excluir, onPick) {
  V.picker = { titulo, grupo: grupo || '', busqueda: '', excluir: excluir || [], onPick };
  render();
}

// ---------- HISTORIAL ----------
function vistaHistorial() {
  const f = V.hist.filtro;
  let ses = S.sesiones.slice().sort((a, b) => b.fecha.localeCompare(a.fecha) || (b.id > a.id ? 1 : -1));
  if (f === 'gym') ses = ses.filter(s => s.tipo === 'gym');
  if (f === 'otras') ses = ses.filter(s => s.tipo !== 'gym');
  const filtros = [['todo', 'Todo'], ['gym', 'Gym'], ['otras', 'Otras']].map(([k, l]) => `<button class="chip ${f === k ? 'chip-acento' : ''}" data-action="hist-filtro" data-val="${k}">${l}</button>`).join('');
  let html = '';
  let semanaActual = null;
  ses.forEach(s => {
    const lunes = aISO(lunesDe(s.fecha));
    if (lunes !== semanaActual) {
      semanaActual = lunes;
      const n = S.sesiones.filter(x => aISO(lunesDe(x.fecha)) === lunes);
      const gymSes = n.filter(x => x.tipo === 'gym');
      const minGym = gymSes.reduce((t, x) => t + (x.duracionMin || 0), 0);
      const minOtras = n.filter(x => x.tipo !== 'gym').reduce((t, x) => t + (x.duracionMin || 0), 0);
      html += `<div class="zona">Semana del ${fechaCorta(lunes)} · ${gymSes.length} gym (${fmtMin(minGym)})${n.length - gymSes.length ? ' · ' + (n.length - gymSes.length) + ' otras (' + fmtMin(minOtras) + ')' : ''}</div>`;
    }
    const abierto = V.hist.abierto === s.id;
    const titulo = s.tipo === 'gym' ? s.nombreDia : s.actividad;
    const resumen = s.tipo === 'gym' ? `${s.ejercicios.length} ejercicios · ${fmtMin(s.duracionMin)}${s.horaInicio ? ' · ' + s.horaInicio + '–' + s.horaFin : ''}` : `${s.duracionMin ? fmtMin(s.duracionMin) : '?'}${s.nota ? ' · ' + esc(s.nota) : ''}`;
    let detalle = '';
    if (abierto) {
      if (s.tipo === 'gym') {
        detalle = s.ejercicios.map(x => { const e = ej(x.ejercicioId); return `<div class="hist-fila"><span>${esc(e.nombre)}</span><span>${fmtSeries(x.series, e)}${x.nota ? '<br><i>' + esc(x.nota) + '</i>' : ''}</span></div>`; }).join('') || '<p class="sub">Sesión sin series.</p>';
      }
      detalle += `<div class="fila"><label>Fecha<input type="date" data-sesion-fecha="${s.id}" value="${s.fecha}"></label><button class="btn peligro-borde chico" data-action="borrar-sesion" data-id="${s.id}">Borrar</button></div>`;
    }
    html += `<div class="card">
      <button class="fila-ej" data-action="hist-abrir" data-id="${s.id}"><span><b>${fechaLarga(s.fecha)}</b> · ${esc(titulo)}</span><small>${resumen}</small></button>
      ${detalle}
    </div>`;
  });
  return `<header class="encabezado"><h1>Historial</h1><div class="chips">${filtros}</div></header>${html || '<p class="nota-pie">Nada todavía.</p>'}`;
}

// ---------- AJUSTES ----------
function calcularNutricion(p) {
  const tmb = p.sexo === 'f' ? 10 * p.peso + 6.25 * p.altura - 5 * p.edad - 161 : 10 * p.peso + 6.25 * p.altura - 5 * p.edad + 5;
  const d = Number(p.diasSemana) || 0;
  const factor = d <= 1 ? 1.2 : d <= 3 ? 1.375 : d <= 5 ? 1.55 : 1.725;
  const mant = Math.round(tmb * factor);
  const ajuste = p.objetivo === 'bajar' ? -400 : p.objetivo === 'subir' ? 300 : 0;
  const objetivo = mant + ajuste;
  const prote = Math.round(p.peso * 1.8);
  const grasa = Math.round(p.peso * 0.9);
  const carbos = Math.max(0, Math.round((objetivo - prote * 4 - grasa * 9) / 4));
  return { tmb: Math.round(tmb), mant, objetivo, prote, grasa, carbos, factor };
}

function vistaAjustes() {
  const p = S.perfil;
  const n = calcularNutricion(p);
  const pesos = S.pesoCorporal.slice().sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 6);
  return `<header class="encabezado"><h1>Ajustes</h1></header>
    <div class="card">
      <div class="titulo">Perfil</div>
      <div class="fila">
        <label>Altura (cm)<input type="number" inputmode="numeric" data-perfil="altura" value="${p.altura}"></label>
        <label>Peso (kg)<input type="number" inputmode="decimal" step="0.1" data-perfil="peso" value="${p.peso}"></label>
      </div>
      <div class="fila">
        <label>Edad<input type="number" inputmode="numeric" data-perfil="edad" value="${p.edad}"></label>
        <label>Sexo<select data-perfil="sexo"><option value="m" ${p.sexo === 'm' ? 'selected' : ''}>Hombre</option><option value="f" ${p.sexo === 'f' ? 'selected' : ''}>Mujer</option></select></label>
      </div>
      <div class="fila">
        <label>Objetivo<select data-perfil="objetivo">${[['bajar', 'Bajar grasa'], ['mantener', 'Mantener'], ['subir', 'Subir masa']].map(([k, l]) => `<option value="${k}" ${p.objetivo === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label>Entrenos por semana<input type="number" inputmode="numeric" data-perfil="diasSemana" value="${p.diasSemana}"></label>
      </div>
    </div>
    <div class="card">
      <div class="titulo">Referencia de comida</div>
      <div class="sub">Estimación con la fórmula de Mifflin-St Jeor. Es una referencia, no una receta exacta.</div>
      <table class="tabla">
        <tr><td>Gasto en reposo</td><td>${n.tmb} kcal</td></tr>
        <tr><td>Mantenimiento con tu actividad</td><td>${n.mant} kcal</td></tr>
        <tr class="destacada"><td>Objetivo diario (${esc(p.objetivo)})</td><td>${n.objetivo} kcal</td></tr>
        <tr><td>Proteína</td><td>${n.prote} g</td></tr>
        <tr><td>Grasas</td><td>${n.grasa} g</td></tr>
        <tr><td>Carbohidratos</td><td>${n.carbos} g</td></tr>
      </table>
      <div class="sub">Guía rápida: 100 g de carne o pollo tienen unos 25 g de proteína. Un huevo, 6 g.</div>
    </div>
    <div class="card">
      <div class="titulo">Peso corporal</div>
      <div class="fila"><input type="number" inputmode="decimal" step="0.1" id="peso-nuevo" placeholder="kg"><button class="btn chico" data-action="registrar-peso">Registrar hoy</button></div>
      ${pesos.map(x => `<div class="hist-fila"><span>${fechaCorta(x.fecha)}</span><span>${x.peso} kg</span></div>`).join('')}
    </div>
    <div class="card">
      <div class="titulo">Objetivo semanal</div>
      <div class="fila">
        ${Object.keys(S.objetivoSemanal).map(g => `<label>${GRUPOS[g]}<input type="number" inputmode="numeric" data-objetivo="${g}" value="${S.objetivoSemanal[g]}"></label>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="titulo">Respaldo</div>
      <div class="sub">Los datos viven en este navegador. Exportá cada tanto para no perder nada.</div>
      <div class="fila">
        <button class="btn secundario" data-action="exportar">Exportar</button>
        <label class="btn secundario centro">Importar<input type="file" accept="application/json,.json" id="importar" hidden></label>
      </div>
      <div class="sub">${S.sesiones.length} sesiones guardadas.</div>
      <button class="btn peligro-borde" data-action="borrar-todo">Borrar todos los datos</button>
    </div>
    <p class="nota-pie">Versión 1 · ${S.sesiones.length ? 'último registro ' + fechaCorta(S.sesiones.slice().sort((a, b) => b.fecha.localeCompare(a.fecha))[0].fecha) : 'sin registros'}</p>`;
}

// ---------- eventos ----------
document.addEventListener('click', ev => {
  const nav = ev.target.closest('.nav button');
  if (nav) { V.tab = nav.dataset.tab; V.picker = null; render(); window.scrollTo(0, 0); return; }
  const el = ev.target.closest('[data-action]');
  if (!el) return;
  const a = el.dataset.action;
  const i = Number(el.dataset.i), j = Number(el.dataset.j);

  // Hoy
  if (a === 'iniciar') return iniciarSesion(el.dataset.dia);
  if (a === 'abrir-otra') { V.otraActividad = { actividad: 'Pádel', nombre: '', duracion: '', nota: '', fecha: hoyISO() }; return render(); }
  if (a === 'cerrar-otra') { V.otraActividad = null; return render(); }
  if (a === 'otra-act') { V.otraActividad.actividad = el.dataset.val; return render(); }
  if (a === 'guardar-otra') {
    const o = V.otraActividad;
    const nombre = o.actividad === 'Otra' ? (o.nombre || '').trim() || 'Otra' : o.actividad;
    S.sesiones.push({ id: uid(), tipo: 'otra', fecha: o.fecha || hoyISO(), actividad: nombre, duracionMin: Number(o.duracion) || null, nota: (o.nota || '').trim() });
    V.otraActividad = null; save(); toast('Actividad guardada'); return render();
  }

  // Sesión
  if (a === 'toggle-grupo') { S.enCurso.grupoAbierto = S.enCurso.grupoAbierto === el.dataset.g ? null : el.dataset.g; save(); return render(); }
  if (a === 'repetir-ultima') {
    const previa = ultimaSesionDeDia(S.enCurso.diaId);
    if (previa) S.enCurso.zonas.forEach((z, k) => {
      if (z.grupo !== el.dataset.g || z.ejercicioId) return;
      const p = previa.ejercicios.find(x => x.zonaId === z.zonaId);
      if (p && !ej(p.ejercicioId).evitar) elegirEjercicioZona(k, p.ejercicioId);
    });
    save(); return render();
  }
  if (a === 'bloque-step') {
    const z = S.enCurso.zonas[i];
    const b = z.bloques[Number(el.dataset.k)];
    const campo = el.dataset.campo;
    const paso = campo === 'peso' ? pasoPeso(ej(z.ejercicioId)) : 1;
    const actual = Number(String(b[campo]).replace(',', '.')) || 0;
    let nuevo = actual + paso * Number(el.dataset.dir);
    nuevo = Math.max(campo === 'peso' ? 0 : 1, Math.round(nuevo * 100) / 100);
    b[campo] = nuevo;
    save(); return render();
  }
  if (a === 'agregar-bloque') {
    const z = S.enCurso.zonas[i];
    const ult = z.bloques[z.bloques.length - 1];
    z.bloques.push(ult ? { series: 3, reps: ult.reps, peso: ult.peso } : { series: 3, reps: 10, peso: 0 });
    save(); return render();
  }
  if (a === 'quitar-bloque') { S.enCurso.zonas[i].bloques.splice(Number(el.dataset.k), 1); save(); return render(); }
  if (a === 'toggle-tecnica') { S.enCurso.zonas[i].tecnica = !S.enCurso.zonas[i].tecnica; return render(); }
  if (a === 'cambiar-ejercicio') {
    const z = S.enCurso.zonas[i];
    z.ejercicioId = null; z.bloques = []; z.tecnica = false; save(); return render();
  }
  if (a === 'elegir-ejercicio') { elegirEjercicioZona(i, el.dataset.id); save(); return render(); }
  if (a === 'buscar-ejercicio-zona') {
    return abrirPicker('Elegir ejercicio', '', [], id => {
      elegirEjercicioZona(i, id);
      // Se agrega como opción de la zona en la rutina para la próxima.
      const dia = S.dias.find(d => d.id === S.enCurso.diaId);
      const def = dia && dia.zonas.find(x => x.id === S.enCurso.zonas[i].zonaId);
      if (def && !def.opciones.includes(id)) def.opciones.push(id);
      save();
    });
  }
  if (a === 'hablar') return hablar(textoTecnica(ej(el.dataset.id)));
  if (a === 'cancelar-sesion') { if (confirm('¿Descartar esta sesión? No se guarda nada.')) { S.enCurso = null; save(); render(); } return; }
  if (a === 'terminar-sesion') return terminarSesion();

  // Rutinas
  if (a === 'abrir-dia') { V.rutinas.diaId = el.dataset.dia; render(); return window.scrollTo(0, 0); }
  if (a === 'volver-rutinas') { V.rutinas.diaId = null; V.rutinas.catalogo = false; V.rutinas.ejercicioId = null; return render(); }
  if (a === 'abrir-catalogo') { V.rutinas.catalogo = true; render(); return window.scrollTo(0, 0); }
  if (a === 'ver-ejercicio') { V.rutinas.ejercicioId = el.dataset.id; render(); return window.scrollTo(0, 0); }
  if (a === 'cerrar-ejercicio') { V.rutinas.ejercicioId = null; return render(); }
  if (a === 'nuevo-dia') {
    const id = uid();
    S.dias.push({ id, nombre: 'Nuevo día', grupo: 'pecho', grupos: [], zonas: [] });
    V.rutinas.diaId = id; save(); return render();
  }
  if (a === 'borrar-dia') {
    if (!confirm('¿Borrar este día de la rutina? Las sesiones ya guardadas no se pierden.')) return;
    S.dias = S.dias.filter(d => d.id !== el.dataset.dia); V.rutinas.diaId = null; save(); return render();
  }
  if (a === 'agregar-zona') {
    const d = S.dias.find(x => x.id === el.dataset.dia);
    const g = d.grupo in ZONAS ? d.grupo : 'pecho';
    d.zonas.push({ id: uid(), grupo: g, zona: ZONAS[g][0], opciones: [] }); save(); return render();
  }
  if (a === 'quitar-zona') {
    const d = S.dias.find(x => x.id === V.rutinas.diaId);
    if (d.zonas[i].opciones.length && !confirm('¿Quitar esta zona del día?')) return;
    d.zonas.splice(i, 1); save(); return render();
  }
  if (a === 'mover-zona') {
    const d = S.dias.find(x => x.id === V.rutinas.diaId);
    // Se mueve dentro del mismo grupo.
    const dir = Number(el.dataset.dir);
    let k = i + dir;
    while (k >= 0 && k < d.zonas.length && d.zonas[k].grupo !== d.zonas[i].grupo) k += dir;
    if (k < 0 || k >= d.zonas.length) return;
    [d.zonas[i], d.zonas[k]] = [d.zonas[k], d.zonas[i]]; save(); return render();
  }
  if (a === 'quitar-opcion') {
    const d = S.dias.find(x => x.id === V.rutinas.diaId);
    d.zonas[i].opciones = d.zonas[i].opciones.filter(x => x !== el.dataset.id); save(); return render();
  }
  if (a === 'agregar-opcion') {
    const d = S.dias.find(x => x.id === V.rutinas.diaId);
    const z = d.zonas[i];
    return abrirPicker('Agregar a: ' + z.zona, z.grupo, z.opciones, id => { z.opciones.push(id); save(); });
  }
  if (a === 'nuevo-ejercicio') { V.rutinas.nuevo = { nombre: '', grupo: 'pecho', zona: ZONAS.pecho[0], unidad: 'kg', equipo: '', tecnica: '', errores: '' }; return render(); }
  if (a === 'cancelar-nuevo') { V.rutinas.nuevo = null; return render(); }
  if (a === 'guardar-nuevo') {
    const n = V.rutinas.nuevo;
    if (!n.nombre.trim()) { alert('Ponele un nombre.'); return; }
    const id = 'c-' + uid();
    S.ejercicios[id] = {
      id, nombre: n.nombre.trim(), grupo: n.grupo, zona: n.zona, unidad: n.unidad, equipo: n.equipo.trim(), personalizado: true,
      tecnica: n.tecnica.split('\n').map(x => x.trim()).filter(Boolean),
      errores: n.errores.split('\n').map(x => x.trim()).filter(Boolean),
    };
    V.rutinas.nuevo = null; V.rutinas.ejercicioId = id; V.rutinas.catalogo = true; save(); toast('Ejercicio creado'); return render();
  }
  if (a === 'borrar-ejercicio') {
    if (!confirm('¿Borrar este ejercicio?')) return;
    S.ejercicios[el.dataset.id] = { eliminado: true, nombre: '(borrado)' };
    S.dias.forEach(d => d.zonas.forEach(z => z.opciones = z.opciones.filter(x => x !== el.dataset.id)));
    V.rutinas.ejercicioId = null; save(); return render();
  }

  // Picker
  if (a === 'picker-cerrar') { V.picker = null; return render(); }
  if (a === 'picker-grupo') { V.picker.grupo = el.dataset.val; return render(); }
  if (a === 'picker-elegir') { const fn = V.picker.onPick; V.picker = null; fn(el.dataset.id); return render(); }

  // Historial
  if (a === 'hist-filtro') { V.hist.filtro = el.dataset.val; return render(); }
  if (a === 'hist-abrir') { V.hist.abierto = V.hist.abierto === el.dataset.id ? null : el.dataset.id; return render(); }
  if (a === 'borrar-sesion') {
    if (!confirm('¿Borrar esta sesión?')) return;
    S.sesiones = S.sesiones.filter(s => s.id !== el.dataset.id); save(); return render();
  }

  // Ajustes
  if (a === 'registrar-peso') {
    const v = Number(String(document.getElementById('peso-nuevo').value).replace(',', '.'));
    if (!v) return;
    S.pesoCorporal = S.pesoCorporal.filter(x => x.fecha !== hoyISO());
    S.pesoCorporal.push({ fecha: hoyISO(), peso: v });
    S.perfil.peso = v; save(); toast('Peso registrado'); return render();
  }
  if (a === 'exportar') return exportarEstado(S);
  if (a === 'borrar-todo') {
    if (!confirm('Esto borra TODO: sesiones, rutinas y ajustes. ¿Seguro?')) return;
    if (!confirm('¿Exportaste un respaldo? Última chance.')) return;
    S = estadoInicial(); save(); return render();
  }
});

// Inputs: se actualiza el estado sin volver a dibujar, para no perder el foco.
document.addEventListener('input', ev => {
  const t = ev.target;
  if (t.dataset.zona !== undefined && S.enCurso) {
    const z = S.enCurso.zonas[Number(t.dataset.zona)];
    if (t.dataset.campo === 'nota') z.nota = t.value;
    else z.bloques[Number(t.dataset.bloque)][t.dataset.campo] = t.value;
    save(); return;
  }
  if (t.dataset.campoOtra !== undefined) { V.otraActividad[t.dataset.campoOtra] = t.value; return; }
  if (t.dataset.busqueda === 'catalogo') { V.rutinas.busqueda = t.value; return renderConservandoFoco(t); }
  if (t.dataset.busqueda === 'picker') { V.picker.busqueda = t.value; return renderConservandoFoco(t); }
  if (t.dataset.diaNombre) { const d = S.dias.find(x => x.id === t.dataset.diaNombre); d.nombre = t.value; if (S.enCurso && S.enCurso.diaId === d.id) S.enCurso.nombreDia = d.nombre; save(); return; }
  if (t.dataset.nuevo) { V.rutinas.nuevo[t.dataset.nuevo] = t.value; if (t.dataset.nuevo === 'grupo') render(); return; }
  if (t.dataset.perfil) {
    const k = t.dataset.perfil;
    S.perfil[k] = (k === 'sexo' || k === 'objetivo') ? t.value : Number(String(t.value).replace(',', '.')) || 0;
    save(); if (t.tagName === 'SELECT') render(); return;
  }
  if (t.dataset.objetivo) { S.objetivoSemanal[t.dataset.objetivo] = Math.max(0, Number(t.value) || 0); save(); return; }
});

// Cambios que sí redibujan (selects y fechas).
document.addEventListener('change', ev => {
  const t = ev.target;
  if (t.dataset.perfil && t.tagName !== 'SELECT') return render();
  if (t.dataset.zonaSel !== undefined) {
    const d = S.dias.find(x => x.id === V.rutinas.diaId);
    const [g, zona] = t.value.split('|');
    const z = d.zonas[Number(t.dataset.zonaSel)];
    z.grupo = g; z.zona = zona;
    if (!(d.grupos || []).includes(g)) { d.grupos = d.grupos || []; d.grupos.push(g); }
    save(); return render();
  }
  if (t.dataset.diaGrupo) { const d = S.dias.find(x => x.id === t.dataset.diaGrupo); d.grupo = t.value; save(); return render(); }
  if (t.dataset.ejUnidad) { S.ejercicios[t.dataset.ejUnidad] = Object.assign({}, S.ejercicios[t.dataset.ejUnidad] || {}, { unidad: t.value }); save(); return render(); }
  if (t.dataset.ejEvitar) { S.ejercicios[t.dataset.ejEvitar] = Object.assign({}, S.ejercicios[t.dataset.ejEvitar] || {}, { evitar: t.checked }); save(); return render(); }
  if (t.dataset.sesionFecha) { const s = S.sesiones.find(x => x.id === t.dataset.sesionFecha); if (s && t.value) { s.fecha = t.value; save(); render(); } return; }
  if (t.id === 'importar' && t.files[0]) {
    importarEstado(t.files[0]).then(data => {
      if (!confirm('Esto reemplaza todo lo que hay en la app por el respaldo. ¿Seguir?')) return;
      S = data; save(); toast('Respaldo importado'); render();
    }).catch(e => alert('No se pudo importar: ' + e.message));
  }
});

function renderConservandoFoco(input) {
  const sel = input.dataset.busqueda;
  const pos = input.selectionStart;
  render();
  const nuevo = document.querySelector(`[data-busqueda="${sel}"]`);
  if (nuevo) { nuevo.focus(); try { nuevo.setSelectionRange(pos, pos); } catch (e) { } }
}

// Tiempo transcurrido de la sesión.
setInterval(() => {
  const tr = document.getElementById('transcurrido');
  if (tr && S.enCurso) tr.textContent = fmtMin((Date.now() - (S.enCurso.inicio || Date.now())) / 60000);
}, 5000);

// Botón atrás del celular: cierra lo que esté abierto antes de salir.
history.replaceState({ app: true }, '');
window.addEventListener('popstate', () => {
  let cerro = true;
  if (V.picker) V.picker = null;
  else if (V.rutinas.nuevo) V.rutinas.nuevo = null;
  else if (V.rutinas.ejercicioId) V.rutinas.ejercicioId = null;
  else if (V.rutinas.catalogo) V.rutinas.catalogo = false;
  else if (V.rutinas.diaId) V.rutinas.diaId = null;
  else if (V.otraActividad) V.otraActividad = null;
  else if (V.tab !== 'hoy') V.tab = 'hoy';
  else cerro = false;
  render();
  // Si cerró algo, vuelve a dejar una entrada para que el próximo "atrás" también lo maneje la app.
  if (cerro) history.pushState({ app: true }, '');
});
history.pushState({ app: true }, '');

if ('speechSynthesis' in window) speechSynthesis.getVoices();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => { });
}

render();
