// Muñequito animado por ejercicio. Figura de palitos en SVG que va y vuelve entre dos poses.
//
// Ángulos en grados, en coordenadas de pantalla: 0 = hacia la derecha, 90 = hacia abajo, -90 = hacia arriba.
// La figura de costado mira hacia la derecha. Cada segmento se dibuja desde su articulación:
//   torso: cadera -> hombro      brazo: hombro -> codo      antebrazo: codo -> muñeca
//   muslo: cadera -> rodilla     pierna: rodilla -> tobillo pie: tobillo -> punta
// hx, hy: posición de la cadera. hombroY: desplazamiento extra del hombro (encogimientos).

const LARGO = { torso: 40, brazo: 26, antebrazo: 24, muslo: 34, pierna: 32, pie: 12, cabeza: 9 };
const PISO = 150;

const POSE_BASE = { hx: 100, hy: 84, torso: -90, brazo: 90, antebrazo: 90, muslo: 90, pierna: 90, pie: 0, hombroY: 0 };

function p(extra) { return Object.assign({}, POSE_BASE, extra); }

// Poses de pie, sentado y acostado, como base para variar.
const PARADO = p({});
const SENTADO = p({ hy: 100, muslo: 0, pierna: 90, pie: 0 });
const ACOSTADO = p({ hx: 110, hy: 92, torso: 180, muslo: 60, pierna: 90, pie: 0 }); // boca arriba, cabeza a la izquierda

// Elementos fijos que se dibujan detrás de la figura.
const BANCO_PLANO = [{ rect: [40, 92, 110, 8] }, { rect: [60, 100, 6, 50] }, { rect: [124, 100, 6, 50] }];
const BANCO_RESPALDO = [{ rect: [62, 100, 50, 8] }, { rect: [60, 60, 6, 48] }, { rect: [70, 108, 6, 42] }, { rect: [100, 108, 6, 42] }];
const POLEA_ALTA = [{ rect: [170, 10, 8, 140] }, { line: [174, 14, 160, 14] }];
const POLEA_BAJA = [{ rect: [170, 10, 8, 140] }];

