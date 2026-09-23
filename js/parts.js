/* Procesador por Dentro — construcción de piezas 3D.
   Todo se dibuja con código: cajas, cilindros y texturas en canvas. */
window.PXD = window.PXD || {};

/* Utilidades compartidas: se crean una vez que existe el renderer */
PXD.makeKit = function (THREE, renderer) {
  'use strict';
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const M = o => new THREE.MeshStandardMaterial(o);
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); draw(g, w, h);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return { tex: t, canvas: c, ctx: g };
  }
  function rnd(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function mk(g, geo, mat, x, y, z) { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; }
  /* rejilla de instancias (pines, contactos, bolitas) */
  function grid(geo, mat, pts, y, rotX) {
    const im = new THREE.InstancedMesh(geo, mat, pts.length), d = new THREE.Object3D();
    pts.forEach((p, k) => { d.position.set(p[0], y, p[1]); if (rotX) d.rotation.x = rotX; d.updateMatrix(); im.setMatrixAt(k, d.matrix); });
    im.castShadow = true; im.frustumCulled = false; return im;
  }
  function gridPts(n, step, skip) {
    const pts = [], h = (n - 1) * step / 2;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = -h + i * step, z = -h + j * step; if (skip && skip(x, z)) continue; pts.push([x, z]); }
    return pts;
  }
  /* ventilador genérico: marco cuadrado con hueco y aspas (eje Y) */
  function makeFan(size, depth) {
    const g = new THREE.Group(), h = size / 2;
    const s = new THREE.Shape(); s.moveTo(-h, -h); s.lineTo(h, -h); s.lineTo(h, h); s.lineTo(-h, h); s.lineTo(-h, -h);
    const hole = new THREE.Path(); hole.absarc(0, 0, h * 0.95, 0, Math.PI * 2, true); s.holes.push(hole);
    const fgeo = new THREE.ExtrudeGeometry(s, { depth: depth, bevelEnabled: false, curveSegments: 48 }); fgeo.rotateX(-Math.PI / 2);
    mk(g, fgeo, M({ color: 0x1f262d, roughness: 0.55 }), 0, 0, 0);
    const blades = new THREE.Group(); blades.position.y = depth / 2; g.add(blades);
    const hubR = size * 0.14;
    mk(blades, new THREE.CylinderGeometry(hubR, hubR, depth * 0.8, 28), M({ color: 0x28313a, roughness: 0.5 }));
    const st = mk(blades, new THREE.CircleGeometry(hubR * 0.78, 28), M({ color: 0xd08a4e, roughness: 0.4, metalness: 0.3 }), 0, depth * 0.41, 0); st.rotation.x = -Math.PI / 2;
    const bl = h * 0.95 - hubR, bg = new THREE.BoxGeometry(bl, depth * 0.06, size * 0.14), bm = M({ color: 0x33414d, roughness: 0.55 });
    for (let i = 0; i < 7; i++) { const piv = new THREE.Group(); piv.rotation.y = i * Math.PI * 2 / 7; blades.add(piv); const b = mk(piv, bg, bm, hubR + bl / 2, 0, 0); b.rotation.x = 0.42; }
    const sp = new THREE.BoxGeometry(size, 0.05, 0.1);
    [Math.PI / 4, -Math.PI / 4].forEach(a => { const m = mk(g, sp, M({ color: 0x1f262d }), 0, 0.02, 0); m.rotation.y = a; });
    return { group: g, blades };
  }
  return { THREE, V, M, canvasTex, rnd, mk, grid, gridPts, makeFan };
};

