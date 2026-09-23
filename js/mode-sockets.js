/* Procesador por Dentro — modo "Sockets": LGA (pines en la tarjeta madre) contra PGA (pines en el procesador). */
window.PXD = window.PXD || {};
PXD.modes = PXD.modes || {};
PXD.modes.sockets = function (ctx) {
  'use strict';
  const { THREE, V, M, mk, canvasTex, grid, gridPts } = ctx.kit;
  const S = PXD.data.SOCKETS;
  const st = { target: 0, p: 0, sel: null, parts: null };
  const gold = () => M({ color: 0xE2B85C, metalness: 1, roughness: 0.28 });
  const skip = (x, z) => Math.abs(x) < 0.7 && Math.abs(z) < 0.7;

  function cpu(withPins) {
    const g = new THREE.Group();
    mk(g, new THREE.BoxGeometry(4.5, 0.12, 4.5), M({ color: 0x2d5a3c, roughness: 0.55 }), 0, 0, 0);
    const nm = M({ color: 0xd0d5da, metalness: 1, roughness: 0.3 });
    mk(g, new THREE.BoxGeometry(3.6, 0.2, 3.6), nm, 0, 0.16, 0);
    const pts = gridPts(24, 0.17, skip);
    if (withPins) g.add(grid(new THREE.CylinderGeometry(0.025, 0.02, 0.3, 6), gold(), pts, -0.21));
    else g.add(grid(new THREE.BoxGeometry(0.09, 0.02, 0.09), gold(), pts, -0.07));
    const mark = mk(g, new THREE.ConeGeometry(0.18, 0.02, 3), M({ color: 0xE2B85C, metalness: 1, roughness: 0.3 }), -2.0, 0.07, -2.0); mark.rotation.y = Math.PI / 4;
    g.traverse(o => { o.userData.sock = withPins ? 'pga' : 'lga'; });
    return g;
  }
  function board(x) { mk(ctx.stage, new THREE.BoxGeometry(7, 0.1, 7), M({ color: 0x16201c, roughness: 0.75 }), x, -0.14, 0); }

  function lga(x) {
    const g = new THREE.Group(); g.position.x = x; ctx.stage.add(g); board(x);
    const fm = M({ color: 0x2b3238, metalness: 0.6, roughness: 0.45 });
    const b1 = new THREE.BoxGeometry(5.4, 0.14, 0.35), b2 = new THREE.BoxGeometry(0.35, 0.14, 4.7);
    mk(g, b1, fm, 0, -0.02, 2.525); mk(g, b1, fm, 0, -0.02, -2.525); mk(g, b2, fm, 2.525, -0.02, 0); mk(g, b2, fm, -2.525, -0.02, 0);
    mk(g, new THREE.BoxGeometry(4.7, 0.02, 4.7), M({ color: 0x1c2227, roughness: 0.6 }), 0, -0.08, 0);
    g.add(grid(new THREE.BoxGeometry(0.035, 0.13, 0.035), gold(), gridPts(24, 0.17, skip), -0.02, 0.5));
    // placa de carga con bisagra
    const plate = new THREE.Group(); plate.position.set(0, 0.06, -2.7); g.add(plate);
    const pm = M({ color: 0xaeb5bc, metalness: 1, roughness: 0.3 });
    [[0, 0.3, 5.2, 0.5], [0, 5.1, 5.2, 0.5], [-2.35, 2.7, 0.5, 4.3], [2.35, 2.7, 0.5, 4.3]].forEach(a => mk(plate, new THREE.BoxGeometry(a[2], 0.04, a[3]), pm, a[0], 0.2, a[1]));
    // palanca
    const lever = new THREE.Group(); lever.position.set(2.95, 0.05, -2.6); g.add(lever);
    mk(lever, new THREE.CylinderGeometry(0.05, 0.05, 5.2, 12), pm, 0, 0, 2.6).rotation.x = Math.PI / 2;
    mk(lever, new THREE.BoxGeometry(0.1, 0.1, 0.5), M({ color: 0x1a1f24 }), 0, 0, 5.2);
    const c = cpu(false); g.add(c);
    g.traverse(o => { o.userData.sock = 'lga'; });
    return { g, cpu: c, plate, lever, restY: 0.12 };
  }
  function pga(x) {
    const g = new THREE.Group(); g.position.x = x; ctx.stage.add(g); board(x);
    const holes = canvasTex(512, 512, (h, w) => { h.fillStyle = '#e9e4d8'; h.fillRect(0, 0, w, w); h.fillStyle = '#3a3630'; const n = 24, stp = 0.17, half = (n - 1) * stp / 2;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const xx = -half + i * stp, zz = -half + j * stp; if (skip(xx, zz)) continue; h.beginPath(); h.arc(w / 2 + xx / 4.8 * w, w / 2 + zz / 4.8 * w, 3.2, 0, Math.PI * 2); h.fill(); } });
    const body = M({ color: 0xe9e4d8, roughness: 0.7 });
    mk(g, new THREE.BoxGeometry(4.8, 0.3, 4.8), [body, body, M({ map: holes.tex, roughness: 0.7 }), body, body, body], 0, 0.06, 0);
    mk(g, new THREE.BoxGeometry(0.5, 0.3, 4.8), M({ color: 0xdcd6c8, roughness: 0.7 }), 2.65, 0.06, 0);
    const lever = new THREE.Group(); lever.position.set(3.05, 0.1, 2.3); g.add(lever);
    mk(lever, new THREE.CylinderGeometry(0.05, 0.05, 4.4, 12), M({ color: 0xaeb5bc, metalness: 1, roughness: 0.3 }), 0, 0, -2.2).rotation.x = Math.PI / 2;
    mk(lever, new THREE.BoxGeometry(0.12, 0.12, 0.4), M({ color: 0xe9e4d8 }), 0, 0, -4.4);
    const c = cpu(true); g.add(c);
    g.traverse(o => { o.userData.sock = 'pga'; });
    return { g, cpu: c, lever, restY: 0.27 };
  }

  function apply() {
    const P = st.parts, p = st.p, k1 = Math.min(1, p), k2 = Math.max(0, p - 1);
    const e = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    [P.lga, P.pga].forEach(s => { const k = e(k1); s.cpu.position.y = 2.6 + (s.restY - 2.6) * k; s.cpu.rotation.x = -0.85 * (1 - k); s.cpu.position.z = 1.2 * (1 - k); });
    P.lga.plate.rotation.x = -1.9 * (1 - e(k2));
    P.lga.lever.rotation.x = -1.2 * (1 - e(k2));
    P.pga.lever.rotation.x = 1.3 * (1 - e(k2));
  }
  function build() {
    ctx.clearStage();
    st.parts = { lga: lga(-3.9), pga: pga(3.9) }; apply();
    ctx.setLabels([
      { text: 'LGA · pines en la tarjeta madre', pos: () => V(-3.9, 3.9, 0), onClick: () => select('lga'), sel: () => st.sel === 'lga' },
      { text: 'PGA · pines en el procesador', pos: () => V(3.9, 3.9, 0), onClick: () => select('pga'), sel: () => st.sel === 'pga' }
    ]);
    const dist = Math.max(14, 8.5 / (0.344 * ctx.aspect()));
    ctx.flyTo(V(0, 0.62, 0.78).normalize().multiplyScalar(dist).add(V(0, 1, 0.5)), V(0, 1, 0.5), 1.3);
    renderPanel(); renderDock();
  }
  function select(id) { st.sel = id; ctx.audio.play('pick'); renderPanel(); }
  function renderPanel() {
    const rows = [['Dónde están los pines', 'En el socket de la tarjeta madre', 'Debajo del procesador'], ['Quién lo usa', S.lga.who, S.pga.who], ['Ventaja', S.lga.good, S.pga.good], ['Riesgo', S.lga.bad, S.pga.bad]];
    let html = '<p class="kicker">Tipos de socket</p><h2>¿Dónde van los pines?</h2><p class="lede">El socket es el “enchufe” del procesador en la tarjeta madre. Hay dos formas de hacerlo.</p>' +
      '<div class="tblwrap"><table class="tbl"><thead><tr><th></th><th>LGA</th><th>PGA</th></tr></thead><tbody>' + rows.map(r => '<tr><th>' + r[0] + '</th><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>').join('') + '</tbody></table></div>';
    if (st.sel) { const s = S[st.sel]; html += '<div class="card"><h4>' + s.name + '</h4><p>' + s.what + '</p></div>'; }
    else html += '<p class="muted">Toca un socket para ver cómo funciona.</p>';
    html += '<div class="fact"><b>¿Y en laptops y celulares?</b><p>' + S.bga + '</p></div>';
    ctx.panel.innerHTML = html;
  }
  function renderDock() {
    const d = ctx.setDock('<button class="btn primary" id="sIns">' + (st.target ? 'Sacar procesadores' : 'Insertar procesadores') + '</button><span class="muted small">' + (st.target ? 'Palancas cerradas' : 'Inclinados para ver los pines') + '</span>');
    d.querySelector('#sIns').onclick = () => { st.target = st.target ? 0 : 2; ctx.audio.play('pick'); renderDock(); };
  }
  return {
    enter() { st.target = 0; st.p = 0; st.sel = null; build(); },
    exit() { ctx.setLabels([]); },
    update(dt) {
      const prev = st.p, sp = dt * 0.9;
      if (st.p < st.target) st.p = Math.min(st.target, st.p + sp); else if (st.p > st.target) st.p = Math.max(st.target, st.p - sp);
      if (prev !== st.p) { apply(); if (prev < 1 && st.p >= 1) ctx.audio.play('place'); if (prev < 2 && st.p >= 2) ctx.audio.play('place'); }
    },
    pick(hit) { let o = hit.object; while (o && !o.userData.sock) o = o.parent; if (o) select(o.userData.sock); }
  };
};