const ANIMACIONES = {
  // ---------- pecho ----------
  'press-plano': {
    fijo: BANCO_PLANO, carga: 'barra',
    a: Object.assign({}, ACOSTADO, { hx: 110, brazo: 110, antebrazo: -80 }),
    b: Object.assign({}, ACOSTADO, { hx: 110, brazo: -90, antebrazo: -90 }),
  },
  'press-inclinado': {
    fijo: [{ rect: [40, 100, 90, 8] }, { rect: [60, 108, 6, 42] }, { rect: [110, 108, 6, 42] }, { line: [44, 100, 20, 55], w: 8 }], carga: 'barra',
    a: p({ hx: 95, hy: 100, torso: 215, muslo: 70, pierna: 90, brazo: 100, antebrazo: -60 }),
    b: p({ hx: 95, hy: 100, torso: 215, muslo: 70, pierna: 90, brazo: -65, antebrazo: -65 }),
  },
  'cruce-alto': {
    fijo: [{ rect: [170, 10, 8, 140] }, { rect: [22, 10, 8, 140] }], carga: 'polea:174,16',
    a: p({ torso: -80, brazo: -40, antebrazo: -25, muslo: 95, muslo2: 80 }),
    b: p({ torso: -80, brazo: 60, antebrazo: 30, muslo: 95, muslo2: 80 }),
  },
  'cruce-bajo': {
    fijo: [{ rect: [170, 10, 8, 140] }, { rect: [22, 10, 8, 140] }], carga: 'polea:174,140',
    a: p({ torso: -85, brazo: 120, antebrazo: 100, muslo: 95, muslo2: 80 }),
    b: p({ torso: -85, brazo: -20, antebrazo: -30, muslo: 95, muslo2: 80 }),
  },
  'aperturas': {
    vista: 'frente', fijo: [{ rect: [70, 130, 60, 8] }], carga: 'mancuerna',
    a: p({ hx: 100, hy: 110, brazo: 170, antebrazo: 175 }),
    b: p({ hx: 100, hy: 110, brazo: -100, antebrazo: -95 }),
  },
  'flexiones': {
    a: p({ hx: 80, hy: 118, torso: 0, muslo: 180, pierna: 180, pie: 90, brazo: 90, antebrazo: 90 }),
    b: p({ hx: 80, hy: 134, torso: 0, muslo: 180, pierna: 180, pie: 90, brazo: 150, antebrazo: 40 }),
  },
  // ---------- tríceps ----------
  'pushdown': {
    fijo: POLEA_ALTA, carga: 'polea:174,14',
    a: p({ brazo: 85, antebrazo: -10 }),
    b: p({ brazo: 85, antebrazo: 85 }),
  },
  'patada': {
    fijo: [{ rect: [120, 110, 60, 8] }], carga: 'mancuerna',
    a: p({ hx: 90, hy: 90, torso: -25, brazo: 165, antebrazo: 90, muslo: 100, pierna: 85, brazo2: 20, antebrazo2: 80 }),
    b: p({ hx: 90, hy: 90, torso: -25, brazo: 165, antebrazo: 165, muslo: 100, pierna: 85, brazo2: 20, antebrazo2: 80 }),
  },
  'sobre-cabeza': {
    carga: 'mancuerna',
    a: p({ brazo: -95, antebrazo: 140 }),
    b: p({ brazo: -95, antebrazo: -95 }),
  },
  'frances': {
    fijo: BANCO_PLANO, carga: 'barra',
    a: Object.assign({}, ACOSTADO, { brazo: -90, antebrazo: 180 }),
    b: Object.assign({}, ACOSTADO, { brazo: -90, antebrazo: -90 }),
  },
  'fondos-banco': {
    fijo: [{ rect: [20, 100, 50, 8] }, { rect: [24, 108, 6, 42] }, { rect: [60, 108, 6, 42] }],
    a: p({ hx: 95, hy: 102, torso: -90, muslo: 15, pierna: 20, brazo: 140, antebrazo: 110 }),
    b: p({ hx: 95, hy: 114, torso: -90, muslo: 8, pierna: 12, brazo: 150, antebrazo: 95 }),
  },
  // ---------- hombros ----------
  'press-hombros': {
    fijo: BANCO_RESPALDO, carga: 'mancuerna',
    a: p({ hx: 85, hy: 100, torso: -90, muslo: 0, pierna: 90, brazo: 15, antebrazo: -85 }),
    b: p({ hx: 85, hy: 100, torso: -90, muslo: 0, pierna: 90, brazo: -85, antebrazo: -90 }),
  },
  'laterales': {
    vista: 'frente', carga: 'mancuerna',
    a: p({ brazo: 100, antebrazo: 100 }),
    b: p({ brazo: 175, antebrazo: 178 }),
  },
  'frontales': {
    carga: 'mancuerna',
    a: p({ brazo: 90, antebrazo: 90 }),
    b: p({ brazo: -10, antebrazo: -10 }),
  },
  'face-pull': {
    fijo: [{ rect: [170, 10, 8, 140] }], carga: 'polea:174,40',
    a: p({ brazo: -5, antebrazo: -5 }),
    b: p({ brazo: 165, antebrazo: -10 }),
  },
  'pajaros': {
    carga: 'mancuerna',
    a: p({ hx: 90, torso: -20, brazo: 95, antebrazo: 95, muslo: 100, pierna: 85 }),
    b: p({ hx: 90, torso: -20, brazo: 180, antebrazo: 175, muslo: 100, pierna: 85 }),
  },
  // ---------- espalda ----------
  'jalon': {
    fijo: [{ rect: [150, 10, 8, 140] }, { rect: [70, 112, 50, 8] }, { rect: [90, 120, 6, 30] }, { line: [154, 14, 100, 14] }], carga: 'polea:100,16',
    a: p({ hx: 85, hy: 112, torso: -95, muslo: 0, pierna: 90, brazo: -80, antebrazo: -85 }),
    b: p({ hx: 85, hy: 112, torso: -100, muslo: 0, pierna: 90, brazo: 125, antebrazo: -60 }),
  },
  'remo-sentado': {
    fijo: [{ rect: [40, 112, 50, 8] }, { rect: [60, 120, 6, 30] }, { rect: [170, 10, 8, 140] }], carga: 'polea:174,95',
    a: p({ hx: 65, hy: 112, torso: -80, muslo: 0, pierna: 60, brazo: -5, antebrazo: -5 }),
    b: p({ hx: 65, hy: 112, torso: -95, muslo: 0, pierna: 60, brazo: 150, antebrazo: 0 }),
  },
  'remo-mancuerna': {
    fijo: [{ rect: [110, 130, 70, 8] }, { rect: [114, 138, 6, 12] }, { rect: [170, 138, 6, 12] }], carga: 'mancuerna',
    a: p({ hx: 95, hy: 95, torso: -15, brazo: 100, antebrazo: 95, muslo: 95, pierna: 85, brazo2: 75, antebrazo2: 90 }),
    b: p({ hx: 95, hy: 95, torso: -15, brazo: 170, antebrazo: 95, muslo: 95, pierna: 85, brazo2: 75, antebrazo2: 90 }),
  },
  'pull-over': {
    fijo: BANCO_PLANO, carga: 'mancuerna',
    a: Object.assign({}, ACOSTADO, { brazo: -90, antebrazo: -90 }),
    b: Object.assign({}, ACOSTADO, { brazo: 190, antebrazo: 185 }),
  },
  'hiperextensiones': {
    fijo: [{ rect: [88, 100, 34, 10] }, { rect: [100, 110, 6, 40] }, { rect: [34, 92, 6, 30] }, { rect: [37, 122, 6, 28] }],
    a: p({ hx: 105, hy: 100, torso: 0, muslo: 177, pierna: 180, pie: 90, brazo: 60, antebrazo: -60 }),
    b: p({ hx: 105, hy: 100, torso: 75, muslo: 177, pierna: 180, pie: 90, brazo: 135, antebrazo: 15 }),
  },
  'encogimientos': {
    carga: 'mancuerna',
    a: p({ brazo: 92, antebrazo: 92, hombroY: 0 }),
    b: p({ brazo: 92, antebrazo: 92, hombroY: -8 }),
  },
  // ---------- bíceps ----------
  'curl': {
    carga: 'mancuerna',
    a: p({ brazo: 90, antebrazo: 90 }),
    b: p({ brazo: 85, antebrazo: -60 }),
  },
  'curl-inclinado': {
    fijo: [{ rect: [62, 100, 50, 8] }, { rect: [70, 108, 6, 42] }, { rect: [100, 108, 6, 42] }, { line: [66, 100, 40, 50], w: 8 }], carga: 'mancuerna',
    a: p({ hx: 90, hy: 100, torso: -120, muslo: 0, pierna: 90, brazo: 100, antebrazo: 100 }),
    b: p({ hx: 90, hy: 100, torso: -120, muslo: 0, pierna: 90, brazo: 100, antebrazo: -45 }),
  },
  'curl-scott': {
    fijo: [{ rect: [40, 112, 50, 8] }, { rect: [60, 120, 6, 30] }, { line: [100, 80, 130, 100], w: 8 }], carga: 'barra',
    a: p({ hx: 65, hy: 112, torso: -85, muslo: 0, pierna: 90, brazo: 35, antebrazo: 40 }),
    b: p({ hx: 65, hy: 112, torso: -85, muslo: 0, pierna: 90, brazo: 35, antebrazo: -75 }),
  },
  'curl-concentrado': {
    fijo: [{ rect: [40, 112, 50, 8] }, { rect: [60, 120, 6, 30] }], carga: 'mancuerna',
    a: p({ hx: 65, hy: 112, torso: -60, muslo: 10, pierna: 90, brazo: 110, antebrazo: 100 }),
    b: p({ hx: 65, hy: 112, torso: -60, muslo: 10, pierna: 90, brazo: 110, antebrazo: -40 }),
  },
  // ---------- piernas ----------
  'prensa': {
    fijo: [{ line: [40, 140, 80, 70], w: 10 }, { rect: [40, 140, 50, 8] }, { line: [122, 24, 162, 104], w: 10 }],
    a: p({ hx: 85, hy: 115, torso: -125, muslo: -95, pierna: 0, pie: -60, brazo: 100, antebrazo: 60 }),
    b: p({ hx: 85, hy: 115, torso: -125, muslo: -45, pierna: -45, pie: 10, brazo: 100, antebrazo: 60 }),
  },
  'extension-cuadriceps': {
    fijo: BANCO_RESPALDO,
    a: p({ hx: 85, hy: 100, torso: -95, muslo: 0, pierna: 90, pie: 0, brazo: 60, antebrazo: 70 }),
    b: p({ hx: 85, hy: 100, torso: -95, muslo: 0, pierna: 0, pie: -40, brazo: 60, antebrazo: 70 }),
  },
  'curl-femoral-acostado': {
    fijo: [{ rect: [30, 110, 130, 8] }, { rect: [50, 118, 6, 32] }, { rect: [130, 118, 6, 32] }],
    a: p({ hx: 100, hy: 108, torso: 180, muslo: 0, pierna: 0, pie: 90, brazo: 180, antebrazo: 90 }),
    b: p({ hx: 100, hy: 108, torso: 180, muslo: 0, pierna: -110, pie: -30, brazo: 180, antebrazo: 90 }),
  },
  'curl-femoral-sentado': {
    fijo: BANCO_RESPALDO,
    a: p({ hx: 85, hy: 100, torso: -95, muslo: 0, pierna: 0, pie: -40, brazo: 60, antebrazo: 70 }),
    b: p({ hx: 85, hy: 100, torso: -95, muslo: 0, pierna: 85, pie: 0, brazo: 60, antebrazo: 70 }),
  },
  'gemelos-pie': {
    fijo: [{ rect: [95, 140, 40, 10] }],
    a: p({ hx: 100, hy: 84, muslo: 90, pierna: 90, pie: 0, brazo: 70, antebrazo: 70 }),
    b: p({ hx: 100, hy: 74, muslo: 90, pierna: 95, pie: -40, brazo: 70, antebrazo: 70 }),
  },
  'gemelos-sentado': {
    fijo: [{ rect: [40, 112, 50, 8] }, { rect: [60, 120, 6, 30] }, { rect: [110, 140, 40, 10] }],
    a: p({ hx: 65, hy: 112, torso: -90, muslo: 0, pierna: 90, pie: 0, brazo: 30, antebrazo: 40 }),
    b: p({ hx: 65, hy: 104, torso: -90, muslo: 0, pierna: 100, pie: -45, brazo: 30, antebrazo: 40 }),
  },
  'sentadilla': {
    carga: 'barra',
    a: p({ hx: 100, hy: 84, torso: -90, muslo: 90, pierna: 90, brazo: 60, antebrazo: -110 }),
    b: p({ hx: 86, hy: 118, torso: -55, muslo: 15, pierna: 115, brazo: 95, antebrazo: -150 }),
  },
  'goblet': {
    carga: 'mancuerna',
    a: p({ hx: 100, hy: 84, torso: -90, muslo: 90, pierna: 90, brazo: 60, antebrazo: -60 }),
    b: p({ hx: 86, hy: 118, torso: -60, muslo: 15, pierna: 115, brazo: 90, antebrazo: -90 }),
  },
  'estocadas': {
    carga: 'mancuerna',
    a: p({ hx: 100, hy: 84, muslo: 90, pierna: 90, muslo2: 90, pierna2: 90, brazo: 90, antebrazo: 90 }),
    b: p({ hx: 100, hy: 112, muslo: 15, pierna: 95, muslo2: 150, pierna2: 60, brazo: 90, antebrazo: 90 }),
  },
  'peso-muerto-rumano': {
    carga: 'barra',
    a: p({ hx: 100, hy: 84, torso: -90, muslo: 92, pierna: 88, brazo: 92, antebrazo: 92 }),
    b: p({ hx: 88, hy: 88, torso: -15, muslo: 100, pierna: 80, brazo: 100, antebrazo: 100 }),
  },
  'hip-thrust': {
    fijo: [{ rect: [20, 100, 50, 8] }, { rect: [24, 108, 6, 42] }, { rect: [60, 108, 6, 42] }], carga: 'cadera',
    a: p({ hx: 95, hy: 128, torso: 215, muslo: 10, pierna: 85, brazo: 90, antebrazo: 20 }),
    b: p({ hx: 100, hy: 100, torso: 185, muslo: 20, pierna: 95, brazo: 90, antebrazo: 20 }),
  },
  'aductores': {
    vista: 'frente', fijo: [{ rect: [70, 118, 60, 8] }],
    a: p({ hx: 100, hy: 110, muslo: 120, pierna: 95, brazo: 95, antebrazo: 95 }),
    b: p({ hx: 100, hy: 110, muslo: 95, pierna: 90, brazo: 95, antebrazo: 95 }),
  },
  'abductores': {
    vista: 'frente', fijo: [{ rect: [70, 118, 60, 8] }],
    a: p({ hx: 100, hy: 110, muslo: 95, pierna: 90, brazo: 95, antebrazo: 95 }),
    b: p({ hx: 100, hy: 110, muslo: 125, pierna: 95, brazo: 95, antebrazo: 95 }),
  },
};

