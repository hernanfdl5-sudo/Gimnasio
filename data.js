// Versión de la app. Se muestra en Ajustes para saber si el celu tiene la última.
const VERSION_APP = '1.8';

// Catálogo de ejercicios, zonas y rutinas por defecto.
// Todo lo que está acá se puede modificar desde la app (Rutinas > Catálogo).

const GRUPOS = {
  pecho: 'Pecho',
  triceps: 'Tríceps',
  hombros: 'Hombros',
  espalda: 'Espalda',
  biceps: 'Bíceps',
  piernas: 'Piernas',
};

// Zonas por grupo. El orden es el orden en que se muestran.
const ZONAS = {
  pecho: ['Pecho superior', 'Pecho medio', 'Pecho inferior / cierre'],
  triceps: ['Tríceps · empuje', 'Tríceps · cabeza larga'],
  hombros: ['Hombro frontal', 'Hombro lateral', 'Hombro posterior'],
  espalda: ['Dorsal · tirón vertical', 'Espalda media · remo', 'Espalda alta / hombro posterior', 'Zona lumbar', 'Trapecio'],
  biceps: ['Bíceps', 'Braquial / antebrazo'],
  piernas: ['Cuádriceps / glúteo · compuesto', 'Cuádriceps · aislado', 'Isquiotibiales / glúteo', 'Isquiotibiales · aislado', 'Glúteo', 'Gemelos', 'Aductores / abductores'],
};

const UNIDADES = {
  kg: { label: 'kilos', corto: 'kg' },
  discos: { label: 'discos (o nivel de la máquina)', corto: 'discos' },
  corporal: { label: 'peso corporal (+kg extra)', corto: '+kg' },
};

