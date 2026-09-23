/* Procesador por Dentro — datos y textos.
   Aquí se cambian los textos sin tocar la lógica. */
window.PXD = window.PXD || {};
PXD.data = (function () {
  'use strict';

  /* ---------- Piezas (de abajo hacia arriba) ---------- */
  const PIECES = {
    contactos: {
      name: 'Contactos dorados', tag: 'fab', short: 'Por aquí entra la energía y viajan los datos.',
      what: 'Son cientos de puntitos dorados en la parte de abajo del procesador. Cada uno toca un pin del socket de la tarjeta madre.',
      why: 'Por unos entra la electricidad que alimenta al chip y por otros viajan los datos hacia la memoria RAM, la tarjeta de video, el disco y lo demás.',
      fact: 'Un procesador de escritorio actual tiene alrededor de 1,700 contactos. Son de oro porque el oro no se oxida y conduce muy bien.',
      material: 'Cobre con baño de oro',
      step: 'Primero va la base. En la vida real los contactos ya vienen pegados al sustrato desde la fábrica; aquí los separamos para que los veas.',
      hint: 'Empieza por lo que toca directamente la tarjeta madre.',
      dims: { hw: 2.15, y0: -0.08, y1: -0.06 }
    },
    sustrato: {
      name: 'Sustrato', tag: 'fab', short: 'El puente entre el chip y la tarjeta madre.',
      what: 'Es una placa de circuito pequeña, verde o café, hecha de varias capas de resina y cobre.',
      why: 'Las conexiones del chip de silicio son microscópicas. El sustrato las “agranda” y las lleva hasta los contactos, que sí tienen un tamaño que la tarjeta madre puede tocar.',
      fact: 'Por dentro tiene más de 10 capas de pistas de cobre, una encima de otra, como un edificio de cables.',
      material: 'Resina con capas de cobre',
      step: 'El sustrato se asienta sobre los contactos. Ya existe el puente entre el chip y la tarjeta madre.',
      hint: '¿Qué placa verde conecta los contactos con todo lo de arriba?',
      dims: { hw: 2.25, y0: -0.06, y1: 0.06 }
    },
    capacitores: {
      name: 'Capacitores', tag: 'fab', short: 'Pequeñas “pilas instantáneas” de energía.',
      what: 'Son componentes diminutos soldados sobre el sustrato, alrededor de la tapa.',
      why: 'Guardan un poco de energía y la sueltan al instante cuando el procesador pide más corriente de golpe. Así el voltaje no baja y el chip no se traba.',
      fact: 'El consumo del procesador puede cambiar miles de veces por segundo. Los capacitores reaccionan más rápido que la fuente de poder.',
      material: 'Cerámica con terminales metálicas',
      step: 'Se sueldan los capacitores. Ahora el chip tendrá energía estable aunque su consumo cambie mucho.',
      hint: 'Antes del chip, el sustrato necesita algo que mantenga la energía estable.',
      dims: { hw: 2.25, y0: 0.06, y1: 0.12 }
    },
    die: {
      name: 'Die (chip de silicio)', tag: 'fab', short: 'El cerebro: miles de millones de transistores.',
      what: 'Es el procesador de verdad: un pedacito de silicio del tamaño de una uña, con miles de millones de transistores.',
      why: 'Un transistor es un interruptor que se prende y se apaga. Combinando miles de millones, el chip suma, compara y toma decisiones. Aquí están los núcleos, la caché, la gráfica integrada y el controlador de memoria.',
      fact: 'Se fabrica sobre una oblea de silicio usando luz ultravioleta, como si se “imprimiera” con luz. Un transistor mide unos pocos nanómetros; un cabello mide unos 80,000.',
      material: 'Silicio',
      step: 'El die se pega al sustrato con miles de bolitas de soldadura microscópicas. Este es el cerebro: en “Cómo funciona” lo puedes ver trabajar.',
      hint: 'Ya hay base y energía estable. Falta lo más importante: el cerebro.',
      dims: { hw: 1.1, y0: 0.06, y1: 0.12 }
    },
    tim1: {
      name: 'Material térmico interno', tag: 'fab', short: 'Saca el calor del chip hacia la tapa.',
      what: 'Una capa muy delgada de material entre el chip y la tapa metálica. Se le conoce como TIM1.',
      why: 'Lleva el calor del chip hacia la tapa. Sin ella quedaría aire en medio, y el aire casi no deja pasar el calor.',
      fact: 'Los procesadores de gama alta usan soldadura de metal (indio) en lugar de pasta, porque conduce mucho mejor el calor.',
      material: 'Soldadura de indio o pasta',
      step: 'Se pone el material térmico interno sobre el die para que el calor pueda salir hacia arriba.',
      hint: 'Antes de cerrar con la tapa, el chip necesita algo que le saque el calor.',
      dims: { hw: 1.1, y0: 0.12, y1: 0.14 }
    },
    ihs: {
      name: 'Tapa metálica (IHS)', tag: 'fab', short: 'Protege el chip y reparte su calor.',
      what: 'Es la tapa metálica que ves cuando sacas un procesador de su caja. IHS significa “repartidor de calor integrado”.',
      why: 'Protege al chip, que es muy frágil, y reparte su calor en un área más grande para que el disipador lo saque mejor.',
      fact: 'Es de cobre con un baño de níquel. Encima viene impreso el modelo y el número de serie.',
      material: 'Cobre niquelado',
      step: 'Se cierra con la tapa metálica. Hasta aquí es trabajo de la fábrica: el procesador ya está listo para venderse.',
      hint: 'Hay que cerrar y proteger el chip.',
      dims: { hw: 1.8, y0: 0.06, y1: 0.30 }
    },
    pasta: {
      name: 'Pasta térmica', tag: 'pc', short: 'Rellena los huecos para que el calor pase.',
      what: 'Una pasta gris que se pone sobre la tapa metálica. Esta la pones tú al armar la computadora.',
      why: 'La tapa y el disipador tienen rayitas microscópicas. La pasta rellena esos huecos para que no quede aire y el calor pase bien.',
      fact: 'Basta una gota del tamaño de un chícharo. Poner de más no enfría mejor y puede ensuciar la tarjeta madre.',
      material: 'Silicona con partículas de metal o cerámica',
      step: 'Ahora te toca a ti: una gota de pasta térmica en el centro. Al apretar el disipador se esparce sola.',
      hint: 'El procesador ya está cerrado. Antes del disipador va algo pequeño y gris.',
      dims: { hw: 0.85, y0: 0.30, y1: 0.35 }
    },
    disipador: {
      name: 'Disipador', tag: 'pc', short: 'Pasa el calor al aire con sus aletas.',
      what: 'Un bloque de metal con muchas aletas. La base suele ser de cobre y las aletas de aluminio.',
      why: 'Recibe el calor y lo reparte en las aletas. Más aletas significa más superficie para pasarle el calor al aire.',
      fact: 'Muchos disipadores tienen tubos de calor (heat pipes) con un líquido que se evapora y se condensa para mover el calor muy rápido.',
      material: 'Base de cobre y aletas de aluminio',
      step: 'El disipador aprieta la pasta y queda pegado a la tapa. El calor ya tiene camino hacia las aletas.',
      hint: 'Sobre la pasta va la pieza grande de metal con aletas.',
      dims: { hw: 2.15, y0: 0.34, y1: 2.19 }
    },
    ventilador: {
      name: 'Ventilador', tag: 'pc', short: 'Mueve aire para llevarse el calor.',
      what: 'El abanico que va sobre el disipador.',
      why: 'Mueve aire entre las aletas para llevarse el calor. Si el aire no se mueve, las aletas se calientan y dejan de enfriar.',
      fact: 'La tarjeta madre controla su velocidad: gira más rápido cuando el procesador se calienta y más lento cuando descansa.',
      material: 'Plástico con motor eléctrico',
      step: 'Se conecta el ventilador. ¡Listo! El procesador puede encender sin sobrecalentarse.',
      hint: 'Solo falta una pieza: la que mueve el aire.',
      dims: { hw: 2.0, y0: 2.19, y1: 2.61 }
    }
  };
  const ORDER = ['contactos', 'sustrato', 'capacitores', 'die', 'tim1', 'ihs', 'pasta', 'disipador', 'ventilador'];
  const OFFSET = { contactos: 0.6, sustrato: 1.3, capacitores: 2.0, die: 2.7, tim1: 3.4, ihs: 4.3, pasta: 5.3, disipador: 6.3, ventilador: 8.6 };
  const SCATTER = ['ventilador', 'die', 'pasta', 'contactos', 'disipador', 'tim1', 'capacitores', 'ihs', 'sustrato'];

  /* ---------- Cómo funciona ---------- */
  const STEPS = [
    { t: 'El reloj marca el ritmo', x: 'Todo empieza con el reloj: una señal que late miles de millones de veces por segundo. Este procesador trabaja a 4.8 GHz, o sea 4,800 millones de latidos cada segundo. En cada latido, cada parte del chip da un pasito.', hl: ['all'] },
    { t: 'Pedir datos a la RAM', x: 'El programa y sus datos viven en la memoria RAM, fuera del chip. El controlador de memoria es la puerta del procesador hacia la RAM: pide lo que se necesita y lo trae.', hl: ['mem'] },
    { t: 'Guardar en la caché L3', x: 'Para el procesador, la RAM está lejos y es lenta. Por eso lo que llega se guarda en la caché L3, una memoria rapidísima dentro del chip que comparten todos los núcleos.', hl: ['l3'] },
    { t: 'Pasar a la caché del núcleo', x: 'Cada núcleo tiene su propia caché L2 y L1: más pequeñas, pero todavía más rápidas. Es como tener lo que usas en tu escritorio en lugar de ir al almacén.', hl: ['c1.l2', 'c1.l1'] },
    { t: 'Buscar la instrucción', x: 'El núcleo toma la siguiente instrucción del programa. En este ejemplo es: suma lo que hay en R1 con lo que hay en R2 y guárdalo en R3. R1, R2 y R3 son registros: los “cajoncitos” más rápidos del núcleo.', hl: ['c1.fetch'] },
    { t: 'Decodificar', x: 'La instrucción llega como unos y ceros. El decodificador la traduce a órdenes sencillas que las otras partes entienden: “toma R1, toma R2, súmalos”.', hl: ['c1.dec'] },
    { t: 'Ejecutar', x: 'La ALU (unidad aritmética y lógica) hace la cuenta: 2 + 3 = 5. Es la calculadora del núcleo.', hl: ['c1.alu'] },
    { t: 'Guardar el resultado', x: 'El 5 se guarda en el registro R3 y se copia a la caché. Si otra instrucción lo necesita, ya está cerca.', hl: ['c1.l1', 'l3'] },
    { t: 'Todo al mismo tiempo', x: 'Lo que acabas de ver pasa miles de millones de veces por segundo, en los 8 núcleos a la vez. Mientras tanto, la gráfica integrada dibuja la pantalla y las entradas y salidas hablan con el disco, el USB y la tarjeta de video.', hl: ['cores', 'gpu', 'io'] }
  ];
  const REGION_INFO = {
    mem: ['Controlador de memoria', 'La puerta hacia la RAM. Pide datos y los trae al chip, y guarda de regreso los resultados.'],
    io: ['Entradas y salidas (E/S)', 'Conexiones hacia la tarjeta de video, el disco SSD, los USB y la red. Casi todas viajan por PCIe.'],
    gpu: ['Gráfica integrada', 'Dibuja lo que ves en la pantalla cuando no tienes tarjeta de video aparte. Tiene cientos de “mini núcleos” pensados para imágenes.'],
    l3: ['Caché L3', 'Memoria muy rápida que comparten todos los núcleos. Guarda lo que se trajo de la RAM para no volver a ir por ello.'],
    core: ['Núcleo', 'Un procesador completo en miniatura. Lee instrucciones y las ejecuta una tras otra. Con 8 núcleos, el chip puede hacer 8 tareas a la vez.'],
    fetch: ['Buscar (fetch)', 'Trae la siguiente instrucción del programa desde la caché L1.'],
    dec: ['Decodificador', 'Traduce la instrucción, que viene en unos y ceros, a órdenes sencillas para el resto del núcleo.'],
    alu: ['ALU', 'La calculadora del núcleo: suma, resta, compara y hace operaciones lógicas.'],
    l1: ['Caché L1', 'La memoria más rápida y más pequeña. Está pegada al núcleo, junto a los registros.'],
    l2: ['Caché L2', 'Un poco más grande y un poco más lenta que la L1. Es exclusiva de este núcleo.']
  };

  /* ---------- Fabricación ---------- */
  const FAB = [
    { t: 'Arena', x: 'Todo empieza con arena común. La arena tiene mucho sílice, que es silicio unido con oxígeno. El silicio es el segundo elemento más abundante de la corteza de la Tierra.', fact: 'Se usa arena de cuarzo muy limpia, no la de cualquier playa.' },
    { t: 'Silicio ultrapuro', x: 'La arena se funde y se purifica varias veces hasta tener silicio de 99.9999999 % de pureza (“nueve nueves”). Un átomo de otra cosa entre mil millones puede arruinar un chip.', fact: 'El silicio se derrite a unos 1,414 °C.' },
    { t: 'El lingote', x: 'En un horno se mete una pequeña semilla de cristal en el silicio derretido y se va jalando despacio mientras gira. Así crece un lingote: un solo cristal perfecto de silicio.', fact: 'Un lingote de 30 cm de diámetro puede pesar más de 100 kg y tardar días en crecer.' },
    { t: 'Cortar obleas', x: 'El lingote se rebana con sierras de alambre muy finas. Cada rebanada es una oblea: un disco de menos de 1 mm de grueso donde se van a fabricar cientos de chips.', fact: 'Una oblea de 30 cm mide unos 0.78 mm de grueso.' },
    { t: 'Pulido', x: 'Cada oblea se pule hasta quedar como espejo. Tiene que ser plana casi a nivel de átomos, porque encima se van a “imprimir” los circuitos.', fact: 'Se pule con químicos y un disco giratorio al mismo tiempo (pulido químico-mecánico).' },
    { t: 'Litografía', x: 'Se cubre la oblea con un material sensible a la luz. Una máquina proyecta luz ultravioleta extrema (EUV) a través de una máscara con el dibujo del circuito, reducido varias veces. Donde pega la luz, el material cambia.', fact: 'Las máquinas de litografía EUV cuestan más de 150 millones de dólares cada una.' },
    { t: 'Grabado y capas', x: 'Se quita (graba) lo que no sirve, se ponen metales y aislantes, y se repite: luz, grabado, depósito… Primero se forman los transistores y encima más de 10 capas de “cables” de cobre.', fact: 'Un chip moderno pasa por más de mil pasos y tarda unos 3 meses en fabricarse.' },
    { t: 'Pruebas', x: 'Con agujas microscópicas se prueba cada chip de la oblea. Los que fallan se marcan. El porcentaje de chips buenos se llama rendimiento (yield).', fact: 'Los chips que funcionan, pero con menos núcleos o menos velocidad, se venden como modelos más baratos.' },
    { t: 'Corte', x: 'Una sierra de diamante o un láser separa la oblea en cientos de chips individuales. Cada uno es un die.', fact: 'Solo se empaquetan los dies que pasaron las pruebas.' },
    { t: 'Empaquetado', x: 'El die se pega al sustrato, se pone el material térmico y se cierra con la tapa metálica. Se prueba otra vez y ya es el procesador que compras.', fact: 'Este es el paso donde el chip se vuelve algo que puedes tocar y poner en una tarjeta madre.' }
  ];

  /* ---------- Comparar ---------- */
  const COMPARE = {
    tamanos: {
      title: 'Celular, laptop y escritorio',
      lead: 'Los tres hacen lo mismo, pero con distinto espacio, energía y forma de enfriarse. Están a la misma escala.',
      items: [
        { id: 'celular', name: 'Celular', size: '~1 × 1 cm', cores: '6–8', trans: '~15,000–20,000 millones', power: '~5–10 W', node: '3–4 nm', cool: 'Sin ventilador: el calor se reparte en el cuerpo del teléfono', note: 'Se llama SoC (“sistema en un chip”): CPU, gráfica, módem e IA en un solo chip. La RAM va apilada encima.' },
        { id: 'laptop', name: 'Laptop', size: '~4 × 2.5 cm', cores: '8–16', trans: '~10,000–25,000 millones', power: '~15–55 W', node: '3–7 nm', cool: 'Ventilador pequeño y tubos de calor', note: 'Va soldado a la tarjeta madre (BGA) y sin tapa metálica: el disipador toca el chip directo.' },
        { id: 'escritorio', name: 'Escritorio', size: '~4.5 × 3.8 cm', cores: '8–24', trans: '~10,000–25,000 millones', power: '~65–250 W', node: '3–7 nm', cool: 'Disipador grande o enfriamiento líquido', note: 'Va en un socket, así que se puede cambiar. Tiene tapa metálica para proteger el chip.' }
      ]
    },
    epocas: {
      title: '1993 contra hoy',
      lead: 'En 30 años el procesador cabe en un espacio parecido, pero tiene miles de veces más transistores.',
      items: [
        { id: 'viejo', name: '1993 (Pentium original)', size: '~5 × 5 cm', cores: '1', trans: '3.1 millones', power: '~15 W', node: '800 nm', cool: 'Disipador pequeño, a veces sin ventilador', note: 'Tenía 273 pines y trabajaba a 60–66 MHz. Los pines estaban en el procesador (PGA).' },
        { id: 'escritorio', name: 'Hoy (escritorio)', size: '~4.5 × 3.8 cm', cores: '8–24', trans: '~10,000–25,000 millones', power: '~65–250 W', node: '3–7 nm', cool: 'Disipador grande o enfriamiento líquido', note: 'Trabaja a 4–6 GHz: unas 70 veces más rápido por núcleo, y con muchos núcleos a la vez.' }
      ]
    }
  };

  /* ---------- Sockets ---------- */
  const SOCKETS = {
    lga: { name: 'LGA — pines en la tarjeta madre', what: 'Land Grid Array. Los pines son resortitos que están en el socket de la tarjeta madre. El procesador solo tiene contactos planos.', who: 'Intel desde 2004 y AMD desde AM5 (2022).', good: 'Caben más contactos en menos espacio y el procesador es muy resistente.', bad: 'Si se dobla un pin del socket, la que se daña es la tarjeta madre.' },
    pga: { name: 'PGA — pines en el procesador', what: 'Pin Grid Array. Los pines están debajo del procesador y el socket tiene agujeritos. Una palanca (ZIF) lo aprieta sin hacer fuerza.', who: 'Muchos AMD hasta AM4 y la mayoría de procesadores de los 90.', good: 'La tarjeta madre es más resistente. Un pin doblado a veces se puede enderezar.', bad: 'Los pines del procesador son frágiles: si se rompe uno, el procesador puede quedar inservible.' },
    bga: 'En laptops y celulares casi siempre se usa BGA: el procesador va soldado con bolitas de estaño y no se puede cambiar.'
  };

  /* ---------- Laboratorio térmico ---------- */
  const LAB = {
    loads: { reposo: { name: 'Reposo', w: 10, ghz: 1.2 }, navegar: { name: 'Navegar', w: 35, ghz: 3.5 }, jugar: { name: 'Jugar', w: 90, ghz: 4.6 }, render: { name: 'Renderizar', w: 150, ghz: 4.8 } },
    paste: { nada: { name: 'Nada', r: 0.35, tip: 'Sin pasta queda aire entre la tapa y el disipador. El aire aísla, así que el calor se atora.' },
      poca: { name: 'Poca', r: 0.10, tip: 'Con poca pasta quedan zonas con aire: el centro del chip se calienta más.' },
      correcta: { name: 'Correcta', r: 0.02, tip: 'Una gota del tamaño de un chícharo: cubre todo sin sobrar.' },
      demasiada: { name: 'Demasiada', r: 0.04, tip: 'La pasta de más se sale por los lados y ensucia. Enfría un poco peor que la cantidad correcta.' } },
    ambient: 25, limit: 95, rChip: 0.08
  };

  return { PIECES, ORDER, OFFSET, SCATTER, STEPS, REGION_INFO, FAB, COMPARE, SOCKETS, LAB };
})();