// Qué animación usa cada ejercicio del catálogo.
const EJ_ANIM = {
  'press-banca': 'press-plano', 'press-plano-mancuernas': 'press-plano', 'press-inclinado-mancuernas': 'press-inclinado',
  'press-inclinado-barra': 'press-inclinado', 'cruce-poleas-alto': 'cruce-alto', 'cruce-poleas-bajo': 'cruce-bajo',
  'aperturas-mancuernas': 'aperturas', 'pec-deck': 'aperturas', 'flexiones': 'flexiones',
  'extension-polea-barra': 'pushdown', 'extension-polea-cuerda': 'pushdown', 'patada-triceps': 'patada',
  'fondos-banco': 'fondos-banco', 'press-frances': 'frances', 'extension-sobre-cabeza': 'sobre-cabeza',
  'press-hombros-mancuernas': 'press-hombros', 'elevaciones-laterales': 'laterales', 'elevaciones-frontales': 'frontales',
  'face-pull': 'face-pull', 'pajaros': 'pajaros',
  'jalon-pecho-ancho': 'jalon', 'jalon-pecho-cerrado': 'jalon', 'jalon-maquina-independiente': 'jalon', 'remo-alto-maquina': 'jalon',
  'dominadas': 'jalon', 'remo-sentado-v': 'remo-sentado', 'remo-sentado-ancho': 'remo-sentado', 'remo-mancuerna': 'remo-mancuerna',
  'remo-maquina': 'remo-sentado', 'pull-over': 'pull-over', 'hiperextensiones': 'hiperextensiones', 'encogimientos': 'encogimientos',
  'curl-mancuernas': 'curl', 'curl-martillo': 'curl', 'curl-barra': 'curl', 'curl-inclinado': 'curl-inclinado',
  'curl-scott': 'curl-scott', 'curl-concentrado': 'curl-concentrado', 'curl-polea': 'curl',
  'prensa': 'prensa', 'extension-cuadriceps': 'extension-cuadriceps', 'curl-femoral-acostado': 'curl-femoral-acostado',
  'curl-femoral-sentado': 'curl-femoral-sentado', 'gemelos-pie': 'gemelos-pie', 'gemelos-sentado': 'gemelos-sentado',
  'sentadilla-goblet': 'goblet', 'sentadilla-barra': 'sentadilla', 'estocadas': 'estocadas', 'sentadilla-bulgara': 'estocadas',
  'peso-muerto-rumano': 'peso-muerto-rumano', 'hip-thrust': 'hip-thrust', 'aductores': 'aductores', 'abductores': 'abductores',
};