const CATALOGO = [
  // ---------------- PECHO ----------------
  {
    id: 'press-banca', nombre: 'Press de banca con barra', tecnico: 'Barbell bench press',
    grupo: 'pecho', zona: 'Pecho medio', equipo: 'Barra y banco plano', unidad: 'kg',
    tecnica: [
      'Acostado, pies firmes en el piso, omóplatos juntos y pecho hacia arriba.',
      'Agarre un poco más ancho que los hombros. Bajá la barra controlada hasta rozar el pecho, a la altura de los pezones.',
      'Los codos van a unos 45 grados del cuerpo, no abiertos del todo.',
      'Empujá hasta estirar los brazos sin despegar la cola del banco.',
    ],
    errores: ['Rebotar la barra en el pecho.', 'Codos muy abiertos (castiga el hombro).', 'Levantar la cola del banco.'],
  },
  {
    id: 'press-plano-mancuernas', nombre: 'Press plano con mancuernas', tecnico: 'Dumbbell bench press',
    grupo: 'pecho', zona: 'Pecho medio', equipo: 'Mancuernas y banco plano', unidad: 'kg',
    tecnica: [
      'Acostado con una mancuerna en cada mano a la altura del pecho, palmas al frente.',
      'Empujá hacia arriba juntando apenas las mancuernas al final.',
      'Bajá lento hasta que los codos queden un poco por debajo del banco.',
      'Mantené los omóplatos juntos todo el tiempo.',
    ],
    errores: ['Chocar las mancuernas arriba con fuerza.', 'Bajar demasiado y forzar el hombro.'],
  },
  {
    id: 'press-inclinado-mancuernas', nombre: 'Press inclinado con mancuernas', tecnico: 'Incline dumbbell press',
    grupo: 'pecho', zona: 'Pecho superior', equipo: 'Mancuernas y banco inclinado (30-45°)', unidad: 'kg',
    tecnica: [
      'Banco inclinado entre 30 y 45 grados, nunca más vertical.',
      'Mancuernas a la altura del pecho alto, palmas al frente.',
      'Empujá hacia arriba y un poco hacia atrás, siguiendo la inclinación.',
      'Bajá controlado hasta sentir el estiramiento en la parte alta del pecho.',
    ],
    errores: ['Banco demasiado inclinado: se vuelve ejercicio de hombro.', 'Arquear la espalda baja para hacer fuerza.'],
  },
  {
    id: 'press-inclinado-barra', nombre: 'Press inclinado con barra', tecnico: 'Incline barbell press',
    grupo: 'pecho', zona: 'Pecho superior', equipo: 'Barra y banco inclinado', unidad: 'kg',
    tecnica: [
      'Banco a 30-45 grados. Agarre un poco más ancho que los hombros.',
      'Bajá la barra hasta la parte alta del pecho, cerca de las clavículas.',
      'Codos a 45 grados del cuerpo.',
      'Empujá hacia arriba sin que la barra se vaya hacia la cara.',
    ],
    errores: ['Bajar la barra al cuello.', 'Rebotar en el pecho.'],
  },
  {
    id: 'cruce-poleas-alto', nombre: 'Cruce de poleas alto', tecnico: 'High cable crossover',
    grupo: 'pecho', zona: 'Pecho inferior / cierre', equipo: 'Poleas altas', unidad: 'discos',
    tecnica: [
      'Poleas en lo más alto, una manija en cada mano, un pie adelante para estabilizar.',
      'Inclinate apenas hacia adelante con los codos un poco flexionados y fijos.',
      'Llevá las manos hacia abajo y adelante hasta que se crucen frente a la cadera.',
      'Apretá el pecho un segundo y volvé lento hasta sentir el estiramiento.',
    ],
    errores: ['Doblar y estirar los codos: eso es tríceps, no pecho.', 'Usar tanto peso que el cuerpo se va hacia adelante.'],
  },
  {
    id: 'cruce-poleas-bajo', nombre: 'Cruce de poleas bajo', tecnico: 'Low cable crossover',
    grupo: 'pecho', zona: 'Pecho superior', equipo: 'Poleas bajas', unidad: 'discos',
    tecnica: [
      'Poleas en lo más bajo, manija en cada mano, un pie adelante.',
      'Con los codos apenas flexionados, llevá las manos hacia arriba y adelante como abrazando.',
      'Terminá con las manos a la altura de los ojos, juntas.',
      'Bajá lento con control.',
    ],
    errores: ['Encoger los hombros hacia las orejas.', 'Balancear el cuerpo.'],
  },
  {
    id: 'aperturas-mancuernas', nombre: 'Aperturas con mancuernas', tecnico: 'Dumbbell fly',
    grupo: 'pecho', zona: 'Pecho medio', equipo: 'Mancuernas y banco plano', unidad: 'kg',
    tecnica: [
      'Acostado, mancuernas arriba del pecho con los brazos casi estirados y codos un poco doblados.',
      'Abrí los brazos en arco hacia los costados hasta sentir el estiramiento en el pecho.',
      'Volvé por el mismo arco como si abrazaras un tronco.',
      'Peso liviano: es un ejercicio de estiramiento y control, no de fuerza.',
    ],
    errores: ['Bajar demasiado y forzar el hombro.', 'Doblar los codos al subir y convertirlo en press.'],
  },
  {
    id: 'pec-deck', nombre: 'Máquina contractora (pec deck)', tecnico: 'Pec deck / chest fly machine',
    grupo: 'pecho', zona: 'Pecho inferior / cierre', equipo: 'Máquina', unidad: 'discos',
    tecnica: [
      'Sentado con la espalda apoyada, manijas a la altura del pecho.',
      'Juntá las manijas al frente apretando el pecho, codos apenas doblados.',
      'Sostené un segundo con las manos juntas.',
      'Abrí lento hasta sentir el estiramiento, sin pasar la línea del hombro.',
    ],
    errores: ['Dejar que el peso te abra los brazos de golpe.', 'Despegar la espalda del respaldo.'],
  },
  {
    id: 'flexiones', nombre: 'Flexiones de brazos', tecnico: 'Push-up',
    grupo: 'pecho', zona: 'Pecho medio', equipo: 'Sin equipo', unidad: 'corporal',
    tecnica: [
      'Manos un poco más abiertas que los hombros, cuerpo recto como una tabla.',
      'Bajá el pecho hasta casi tocar el piso con los codos a 45 grados.',
      'Empujá hasta estirar los brazos.',
      'Apretá el abdomen y el glúteo para que la cadera no caiga.',
    ],
    errores: ['Cadera caída o levantada.', 'Hacer medio recorrido.'],
  },

  // ---------------- TRÍCEPS ----------------
  {
    id: 'extension-polea-barra', nombre: 'Extensión de tríceps en polea (barra)', tecnico: 'Cable triceps pushdown',
    grupo: 'triceps', zona: 'Tríceps · empuje', equipo: 'Polea alta con barra corta', unidad: 'discos',
    tecnica: [
      'Parado frente a la polea alta, agarrá la barra con las palmas hacia abajo.',
      'Codos pegados a los costados del cuerpo y quietos durante todo el movimiento.',
      'Empujá hacia abajo hasta estirar los brazos por completo.',
      'Volvé controlado hasta que los antebrazos pasen la horizontal.',
    ],
    errores: ['Separar los codos del cuerpo.', 'Inclinarse hacia adelante y empujar con el peso del cuerpo.'],
  },
  {
    id: 'extension-polea-cuerda', nombre: 'Extensión de tríceps en polea (cuerda)', tecnico: 'Rope triceps pushdown',
    grupo: 'triceps', zona: 'Tríceps · empuje', equipo: 'Polea alta con cuerda', unidad: 'discos',
    tecnica: [
      'Igual que con la barra, pero con la cuerda.',
      'Al llegar abajo, separá las manos hacia los costados girando las muñecas.',
      'Eso aprieta más el tríceps en el final.',
      'Codos fijos, pegados al cuerpo.',
    ],
    errores: ['Mover los codos hacia adelante y atrás.', 'No separar las manos abajo.'],
  },
  {
    id: 'patada-triceps', nombre: 'Patada de tríceps con mancuerna', tecnico: 'Triceps kickback',
    grupo: 'triceps', zona: 'Tríceps · empuje', equipo: 'Mancuerna', unidad: 'kg',
    tecnica: [
      'Inclinate hacia adelante con el tronco casi horizontal, una mano apoyada en un banco.',
      'Codo pegado al costado, doblado a 90 grados.',
      'Estirá el brazo hacia atrás hasta que quede recto, sin mover el codo.',
      'Volvé lento. Peso liviano, este ejercicio no admite trampa.',
    ],
    errores: ['Hacerlo parado derecho: la mancuerna no opone resistencia.', 'Dejar caer el codo.'],
  },
  {
    id: 'fondos-banco', nombre: 'Fondos en banco', tecnico: 'Bench dips',
    grupo: 'triceps', zona: 'Tríceps · cabeza larga', equipo: 'Banco', unidad: 'corporal',
    tecnica: [
      'Manos apoyadas en el borde de un banco detrás tuyo, dedos hacia adelante.',
      'Piernas estiradas al frente (más duro) o dobladas (más fácil).',
      'Bajá el cuerpo doblando los codos hasta unos 90 grados.',
      'Empujá hasta estirar los brazos. Para más carga, apoyá un disco sobre los muslos.',
    ],
    errores: ['Bajar demasiado y sentir pinchazo en el hombro.', 'Separar la cola del banco hacia adelante.'],
  },
  {
    id: 'press-frances', nombre: 'Press francés', tecnico: 'Skull crusher / lying triceps extension',
    grupo: 'triceps', zona: 'Tríceps · cabeza larga', equipo: 'Barra Z o mancuernas, banco plano', unidad: 'kg',
    tecnica: [
      'Acostado en banco plano, barra o mancuernas con los brazos estirados hacia arriba.',
      'Bajá el peso doblando solo los codos, hasta la frente o un poco por detrás de la cabeza.',
      'Los brazos (del hombro al codo) quedan quietos, apuntando al techo.',
      'Estirá los codos para volver arriba.',
    ],
    errores: ['Mover los codos hacia adelante y atrás.', 'Usar tanto peso que se pierde el control cerca de la cara.'],
  },
  {
    id: 'extension-sobre-cabeza', nombre: 'Extensión de tríceps sobre la cabeza', tecnico: 'Overhead triceps extension',
    grupo: 'triceps', zona: 'Tríceps · cabeza larga', equipo: 'Mancuerna', unidad: 'kg',
    tecnica: [
      'Sentado o parado, una mancuerna sostenida con las dos manos por encima de la cabeza.',
      'Bajá la mancuerna por detrás de la cabeza doblando los codos.',
      'Codos apuntando al frente, cerca de las orejas.',
      'Estirá los brazos para volver arriba.',
    ],
    errores: ['Abrir los codos hacia los costados.', 'Arquear la espalda baja.'],
  },

  // ---------------- HOMBROS ----------------
  {
    id: 'press-hombros-mancuernas', nombre: 'Press de hombros con mancuernas', tecnico: 'Dumbbell shoulder press',
    grupo: 'hombros', zona: 'Hombro frontal', equipo: 'Mancuernas, banco con respaldo', unidad: 'kg',
    tecnica: [
      'Sentado con la espalda apoyada, mancuernas a la altura de las orejas, palmas al frente.',
      'Empujá hacia arriba hasta casi estirar los brazos, sin chocar las mancuernas.',
      'Bajá controlado hasta que los codos queden a 90 grados.',
      'Abdomen apretado para no arquear la espalda.',
    ],
    errores: ['Arquear mucho la espalda baja.', 'Bajar demasiado con los codos por debajo del hombro.'],
  },
  {
    id: 'elevaciones-laterales', nombre: 'Elevaciones laterales', tecnico: 'Lateral raise',
    grupo: 'hombros', zona: 'Hombro lateral', equipo: 'Mancuernas', unidad: 'kg',
    tecnica: [
      'Parado, mancuernas a los costados, codos apenas doblados.',
      'Subí los brazos hacia los costados hasta la altura de los hombros.',
      'Imaginá que vertés agua de una jarra: el meñique un poco más alto que el pulgar.',
      'Bajá lento. Peso liviano y control.',
    ],
    errores: ['Encoger los hombros hacia las orejas (eso es trapecio).', 'Balancear el cuerpo para subir el peso.'],
  },
  {
    id: 'elevaciones-frontales', nombre: 'Elevaciones frontales', tecnico: 'Front raise',
    grupo: 'hombros', zona: 'Hombro frontal', equipo: 'Mancuernas o disco', unidad: 'kg',
    tecnica: [
      'Parado, mancuernas frente a los muslos.',
      'Subí los brazos al frente hasta la altura de los ojos, codos apenas doblados.',
      'Bajá lento sin que el peso te empuje.',
      'Si hacés mucho press, este se puede saltear: el hombro frontal ya trabaja ahí.',
    ],
    errores: ['Balancearse.', 'Subir mucho más arriba de los hombros.'],
  },
  {
    id: 'face-pull', nombre: 'Face pull (tirón a la cara)', tecnico: 'Face pull',
    grupo: 'hombros', zona: 'Hombro posterior', equipo: 'Polea alta con cuerda', unidad: 'discos',
    tecnica: [
      'Polea a la altura de la cara con la cuerda. Agarrá con los pulgares apuntando hacia vos.',
      'Tirá hacia la cara abriendo las manos, como si la cuerda tuviera que pasar por los costados de las orejas.',
      'Los codos terminan altos y abiertos, a la altura de los hombros.',
      'Apretá los omóplatos un segundo y volvé lento.',
    ],
    errores: ['Codos caídos: se vuelve ejercicio de bíceps.', 'Demasiado peso y tirar con todo el cuerpo.'],
  },
  {
    id: 'pajaros', nombre: 'Pájaros (vuelos posteriores)', tecnico: 'Rear delt fly / bent-over reverse fly',
    grupo: 'hombros', zona: 'Hombro posterior', equipo: 'Mancuernas', unidad: 'kg',
    tecnica: [
      'Inclinado hacia adelante con el tronco casi horizontal y la espalda recta.',
      'Mancuernas colgando, codos apenas doblados.',
      'Abrí los brazos hacia los costados hasta la altura de los hombros.',
      'Bajá lento. Peso liviano.',
    ],
    errores: ['Redondear la espalda.', 'Usar impulso.'],
  },

  // ---------------- ESPALDA ----------------
  {
    id: 'jalon-pecho-ancho', nombre: 'Jalón al pecho agarre ancho', tecnico: 'Wide-grip lat pulldown',
    grupo: 'espalda', zona: 'Dorsal · tirón vertical', equipo: 'Máquina de jalón', unidad: 'discos',
    tecnica: [
      'Sentado con los muslos trabados, agarre ancho con las palmas al frente.',
      'Inclinate apenas hacia atrás, pecho hacia arriba.',
      'Tirá de la barra hasta la parte alta del pecho, llevando los codos hacia abajo y atrás.',
      'Volvé lento hasta estirar los brazos y sentir el estiramiento en los costados.',
    ],
    errores: ['Tirar detrás de la nuca.', 'Hacer impulso con el cuerpo hacia atrás.', 'Hacer medio recorrido sin estirar arriba.'],
  },
  {
    id: 'jalon-pecho-cerrado', nombre: 'Jalón al pecho agarre cerrado', tecnico: 'Close-grip / neutral-grip lat pulldown',
    grupo: 'espalda', zona: 'Dorsal · tirón vertical', equipo: 'Máquina de jalón con agarre en V o supino', unidad: 'discos',
    tecnica: [
      'Con el agarre en V (palmas enfrentadas) o con la barra y palmas hacia vos, manos al ancho de los hombros.',
      'Tirá hasta la parte alta del pecho con los codos pegados al cuerpo.',
      'Carga más la parte baja del dorsal y mete más bíceps que el agarre ancho.',
      'Estirá bien arriba en cada repetición.',
    ],
    errores: ['Tirar con los brazos sin llevar los codos atrás.', 'Balancearse.'],
  },
  {
    id: 'jalon-maquina-independiente', nombre: 'Jalón en máquina de brazos independientes', tecnico: 'Iso-lateral pulldown',
    grupo: 'espalda', zona: 'Dorsal · tirón vertical', equipo: 'Máquina de discos con manijas arriba y topes para las piernas', unidad: 'discos',
    tecnica: [
      'Sentado mirando hacia adelante, muslos trabados bajo los topes.',
      'Agarrá las manijas por encima de la cabeza y tirá hacia abajo hasta la altura del pecho.',
      'Codos hacia abajo y atrás, pecho arriba. Cada brazo trabaja por separado: que no baje uno más que el otro.',
      'Volvé lento hasta estirar del todo y sentir el tirón en los costados.',
    ],
    errores: ['Encoger los hombros hacia las orejas.', 'Hacer medio recorrido sin estirar arriba.', 'Un brazo que tira más que el otro.'],
  },
  {
    id: 'remo-alto-maquina', nombre: 'Remo alto en máquina (pecho apoyado)', tecnico: 'Iso-lateral high row',
    grupo: 'espalda', zona: 'Dorsal · tirón vertical', equipo: 'Máquina de discos con almohadón para el pecho', unidad: 'discos',
    tecnica: [
      'Sentado de frente a la máquina, pecho apoyado en el almohadón.',
      'Agarrá las manijas arriba y tirá hacia abajo y atrás, llevando los codos hacia la cadera.',
      'Apretá los omóplatos al final.',
      'Volvé lento hasta estirar del todo.',
    ],
    errores: ['Despegar el pecho del almohadón para hacer fuerza.', 'Tirar solo con los brazos.'],
  },
  {
    id: 'dominadas', nombre: 'Dominadas', tecnico: 'Pull-up',
    grupo: 'espalda', zona: 'Dorsal · tirón vertical', equipo: 'Barra fija (o máquina asistida)', unidad: 'corporal',
    tecnica: [
      'Colgado de la barra con las palmas al frente, agarre un poco más ancho que los hombros.',
      'Tirá hasta que el mentón pase la barra, llevando los codos hacia abajo.',
      'Bajá lento hasta estirar del todo.',
      'Si no salen, usá la máquina asistida o una banda elástica.',
    ],
    errores: ['Balancearse.', 'No estirar abajo.'],
  },
  {
    id: 'remo-sentado-v', nombre: 'Remo sentado en polea (agarre en V)', tecnico: 'Seated cable row, close grip',
    grupo: 'espalda', zona: 'Espalda media · remo', equipo: 'Polea baja con agarre en V', unidad: 'discos',
    tecnica: [
      'Sentado con las rodillas apenas dobladas, espalda recta, pecho arriba.',
      'Tirá del agarre hacia la panza llevando los codos hacia atrás, pegados al cuerpo.',
      'Apretá los omóplatos al final como si quisieras sostener un lápiz entre ellos.',
      'Volvé lento dejando que los hombros se estiren hacia adelante.',
    ],
    errores: ['Mecerse hacia adelante y atrás con todo el tronco.', 'Redondear la espalda.'],
  },
  {
    id: 'remo-sentado-ancho', nombre: 'Remo sentado en polea (agarre ancho)', tecnico: 'Seated cable row, wide grip',
    grupo: 'espalda', zona: 'Espalda alta / hombro posterior', equipo: 'Polea baja con barra larga', unidad: 'discos',
    tecnica: [
      'En la misma máquina del remo, enganchá la barra larga del jalón.',
      'Agarre ancho, palmas hacia abajo.',
      'Tirá hacia el pecho (no a la panza) con los codos abiertos hacia los costados.',
      'Apretá los omóplatos y volvé lento.',
    ],
    errores: ['Tirar a la panza con los codos pegados: eso es el remo cerrado.', 'Mecerse.'],
  },
  {
    id: 'remo-mancuerna', nombre: 'Remo con mancuerna a una mano', tecnico: 'One-arm dumbbell row',
    grupo: 'espalda', zona: 'Espalda media · remo', equipo: 'Mancuerna y banco', unidad: 'kg',
    tecnica: [
      'Rodilla y mano del mismo lado apoyadas en el banco, tronco casi horizontal, espalda recta.',
      'Con la otra mano, levantá la mancuerna del piso hacia la cadera.',
      'El codo va pegado al cuerpo y pasa la línea de la espalda.',
      'Bajá lento hasta estirar del todo.',
    ],
    errores: ['Girar el tronco para subir el peso.', 'Tirar hacia el hombro en vez de hacia la cadera.'],
  },
  {
    id: 'remo-maquina', nombre: 'Remo en máquina de discos', tecnico: 'Plate-loaded row machine',
    grupo: 'espalda', zona: 'Espalda media · remo', equipo: 'Máquina de discos con apoyo de pecho', unidad: 'discos',
    tecnica: [
      'Pecho apoyado en el almohadón, agarrá las manijas.',
      'Tirá hacia atrás llevando los codos hacia la cadera.',
      'Apretá los omóplatos al final.',
      'Volvé lento sin despegar el pecho.',
    ],
    errores: ['Empujar con las piernas y despegar el pecho.', 'Hacer medio recorrido.'],
  },
  {
    id: 'pull-over', nombre: 'Pull-over con mancuerna', tecnico: 'Dumbbell pullover',
    grupo: 'espalda', zona: 'Dorsal · tirón vertical', equipo: 'Mancuerna y banco plano', unidad: 'kg',
    tecnica: [
      'Acostado en el banco, mancuerna sostenida con las dos manos sobre el pecho.',
      'Con los brazos casi estirados, bajala en arco por detrás de la cabeza.',
      'Pará cuando sientas el estiramiento en los costados y volvé por el mismo arco.',
      'Trabaja dorsal y algo de pecho.',
    ],
    errores: ['Doblar mucho los codos.', 'Arquear demasiado la espalda baja.'],
  },
  {
    id: 'hiperextensiones', nombre: 'Hiperextensiones', tecnico: 'Back extension',
    grupo: 'espalda', zona: 'Zona lumbar', equipo: 'Banco de hiperextensiones', unidad: 'kg',
    tecnica: [
      'Muslos apoyados en el almohadón, pies trabados, cuerpo en diagonal boca abajo.',
      'Bajá el tronco doblando desde la cadera, espalda recta.',
      'Subí hasta quedar en línea recta con las piernas, no más arriba.',
      'Para más carga, abrazá un disco contra el pecho. Anotá 0 si lo hacés sin peso.',
    ],
    errores: ['Subir de más y arquear la espalda hacia atrás.', 'Hacerlo rápido con impulso.'],
  },
  {
    id: 'encogimientos', nombre: 'Encogimientos de hombros', tecnico: 'Shrugs',
    grupo: 'espalda', zona: 'Trapecio', equipo: 'Mancuernas o barra', unidad: 'kg',
    tecnica: [
      'Parado con el peso colgando a los costados.',
      'Subí los hombros hacia las orejas lo más alto que puedas.',
      'Sostené un segundo arriba.',
      'Bajá lento. No rotes los hombros en círculo.',
    ],
    errores: ['Rotar los hombros.', 'Doblar los codos.'],
  },

  // ---------------- BÍCEPS ----------------
  {
    id: 'curl-mancuernas', nombre: 'Curl de bíceps con mancuernas', tecnico: 'Dumbbell biceps curl',
    grupo: 'biceps', zona: 'Bíceps', equipo: 'Mancuernas', unidad: 'kg',
    tecnica: [
      'Parado, mancuernas a los costados, palmas al frente.',
      'Subí doblando solo los codos, que quedan pegados al cuerpo.',
      'Apretá arriba un segundo.',
      'Bajá lento hasta estirar del todo.',
    ],
    errores: ['Balancear el cuerpo para subir el peso.', 'Llevar los codos hacia adelante.'],
  },
  {
    id: 'curl-martillo', nombre: 'Curl martillo', tecnico: 'Hammer curl',
    grupo: 'biceps', zona: 'Braquial / antebrazo', equipo: 'Mancuernas', unidad: 'kg',
    tecnica: [
      'Igual que el curl normal, pero con las palmas enfrentadas (como sosteniendo un martillo).',
      'Codos pegados al cuerpo.',
      'Subí hasta arriba y bajá lento.',
      'Trabaja el braquial, que está debajo del bíceps, y el antebrazo.',
    ],
    errores: ['Balancearse.', 'Girar la muñeca al subir.'],
  },
  {
    id: 'curl-barra', nombre: 'Curl con barra', tecnico: 'Barbell curl',
    grupo: 'biceps', zona: 'Bíceps', equipo: 'Barra recta o Z', unidad: 'kg',
    tecnica: [
      'Parado, barra con las palmas al frente, manos al ancho de los hombros.',
      'Subí doblando los codos, que quedan quietos a los costados.',
      'Bajá lento sin que la barra te tire hacia adelante.',
      'Permite más peso que las mancuernas.',
    ],
    errores: ['Mecerse con la espalda.', 'No estirar abajo.'],
  },
  {
    id: 'curl-inclinado', nombre: 'Curl en banco inclinado', tecnico: 'Incline dumbbell curl',
    grupo: 'biceps', zona: 'Bíceps', equipo: 'Mancuernas y banco inclinado', unidad: 'kg',
    tecnica: [
      'Sentado en un banco inclinado hacia atrás (unos 45-60 grados), brazos colgando detrás de la línea del cuerpo.',
      'Hacé el curl sin mover los codos hacia adelante.',
      'Al tener el brazo atrás, estira más el bíceps que el curl parado.',
      'Bajá lento hasta estirar del todo.',
    ],
    errores: ['Llevar los codos hacia adelante.', 'Usar mucho peso y perder el control.'],
  },
  {
    id: 'curl-scott', nombre: 'Curl en banco Scott', tecnico: 'Preacher curl',
    grupo: 'biceps', zona: 'Bíceps', equipo: 'Banco Scott con barra o mancuernas', unidad: 'kg',
    tecnica: [
      'Brazos apoyados en el almohadón inclinado, axilas pegadas al borde.',
      'Subí el peso doblando los codos.',
      'Bajá lento, sin estirar de golpe al final.',
      'Al estar apoyado, el bíceps trabaja solo sin ayuda del cuerpo.',
    ],
    errores: ['Soltar el peso en la bajada: castiga el codo.', 'Despegar los brazos del almohadón.'],
  },
  {
    id: 'curl-concentrado', nombre: 'Curl concentrado', tecnico: 'Concentration curl',
    grupo: 'biceps', zona: 'Bíceps', equipo: 'Mancuerna y banco', unidad: 'kg',
    tecnica: [
      'Sentado, piernas abiertas, codo apoyado contra la parte interna del muslo.',
      'Subí la mancuerna hacia el hombro doblando solo el codo.',
      'Apretá arriba.',
      'Bajá lento hasta estirar.',
    ],
    errores: ['Despegar el codo del muslo.', 'Impulsar con el hombro.'],
  },
  {
    id: 'curl-polea', nombre: 'Curl en polea baja', tecnico: 'Cable curl',
    grupo: 'biceps', zona: 'Bíceps', equipo: 'Polea baja con barra o cuerda', unidad: 'discos',
    tecnica: [
      'Parado frente a la polea baja, agarre con las palmas hacia arriba.',
      'Subí doblando los codos, que quedan pegados al cuerpo.',
      'La polea mantiene la tensión todo el recorrido.',
      'Bajá lento.',
    ],
    errores: ['Mecerse.', 'Codos hacia adelante.'],
  },

  // ---------------- PIERNAS ----------------
  {
    id: 'prensa', nombre: 'Prensa de piernas', tecnico: 'Leg press',
    grupo: 'piernas', zona: 'Cuádriceps / glúteo · compuesto', equipo: 'Prensa 45°', unidad: 'discos',
    tecnica: [
      'Espalda y cola bien apoyadas, pies al ancho de los hombros en el medio de la plataforma.',
      'Bajá controlado hasta que las rodillas lleguen a unos 90 grados.',
      'Empujá sin estirar las rodillas del todo arriba.',
      'Pies más arriba en la plataforma: más glúteo. Más abajo: más cuádriceps.',
    ],
    errores: ['Despegar la cola del asiento al bajar (curva la espalda baja).', 'Trabar las rodillas arriba.', 'Rodillas que se van hacia adentro.'],
  },
  {
    id: 'extension-cuadriceps', nombre: 'Extensión de cuádriceps', tecnico: 'Leg extension',
    grupo: 'piernas', zona: 'Cuádriceps · aislado', equipo: 'Máquina', unidad: 'discos',
    tecnica: [
      'Sentado con la espalda apoyada, rodillo sobre los tobillos.',
      'Estirá las piernas hasta arriba y sostené un segundo.',
      'Bajá lento, sin que el peso caiga.',
      'Es la "patada para adelante".',
    ],
    errores: ['Dejar caer el peso.', 'Levantar la cola del asiento.'],
  },
  {
    id: 'curl-femoral-acostado', nombre: 'Curl femoral acostado', tecnico: 'Lying leg curl',
    grupo: 'piernas', zona: 'Isquiotibiales · aislado', equipo: 'Máquina', unidad: 'discos',
    tecnica: [
      'Boca abajo, rodillo sobre los tobillos, cadera pegada al banco.',
      'Llevá los talones hacia la cola.',
      'Sostené un segundo arriba.',
      'Bajá lento. Es la "patada acostado".',
    ],
    errores: ['Levantar la cadera del banco.', 'Hacerlo rápido con impulso.'],
  },
  {
    id: 'curl-femoral-sentado', nombre: 'Curl femoral sentado', tecnico: 'Seated leg curl',
    grupo: 'piernas', zona: 'Isquiotibiales · aislado', equipo: 'Máquina', unidad: 'discos',
    tecnica: [
      'Sentado con el muslo trabado por el almohadón de arriba.',
      'Llevá los talones hacia abajo y atrás, doblando las rodillas.',
      'Sostené un segundo.',
      'Volvé lento hasta estirar.',
    ],
    errores: ['Despegar la espalda del respaldo.', 'Medio recorrido.'],
  },
  {
    id: 'gemelos-pie', nombre: 'Elevación de talones de pie', tecnico: 'Standing calf raise',
    grupo: 'piernas', zona: 'Gemelos', equipo: 'Máquina de gemelos de pie', unidad: 'discos',
    tecnica: [
      'Hombros bajo las almohadillas, punta de los pies en el escalón, talones colgando.',
      'Bajá los talones hasta sentir el estiramiento.',
      'Subí en punta de pie lo más alto posible y sostené un segundo.',
      'Hacelo lento: los gemelos responden al recorrido completo.',
    ],
    errores: ['Rebotar abajo.', 'Doblar las rodillas para ayudar.'],
  },
  {
    id: 'gemelos-sentado', nombre: 'Elevación de talones sentado', tecnico: 'Seated calf raise',
    grupo: 'piernas', zona: 'Gemelos', equipo: 'Máquina de gemelos sentado', unidad: 'kg',
    tecnica: [
      'Sentado con el almohadón sobre las rodillas, punta de los pies en el escalón.',
      'Bajá los talones hasta estirar.',
      'Subí en punta de pie y sostené un segundo.',
      'Trabaja el sóleo, el músculo que está debajo del gemelo.',
    ],
    errores: ['Rebotar.', 'Recorrido corto.'],
  },
  {
    id: 'sentadilla-goblet', nombre: 'Sentadilla goblet', tecnico: 'Goblet squat',
    grupo: 'piernas', zona: 'Cuádriceps / glúteo · compuesto', equipo: 'Mancuerna', unidad: 'kg',
    tecnica: [
      'Mancuerna vertical sostenida con las dos manos pegada al pecho.',
      'Pies un poco más abiertos que los hombros, puntas apenas hacia afuera.',
      'Sentate hacia abajo como si hubiera una silla, hasta que los muslos queden paralelos al piso.',
      'Rodillas en la dirección de las puntas de los pies. Pecho arriba. Subí empujando el piso.',
    ],
    errores: ['Rodillas hacia adentro.', 'Talones que se levantan.', 'Redondear la espalda.'],
  },
  {
    id: 'sentadilla-barra', nombre: 'Sentadilla con barra', tecnico: 'Barbell back squat',
    grupo: 'piernas', zona: 'Cuádriceps / glúteo · compuesto', equipo: 'Barra y rack', unidad: 'kg',
    tecnica: [
      'Barra apoyada sobre los trapecios (no sobre el cuello), pies al ancho de los hombros.',
      'Bajá empujando la cadera hacia atrás y doblando las rodillas, pecho arriba.',
      'Llegá a muslos paralelos al piso o un poco más abajo.',
      'Subí empujando el piso con todo el pie.',
    ],
    errores: ['Rodillas hacia adentro.', 'Redondear la espalda baja al fondo.', 'Mirar el techo.'],
  },
  {
    id: 'estocadas', nombre: 'Estocadas', tecnico: 'Lunges',
    grupo: 'piernas', zona: 'Cuádriceps / glúteo · compuesto', equipo: 'Mancuernas o sin peso', unidad: 'kg',
    tecnica: [
      'Parado, un paso largo hacia adelante.',
      'Bajá la rodilla de atrás hasta casi tocar el piso. La de adelante queda sobre el tobillo.',
      'Empujá con la pierna de adelante para volver a la posición inicial.',
      'Alterná piernas. Con mancuernas en las manos para más carga.',
    ],
    errores: ['Paso corto y rodilla de adelante que pasa mucho la punta del pie.', 'Inclinar el tronco hacia adelante.'],
  },
  {
    id: 'sentadilla-bulgara', nombre: 'Sentadilla búlgara', tecnico: 'Bulgarian split squat',
    grupo: 'piernas', zona: 'Cuádriceps / glúteo · compuesto', equipo: 'Banco y mancuernas', unidad: 'kg',
    tecnica: [
      'Pie de atrás apoyado sobre un banco, pie de adelante a un paso largo.',
      'Bajá doblando la rodilla de adelante hasta que el muslo quede paralelo al piso.',
      'Tronco derecho o apenas inclinado adelante.',
      'Subí empujando con el pie de adelante. Hacé todas las repeticiones de un lado y después el otro.',
    ],
    errores: ['Pie de adelante muy cerca del banco.', 'Perder el equilibrio por ir con demasiado peso.'],
  },
  {
    id: 'peso-muerto-rumano', nombre: 'Peso muerto rumano', tecnico: 'Romanian deadlift',
    grupo: 'piernas', zona: 'Isquiotibiales / glúteo', equipo: 'Barra o mancuernas', unidad: 'kg',
    tecnica: [
      'Parado con el peso frente a los muslos, rodillas apenas dobladas y así quedan.',
      'Empujá la cola hacia atrás y bajá el peso rozando las piernas, espalda recta.',
      'Pará cuando sientas el tirón atrás de los muslos, más o menos a la altura de las rodillas.',
      'Subí apretando el glúteo, sin tirar con la espalda.',
    ],
    errores: ['Redondear la espalda.', 'Doblar las rodillas y convertirlo en sentadilla.', 'Alejar el peso del cuerpo.'],
  },
  {
    id: 'hip-thrust', nombre: 'Hip thrust (empuje de cadera)', tecnico: 'Hip thrust',
    grupo: 'piernas', zona: 'Glúteo', equipo: 'Banco y barra o disco', unidad: 'kg',
    tecnica: [
      'Espalda alta apoyada en el borde de un banco, pies en el piso al ancho de la cadera.',
      'Barra o disco sobre la cadera (con una almohadilla).',
      'Levantá la cadera hasta que el tronco quede horizontal, como una mesa.',
      'Apretá el glúteo arriba un segundo. Mentón hacia el pecho. Bajá controlado.',
    ],
    errores: ['Arquear la espalda baja arriba en vez de apretar el glúteo.', 'Pies muy lejos o muy cerca.'],
  },
  {
    id: 'aductores', nombre: 'Aductores en máquina', tecnico: 'Hip adduction machine',
    grupo: 'piernas', zona: 'Aductores / abductores', equipo: 'Máquina', unidad: 'discos',
    tecnica: [
      'Sentado con las piernas abiertas contra las almohadillas.',
      'Cerrá las piernas apretando la cara interna del muslo.',
      'Sostené un segundo.',
      'Abrí lento.',
    ],
    errores: ['Dejar que el peso te abra de golpe.'],
  },
  {
    id: 'abductores', nombre: 'Abductores en máquina', tecnico: 'Hip abduction machine',
    grupo: 'piernas', zona: 'Aductores / abductores', equipo: 'Máquina', unidad: 'discos',
    tecnica: [
      'Sentado con las almohadillas por fuera de las rodillas.',
      'Abrí las piernas contra la resistencia.',
      'Sostené un segundo.',
      'Cerrá lento. Trabaja el glúteo medio, el de los costados.',
    ],
    errores: ['Hacerlo rápido con impulso.'],
  },
];