/* ---------- Plano del die (textura + zonas) ---------- */
PXD.makeDie = function (kit) {
  'use strict';
  const W = 2.2, D = 1.5, TOP = 0.12;
  const RG = { mem: [0.66, 0.66, 0.29, 0.145], io: [0.66, 0.83, 0.29, 0.12], gpu: [0.66, 0.05, 0.29, 0.58], l3: [0.05, 0.405, 0.58, 0.19] };
  const SUB = { fetch: [0.04, 0.19], dec: [0.21, 0.35], alu: [0.37, 0.51], l1: [0.53, 0.69], l2: [0.71, 0.96] };
  function coreRect(i) { const col = i % 4, row = i < 4 ? 0 : 1; return [0.05 + col * 0.1475, row ? 0.62 : 0.05, 0.1375, 0.33]; }
  function subRect(i, s) { const c = coreRect(i), b = SUB[s]; let a0 = b[0], a1 = b[1]; if (i >= 4) { const t = a0; a0 = 1 - a1; a1 = 1 - t; } return [c[0] + c[2] * 0.08, c[1] + c[3] * a0, c[2] * 0.84, c[3] * (a1 - a0)]; }
  function rectOf(key) { if (RG[key]) return RG[key]; const m = key.match(/^c(\d)(?:\.(\w+))?$/); if (!m) return null; return m[2] ? subRect(+m[1], m[2]) : coreRect(+m[1]); }
  function centerOf(key) { const r = rectOf(key); return [r[0] + r[2] / 2, r[1] + r[3] / 2]; }
  function regionAt(u, v) {
    const inR = r => u >= r[0] && u <= r[0] + r[2] && v >= r[1] && v <= r[1] + r[3];
    for (let i = 0; i < 8; i++) { if (inR(coreRect(i))) { for (const s in SUB) if (inR(subRect(i, s))) return 'c' + i + '.' + s; return 'c' + i; } }
    for (const k of ['mem', 'io', 'gpu', 'l3']) if (inR(RG[k])) return k;
    return null;
  }
  const cv = kit.canvasTex(2048, 1396, () => { });
  function draw(hl) {
    hl = hl || new Set();
    const g = cv.ctx, w = 2048, h = 1396; g.clearRect(0, 0, w, h);
    g.fillStyle = '#161029'; g.fillRect(0, 0, w, h);
    const R = (r, fill) => { g.fillStyle = fill; g.fillRect(r[0] * w, r[1] * h, r[2] * w, r[3] * h); };
    const lines = (r, col, step) => { g.strokeStyle = col; g.lineWidth = 1; for (let x = r[0] * w; x < (r[0] + r[2]) * w; x += step) { g.beginPath(); g.moveTo(x, r[1] * h); g.lineTo(x, (r[1] + r[3]) * h); g.stroke(); } for (let y = r[1] * h; y < (r[1] + r[3]) * h; y += step) { g.beginPath(); g.moveTo(r[0] * w, y); g.lineTo((r[0] + r[2]) * w, y); g.stroke(); } };
    const txt = (s, r, size, col) => { g.fillStyle = col || 'rgba(235,240,255,.85)'; g.font = '600 ' + size + 'px "IBM Plex Mono", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, (r[0] + r[2] / 2) * w, (r[1] + r[3] / 2) * h); };
    g.strokeStyle = '#3d3470'; g.lineWidth = 10; g.strokeRect(0.035 * w, 0.035 * h, 0.61 * w, 0.93 * h);
    R(RG.l3, '#2f4a33'); lines(RG.l3, 'rgba(160,200,110,.35)', 12); txt('CACHÉ L3', RG.l3, 44);
    R(RG.gpu, '#33224f'); for (let i = 0; i < 8; i++) for (let j = 0; j < 10; j++) { g.fillStyle = (i + j) % 2 ? '#46306d' : '#3d2a61'; g.fillRect((0.67 + i * 0.034) * w, (0.07 + j * 0.054) * h, 0.03 * w, 0.048 * h); } txt('GRÁFICA', RG.gpu, 46);
    R(RG.mem, '#5a4526'); for (let x = RG.mem[0] * w; x < (RG.mem[0] + RG.mem[2]) * w; x += 16) { g.fillStyle = 'rgba(255,210,140,.18)'; g.fillRect(x, RG.mem[1] * h, 6, RG.mem[3] * h); } txt('MEMORIA', RG.mem, 34);
    R(RG.io, '#4a3526'); txt('E/S · PCIe', RG.io, 30);
    const subCol = { fetch: '#3b4686', dec: '#4b3f8c', alu: '#6a3f86', l1: '#27616e', l2: '#255d52' };
    const subTxt = { fetch: 'BUSCAR', dec: 'DECOD', alu: 'ALU', l1: 'L1', l2: 'L2' };
    for (let i = 0; i < 8; i++) {
      const c = coreRect(i); R(c, '#241f48');
      for (const s in SUB) { const r = subRect(i, s); R(r, subCol[s]); if (s === 'l1' || s === 'l2') lines(r, 'rgba(170,230,230,.25)', 9); txt(subTxt[s], r, 21, 'rgba(235,240,255,.75)'); }
      txt('NÚCLEO ' + (i + 1), [c[0], i < 4 ? c[1] - 0.028 : c[1] + c[3] + 0.002, c[2], 0.026], 20, 'rgba(200,190,255,.8)');
    }
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, 'rgba(90,200,255,.10)'); gr.addColorStop(0.5, 'rgba(255,120,220,.06)'); gr.addColorStop(1, 'rgba(255,210,120,.10)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const keys = [];
    hl.forEach(k => { if (k === 'all') keys.push('mem', 'io', 'gpu', 'l3', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'); else if (k === 'cores') for (let i = 0; i < 8; i++) keys.push('c' + i); else keys.push(k); });
    keys.forEach(k => { const r = rectOf(k); if (!r) return; g.save(); g.fillStyle = 'rgba(127,220,235,.30)'; g.fillRect(r[0] * w, r[1] * h, r[2] * w, r[3] * h); g.shadowColor = '#7FDCEB'; g.shadowBlur = 24; g.strokeStyle = '#A8F0FA'; g.lineWidth = 7; g.strokeRect(r[0] * w + 4, r[1] * h + 4, r[2] * w - 8, r[3] * h - 8); g.restore(); });
    cv.tex.needsUpdate = true;
  }
  draw();
  function world(u, v, lift) { return kit.V((u - 0.5) * W, TOP + (lift || 0.025), (v - 0.5) * D); }
  return { W, D, TOP, tex: cv.tex, draw, rectOf, centerOf, regionAt, world };
};

/* ---------- Piezas del procesador principal ---------- */
PXD.makeCpuParts = function (kit, die) {
  'use strict';
  const { THREE, M, mk, canvasTex, rnd, grid, gridPts } = kit;
  const refs = {};

  function contactos() {
    const g = new THREE.Group();
    const pts = []; for (let i = 0; i < 31; i++) for (let j = 0; j < 31; j++) { const x = -2.1 + i * 0.14, z = -2.1 + j * 0.14; if (Math.abs(x) < 0.75 && Math.abs(z) < 0.75) continue; pts.push([x, z]); }
    g.add(grid(new THREE.BoxGeometry(0.08, 0.02, 0.08), M({ color: 0xE2B85C, metalness: 1, roughness: 0.28 }), pts, -0.07));
    return g;
  }
  function sustrato() {
    const g = new THREE.Group();
    const t = canvasTex(1024, 1024, (c, w, h) => { c.fillStyle = '#2d5a3c'; c.fillRect(0, 0, w, h); const r = rnd(3); c.strokeStyle = 'rgba(180,210,150,.18)'; c.lineWidth = 2;
      for (let i = 0; i < 180; i++) { c.beginPath(); let x = r() * w, y = r() * h; c.moveTo(x, y); x += (r() - 0.5) * 200; c.lineTo(x, y); y += (r() - 0.5) * 200; c.lineTo(x, y); c.stroke(); }
      c.fillStyle = '#e9d9a0'; c.beginPath(); c.moveTo(30, 30); c.lineTo(90, 30); c.lineTo(30, 90); c.fill(); });
    const side = M({ color: 0x234632, roughness: 0.6 });
    mk(g, new THREE.BoxGeometry(4.5, 0.12, 4.5), [side, side, M({ map: t.tex, roughness: 0.55, metalness: 0.05 }), M({ color: 0x2a4f37, roughness: 0.6 }), side, side]);
    return g;
  }
  function capacitores() {
    const g = new THREE.Group(), pos = [];
    for (let k = -2; k <= 2; k++) { pos.push([2.02, 0.3 * k, 0]); pos.push([-2.02, 0.3 * k, 0]); pos.push([0.3 * k, 2.02, 1]); pos.push([0.3 * k, -2.02, 1]); }
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(s => { pos.push([s[0] * 2.0, s[1] * 1.95, 0]); pos.push([s[0] * 1.95, s[1] * 2.12, 1]); });
    const body = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.06, 0.07), M({ color: 0x9b7a55, roughness: 0.5 }), pos.length);
    const ends = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.062, 0.072), M({ color: 0xd7dde2, metalness: 1, roughness: 0.3 }), pos.length * 2);
    const d = new THREE.Object3D();
    pos.forEach((p, i) => { const rot = p[2] ? 0 : Math.PI / 2; d.rotation.set(0, rot, 0); d.position.set(p[0], 0.09, p[1]); d.updateMatrix(); body.setMatrixAt(i, d.matrix);
      for (let e = 0; e < 2; e++) { const o = (e ? 1 : -1) * 0.07, ox = p[2] ? o : 0, oz = p[2] ? 0 : o; d.position.set(p[0] + ox, 0.09, p[1] + oz); d.updateMatrix(); ends.setMatrixAt(i * 2 + e, d.matrix); } });
    body.castShadow = ends.castShadow = true; body.frustumCulled = ends.frustumCulled = false; g.add(body, ends);
    return g;
  }
  function dieP() {
    const g = new THREE.Group(), side = M({ color: 0x1c2030, metalness: 0.6, roughness: 0.35 });
    refs.dieTopMat = M({ map: die.tex, emissiveMap: die.tex, emissive: 0xffffff, emissiveIntensity: 0.22, metalness: 0.35, roughness: 0.3 });
    const m = mk(g, new THREE.BoxGeometry(die.W, 0.06, die.D), [side, side, refs.dieTopMat, side, side, side], 0, 0.09, 0); m.userData.isDie = true;
    return g;
  }
  function tim1() { const g = new THREE.Group(); mk(g, new THREE.BoxGeometry(die.W, 0.02, die.D), M({ color: 0xa3abb4, metalness: 0.85, roughness: 0.35 }), 0, 0.13, 0); return g; }
  const ihsCv = canvasTex(1024, 1024, () => { });
  function drawIHS() {
    const g = ihsCv.ctx, W = 1024, H = 1024; g.fillStyle = '#cfd4d9'; g.fillRect(0, 0, W, H); const r = rnd(11);
    for (let i = 0; i < 1400; i++) { g.strokeStyle = 'rgba(' + (r() < 0.5 ? 255 : 120) + ',' + (r() < 0.5 ? 255 : 125) + ',' + (r() < 0.5 ? 255 : 130) + ',.08)'; g.beginPath(); const y = r() * H; g.moveTo(0, y); g.lineTo(W, y + (r() - 0.5) * 4); g.stroke(); }
    g.fillStyle = '#7d858d'; g.textAlign = 'left'; g.font = '600 50px "IBM Plex Mono", monospace'; g.fillText('PX-9800', 150, 380);
    g.font = '500 36px "IBM Plex Mono", monospace'; g.fillText('8 NÚCLEOS · 4.8 GHz', 150, 450); g.fillText('MODELO DE EJEMPLO', 150, 510);
    g.font = '400 30px "IBM Plex Mono", monospace'; g.fillText('HECHO PARA APRENDER', 150, 640); g.fillText('L4C7 0925 · 2A31B', 150, 690);
    g.beginPath(); g.moveTo(60, 60); g.lineTo(130, 60); g.lineTo(60, 130); g.fill(); ihsCv.tex.needsUpdate = true;
  }
  drawIHS();
  function ihs() {
    const g = new THREE.Group(), nm = M({ color: 0xd0d5da, metalness: 1, roughness: 0.3 });
    mk(g, new THREE.BoxGeometry(3.6, 0.16, 3.6), [nm, nm, M({ map: ihsCv.tex, metalness: 1, roughness: 0.28 }), nm, nm, nm], 0, 0.22, 0);
    const a = new THREE.BoxGeometry(3.6, 0.08, 0.18), b = new THREE.BoxGeometry(0.18, 0.08, 3.24);
    mk(g, a, nm, 0, 0.10, 1.71); mk(g, a, nm, 0, 0.10, -1.71); mk(g, b, nm, 1.71, 0.10, 0); mk(g, b, nm, -1.71, 0.10, 0);
    return g;
  }
  function pasta() {
    const g = new THREE.Group();
    refs.pasteMesh = mk(g, new THREE.SphereGeometry(1, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), M({ color: 0xb9bec4, roughness: 0.55, metalness: 0.2 }), 0, 0.30, 0);
    refs.pasteMesh.scale.set(0.85, 0.05, 0.85);
    return g;
  }
  function disipador() {
    const g = new THREE.Group(), cu = M({ color: 0xc77b45, metalness: 1, roughness: 0.32 });
    mk(g, new THREE.BoxGeometry(3.9, 0.25, 3.9), cu, 0, 0.465, 0);
    refs.finMat = M({ color: 0xbac2ca, metalness: 0.9, roughness: 0.38 });
    const fg = new THREE.BoxGeometry(0.05, 1.6, 3.9); for (let i = 0; i < 17; i++) mk(g, fg, refs.finMat, -1.92 + i * 0.24, 1.39, 0);
    const pg = new THREE.CylinderGeometry(0.085, 0.085, 4.3, 16);
    [[0.9, -0.9], [1.5, 0.9], [1.9, -0.3]].forEach(p => { const m = mk(g, pg, cu, 0, p[0], p[1]); m.rotation.z = Math.PI / 2; });
    return g;
  }
  function ventilador() {
    const f = kit.makeFan(4.0, 0.42); f.group.position.y = 2.19; refs.blades = f.blades;
    const g = new THREE.Group(); g.add(f.group); return g;
  }
  const builders = { contactos, sustrato, capacitores, die: dieP, tim1, ihs, pasta, disipador, ventilador };
  return { builders, refs, drawIHS };
};