function animacionDe(ejercicioId) {
  const k = EJ_ANIM[ejercicioId];
  return k ? ANIMACIONES[k] : null;
}

// ---------- geometría ----------
function rad(g) { return g * Math.PI / 180; }
function punta(x, y, ang, largo) { return [x + Math.cos(rad(ang)) * largo, y + Math.sin(rad(ang)) * largo]; }

function interpolar(a, b, t) {
  const out = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  keys.forEach(k => {
    const va = a[k] !== undefined ? a[k] : b[k];
    const vb = b[k] !== undefined ? b[k] : a[k];
    out[k] = typeof va === 'number' ? va + (vb - va) * t : va;
  });
  return out;
}

function svgFijo(fijo) {
  return (fijo || []).map(f => {
    if (f.rect) return `<rect x="${f.rect[0]}" y="${f.rect[1]}" width="${f.rect[2]}" height="${f.rect[3]}" rx="2" class="eq"/>`;
    if (f.line) return `<line x1="${f.line[0]}" y1="${f.line[1]}" x2="${f.line[2]}" y2="${f.line[3]}" class="eq" stroke-width="${f.w || 4}"/>`;
    return '';
  }).join('');
}

function seg(x, y, ang, largo, clase) {
  const [x2, y2] = punta(x, y, ang, largo);
  return { svg: `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="${clase || 'cuerpo'}"/>`, x: x2, y: y2 };
}