// Rutinas por defecto. Cada día tiene grupos (secciones desplegables) y, dentro de cada grupo,
// zonas con varias opciones de ejercicio. En cada sesión elegís un ejercicio por zona.
const DIAS_DEFAULT = [
  {
    id: 'pecho', nombre: 'Pecho y tríceps', grupo: 'pecho', grupos: ['pecho', 'triceps', 'hombros'],
    zonas: [
      { id: 'p1', grupo: 'pecho', zona: 'Pecho superior', opciones: ['press-inclinado-mancuernas', 'press-inclinado-barra', 'cruce-poleas-bajo'] },
      { id: 'p2', grupo: 'pecho', zona: 'Pecho medio', opciones: ['press-banca', 'press-plano-mancuernas', 'aperturas-mancuernas', 'flexiones'] },
      { id: 'p3', grupo: 'pecho', zona: 'Pecho inferior / cierre', opciones: ['cruce-poleas-alto', 'pec-deck'] },
      { id: 'p4', grupo: 'triceps', zona: 'Tríceps · empuje', opciones: ['extension-polea-barra', 'extension-polea-cuerda', 'patada-triceps'] },
      { id: 'p5', grupo: 'triceps', zona: 'Tríceps · cabeza larga', opciones: ['press-frances', 'extension-sobre-cabeza', 'fondos-banco'] },
      { id: 'p6', grupo: 'hombros', zona: 'Hombro frontal', opciones: ['press-hombros-mancuernas', 'elevaciones-frontales'] },
      { id: 'p7', grupo: 'hombros', zona: 'Hombro lateral', opciones: ['elevaciones-laterales'] },
    ],
  },
  {
    id: 'espalda', nombre: 'Espalda y bíceps', grupo: 'espalda', grupos: ['espalda', 'biceps'],
    zonas: [
      { id: 'e1', grupo: 'espalda', zona: 'Dorsal · tirón vertical', opciones: ['jalon-pecho-ancho', 'jalon-pecho-cerrado', 'jalon-maquina-independiente', 'remo-alto-maquina', 'dominadas', 'pull-over'] },
      { id: 'e2', grupo: 'espalda', zona: 'Espalda media · remo', opciones: ['remo-sentado-v', 'remo-mancuerna', 'remo-maquina'] },
      { id: 'e3', grupo: 'espalda', zona: 'Espalda alta / hombro posterior', opciones: ['remo-sentado-ancho', 'face-pull', 'pajaros'] },
      { id: 'e4', grupo: 'espalda', zona: 'Zona lumbar', opciones: ['hiperextensiones'] },
      { id: 'e5', grupo: 'espalda', zona: 'Trapecio', opciones: ['encogimientos'] },
      { id: 'e6', grupo: 'biceps', zona: 'Bíceps', opciones: ['curl-mancuernas', 'curl-barra', 'curl-inclinado', 'curl-scott', 'curl-concentrado', 'curl-polea'] },
      { id: 'e7', grupo: 'biceps', zona: 'Braquial / antebrazo', opciones: ['curl-martillo'] },
    ],
  },
  {
    id: 'piernas', nombre: 'Piernas', grupo: 'piernas', grupos: ['piernas'],
    zonas: [
      { id: 'l1', grupo: 'piernas', zona: 'Cuádriceps / glúteo · compuesto', opciones: ['prensa', 'sentadilla-goblet', 'sentadilla-barra', 'estocadas', 'sentadilla-bulgara'] },
      { id: 'l2', grupo: 'piernas', zona: 'Isquiotibiales / glúteo', opciones: ['peso-muerto-rumano', 'hip-thrust'] },
      { id: 'l3', grupo: 'piernas', zona: 'Cuádriceps · aislado', opciones: ['extension-cuadriceps'] },
      { id: 'l4', grupo: 'piernas', zona: 'Isquiotibiales · aislado', opciones: ['curl-femoral-acostado', 'curl-femoral-sentado'] },
      { id: 'l5', grupo: 'piernas', zona: 'Gemelos', opciones: ['gemelos-pie', 'gemelos-sentado'] },
      { id: 'l6', grupo: 'piernas', zona: 'Aductores / abductores', opciones: ['aductores', 'abductores'] },
    ],
  },
];

// Ejercicios que hace habitualmente (según lo que contó al armar la app). Son los que aparecen primero en cada parte;
// el resto queda en "Ver otros ejercicios". Al hacer uno nuevo pasa solo a esta lista.
const MIS_EJERCICIOS_INICIALES = [
  'press-banca', 'press-inclinado-mancuernas', 'cruce-poleas-alto',
  'extension-polea-barra', 'extension-polea-cuerda',
  'press-hombros-mancuernas', 'elevaciones-laterales',
  'jalon-pecho-ancho', 'jalon-pecho-cerrado', 'jalon-maquina-independiente', 'remo-sentado-v',
  'curl-mancuernas', 'curl-martillo',
  'prensa', 'extension-cuadriceps', 'curl-femoral-acostado', 'gemelos-pie',
];

const ACTIVIDADES = ['Pádel', 'Boxeo', 'Natación', 'Fútbol', 'Correr', 'Bici', 'Caminata', 'Otra'];

// Objetivo de sesiones por semana por grupo.
const OBJETIVO_SEMANAL_DEFAULT = { pecho: 2, espalda: 2, piernas: 1 };
