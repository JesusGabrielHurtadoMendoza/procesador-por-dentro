/* Procesador por Dentro — núcleo de la aplicación:
   escena 3D, modos Desarmar / Armar / Cómo funciona, laboratorio térmico,
   arrastrar piezas, cronómetro, sonidos, presentación y carga de los otros modos. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const panel = $('panel'), dock = $('dock');
  if (!window.THREE || !THREE.OrbitControls || !window.PXD || !PXD.data) {
    panel.innerHTML = '<h2>No cargó el motor 3D</h2><p>Revisa tu conexión a internet y vuelve a abrir la página.</p>';
    return;
  }
  const D = PXD.data, PIECES = D.PIECES, ORDER = D.ORDER, OFFSET = D.OFFSET, SCATTER = D.SCATTER, STEPS = D.STEPS, REGION_INFO = D.REGION_INFO, LAB = D.LAB;
  const viewer = $('viewer'), canvas = $('c'), labelsEl = $('labels');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= ESCENA ================= */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0B1016);
  scene.fog = new THREE.Fog(0x0B1016, 32, 75);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 200);
  camera.position.set(6, 5, 8);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.minDistance = 1.6; controls.maxDistance = 45;
  controls.maxPolarAngle = Math.PI * 0.495; controls.autoRotateSpeed = 0.7; controls.autoRotate = !reduce;

  const kit = PXD.makeKit(THREE, renderer), V = kit.V, M = kit.M;
  (function env() {
    const pm = new THREE.PMREMGenerator(renderer), es = new THREE.Scene();
    es.add(new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0x0c1015, side: THREE.BackSide })));
    const lp = (w, h, p, r, k, c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide })); m.position.copy(p); m.rotation.set(r[0], r[1], r[2]); es.add(m); };
    lp(14, 6, V(0, 14, 0), [Math.PI / 2, 0, 0], 1.7, 0xffffff);
    lp(8, 10, V(-14, 4, 2), [0, Math.PI / 2, 0], 1.0, 0xffd9b0);
    lp(8, 10, V(14, 5, -3), [0, -Math.PI / 2, 0], 0.8, 0xa8d8ff);
    scene.environment = pm.fromScene(es, 0.04).texture;
  })();
  scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x1a1410, 0.35));
  const sun = new THREE.DirectionalLight(0xfff1e0, 1.5); sun.position.set(6, 16, 8); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 50 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02; scene.add(sun);
  const rim = new THREE.DirectionalLight(0x9fd3ff, 0.55); rim.position.set(-8, 6, -10); scene.add(rim);

  /* mesa y tarjeta madre */
  const TABLE_Y = -0.19;
  const table = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), M({ color: 0x070a0d, roughness: 0.95, metalness: 0, envMapIntensity: 0.1 }));
  table.rotation.x = -Math.PI / 2; table.position.y = TABLE_Y; table.receiveShadow = true; scene.add(table);
  const bench = new THREE.Group(); scene.add(bench);
  (function buildBench() {
    const bt = kit.canvasTex(1024, 1024, (g, w, h) => { g.fillStyle = '#16201c'; g.fillRect(0, 0, w, h); const r = kit.rnd(7); g.lineWidth = 2;
      for (let i = 0; i < 260; i++) { g.strokeStyle = r() < 0.5 ? '#1f2d27' : '#243530'; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 3; k++) { if (r() < 0.5) x += (r() - 0.5) * 260; else y += (r() - 0.5) * 260; g.lineTo(x, y); } g.stroke(); }
      g.fillStyle = '#8b9aa0'; g.font = '600 22px monospace'; g.fillText('CPU', 470, 250); g.fillText('DIMM A1  A2  B1  B2', 640, 90); });
    const bm = M({ color: 0x16201c });
    const board = new THREE.Mesh(new THREE.BoxGeometry(11, 0.1, 11), [bm, bm, M({ map: bt.tex, roughness: 0.7, metalness: 0.1 }), bm, bm, bm]);
    board.position.y = -0.14; board.receiveShadow = true; bench.add(board);
    const fm = M({ color: 0x2b3238, metalness: 0.6, roughness: 0.45 });
    const add = (geo, mat, x, y, z) => kit.mk(bench, geo, mat, x, y, z);
    const b1 = new THREE.BoxGeometry(5.4, 0.12, 0.35), b2 = new THREE.BoxGeometry(0.35, 0.12, 4.7);
    add(b1, fm, 0, -0.03, 2.525); add(b1, fm, 0, -0.03, -2.525); add(b2, fm, 2.525, -0.03, 0); add(b2, fm, -2.525, -0.03, 0);
    add(new THREE.CylinderGeometry(0.05, 0.05, 4.8, 12), M({ color: 0x9aa3ab, metalness: 1, roughness: 0.3 }), 2.9, -0.04, 0).rotation.x = Math.PI / 2;
    const ft = kit.canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#1c2227'; g.fillRect(0, 0, w, h); g.fillStyle = '#b89550'; for (let i = 0; i < 46; i++) for (let j = 0; j < 46; j++) { const x = 8 + i * 10.8, y = 8 + j * 10.8; if (Math.abs(x - 256) < 70 && Math.abs(y - 256) < 70) continue; g.fillRect(x, y, 3, 3); } });
    add(new THREE.PlaneGeometry(4.7, 4.7), M({ map: ft.tex, roughness: 0.6, metalness: 0.3 }), 0, -0.087, 0).rotation.x = -Math.PI / 2;
    const choke = new THREE.BoxGeometry(0.55, 0.4, 0.55), cm = M({ color: 0x3a434b, metalness: 0.5, roughness: 0.5 });
    for (let i = 0; i < 6; i++) { add(choke, cm, -2.6 + i * 1.04, 0.11, -3.7); add(choke, cm, -3.7, 0.11, -2.6 + i * 1.04); }
    const slot = new THREE.BoxGeometry(0.24, 0.28, 8.6), sm = M({ color: 0x262d33, roughness: 0.6 });
    for (let i = 0; i < 4; i++) add(slot, sm, 4.0 + i * 0.42, 0.05, 0);
    const ec = new THREE.CylinderGeometry(0.22, 0.22, 0.6, 20), em = M({ color: 0x3d4b58, metalness: 0.7, roughness: 0.35 });
    [[-4.6, 4.2], [-4, 4.2], [-3.4, 4.2], [3, -4.6], [2.4, -4.6]].forEach(p => add(ec, em, p[0], 0.21, p[1]));
  })();
  const stage = new THREE.Group(); scene.add(stage);

  /* piezas */
  const die = PXD.makeDie(kit);
  const cpu = PXD.makeCpuParts(kit, die), refs = cpu.refs;
  const P = {};
  ORDER.forEach((id, idx) => {
    const g = cpu.builders[id](); g.userData.pieceId = id; scene.add(g);
    const d = PIECES[id].dims;
    // caja invisible para que sea fácil agarrar la pieza (piezas con huecos, como los contactos)
    const proxy = new THREE.Mesh(new THREE.BoxGeometry(d.hw * 2, Math.max(0.12, d.y1 - d.y0 + 0.06), d.hw * 2), new THREE.MeshBasicMaterial());
    proxy.position.y = (d.y0 + d.y1) / 2; proxy.visible = false; proxy.userData.proxy = true; g.add(proxy);
    const k = SCATTER.indexOf(id), ang = -Math.PI / 2 + k * Math.PI * 2 / 9 + 0.2, rad = 7.9;
    const mats = []; g.traverse(o => { if (o.isMesh && !o.userData.proxy) [].concat(o.material).forEach(m => { if (!mats.includes(m)) { m.userData.orig = { c: m.emissive.clone(), i: m.emissiveIntensity }; mats.push(m); } }); });
    const lbl = document.createElement('button'); lbl.className = 'lbl'; lbl.type = 'button'; lbl.textContent = PIECES[id].name; lbl.hidden = true; labelsEl.appendChild(lbl);
    lbl.addEventListener('click', () => onPieceClick(id));
    P[id] = { id, idx, group: g, mats, lbl, dims: d, scatter: { x: Math.cos(ang) * rad, z: Math.sin(ang) * rad * 0.85 - 0.6, y: TABLE_Y - d.y0, ry: (k % 3 - 1) * 0.5 }, anim: null, drag: false };
  });
  const liquid = PXD.makeLiquid(kit, TABLE_Y); scene.add(liquid.group);
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.85, 64), new THREE.MeshBasicMaterial({ color: 0xd08a4e, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.06; ring.visible = false; scene.add(ring);

  /* ================= ESTADO ================= */
  const st = {
    mode: 'desarmar', explode: 0, explodeT: 0, selected: null, hl: null, dieGlow: 0.22, fanSpeed: 3,
    arm: { next: 0, placed: new Set(), done: false, auto: false, timer: null, errors: 0, last: null, showHint: false, t0: null, elapsed: 0, usedAuto: false, result: null },
    lab: { cooler: 'aire', paste: 'correcta', fanOn: true, load: 'navegar', T: 25, rpm: 0, peff: 0, freq: 0, throttle: false },
    fn: { step: 0, playing: false, timer: 0, region: null }
  };
  let fly = null, time = 0, dieHL = new Set();

  /* ================= UTILIDADES ================= */
  let toastT = null;
  function toast(msg, kind) { const t = $('toast'); t.textContent = msg; t.className = kind || ''; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600); }
  const tagHTML = t => t === 'fab' ? '<span class="tag fab">FÁBRICA</span>' : '<span class="tag pc">LO PONES TÚ</span>';
  const aspect = () => camera.aspect || 1;
  function flyTo(pos, target, dur) { fly = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: target, t: 0, dur: reduce ? 0.01 : (dur || 1.3) }; }
  controls.addEventListener('start', () => { fly = null; controls.autoRotate = false; });
  function setDock(html) { dock.innerHTML = html; return dock; }
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const fmtTime = s => { const m = Math.floor(s / 60), r = s - m * 60; return String(m).padStart(2, '0') + ':' + r.toFixed(1).padStart(4, '0'); };

  /* etiquetas extra (para los modos) */
  let extraLabels = [];
  function setLabels(list) {
    extraLabels.forEach(l => l.el && l.el.remove());
    extraLabels = list || [];
    extraLabels.forEach(l => { const el = document.createElement(l.onClick ? 'button' : 'div'); el.className = 'lbl lbl-up' + (l.onClick ? '' : ' passive'); el.textContent = l.text; if (l.onClick) { el.type = 'button'; el.addEventListener('click', l.onClick); } labelsEl.appendChild(el); l.el = el; });
  }
  function clearStage() {
    while (stage.children.length) {
      const c = stage.children.pop();
      c.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); });
    }
  }

  /* ================= CÁMARA POR MODO ================= */
  function frameDesarmar(e) {
    const tgt = V(0, 0.3 + e * 5.2, 0); let dir = camera.position.clone().sub(controls.target);
    if (dir.lengthSq() < 0.01) dir = V(0.55, 0.42, 0.72); dir.normalize(); if (dir.y < 0.15) { dir.y = 0.25; dir.normalize(); }
    const dist = (7.5 + e * 11) * (aspect() < 0.8 ? 1.25 : 1); return [tgt.clone().add(dir.multiplyScalar(dist)), tgt];
  }
  function frameArmar() { const dist = Math.max(19, 11.5 / (0.344 * aspect())) * 1.02; const t = V(0, 0, 1.2); return [t.clone().add(V(0, 0.78, 0.63).normalize().multiplyScalar(dist)), t]; }
  function frameFunciona() { const dist = Math.max(3.3, 1.55 / (0.344 * aspect())); const t = V(0, 0.1, 0.05); return [t.clone().add(V(0.05, 0.82, 0.57).normalize().multiplyScalar(dist)), t]; }

  /* ================= MODO DESARMAR ================= */
  function renderDesarmarIntro() {
    panel.innerHTML = '<p class="kicker">Modo desarmar</p><h2>Las 9 capas de un procesador</h2>' +
      '<p class="lede">Mueve la barra de separación o toca una pieza para saber qué es y para qué sirve.</p>' +
      '<p class="muted small">Las marcadas como <span class="tag fab">FÁBRICA</span> vienen armadas de fábrica. Las marcadas como <span class="tag pc">LO PONES TÚ</span> se ponen al armar la computadora.</p>' +
      '<ol class="plist">' + ORDER.slice().reverse().map(id => '<li><button data-id="' + id + '"><span class="n">' + String(ORDER.indexOf(id) + 1).padStart(2, '0') + '</span>' + PIECES[id].name + tagHTML(PIECES[id].tag) + '</button></li>').join('') + '</ol>' +
      '<p class="muted small">Ordenadas de arriba (ventilador) hacia abajo (contactos).</p>';
    panel.querySelectorAll('.plist button').forEach(b => b.addEventListener('click', () => selectPiece(b.dataset.id)));
  }
  function renderPiece(id) {
    const d = PIECES[id], i = ORDER.indexOf(id);
    panel.innerHTML = '<button class="btn" id="back">← Todas las piezas</button>' +
      '<p class="kicker" style="margin-top:16px">Capa ' + (i + 1) + ' de 9 ' + tagHTML(d.tag) + '</p><h2>' + d.name + '</h2><p class="lede">' + d.short + '</p>' +
      '<h3>Qué es</h3><p>' + d.what + '</p><h3>Para qué sirve</h3><p>' + d.why + '</p>' +
      '<div class="fact"><b>Dato curioso</b><p>' + d.fact + '</p></div>' +
      '<dl class="meta"><dt>Material</dt><dd>' + d.material + '</dd></dl>' +
      '<div class="row"><button class="btn" id="pPrev"' + (i === 0 ? ' disabled' : '') + '>↓ Capa de abajo</button><button class="btn" id="pNext"' + (i === 8 ? ' disabled' : '') + '>↑ Capa de arriba</button></div>';
    $('back').onclick = () => { st.selected = null; st.hl = null; renderDesarmarIntro(); };
    $('pPrev').onclick = () => selectPiece(ORDER[i - 1]); $('pNext').onclick = () => selectPiece(ORDER[i + 1]);
  }
  function selectPiece(id) { st.selected = id; st.hl = { id, color: new THREE.Color(0xd08a4e), until: Infinity }; PXD.audio.play('pick'); renderPiece(id); }
  function renderDesarmarDock() {
    setDock('<button class="btn primary" id="btnExplode">' + (st.explodeT > 0.5 ? 'Armar' : 'Desarmar') + '</button><label for="sep">Separación</label><input type="range" id="sep" min="0" max="100" value="' + Math.round(st.explodeT * 100) + '">');
    $('sep').addEventListener('input', e => { st.explodeT = e.target.value / 100; $('btnExplode').textContent = st.explodeT > 0.5 ? 'Armar' : 'Desarmar'; });
    $('sep').addEventListener('change', () => { const f = frameDesarmar(st.explodeT); flyTo(f[0], f[1], 0.9); });
    $('btnExplode').addEventListener('click', () => { st.explodeT = st.explodeT > 0.5 ? 0 : 1; renderDesarmarDock(); const f = frameDesarmar(st.explodeT); flyTo(f[0], f[1]); });
  }
  const modeDesarmar = {
    enter(first) { st.selected = null; if (!first) st.explodeT = 1; renderDesarmarDock(); renderDesarmarIntro(); if (!first) { const f = frameDesarmar(1); flyTo(f[0], f[1]); } },
    exit() { st.hl = null; },
    key(dir) { const i = st.selected ? ORDER.indexOf(st.selected) : (dir > 0 ? -1 : 9); const n = i + dir; if (n >= 0 && n < 9) selectPiece(ORDER[n]); }
  };

  /* ================= MODO ARMAR ================= */
  const REC_KEY = 'pxd-record-v1';
  function renderArmarDock() {
    const a = st.arm;
    setDock('<span class="count" id="armCount">' + a.placed.size + ' / 9</span><span class="timer" id="armTimer" title="Cronómetro">' + fmtTime(a.elapsed) + '</span><span class="errs" id="armErr">' + a.errors + (a.errors === 1 ? ' error' : ' errores') + '</span>' +
      '<button class="btn" id="btnHint"' + (a.done ? ' disabled' : '') + '>Pista</button><button class="btn primary" id="btnAuto"' + (a.done ? ' disabled' : '') + '>' + (a.auto ? 'Pausar' : 'Ver cómo se arma') + '</button><button class="btn" id="btnReset">Reiniciar</button>');
    $('btnHint').onclick = () => { if (a.done) return; a.showHint = true; st.hl = { id: ORDER[a.next], color: new THREE.Color(0x7fc4d4), until: time + 3 }; renderArmar(); };
    $('btnReset').onclick = () => resetArmar(false);
    $('btnAuto').onclick = () => {
      if (a.auto) { stopAuto(); return; }
      a.auto = true; a.usedAuto = true; startTimer(); renderArmarDock();
      const stepFn = () => { if (!a.auto || a.done) return; place(ORDER[a.next]); if (!a.done) a.timer = setTimeout(stepFn, reduce ? 600 : 2000); };
      stepFn();
    };
  }
  function recordLine() { const r = store.get(REC_KEY); return r ? '<p class="muted small">Tu récord: ' + fmtTime(r.time) + ' · menos errores: ' + r.errors + '</p>' : ''; }
  function renderArmar() {
    const a = st.arm, L = st.lab;
    let html = '<p class="kicker">Modo armar</p><h2>' + (a.done ? 'Laboratorio de temperatura' : 'Arma tu procesador') + '</h2>';
    if (!a.done) {
      html += '<p class="lede">Arrastra cada pieza al socket (o tócala) en el orden correcto, de abajo hacia arriba. El cronómetro empieza con tu primer movimiento.</p>' + recordLine();
      if (a.last) { const d = PIECES[a.last]; html += '<div class="card okc"><p class="kicker">Paso ' + (ORDER.indexOf(a.last) + 1) + ' · ' + tagHTML(d.tag) + '</p><h4>' + d.name + '</h4><p>' + d.step + '</p></div>'; }
      html += '<div class="card"><h4>¿Qué pieza va ahora?</h4>' + (a.showHint ? '<p>' + PIECES[ORDER[a.next]].hint + '</p>' : '<p class="muted">Si no sabes, toca “Pista”.</p>') + '</div>';
      html += '<h3>Pasos</h3><ol class="steps">' + ORDER.map((id, i) => { const done = a.placed.has(id), now = i === a.next; return '<li class="' + (done ? 'done' : now ? 'now' : '') + '"><span class="i">' + (done ? '✓' : i + 1) + '</span><span>' + (done ? PIECES[id].name : now ? '¿…?' : 'Pieza ' + (i + 1)) + '</span></li>'; }).join('') + '</ol>';
    } else {
      const r = a.result;
      html += '<div class="card okc"><h4>¡Procesador armado!</h4><p>Tiempo: <b class="mono">' + fmtTime(a.elapsed) + '</b> · Errores: <b class="mono">' + a.errors + '</b></p>' +
        (a.usedAuto ? '<p class="muted small">Usaste “Ver cómo se arma”, así que este intento no cuenta para el récord.</p>' : '') +
        (r && (r.newTime || r.newErr) ? '<p class="rec">★ ' + (r.newTime ? '¡Nuevo récord de tiempo!' : '') + (r.newTime && r.newErr ? ' ' : '') + (r.newErr ? '¡Nuevo récord de menos errores!' : '') + '</p>' : '') + recordLine() + '</div>';
      html += '<div class="card"><div class="readouts"><div><b>Temperatura</b><span class="temp" id="tempVal">25 °C</span></div><div><b>Velocidad</b><span id="freqVal">—</span></div><div><b>' + (L.cooler === 'aire' ? 'Ventilador' : 'Bomba') + '</b><span id="rpmVal">—</span></div><div><b>Consumo</b><span id="powVal">—</span></div></div>' +
        '<div class="gauge"><i id="tempBar"></i><em style="left:' + ((95 - 20) / 85 * 100) + '%"></em></div><p id="tempMsg" class="small"></p>' +
        '<div class="heatpath"><span>Die</span>→<span>TIM1</span>→<span>Tapa</span>→<span>Pasta</span>→<span>' + (L.cooler === 'aire' ? 'Disipador' : 'Bloque de agua') + '</span>→<span>' + (L.cooler === 'aire' ? 'Aire' : 'Radiador') + '</span></div></div>';
      const seg = (name, key, opts) => '<h3>' + name + '</h3><div class="seg" role="group" aria-label="' + name + '">' + opts.map(o => '<button class="btn" data-k="' + key + '" data-v="' + o[0] + '" aria-pressed="' + (String(L[key]) === String(o[0])) + '">' + o[1] + '</button>').join('') + '</div>';
      html += seg('Carga de trabajo', 'load', Object.keys(LAB.loads).map(k => [k, LAB.loads[k].name + ' <small>' + LAB.loads[k].w + ' W</small>']));
      html += seg('Enfriamiento', 'cooler', [['aire', 'Aire (disipador)'], ['liquido', 'Líquido']]);
      html += seg('Pasta térmica', 'paste', Object.keys(LAB.paste).map(k => [k, LAB.paste[k].name]));
      html += seg(L.cooler === 'aire' ? 'Ventilador' : 'Bomba y ventiladores', 'fanOn', [['true', 'Encendido'], ['false', 'Apagado']]);
      const tips = [LAB.paste[L.paste].tip];
      tips.push(L.cooler === 'aire' ? 'El disipador pasa el calor al aire que mueve el ventilador.' : 'El líquido se lleva el calor del bloque de agua al radiador, que tiene mucha más superficie para enfriar.');
      if (L.fanOn === false) tips.push(L.cooler === 'aire' ? 'Sin aire en movimiento, las aletas se calientan y casi no sueltan el calor.' : 'Sin bomba el líquido no circula y el calor se queda en el bloque.');
      html += '<div class="fact"><b>Qué está pasando</b>' + tips.map(t => '<p>' + t + '</p>').join('') + '</div>';
      html += '<p class="muted small">Modelo simplificado para aprender: las temperaturas son aproximadas.</p>';
    }
    panel.innerHTML = html;
    panel.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.k; L[k] = k === 'fanOn' ? b.dataset.v === 'true' : b.dataset.v; PXD.audio.play('pick'); applyLabVisual(); renderArmar(); }));
    const c = $('armCount'); if (c) c.textContent = a.placed.size + ' / 9';
    const e = $('armErr'); if (e) e.textContent = a.errors + (a.errors === 1 ? ' error' : ' errores');
  }
  function startTimer() { const a = st.arm; if (a.t0 == null && !a.done) a.t0 = performance.now(); }
  function resetArmar(doFly) {
    const a = st.arm; stopAuto();
    Object.assign(a, { next: 0, placed: new Set(), done: false, errors: 0, last: null, showHint: false, t0: null, elapsed: 0, usedAuto: false, result: null });
    Object.assign(st.lab, { cooler: 'aire', paste: 'correcta', fanOn: true, load: 'navegar', T: 25, rpm: 0 });
    ORDER.forEach(id => { P[id].anim = null; P[id].drag = false; });
    applyLabVisual(); renderArmarDock(); renderArmar();
    if (doFly) { const f = frameArmar(); flyTo(f[0], f[1], 1.5); }
  }
  function stopAuto() { const a = st.arm; a.auto = false; clearTimeout(a.timer); const b = $('btnAuto'); if (b && st.mode === 'armar') b.textContent = 'Ver cómo se arma'; }
  function tryPlace(id) {
    const a = st.arm; if (a.done) return;
    startTimer();
    if (a.placed.has(id)) { toast('Esa pieza ya está en su lugar.'); return; }
    if (ORDER[a.next] === id) { place(id); return; }
    a.errors++; st.hl = { id, color: new THREE.Color(0xe0685a), until: time + 0.7 }; PXD.audio.play('wrong');
    toast('Todavía no va “' + PIECES[id].name + '”. Pista: ' + PIECES[ORDER[a.next]].hint, 'bad'); a.showHint = true; renderArmar();
  }
  function place(id) {
    const a = st.arm, p = P[id];
    p.anim = { from: p.group.position.clone(), to: V(0, 0, 0), r0: p.group.rotation.y, r1: 0, t: 0, dur: reduce ? 0.05 : 1.1, arc: p.drag ? 0.8 : 2.6, done: () => PXD.audio.play('place') };
    p.drag = false; a.placed.add(id); a.next++; a.last = id; a.showHint = false; st.hl = null;
    toast('✓ ' + PIECES[id].name, 'ok');
    if (a.next === ORDER.length) finishArmar();
    renderArmar();
  }
  function finishArmar() {
    const a = st.arm; a.done = true; stopAuto();
    if (a.t0 != null) a.elapsed = (performance.now() - a.t0) / 1000;
    a.result = null;
    if (!a.usedAuto) {
      const r = store.get(REC_KEY), newTime = !r || a.elapsed < r.time, newErr = !r || a.errors < r.errors;
      store.set(REC_KEY, { time: r ? Math.min(r.time, a.elapsed) : a.elapsed, errors: r ? Math.min(r.errors, a.errors) : a.errors });
      a.result = { newTime: !!r && newTime, newErr: !!r && newErr, first: !r };
      setTimeout(() => PXD.audio.play(a.result.newTime || a.result.newErr ? 'record' : 'done'), 1200);
    } else setTimeout(() => PXD.audio.play('done'), 1200);
    st.lab.T = 25; renderArmarDock();
  }
  function applyLabVisual() {
    const L = st.lab, on = st.mode === 'armar' && st.arm.done, liq = on && L.cooler === 'liquido';
    liquid.group.visible = liq;
    P.disipador.group.visible = !liq; P.ventilador.group.visible = !liq;
    const pm = refs.pasteMesh;
    if (!on) { pm.visible = true; pm.scale.set(0.85, 0.05, 0.85); return; }
    const S = { nada: null, poca: [0.5, 0.012, 0.5], correcta: [1.3, 0.012, 1.3], demasiada: [2.3, 0.02, 2.3] }[L.paste];
    pm.visible = !!S; if (S) pm.scale.set(S[0], S[1], S[2]);
  }
  /* modelo térmico sencillo: T = ambiente + potencia × resistencia térmica */
  function updateLab(dt) {
    const L = st.lab, load = LAB.loads[L.load], Pw = load.w;
    const target = L.fanOn ? Math.max(0.25, Math.min(1, (L.T - 35) / 45)) : 0;
    L.rpm += (target - L.rpm) * (1 - Math.exp(-dt * 1.5));
    const air = L.cooler === 'aire';
    const rCool = L.fanOn ? (air ? 0.5 - 0.25 * L.rpm : 0.22 - 0.10 * L.rpm) : (air ? 1.2 : 1.0);
    const R = LAB.rChip + LAB.paste[L.paste].r + rCool;
    let peff = Pw; L.throttle = false;
    if (LAB.ambient + Pw * R > LAB.limit) { peff = Math.max(Pw * 0.25, (LAB.limit - LAB.ambient) / R); L.throttle = true; }
    const Tss = LAB.ambient + peff * R;
    L.T += (Tss - L.T) * (1 - Math.exp(-dt * 0.6));
    L.peff = peff; L.freq = load.ghz * Math.cbrt(peff / Pw);
  }
  let lastReadout = '';
  function updateReadouts() {
    const L = st.lab, el = $('tempVal'); if (!el) return;
    const rpm = L.fanOn ? Math.round((L.cooler === 'aire' ? 500 + 1700 * L.rpm : 1200 + 1600 * L.rpm) / 10) * 10 : 0;
    const txt = Math.round(L.T) + '|' + L.freq.toFixed(1) + '|' + rpm + '|' + Math.round(L.peff);
    if (txt === lastReadout && el.textContent !== '25 °C') return; lastReadout = txt;
    el.textContent = Math.round(L.T) + ' °C';
    $('freqVal').textContent = L.freq.toFixed(1) + ' GHz'; $('rpmVal').textContent = rpm ? rpm.toLocaleString('es-MX') + ' RPM' : 'Apagado'; $('powVal').textContent = Math.round(L.peff) + ' W';
    const bar = $('tempBar'); bar.style.width = Math.min(100, (L.T - 20) / 85 * 100) + '%'; bar.style.background = L.T < 60 ? 'var(--ok)' : L.T < 85 ? 'var(--warn)' : 'var(--bad)';
    let msg;
    if (L.throttle) msg = 'Se calienta demasiado: el procesador bajó su velocidad a ' + L.freq.toFixed(1) + ' GHz (de ' + LAB.loads[L.load].ghz + ') para no pasar de 95 °C. Esto se llama thermal throttling. Si aun así no bastara, se apagaría solo para no dañarse.';
    else if (L.T > 80) msg = 'Caliente, pero dentro del límite. ' + (L.fanOn ? 'El enfriamiento va casi al máximo.' : 'Sin ventilador, está al borde.');
    else if (L.T < 45) msg = 'Fresco. ' + (L.fanOn ? 'El ventilador gira despacio y casi no hace ruido.' : 'Con tan poca carga aguanta sin ventilador, pero no le subas mucho.');
    else msg = 'Temperatura normal para esta carga.' + (L.fanOn ? ' El ventilador ajusta su velocidad solo.' : '');
    const m = $('tempMsg'); if (m.textContent !== msg) m.textContent = msg;
  }
  /* arrastrar piezas */
  let drag = null; const dragPlane = new THREE.Plane(V(0, 1, 0), -0.3), ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitPt = V(0, 0, 0);
  function setRay(e) { const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); }
  function pieceOf(o) { while (o) { if (o.userData && o.userData.pieceId) return o.userData.pieceId; o = o.parent; } return null; }
  viewer.addEventListener('pointerdown', e => {
    if (st.mode !== 'armar' || st.arm.done || st.arm.auto || e.target !== canvas || (e.button && e.button !== 0)) return;
    setRay(e);
    const objs = ORDER.filter(id => !st.arm.placed.has(id) && !P[id].anim).map(id => P[id].group);
    const hits = ray.intersectObjects(objs, true); if (!hits.length) return;
    drag = { id: pieceOf(hits[0].object), x: e.clientX, y: e.clientY, moved: false, near: false };
    controls.enabled = false; startTimer(); e.preventDefault();
  }, true);
  window.addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
    const p = P[drag.id];
    if (!drag.moved) { drag.moved = true; p.drag = true; ring.visible = true; PXD.audio.play('pick'); }
    setRay(e); if (!ray.ray.intersectPlane(dragPlane, hitPt)) return;
    p.group.position.set(hitPt.x, p.scatter.y + 0.9, hitPt.z); p.group.rotation.y *= 0.9;
    drag.near = Math.hypot(hitPt.x, hitPt.z) < 2.8;
    ring.material.color.setHex(drag.near ? 0x6bcb8b : 0xd08a4e);
  });
  function endDrag(ok) {
    if (!drag) return; const d = drag; drag = null; controls.enabled = true; ring.visible = false;
    const p = P[d.id];
    if (!d.moved) { if (ok) tryPlace(d.id); return; }
    if (ok && d.near) tryPlace(d.id);
    if (!st.arm.placed.has(d.id)) p.drag = false;
  }
  window.addEventListener('pointerup', () => endDrag(true));
  window.addEventListener('pointercancel', () => endDrag(false));

  const modeArmar = {
    enter() { resetArmar(true); },
    exit() { stopAuto(); ring.visible = false; drag = null; controls.enabled = true; st.lab.T = 25; }
  };

  /* ================= MODO CÓMO FUNCIONA ================= */
  const glowTex = (function () { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(160,240,255,.6)'); r.addColorStop(1, 'rgba(127,196,212,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const pktGeo = new THREE.SphereGeometry(0.026, 14, 10), pktMat = new THREE.MeshBasicMaterial({ color: 0xe6fcff });
  const packets = [];
  function spawn(pts, o) {
    o = o || {}; const mesh = new THREE.Mesh(pktGeo, pktMat);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: o.color || 0x9fe8f5, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); sp.scale.set(0.24, 0.24, 1); mesh.add(sp); scene.add(mesh);
    const lens = []; let total = 0; for (let i = 1; i < pts.length; i++) { const l = pts[i].distanceTo(pts[i - 1]); lens.push(l); total += l; }
    const speed = o.speed || 0.8; packets.push({ mesh, pts, lens, total, speed, d: -(o.delay || 0) * speed, pause: o.pause == null ? 0.8 : o.pause });
  }
  function clearPackets() { packets.forEach(p => { scene.remove(p.mesh); p.mesh.children[0].material.dispose(); }); packets.length = 0; }
  const W_ = k => { const c = die.centerOf(k); return die.world(c[0], c[1]); };
  function spawnForStep(s) {
    clearPackets();
    const mem = W_('mem'), l3c = die.world(die.centerOf('c1')[0], 0.5), ringP = die.world(0.645, 0.5), L = k => W_('c1.' + k);
    if (s === 1) for (let i = 0; i < 3; i++) spawn([V(2.3, 0.08, mem.z), V(1.3, 0.08, mem.z), mem], { delay: i * 0.45 });
    if (s === 2) for (let i = 0; i < 3; i++) spawn([mem, ringP, l3c], { delay: i * 0.4 });
    if (s === 3) spawn([l3c, L('l2'), L('l1')], { speed: 0.5 });
    if (s === 4) spawn([L('l1'), L('fetch')], { speed: 0.35 });
    if (s === 5) spawn([L('fetch'), L('dec')], { speed: 0.25 });
    if (s === 6) { spawn([L('dec'), L('alu')], { speed: 0.25 }); spawn([L('dec'), L('alu')], { speed: 0.25, delay: 0.25, color: 0xf0b27a }); }
    if (s === 7) spawn([L('alu'), L('l1'), L('l2'), l3c], { speed: 0.5, color: 0x9ff0b8 });
    if (s === 8) {
      for (let i = 0; i < 8; i++) { const k = 'c' + i + '.'; spawn([W_(k + 'l1'), W_(k + 'fetch'), W_(k + 'dec'), W_(k + 'alu'), W_(k + 'l1')], { speed: 0.7, delay: i * 0.17, pause: 0 }); }
      for (let i = 0; i < 4; i++) { const u = 0.69 + i * 0.07; spawn([die.world(u, 0.1), die.world(u, 0.58)], { speed: 0.5, delay: i * 0.3, color: 0xc9a4ff, pause: 0.2 }); }
      spawn([W_('io'), V(2.3, 0.08, W_('io').z)], { speed: 0.8, color: 0xf0b27a });
    }
  }
  function updatePackets(dt) {
    const tmp = V(0, 0, 0);
    packets.forEach(p => {
      p.d += dt * p.speed; if (p.d < 0) { p.mesh.visible = false; return; } p.mesh.visible = true;
      if (p.d > p.total + p.pause * p.speed) p.d = 0;
      let d = Math.min(p.d, p.total), i = 0; while (i < p.lens.length - 1 && d > p.lens[i]) { d -= p.lens[i]; i++; }
      tmp.copy(p.pts[i]).lerp(p.pts[i + 1], p.lens[i] ? Math.min(d / p.lens[i], 1) : 1); p.mesh.position.copy(tmp);
    });
  }
  function renderFunciona() {
    const s = st.fn.step, S = STEPS[s];
    const r1 = s >= 3 ? '2' : '—', r2 = s >= 3 ? '3' : '—', r3 = s >= 6 ? '5' : (s >= 4 ? '?' : '—');
    let html = '<p class="kicker">Cómo funciona · paso ' + (s + 1) + ' de 9 <span class="clock"><i></i>reloj 4.8 GHz</span></p><h2>' + S.t + '</h2><p>' + S.x + '</p>';
    if (s >= 4 && s <= 7) html += '<div class="instr"><small>Instrucción</small>SUMA R1, R2 → R3' + (s === 5 ? '<br><span class="muted" style="font-size:12px">01001000 00000001 11010011</span>' : '') + '</div>';
    if (s >= 3 && s <= 7) html += '<div class="regs"><div><b>R1</b><span>' + r1 + '</span></div><div><b>R2</b><span>' + r2 + '</span></div><div class="' + (s === 6 ? 'flash' : '') + '"><b>R3</b><span>' + r3 + '</span></div></div>';
    html += '<h3>Explora</h3><p class="muted">Toca cualquier zona del chip para saber qué es.</p>';
    if (st.fn.region) {
      const k = st.fn.region, m = k.match(/^c(\d)(?:\.(\w+))?$/); let info, title;
      if (m) { info = REGION_INFO[m[2] || 'core']; title = m[2] ? info[0] + ' · núcleo ' + (+m[1] + 1) : 'Núcleo ' + (+m[1] + 1); } else { info = REGION_INFO[k]; title = info[0]; }
      html += '<div class="card"><h4>' + title + '</h4><p>' + info[1] + '</p></div>';
    }
    panel.innerHTML = html;
  }
  function renderFuncionaDock() {
    setDock('<button class="btn" id="btnPrev" aria-label="Paso anterior">◀</button><div class="dots">' + STEPS.map((_, i) => '<i class="' + (i === st.fn.step ? 'on' : '') + '"></i>').join('') + '</div><span class="count">' + (st.fn.step + 1) + ' / 9</span><button class="btn primary" id="btnPlay">' + (st.fn.playing ? 'Pausar' : 'Reproducir') + '</button><button class="btn" id="btnNext" aria-label="Paso siguiente">▶</button>');
    $('btnPrev').onclick = () => goStep(st.fn.step - 1); $('btnNext').onclick = () => goStep(st.fn.step + 1);
    $('btnPlay').onclick = () => { st.fn.playing = !st.fn.playing; st.fn.timer = 0; renderFuncionaDock(); };
  }
  function applyStep() { dieHL = new Set(STEPS[st.fn.step].hl); if (st.fn.region) dieHL.add(st.fn.region); die.draw(dieHL); renderFunciona(); renderFuncionaDock(); spawnForStep(st.fn.step); }
  function goStep(n) { st.fn.step = (n + 9) % 9; st.fn.region = null; st.fn.timer = 0; PXD.audio.play('step'); applyStep(); }
  const HIDE_FN = ['tim1', 'ihs', 'pasta', 'disipador', 'ventilador'];
  const modeFunciona = {
    enter() { HIDE_FN.forEach(id => { P[id].group.visible = false; }); st.fn.step = 0; st.fn.region = null; st.fn.playing = false; applyStep(); const f = frameFunciona(); flyTo(f[0], f[1], 1.6); },
    exit() { clearPackets(); st.fn.playing = false; ORDER.forEach(id => { P[id].group.visible = true; }); dieHL = new Set(); die.draw(dieHL); },
    update(dt) {
      updatePackets(dt);
      if (st.fn.playing) { st.fn.timer += dt; if (st.fn.timer > 6.5) { st.fn.timer = 0; if (st.fn.step === 8) { st.fn.playing = false; renderFuncionaDock(); } else goStep(st.fn.step + 1); } }
    },
    pick(h) {
      if (h.object.userData.isDie && h.face && h.face.materialIndex === 2 && h.uv) {
        const k = die.regionAt(h.uv.x, 1 - h.uv.y);
        if (k) { st.fn.region = k; dieHL = new Set(STEPS[st.fn.step].hl); dieHL.add(k); die.draw(dieHL); PXD.audio.play('pick'); renderFunciona(); }
      }
    },
    key(dir) { goStep(st.fn.step + dir); }
  };

  /* ================= REGISTRO DE MODOS ================= */
  const ctx = { kit, THREE, die, scene, stage, camera, controls, renderer, panel, reduce, TABLE_Y, setDock, toast, flyTo, aspect, setLabels, clearStage, get audio() { return PXD.audio; } };
  const MODES = { desarmar: modeDesarmar, armar: modeArmar, funciona: modeFunciona };
  ['fabricacion', 'comparar', 'sockets'].forEach(k => { if (PXD.modes && PXD.modes[k]) MODES[k] = PXD.modes[k](ctx); });
  const BENCH_MODES = ['desarmar', 'armar', 'funciona'];
  function showBench(v) { bench.visible = v; ORDER.forEach(id => { P[id].group.visible = v; P[id].lbl.hidden = true; }); if (!v) liquid.group.visible = false; }

  function setMode(m, first) {
    if (!MODES[m]) return;
    const prev = MODES[st.mode]; if (!first && prev && prev.exit) prev.exit();
    st.mode = m; st.hl = null; setLabels([]); clearStage();
    document.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', t.dataset.mode === m));
    const onBench = BENCH_MODES.includes(m); showBench(onBench);
    if (!first) controls.autoRotate = false;
    if (onBench) { die.draw(dieHL = new Set()); applyLabVisual(); }
    MODES[m].enter(first);
    const tab = document.querySelector('.tab[data-mode="' + m + '"]'); if (tab && tab.scrollIntoView) tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => { if (st.mode !== t.dataset.mode) setMode(t.dataset.mode); }));

  /* clic / toque en la escena (fuera del modo armar) */
  let down = null;
  canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', e => {
    if (!down) return; const dx = e.clientX - down[0], dy = e.clientY - down[1]; down = null;
    if (dx * dx + dy * dy > 49 || st.mode === 'armar') return;
    setRay(e);
    const onBench = BENCH_MODES.includes(st.mode);
    const objs = onBench ? ORDER.map(id => P[id].group).filter(g => g.visible) : [stage];
    const hits = ray.intersectObjects(objs, true); if (!hits.length) return;
    const mode = MODES[st.mode];
    if (st.mode === 'desarmar') { const id = pieceOf(hits[0].object); if (id) selectPiece(id); }
    else if (mode.pick) { const h = hits.find(x => !x.object.userData.proxy); if (h) mode.pick(h); }
  });
  function onPieceClick(id) { if (st.mode === 'desarmar') selectPiece(id); else if (st.mode === 'armar') tryPlace(id); }

  /* ================= CICLO PRINCIPAL ================= */
  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const proj = V(0, 0, 0);
  let audioT = 0;
  function frame(dt) {
    time += dt;
    if (fly) { fly.t += dt / fly.dur; const k = ease(Math.min(fly.t, 1)); camera.position.lerpVectors(fly.p0, fly.p1, k); controls.target.lerpVectors(fly.t0, fly.t1, k); if (fly.t >= 1) fly = null; }
    const onBench = BENCH_MODES.includes(st.mode), a = st.arm, L = st.lab;
    let fanVis = 0, audioFan = 0, heat = 0;
    if (onBench) {
      st.explode += (st.explodeT - st.explode) * (1 - Math.exp(-dt * 3.2));
      const fk = 1 - Math.exp(-dt * 7);
      ORDER.forEach(id => {
        const p = P[id], g = p.group;
        if (p.anim) { const n = p.anim; n.t += dt / n.dur; const k = ease(Math.min(n.t, 1)); g.position.lerpVectors(n.from, n.to, k); g.position.y += Math.sin(Math.PI * k) * n.arc; g.rotation.y = n.r0 + (n.r1 - n.r0) * k; if (n.t >= 1) { p.anim = null; if (n.done) n.done(); } return; }
        if (p.drag) return;
        let tx = 0, ty = 0, tz = 0, tr = 0;
        if (st.mode === 'desarmar') ty = OFFSET[id] * st.explode;
        else if (st.mode === 'armar' && !a.placed.has(id)) { tx = p.scatter.x; ty = p.scatter.y; tz = p.scatter.z; tr = p.scatter.ry; }
        g.position.x += (tx - g.position.x) * fk; g.position.y += (ty - g.position.y) * fk; g.position.z += (tz - g.position.z) * fk; g.rotation.y += (tr - g.rotation.y) * fk;
      });
      if (st.mode === 'desarmar') { fanVis = 3; audioFan = 0.1; }
      if (st.mode === 'armar') {
        if (a.t0 != null && !a.done) { a.elapsed = (performance.now() - a.t0) / 1000; const te = $('armTimer'); if (te) te.textContent = fmtTime(a.elapsed); }
        if (a.done && !P.ventilador.anim) {
          updateLab(dt); updateReadouts();
          heat = Math.max(0, Math.min(1, (L.T - 60) / 40));
          fanVis = L.fanOn ? 4 + 16 * L.rpm : 0; audioFan = L.fanOn ? 0.15 + 0.85 * L.rpm : 0;
          if (liquid.group.visible) {
            liquid.fans.forEach(b => { b.rotation.y += fanVis * dt; });
            const sp = L.fanOn ? 0.08 + 0.12 * L.rpm : 0;
            liquid.dots.forEach(d => { d.u = (d.u + sp * dt * d.dir + 1) % 1; d.m.position.copy(d.c.getPointAt(d.u)); });
            liquid.ringMat.emissiveIntensity = L.fanOn ? 1.2 : 0.1;
          }
        }
      }
    }
    st.fanSpeed += (fanVis - st.fanSpeed) * (1 - Math.exp(-dt * 1.5)); refs.blades.rotation.y += st.fanSpeed * dt;
    audioT += dt; if (audioT > 0.2) { audioT = 0; PXD.audio.setFan(audioFan); }
    if (st.mode === 'funciona' && st.fn.step === 0) st.dieGlow = 0.25 + 0.35 * Math.abs(Math.sin(time * 5)); else st.dieGlow += (0.22 - st.dieGlow) * 0.1;
    const hl = st.hl && time < st.hl.until ? st.hl : null;
    ORDER.forEach(id => {
      P[id].mats.forEach(m => {
        const o = m.userData.orig;
        if (hl && hl.id === id) { m.emissive.copy(hl.color); m.emissiveIntensity = 0.35 + 0.3 * Math.sin(time * 6); }
        else if (heat > 0 && (id === 'disipador' || id === 'ihs') && m !== refs.dieTopMat) { m.emissive.setRGB(1, 0.22, 0.05); m.emissiveIntensity = heat * (id === 'ihs' ? 0.9 : 0.55); }
        else { m.emissive.copy(o.c); m.emissiveIntensity = o.i; }
        if (m === refs.dieTopMat && !(hl && hl.id === id)) m.emissiveIntensity = st.dieGlow;
      });
    });
    liquid.coldMat.emissive.setRGB(1, 0.22, 0.05); liquid.coldMat.emissiveIntensity = heat * 0.6;
    const mode = MODES[st.mode]; if (mode.update) mode.update(dt, time);
    controls.update();
    updateLabels();
  }
  function updateLabels() {
    const w = canvas.clientWidth, h = canvas.clientHeight, onBench = BENCH_MODES.includes(st.mode);
    ORDER.forEach(id => {
      const p = P[id], d = p.dims; let show = false;
      if (onBench && st.mode === 'desarmar' && st.explode > 0.35) { show = true; proj.set(d.hw + 0.25, (d.y0 + d.y1) / 2, 0); }
      else if (onBench && st.mode === 'armar' && !st.arm.placed.has(id) && !p.anim && !p.drag) { show = true; proj.set(0, d.y1 + 0.35, 0); }
      if (show) { p.group.localToWorld(proj); proj.project(camera); if (proj.z > 1 || Math.abs(proj.x) > 1.1 || Math.abs(proj.y) > 1.1) show = false; }
      p.lbl.hidden = !show; if (!show) return;
      const x = (proj.x * 0.5 + 0.5) * w, y = (-proj.y * 0.5 + 0.5) * h;
      p.lbl.style.transform = st.mode === 'armar' ? 'translate(' + x + 'px,' + y + 'px) translate(-50%,-100%)' : 'translate(' + x + 'px,' + y + 'px) translate(0,-50%)';
      p.lbl.classList.toggle('sel', st.selected === id && st.mode === 'desarmar');
      p.lbl.classList.toggle('hint', !!(st.hl && st.hl.id === id && time < st.hl.until && st.mode === 'armar' && st.hl.color.b > 0.7));
    });
    extraLabels.forEach(l => {
      const p = l.pos(); if (!p) { l.el.hidden = true; return; }
      proj.copy(p).project(camera);
      const hide = proj.z > 1 || Math.abs(proj.x) > 1.1 || Math.abs(proj.y) > 1.1; l.el.hidden = hide; if (hide) return;
      l.el.style.transform = 'translate(' + ((proj.x * 0.5 + 0.5) * w) + 'px,' + ((-proj.y * 0.5 + 0.5) * h) + 'px) translate(-50%,-100%)';
      if (l.sel) l.el.classList.toggle('sel', !!l.sel());
    });
  }
  function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(canvas); resize();
  let last = performance.now();
  function loop(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; frame(dt); renderer.render(scene, camera); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { die.draw(dieHL); cpu.drawIHS(); });

  /* ================= SONIDO Y PRESENTACIÓN ================= */
  const btnSound = $('btnSound'), btnPresent = $('btnPresent');
  function syncSound() { const on = PXD.audio.enabled; btnSound.setAttribute('aria-pressed', on); btnSound.querySelector('span').textContent = on ? 'Sonido' : 'Silencio'; }
  btnSound.addEventListener('click', () => { const on = PXD.audio.setEnabled(!PXD.audio.enabled); if (on) PXD.audio.play('step'); syncSound(); });
  syncSound();
  function setPresent(on) {
    document.body.classList.toggle('present', on); btnPresent.setAttribute('aria-pressed', on);
    btnPresent.querySelector('span').textContent = on ? 'Salir' : 'Presentar';
    $('presentHint').hidden = !on;
    setTimeout(resize, 50);
  }
  btnPresent.addEventListener('click', () => {
    const on = !document.body.classList.contains('present');
    setPresent(on);
    try {
      if (on && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => { });
      else if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => { });
    } catch (e) { }
  });
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && document.body.classList.contains('present')) setPresent(false); });
  window.addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    const mode = MODES[st.mode];
    if (e.key === 'ArrowRight' && mode.key) { mode.key(1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' && mode.key) { mode.key(-1); e.preventDefault(); }
    else if (e.key === 'Escape' && document.body.classList.contains('present')) setPresent(false);
    else if (/^[1-6]$/.test(e.key) && document.body.classList.contains('present')) { const tabs = document.querySelectorAll('.tab'); const t = tabs[+e.key - 1]; if (t) setMode(t.dataset.mode); }
  });

  PXD.debug = { st, P, camera };
  /* ================= INICIO ================= */
  setMode('desarmar', true);
  { const f = frameDesarmar(0); camera.position.copy(f[0]); controls.target.copy(f[1]); }
  setTimeout(() => { if (st.mode === 'desarmar' && st.explodeT === 0) { st.explodeT = 1; renderDesarmarDock(); const f = frameDesarmar(1); flyTo(f[0], f[1], 1.8); } }, 900);
  if (location.hash) { const m = location.hash.slice(1); if (MODES[m]) setTimeout(() => setMode(m), 50); }
})();