function svgCarga(tipo, wx, wy, hx, hy) {
  if (!tipo) return '';
  if (tipo === 'barra') return `<circle cx="${wx.toFixed(1)}" cy="${wy.toFixed(1)}" r="7" class="carga"/>`;
  if (tipo === 'mancuerna') return `<rect x="${(wx - 6).toFixed(1)}" y="${(wy - 3).toFixed(1)}" width="12" height="6" rx="2" class="carga"/>`;
  if (tipo === 'cadera') return `<circle cx="${hx.toFixed(1)}" cy="${(hy - 6).toFixed(1)}" r="7" class="carga"/>`;
  if (tipo.startsWith('polea:')) {
    const [px, py] = tipo.slice(6).split(',').map(Number);
    return `<line x1="${px}" y1="${py}" x2="${wx.toFixed(1)}" y2="${wy.toFixed(1)}" class="cable"/><rect x="${(wx - 5).toFixed(1)}" y="${(wy - 2).toFixed(1)}" width="10" height="4" class="carga"/>`;
  }
  return '';
}

// Figura de costado.
function figuraLado(pose, carga) {
  const partes = [];
  const hx = pose.hx, hy = pose.hy;
  // piernas (la de atrás primero, más tenue)
  const m2 = pose.muslo2 !== undefined ? pose.muslo2 : pose.muslo;
  const p2 = pose.pierna2 !== undefined ? pose.pierna2 : pose.pierna;
  const pie2 = pose.pie2 !== undefined ? pose.pie2 : pose.pie;
  let s = seg(hx, hy, m2, LARGO.muslo, 'cuerpo atras'); partes.push(s.svg);
  s = seg(s.x, s.y, p2, LARGO.pierna, 'cuerpo atras'); partes.push(s.svg);
  s = seg(s.x, s.y, pie2, LARGO.pie, 'cuerpo atras'); partes.push(s.svg);
  // torso y cabeza
  const hombro = punta(hx, hy, pose.torso, LARGO.torso);
  hombro[1] += pose.hombroY || 0;
  partes.push(`<line x1="${hx}" y1="${hy}" x2="${hombro[0].toFixed(1)}" y2="${hombro[1].toFixed(1)}" class="cuerpo"/>`);
  const cab = punta(hombro[0], hombro[1], pose.torso, LARGO.cabeza + 6);
  partes.push(`<circle cx="${cab[0].toFixed(1)}" cy="${cab[1].toFixed(1)}" r="${LARGO.cabeza}" class="cabeza"/>`);
  // brazo de atrás
  const b2 = pose.brazo2 !== undefined ? pose.brazo2 : pose.brazo;
  const a2 = pose.antebrazo2 !== undefined ? pose.antebrazo2 : pose.antebrazo;
  s = seg(hombro[0], hombro[1], b2, LARGO.brazo, 'cuerpo atras'); partes.push(s.svg);
  s = seg(s.x, s.y, a2, LARGO.antebrazo, 'cuerpo atras'); partes.push(s.svg);
  // pierna de adelante
  s = seg(hx, hy, pose.muslo, LARGO.muslo); partes.push(s.svg);
  s = seg(s.x, s.y, pose.pierna, LARGO.pierna); partes.push(s.svg);
  s = seg(s.x, s.y, pose.pie, LARGO.pie); partes.push(s.svg);
  // brazo de adelante y carga
  s = seg(hombro[0], hombro[1], pose.brazo, LARGO.brazo); partes.push(s.svg);
  s = seg(s.x, s.y, pose.antebrazo, LARGO.antebrazo); partes.push(s.svg);
  partes.push(svgCarga(carga, s.x, s.y, hx, hy));
  return partes.join('');
}

