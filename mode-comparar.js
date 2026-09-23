/* Procesador por Dentro — modo "Comparar": celular / laptop / escritorio y 1993 contra hoy. */
window.PXD = window.PXD || {};
PXD.modes = PXD.modes || {};
PXD.modes.comparar = function (ctx) {
  'use strict';
  const { THREE, V, M, mk, canvasTex, grid, gridPts } = ctx.kit;
  const C = PXD.data.COMPARE;
  const st = { view: 'tamanos', flip: 0, flipT: 0, sel: null, models: {} };

  const green = () => M({ color: 0x2d5a3c, roughness: 0.55, metalness: 0.05 });
  const nickel = () => M({ color: 0xd0d5da, metalness: 1, roughness: 0.3 });
  const dieTop = () => M({ map: ctx.die.tex, emissive: 0xffffff, emissiveMap: ctx.die.tex, emissiveIntensity: 0.2, metalness: 0.35, roughness: 0.3 });
  const ball = () => M({ color: 0xc9cfd5, metalness: 1, roughness: 0.25 });
  const ramTex = canvasTex(256, 256, (g, w) => { g.fillStyle = '#15181c'; g.fillRect(0, 0, w, w); g.fillStyle = '#9aa3ab'; g.font = '600 34px "IBM Plex Mono", monospace'; g.textAlign = 'center'; g.fillText('RAM', w / 2, 120); g.font = '400 20px "IBM Plex Mono", monospace'; g.fillText('LPDDR', w / 2, 160); });

  function celular() {
    const g = new THREE.Group();
    mk(g, new THREE.BoxGeometry(1.25, 0.08, 1.25), M({ color: 0x1f3b2a, roughness: 0.6 }), 0, 0, 0);
    const side = M({ color: 0x1c2030, metalness: 0.6, roughness: 0.35 });
    mk(g, new THREE.BoxGeometry(0.72, 0.05, 0.6), [side, side, dieTop(), side, side, side], 0, 0.065, 0);
    const ram = new THREE.Group(); g.add(ram);
    mk(ram, new THREE.BoxGeometry(1.15, 0.14, 1.15), [M({ color: 0x15181c }), M({ color: 0x15181c }), M({ map: ramTex.tex, roughness: 0.6 }), M({ color: 0x15181c }), M({ color: 0x15181c }), M({ color: 0x15181c })], 0, 0, 0);
    ram.position.y = 0.42; st.ram = ram;
    g.add(grid(new THREE.SphereGeometry(0.035, 8, 6), ball(), gridPts(12, 0.1), -0.06));
    return g;
  }
  function laptop() {
    const g = new THREE.Group(), side = M({ color: 0x1c2030, metalness: 0.6, roughness: 0.35 });
    mk(g, new THREE.BoxGeometry(4.0, 0.1, 2.5), green(), 0, 0, 0);
    mk(g, new THREE.BoxGeometry(1.5, 0.06, 1.0), [side, side, dieTop(), side, side, side], -0.6, 0.08, 0);
    mk(g, new THREE.BoxGeometry(0.8, 0.06, 0.6), M({ color: 0x1c2030, metalness: 0.6, roughness: 0.35 }), 1.1, 0.08, 0.2);
    for (let i = 0; i < 10; i++) mk(g, new THREE.BoxGeometry(0.1, 0.05, 0.06), M({ color: 0x9b7a55 }), -1.8 + i * 0.4, 0.075, -1.05);
    const pts = []; for (let i = 0; i < 36; i++) for (let j = 0; j < 22; j++) pts.push([-1.9 + i * 0.108, -1.15 + j * 0.108]);
    g.add(grid(new THREE.SphereGeometry(0.035, 8, 6), ball(), pts, -0.07));
    return g;
  }
  function escritorio() {
    const g = new THREE.Group();
    mk(g, new THREE.BoxGeometry(4.5, 0.12, 3.75), green(), 0, 0, 0);
    const nm = nickel(); mk(g, new THREE.BoxGeometry(3.3, 0.2, 3.1), nm, 0, 0.16, 0);
    for (let i = 0; i < 8; i++) { mk(g, new THREE.BoxGeometry(0.1, 0.05, 0.07), M({ color: 0x9b7a55 }), -1.9 + i * 0.54, 0.085, 1.7); mk(g, new THREE.BoxGeometry(0.1, 0.05, 0.07), M({ color: 0x9b7a55 }), -1.9 + i * 0.54, 0.085, -1.7); }
    const pts = []; for (let i = 0; i < 30; i++) for (let j = 0; j < 25; j++) { const x = -2.05 + i * 0.141, z = -1.7 + j * 0.141; if (Math.abs(x) < 0.7 && Math.abs(z) < 0.6) continue; pts.push([x, z]); }
    g.add(grid(new THREE.BoxGeometry(0.08, 0.02, 0.08), M({ color: 0xE2B85C, metalness: 1, roughness: 0.28 }), pts, -0.07));
    return g;
  }
  function viejo() {
    const g = new THREE.Group();
    mk(g, new THREE.BoxGeometry(4.95, 0.25, 4.95), M({ color: 0xd9d3c7, roughness: 0.75 }), 0, 0, 0);
    mk(g, new THREE.BoxGeometry(2.0, 0.04, 2.0), M({ color: 0xE2B85C, metalness: 1, roughness: 0.3 }), 0, 0.145, 0);
    const pts = gridPts(21, 0.228, (x, z) => Math.abs(x) < 1.4 && Math.abs(z) < 1.4);
    g.add(grid(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 6), M({ color: 0xE2B85C, metalness: 1, roughness: 0.3 }), pts, -0.3));
    return g;
  }
  const BUILD = { celular, laptop, escritorio, viejo };
  const LAYOUT = { tamanos: { celular: -5.0, laptop: -1.3, escritorio: 3.9 }, epocas: { viejo: -3.3, escritorio: 3.0 } };

  function build() {
    ctx.clearStage(); st.models = {}; st.sel = null;
    const L = LAYOUT[st.view];
    Object.keys(L).forEach(id => {
      const holder = new THREE.Group(); holder.position.set(L[id], 0.7, 0); ctx.stage.add(holder);
      const m = BUILD[id](); holder.add(m); m.userData.cmpId = id; m.traverse(o => { o.userData.cmpId = id; });
      st.models[id] = holder;
    });
    // regla de 5 cm
    const ruler = new THREE.Group(); ruler.position.set(-2.5, -0.17, 3.3); ctx.stage.add(ruler);
    mk(ruler, new THREE.BoxGeometry(5, 0.02, 0.1), M({ color: 0xe4ecf2, roughness: 0.6 }), 2.5, 0, 0);
    for (let i = 0; i <= 5; i++) mk(ruler, new THREE.BoxGeometry(0.03, 0.03, 0.3), M({ color: 0xe4ecf2 }), i, 0, -0.1);
    const items = C[st.view].items;
    ctx.setLabels(items.map(it => ({ text: it.name, pos: () => st.models[it.id].position.clone().add(V(0, 1.1, 0)), onClick: () => select(it.id), sel: () => st.sel === it.id }))
      .concat([{ text: '5 cm', pos: () => V(0, -0.1, 3.7) }]));
    const dist = Math.max(13, 7.2 / (0.344 * ctx.aspect()));
    const dir = V(0, 0.7, 0.72).normalize();
    ctx.flyTo(dir.multiplyScalar(dist).add(V(0, 0.4, 0.5)), V(0, 0.4, 0.5), 1.3);
    renderPanel(); renderDock();
  }
  function select(id) { st.sel = id; ctx.audio.play('pick'); renderPanel(); }
  function renderPanel() {
    const v = C[st.view], items = v.items;
    const rows = [['Tamaño', 'size'], ['Núcleos', 'cores'], ['Transistores', 'trans'], ['Consumo', 'power'], ['Proceso', 'node'], ['Enfriamiento', 'cool']];
    let html = '<p class="kicker">Comparar</p><h2>' + v.title + '</h2><p class="lede">' + v.lead + '</p>' +
      '<div class="tblwrap"><table class="tbl"><thead><tr><th></th>' + items.map(i => '<th>' + i.name + '</th>').join('') + '</tr></thead><tbody>' +
      rows.map(r => '<tr><th>' + r[0] + '</th>' + items.map(i => '<td>' + i[r[1]] + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>' +
      '<p class="muted small">Valores aproximados; cambian según el modelo.</p>';
    if (st.sel) { const it = items.find(i => i.id === st.sel); if (it) html += '<div class="card"><h4>' + it.name + '</h4><p>' + it.note + '</p></div>'; }
    else html += '<p class="muted">Toca un procesador para ver un detalle importante.</p>';
    html += '<p class="muted small">“nm” mide el tamaño del proceso de fabricación: entre más chico, más transistores caben.</p>';
    ctx.panel.innerHTML = html;
  }
  function renderDock() {
    const d = ctx.setDock('<div class="seg" role="group" aria-label="Qué comparar"><button class="btn" data-v="tamanos" aria-pressed="' + (st.view === 'tamanos') + '">Celular · Laptop · Escritorio</button><button class="btn" data-v="epocas" aria-pressed="' + (st.view === 'epocas') + '">1993 vs hoy</button></div><button class="btn primary" id="cFlip">' + (st.flip ? 'Ver por arriba' : 'Ver por abajo') + '</button>');
    d.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { if (st.view !== b.dataset.v) { st.view = b.dataset.v; st.flip = 0; build(); } });
    d.querySelector('#cFlip').onclick = () => { st.flip = st.flip ? 0 : 1; renderDock(); };
  }
  return {
    enter() { st.flip = 0; st.flipT = 0; build(); },
    exit() { ctx.setLabels([]); },
    update(dt, time) {
      st.flipT += (st.flip - st.flipT) * (1 - Math.exp(-dt * 4));
      Object.values(st.models).forEach(h => { h.rotation.x = st.flipT * Math.PI; h.rotation.y = Math.sin(time * 0.3) * 0.25; });
      if (st.ram && st.models.celular) st.ram.position.y = 0.42 + Math.sin(time * 1.5) * 0.05;
    },
    pick(hit) { let o = hit.object; while (o && !o.userData.cmpId) o = o.parent; if (o) select(o.userData.cmpId); }
  };
};