/* ---------- Enfriamiento líquido (bomba + mangueras + radiador) ---------- */
PXD.makeLiquid = function (kit, TABLE_Y) {
  'use strict';
  const { THREE, V, M, mk } = kit;
  const g = new THREE.Group();
  const cold = M({ color: 0xc77b45, metalness: 1, roughness: 0.3 });
  mk(g, new THREE.BoxGeometry(3.2, 0.15, 3.2), cold, 0, 0.415, 0);
  mk(g, new THREE.CylinderGeometry(1.3, 1.35, 0.9, 40), M({ color: 0x1c2228, roughness: 0.45, metalness: 0.3 }), 0, 0.94, 0);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x7fc4d4, emissive: 0x7fc4d4, emissiveIntensity: 1.2 });
  const ring = mk(g, new THREE.TorusGeometry(1.0, 0.05, 12, 48), ringMat, 0, 1.40, 0); ring.rotation.x = Math.PI / 2;
  mk(g, new THREE.CylinderGeometry(0.9, 0.9, 0.04, 40), M({ color: 0x2a323a, metalness: 0.6, roughness: 0.3 }), 0, 1.41, 0);
  // radiador de pie, detrás de la tarjeta madre
  const RZ = -6.9, RH = 2.6, RY = TABLE_Y + RH / 2 + 0.05;
  mk(g, new THREE.BoxGeometry(9.2, RH, 0.5), M({ color: 0x20272e, roughness: 0.6, metalness: 0.4 }), 0, RY, RZ);
  const finGeo = new THREE.BoxGeometry(0.03, RH * 0.86, 0.52), finM = M({ color: 0x3a444d, metalness: 0.7, roughness: 0.4 });
  for (let i = 0; i < 60; i++) mk(g, finGeo, finM, -4.3 + i * 0.146, RY, RZ);
  const fans = [];
  [-2.25, 2.25].forEach(x => { const f = kit.makeFan(2.4, 0.3); f.group.rotation.x = Math.PI / 2; f.group.position.set(x, RY, RZ + 0.25); g.add(f.group); fans.push(f.blades); });
  // mangueras
  const tubeM = M({ color: 0x15191d, roughness: 0.7 });
  const curves = [
    new THREE.CatmullRomCurve3([V(0.95, 0.8, -0.9), V(1.2, 2.3, -2.2), V(2.6, 2.6, -5.0), V(4.2, RY + 0.8, RZ + 0.1)]),
    new THREE.CatmullRomCurve3([V(-0.95, 0.8, -0.9), V(-1.2, 2.3, -2.2), V(-2.6, 2.6, -5.0), V(-4.2, RY + 0.8, RZ + 0.1)])
  ];
  curves.forEach(c => mk(g, new THREE.TubeGeometry(c, 60, 0.14, 12, false), tubeM));
  // gotitas de líquido que viajan por las mangueras
  const dots = [], dg = new THREE.SphereGeometry(0.07, 10, 8);
  curves.forEach((c, ci) => { for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ color: ci === 0 ? 0xffa070 : 0x8fe6f5 })); g.add(m); dots.push({ m, c, u: i / 14, dir: ci === 0 ? 1 : -1 }); } });
  g.visible = false;
  return { group: g, fans, dots, ringMat, coldMat: cold };
};