// Figura de frente: brazos y piernas espejados. Los ángulos de la pose son los del lado derecho del dibujo.
function figuraFrente(pose, carga) {
  const partes = [];
  const hx = pose.hx, hy = pose.hy;
  const hombroY = hy - LARGO.torso + (pose.hombroY || 0);
  partes.push(`<line x1="${hx}" y1="${hy}" x2="${hx}" y2="${hombroY.toFixed(1)}" class="cuerpo"/>`);
  partes.push(`<circle cx="${hx}" cy="${(hombroY - LARGO.cabeza - 6).toFixed(1)}" r="${LARGO.cabeza}" class="cabeza"/>`);
  partes.push(`<line x1="${hx - 14}" y1="${hombroY.toFixed(1)}" x2="${hx + 14}" y2="${hombroY.toFixed(1)}" class="cuerpo"/>`);
  partes.push(`<line x1="${hx - 8}" y1="${hy}" x2="${hx + 8}" y2="${hy}" class="cuerpo"/>`);
  [1, -1].forEach(lado => {
    const esp = ang => lado === 1 ? ang : 180 - ang;
    let s = seg(hx + 8 * lado, hy, esp(pose.muslo), LARGO.muslo); partes.push(s.svg);
    s = seg(s.x, s.y, esp(pose.pierna), LARGO.pierna); partes.push(s.svg);
    s = seg(hx + 14 * lado, hombroY, esp(pose.brazo), LARGO.brazo); partes.push(s.svg);
    s = seg(s.x, s.y, esp(pose.antebrazo), LARGO.antebrazo); partes.push(s.svg);
    partes.push(svgCarga(carga, s.x, s.y, hx, hy));
  });
  return partes.join('');
}

function svgAnimacion(anim, t) {
  const pose = interpolar(anim.a, anim.b, t);
  const cuerpo = anim.vista === 'frente' ? figuraFrente(pose, anim.carga) : figuraLado(pose, anim.carga);
  return `<line x1="0" y1="${PISO}" x2="200" y2="${PISO}" class="piso"/>${svgFijo(anim.fijo)}${cuerpo}`;
}

// ---------- montaje en la página ----------
// Busca <div data-anim="id-ejercicio"> y los anima en bucle. Se llama después de cada render.
let _animFrame = null;
function montarAnimaciones() {
  if (_animFrame) cancelAnimationFrame(_animFrame);
  const nodos = [...document.querySelectorAll('[data-anim]')].map(el => {
    const anim = animacionDe(el.dataset.anim);
    if (!anim) { el.innerHTML = '<div class="sub">Sin animación para este ejercicio.</div>'; return null; }
    el.innerHTML = `<svg viewBox="0 0 200 160" class="muneco"><g></g></svg>`;
    return { g: el.querySelector('g'), anim };
  }).filter(Boolean);
  if (!nodos.length) return;
  const inicio = performance.now();
  const CICLO = 2400; // ida y vuelta
  function paso(ahora) {
    const f = ((ahora - inicio) % CICLO) / CICLO;
    // ida y vuelta con pausa corta en los extremos
    let t = f < 0.5 ? f * 2 : (1 - f) * 2;
    t = Math.min(1, Math.max(0, (t - 0.05) / 0.9));
    t = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // suavizado
    nodos.forEach(n => { n.g.innerHTML = svgAnimacion(n.anim, t); });
    _animFrame = requestAnimationFrame(paso);
  }
  _animFrame = requestAnimationFrame(paso);
}
