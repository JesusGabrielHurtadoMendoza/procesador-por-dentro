/* Procesador por Dentro — modo "Fabricación": de la arena al procesador empaquetado. */
window.PXD = window.PXD || {};
PXD.modes = PXD.modes || {};
PXD.modes.fabricacion = function (ctx) {
  'use strict';
  const { THREE, V, M, mk, canvasTex, rnd } = ctx.kit;
  const FAB = PXD.data.FAB, N = FAB.length;
  const st = { step: 0, t: 0, playing: false, playT: 0, cur: null };
  const WR = 1.6; // radio de la oblea en la escena

  /* ---------- texturas de oblea ---------- */
  const dieCells = []; // centros normalizados de cada chip dentro de la oblea
  const waferPattern = canvasTex(1024, 1024, (g, w) => {
    g.fillStyle = '#aeb6be'; g.fillRect(0, 0, w, w);
    const n = 15, step = w / n, cx = w / 2, R = w * 0.46;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x0 = i * step + 3, y0 = j * step + 3, s = step - 6;
      const far = [[x0, y0], [x0 + s, y0], [x0, y0 + s], [x0 + s, y0 + s]].some(p => Math.hypot(p[0] - cx, p[1] - cx) > R);
      if (far) continue;
      const u = (x0 + s / 2) / w, v = (y0 + s / 2) / w; dieCells.push([u, v]);
      const gr = g.createLinearGradient(x0, y0, x0 + s, y0 + s);
      const hue = 200 + ((i * 7 + j * 11) % 90);
      gr.addColorStop(0, 'hsl(' + hue + ',55%,42%)'); gr.addColorStop(1, 'hsl(' + (hue + 60) + ',60%,35%)');
      g.fillStyle = gr; g.fillRect(x0, y0, s, s);
      g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x0 + s * 0.1, y0 + s * 0.1, s * 0.5, s * 0.35);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x0 + s * 0.65, y0 + s * 0.1, s * 0.25, s * 0.8);
    }
  });
  const maskTex = canvasTex(512, 512, (g, w) => {
    g.fillStyle = '#0d1116'; g.fillRect(0, 0, w, w); g.strokeStyle = '#e3c27a'; g.lineWidth = 3;
    const r = rnd(5); for (let i = 0; i < 120; i++) { g.beginPath(); let x = r() * w, y = r() * w; g.moveTo(x, y); if (r() < 0.5) x += (r() - 0.5) * 160; else y += (r() - 0.5) * 160; g.lineTo(x, y); g.stroke(); }
  });
  const siMat = () => M({ color: 0x8e98a3, metalness: 0.95, roughness: 0.22 });
  function wafer(opts) {
    opts = opts || {};
    const g = new THREE.Group(), r = opts.r || WR;
    mk(g, new THREE.CylinderGeometry(r, r, 0.03, 72), M({ color: 0x9aa2ab, metalness: 1, roughness: opts.rough == null ? 0.12 : opts.rough }));
    let top = null;
    if (opts.pattern) {
      top = mk(g, new THREE.CircleGeometry(r * 0.999, 72), M({ map: waferPattern.tex, metalness: 0.7, roughness: 0.25, emissive: 0xffffff, emissiveMap: waferPattern.tex, emissiveIntensity: 0.08, clippingPlanes: opts.clip ? [opts.clip] : null }), 0, 0.017, 0);
      top.rotation.x = -Math.PI / 2;
    }
    return { group: g, top };
  }
  function cellWorld(c, r) { r = r || WR; return V((c[0] - 0.5) * 2 * r, 0, (c[1] - 0.5) * 2 * r); }
  function crucible(s) {
    const g = new THREE.Group();
    const wall = M({ color: 0xd9dde2, roughness: 0.35, metalness: 0.1, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    mk(g, new THREE.CylinderGeometry(1.35, 1.2, 1.3, 48, 1, true), wall, 0, 0.46, 0);
    mk(g, new THREE.CylinderGeometry(1.2, 1.2, 0.06, 48), wall, 0, -0.16, 0);
    const meltMat = new THREE.MeshStandardMaterial({ color: 0xff8a3d, emissive: 0xff6a1a, emissiveIntensity: 1.4, roughness: 0.3 });
    const melt = mk(g, new THREE.CylinderGeometry(1.26, 1.2, 0.6, 48), meltMat, 0, 0.16, 0);
    const heater = M({ color: 0x3a2a24, roughness: 0.8 });
    mk(g, new THREE.TorusGeometry(1.55, 0.08, 10, 48), heater, 0, 0.1, 0).rotation.x = Math.PI / 2;
    mk(g, new THREE.TorusGeometry(1.55, 0.08, 10, 48), heater, 0, 0.6, 0).rotation.x = Math.PI / 2;
    const light = new THREE.PointLight(0xff7a2a, 1.4, 8); light.position.set(0, 1.2, 0); g.add(light);
    s.add(g);
    return { meltMat, light, meltTop: 0.46 };
  }

  /* ---------- escenas por paso: cada una devuelve update(t) ---------- */
  const BUILD = [
    // 0 Arena
    function (s) {
      const n = 1400, geo = new THREE.SphereGeometry(0.05, 6, 4), mat = M({ color: 0xffffff, roughness: 0.9 });
      const im = new THREE.InstancedMesh(geo, mat, n); im.castShadow = true; im.frustumCulled = false; s.add(im);
      const r = rnd(9), tgt = [], col = new THREE.Color(), d = new THREE.Object3D();
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2, rad = 2.3 * Math.sqrt(r()), hmax = 1.3 * (1 - rad / 2.3);
        tgt.push([Math.cos(a) * rad, -0.14 + r() * hmax + 0.05, Math.sin(a) * rad, r() * 1.6]);
        col.setHSL(0.1 + r() * 0.04, 0.35 + r() * 0.2, 0.55 + r() * 0.2); im.setColorAt(i, col);
      }
      return function (t) {
        if (t > 4.2 && im.userData.done) return;
        for (let i = 0; i < n; i++) { const p = tgt[i], tt = Math.max(0, t - p[3]); const y = Math.max(p[1], 6 - 9.8 * tt * tt); d.position.set(p[0], y, p[2]); d.updateMatrix(); im.setMatrixAt(i, d.matrix); }
        im.instanceMatrix.needsUpdate = true; if (t > 4.2) im.userData.done = true;
      };
    },
    // 1 Silicio ultrapuro
    function (s) {
      const c = crucible(s), grains = [], gm = M({ color: 0xe5d3a6, roughness: 0.9 }), r = rnd(4);
      for (let i = 0; i < 40; i++) { const m = mk(s, new THREE.SphereGeometry(0.06, 6, 4), gm); grains.push({ m, x: (r() - 0.5) * 1.6, z: (r() - 0.5) * 1.6, o: r() * 3 }); }
      ctx.setLabels([{ text: 'Pureza 99.9999999 %', pos: () => V(0, 2.4, 0) }]);
      return function (t) {
        c.meltMat.emissiveIntensity = 1.2 + 0.3 * Math.sin(t * 3); c.light.intensity = 1.2 + 0.3 * Math.sin(t * 3);
        grains.forEach(g => { const k = ((t + g.o) % 3) / 3; const y = 3.5 - k * 3.4; g.m.position.set(g.x, Math.max(c.meltTop, y), g.z); const sc = y < c.meltTop + 0.05 ? 0.01 : 1; g.m.scale.setScalar(sc); });
      };
    },
    // 2 Lingote
    function (s) {
      const c = crucible(s);
      const ingot = mk(s, new THREE.CylinderGeometry(0.72, 0.72, 1, 48), siMat());
      const neck = mk(s, new THREE.ConeGeometry(0.72, 0.5, 48), siMat());
      const rod = mk(s, new THREE.CylinderGeometry(0.05, 0.05, 1, 12), M({ color: 0x9aa3ab, metalness: 1, roughness: 0.3 }));
      return function (t) {
        const tt = t % 11, L = Math.min(tt * 0.45, 3.6), base = c.meltTop - 0.05;
        ingot.scale.y = Math.max(0.01, L); ingot.position.y = base + L / 2; ingot.rotation.y = t * 0.8;
        neck.position.y = base + L + 0.25; neck.visible = L > 0.05;
        const top = base + L + 0.5; rod.scale.y = 6.5 - top; rod.position.y = top + (6.5 - top) / 2;
        c.meltMat.emissiveIntensity = 1.2 + 0.2 * Math.sin(t * 3);
      };
    },
    // 3 Cortar obleas
    function (s) {
      const ingotLen = 4, ingot = mk(s, new THREE.CylinderGeometry(0.75, 0.75, 1, 48), siMat());
      ingot.rotation.z = Math.PI / 2;
      const wm = M({ color: 0x9aa2ab, metalness: 1, roughness: 0.2 }), wg = new THREE.CylinderGeometry(0.75, 0.75, 0.03, 48);
      const ws = []; for (let i = 0; i < 9; i++) { const m = mk(s, wg, wm); m.rotation.z = Math.PI / 2; ws.push(m); }
      const saw = new THREE.Group(); s.add(saw);
      for (let i = 0; i < 5; i++) mk(saw, new THREE.CylinderGeometry(0.008, 0.008, 2.6, 6), M({ color: 0xdfe6ec, metalness: 1, roughness: 0.2 }), 0, 0, -0.4 + i * 0.2);
      return function (t) {
        const tt = t % 10, k = Math.min(9, Math.floor(tt / 0.9)), frac = (tt % 0.9) / 0.9;
        const len = ingotLen - k * 0.12; ingot.scale.y = len; ingot.position.set(-2.4 + len / 2, 0.8, 0);
        const cutX = -2.4 + len; saw.position.set(cutX + 0.03, 0.8 + Math.sin(t * 20) * 0.05, 0);
        ws.forEach((w, i) => { if (i > k) { w.visible = false; return; } w.visible = true;
          const f = i < k ? 1 : frac; const rackX = 2.2 + i * 0.28; const x = cutX + 0.05 + (rackX - cutX) * f; w.position.set(x, 0.8 - Math.sin(Math.PI * f) * 0.2 + (i < k ? 0 : 0), 0); });
      };
    },
    // 4 Pulido
    function (s) {
      const pad = mk(s, new THREE.CylinderGeometry(2.6, 2.6, 0.18, 64), M({ color: 0x2a3440, roughness: 0.85 }), 0, -0.08, 0);
      const w = wafer({ rough: 0.7 }); w.group.position.set(0.8, 0.03, 0); s.add(w.group);
      const wmat = w.group.children[0].material;
      const arm = mk(s, new THREE.BoxGeometry(3.2, 0.2, 0.3), M({ color: 0x59636d, metalness: 0.6, roughness: 0.4 }), 2.4, 0.35, 0);
      mk(s, new THREE.CylinderGeometry(0.25, 0.25, 0.4, 20), M({ color: 0x59636d, metalness: 0.6, roughness: 0.4 }), 0.8, 0.2, 0);
      return function (t) {
        pad.rotation.y = t * 1.5; w.group.rotation.y = -t * 3;
        const k = Math.min(1, (t % 9) / 6); wmat.roughness = 0.7 - 0.66 * k; wmat.color.setHex(k > 0.5 ? 0xb8c0c8 : 0x8a929a);
        arm.position.y = 0.35;
      };
    },
    // 5 Litografía
    function (s) {
      const clip = new THREE.Plane(V(-1, 0, 0), -WR);
      const base = wafer({ rough: 0.3 }); s.add(base.group);
      const pat = wafer({ pattern: true, clip }); pat.group.children[0].visible = false; pat.group.position.y = 0.002; s.add(pat.group);
      mk(s, new THREE.BoxGeometry(4.4, 0.2, 4.4), M({ color: 0x252d35, roughness: 0.6, metalness: 0.4 }), 0, -0.13, 0);
      const head = new THREE.Group(); s.add(head);
      mk(head, new THREE.CylinderGeometry(0.55, 0.45, 1.2, 32), M({ color: 0x3a4550, metalness: 0.7, roughness: 0.3 }), 0, 3.4, 0);
      const mask = mk(head, new THREE.BoxGeometry(1.6, 0.04, 1.6), M({ map: maskTex.tex, transparent: true, opacity: 0.9, roughness: 0.3 }), 0, 4.3, 0);
      mk(head, new THREE.BoxGeometry(1.4, 0.6, 1.4), M({ color: 0x1e252c, metalness: 0.5, roughness: 0.4 }), 0, 5.0, 0);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0xa87bff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.1, 2.75, 32, 1, true), beamMat); beam.position.y = 1.4; head.add(beam);
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.6, 32, 1, true), beamMat); upper.position.y = 4.65; head.add(upper);
      const spot = new THREE.PointLight(0xa87bff, 1.2, 3); spot.position.y = 0.3; head.add(spot);
      ctx.setLabels([{ text: 'Luz EUV', pos: () => V(head.position.x + 0.7, 2.2, 0) }, { text: 'Máscara', pos: () => V(head.position.x + 0.9, 4.3, 0) }]);
      return function (t) {
        const k = (t % 8) / 7, x = -WR - 0.2 + Math.min(1, k) * (2 * WR + 0.4);
        head.position.x = x; clip.constant = x; beamMat.opacity = 0.28 + 0.1 * Math.sin(t * 20); mask.rotation.y = 0;
      };
    },
    // 6 Grabado y capas (corte transversal)
    function (s) {
      mk(s, new THREE.BoxGeometry(3.4, 0.5, 1.6), M({ color: 0x3a4660, metalness: 0.5, roughness: 0.4 }), 0, 0.06, 0);
      const tr = new THREE.Group(); s.add(tr);
      for (let i = 0; i < 8; i++) { const x = -1.4 + i * 0.4; mk(tr, new THREE.BoxGeometry(0.12, 0.18, 1.4), M({ color: 0xc0504a, roughness: 0.5 }), x, 0.4, 0); mk(tr, new THREE.BoxGeometry(0.1, 0.06, 1.4), M({ color: 0x8fb6d8, roughness: 0.4 }), x - 0.16, 0.34, 0); mk(tr, new THREE.BoxGeometry(0.1, 0.06, 1.4), M({ color: 0x8fb6d8, roughness: 0.4 }), x + 0.16, 0.34, 0); }
      const layers = [], cu = M({ color: 0xd08a4e, metalness: 1, roughness: 0.3 });
      for (let L = 0; L < 7; L++) {
        const g = new THREE.Group(); s.add(g); const y = 0.58 + L * 0.26;
        mk(g, new THREE.BoxGeometry(3.4, 0.2, 1.6), new THREE.MeshStandardMaterial({ color: 0x9fd0e6, transparent: true, opacity: 0.18, roughness: 0.2, depthWrite: false }), 0, y, 0);
        const cnt = Math.max(3, 16 - L * 2), wdt = 0.05 + L * 0.03;
        for (let i = 0; i < cnt; i++) { const x = -1.55 + (i + 0.5) * (3.1 / cnt); if (L % 2) mk(g, new THREE.BoxGeometry(wdt, 0.08, 1.5), cu, x, y + 0.04, 0); else mk(g, new THREE.BoxGeometry(3.1, 0.08, wdt), cu, 0, y + 0.04, -0.7 + (i + 0.5) * (1.4 / cnt)); }
        mk(g, new THREE.BoxGeometry(0.05, 0.22, 0.05), cu, -1.2 + L * 0.35, y - 0.11, 0);
        layers.push({ g, y });
      }
      const lbl = { text: 'Capa de cobre 0 de 7', pos: () => V(1.9, 1.5, 0.9) };
      ctx.setLabels([lbl, { text: 'Transistores', pos: () => V(-1.9, 0.4, 0.9) }]);
      return function (t) {
        const tt = t % 10; let shown = 0;
        layers.forEach((l, i) => { const t0 = 1 + i * 1.0, k = Math.max(0, Math.min(1, (tt - t0) / 0.6)); l.g.visible = k > 0; l.g.position.y = (1 - k) * 1.5; if (k >= 1) shown++; });
        const txt = 'Capa de cobre ' + shown + ' de 7'; if (lbl.el && lbl.el.textContent !== txt) lbl.el.textContent = txt;
      };
    },
    // 7 Pruebas
    function (s) {
      const w = wafer({ pattern: true }); s.add(w.group);
      mk(s, new THREE.BoxGeometry(4.4, 0.2, 4.4), M({ color: 0x252d35, roughness: 0.6, metalness: 0.4 }), 0, -0.13, 0);
      const probe = new THREE.Group(); s.add(probe);
      mk(probe, new THREE.BoxGeometry(0.5, 0.3, 0.5), M({ color: 0x3a4550, metalness: 0.7, roughness: 0.3 }), 0, 0.55, 0);
      mk(probe, new THREE.CylinderGeometry(0.05, 0.05, 2.5, 10), M({ color: 0x59636d, metalness: 0.7, roughness: 0.3 }), 0, 1.95, 0);
      for (let i = 0; i < 6; i++) mk(probe, new THREE.CylinderGeometry(0.008, 0.002, 0.35, 6), M({ color: 0xe2b85c, metalness: 1, roughness: 0.2 }), -0.1 + (i % 3) * 0.1, 0.23, i < 3 ? -0.06 : 0.06);
      const r = rnd(21), fail = dieCells.map(() => r() < 0.13), n = dieCells.length;
      const mk2 = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xffffff }), n);
      mk2.frustumCulled = false; s.add(mk2); const d = new THREE.Object3D(), col = new THREE.Color();
      dieCells.forEach((c, i) => { const p = cellWorld(c); d.position.set(p.x, 0.03, p.z); d.rotation.set(-Math.PI / 2, 0, 0); d.updateMatrix(); mk2.setMatrixAt(i, d.matrix); mk2.setColorAt(i, col.setHex(fail[i] ? 0xe0685a : 0x6bcb8b)); });
      mk2.count = 0;
      const per = 0.09, total = n * per + 2;
      return function (t) {
        const tt = t % total, k = Math.min(n - 1, Math.floor(tt / per)), frac = (tt % per) / per;
        mk2.count = Math.min(n, Math.floor(tt / per)); const p = cellWorld(dieCells[k]);
        probe.position.set(p.x, tt < n * per ? Math.abs(Math.cos(frac * Math.PI)) * 0.12 : 0.8, p.z);
      };
    },
    // 8 Corte
    function (s) {
      const n = dieCells.length, sz = (2 * WR) / 15 * 0.86;
      const im = new THREE.InstancedMesh(new THREE.BoxGeometry(sz, 0.03, sz), M({ color: 0xffffff, metalness: 0.6, roughness: 0.3 }), n);
      im.castShadow = true; im.frustumCulled = false; s.add(im);
      const r = rnd(21), fail = dieCells.map(() => r() < 0.13), col = new THREE.Color(), d = new THREE.Object3D();
      dieCells.forEach((c, i) => { col.setHSL(0.6 + ((i * 13) % 20) / 100, 0.5, 0.42); if (fail[i]) col.setHex(0x6a2a28); im.setColorAt(i, col); });
      mk(s, new THREE.BoxGeometry(4.4, 0.2, 4.4), M({ color: 0x252d35, roughness: 0.6, metalness: 0.4 }), 0, -0.13, 0);
      const blade = mk(s, new THREE.CylinderGeometry(0.6, 0.6, 0.02, 40), M({ color: 0xdfe6ec, metalness: 1, roughness: 0.15 }));
      blade.rotation.x = Math.PI / 2;
      return function (t) {
        const tt = t % 9, cut = Math.min(1, tt / 3), spread = Math.max(0, Math.min(1, (tt - 3.3) / 1.5));
        blade.visible = tt < 3.1; const row = Math.floor(cut * 15), bz = -WR + (row + 0.5) * (2 * WR / 15);
        blade.position.set(Math.sin(tt * 9) * WR * 0.9, 0.5, bz); blade.rotation.z = tt * 30;
        dieCells.forEach((c, i) => { const p = cellWorld(c), f = 1 + spread * 0.35; d.position.set(p.x * f, 0.02 + (fail[i] ? 0 : spread * 0.25), p.z * f); d.updateMatrix(); im.setMatrixAt(i, d.matrix); });
        im.instanceMatrix.needsUpdate = true;
      };
    },
    // 9 Empaquetado
    function (s) {
      const g = new THREE.Group(); s.add(g);
      const side = M({ color: 0x234632, roughness: 0.6 });
      mk(g, new THREE.BoxGeometry(3, 0.1, 3), M({ color: 0x2d5a3c, roughness: 0.55 }), 0, 0.05, 0);
      const pads = ctx.kit.grid(new THREE.BoxGeometry(0.06, 0.02, 0.06), M({ color: 0xE2B85C, metalness: 1, roughness: 0.3 }), ctx.kit.gridPts(20, 0.14, (x, z) => Math.abs(x) < 0.5 && Math.abs(z) < 0.5), -0.01); g.add(pads);
      const dieMesh = mk(g, new THREE.BoxGeometry(1.2, 0.05, 0.82), [side, side, M({ map: ctx.die.tex, emissive: 0xffffff, emissiveMap: ctx.die.tex, emissiveIntensity: 0.2, metalness: 0.35, roughness: 0.3 }), side, side, side]);
      const tim = mk(g, new THREE.BoxGeometry(1.2, 0.02, 0.82), M({ color: 0xa3abb4, metalness: 0.85, roughness: 0.35 }));
      const cap = new THREE.Group(); g.add(cap); const nm = M({ color: 0xd0d5da, metalness: 1, roughness: 0.3 });
      mk(cap, new THREE.BoxGeometry(2.4, 0.12, 2.4), nm, 0, 0.06, 0);
      [[0, 1.14, 2.4, 0.12], [0, -1.14, 2.4, 0.12], [1.14, 0, 0.12, 2.16], [-1.14, 0, 0.12, 2.16]].forEach(a => mk(cap, new THREE.BoxGeometry(a[2], 0.1, a[3]), nm, a[0], -0.05, a[1]));
      const drop = (t, t0, y0, y1) => { const k = Math.max(0, Math.min(1, (t - t0) / 0.9)); return y0 + (y1 - y0) * (1 - Math.pow(1 - k, 3)); };
      return function (t) {
        const tt = t % 9;
        dieMesh.position.y = drop(tt, 0.4, 3, 0.125); tim.position.y = drop(tt, 1.6, 3.2, 0.16); cap.position.y = drop(tt, 2.8, 3.4, 0.2);
        tim.visible = tt > 1.6; cap.visible = tt > 2.8;
        g.rotation.y = tt > 4.2 ? (tt - 4.2) * 0.6 : 0;
      };
    }
  ];
  const CAMS = [
    [V(3.5, 4.2, 6.5), V(0, 0.5, 0)], [V(3.2, 4.8, 6.2), V(0, 1.0, 0)], [V(4.5, 4.5, 7.5), V(0, 2.0, 0)], [V(1.5, 3.5, 7), V(0.5, 0.8, 0)],
    [V(3.5, 4.5, 5.5), V(0.6, 0, 0)], [V(3.5, 4.8, 7.5), V(0, 1.6, 0)], [V(3.3, 3.2, 4.8), V(0, 1.0, 0)], [V(0.5, 4.8, 3.6), V(0, 0, 0)],
    [V(0.5, 5, 4.2), V(0, 0, 0)], [V(3.2, 3.2, 4.8), V(0, 0.4, 0)]
  ];

  function build() {
    ctx.clearStage(); ctx.setLabels([]);
    st.cur = BUILD[st.step](ctx.stage); st.t = 0;
    const c = CAMS[st.step], dir = c[0].clone().sub(c[1]), k = ctx.aspect() < 0.9 ? 1.3 : 1;
    ctx.flyTo(c[1].clone().add(dir.multiplyScalar(k)), c[1].clone(), 1.2);
    renderPanel(); renderDock();
  }
  function renderPanel() {
    const f = FAB[st.step];
    ctx.panel.innerHTML = '<p class="kicker">Fabricación · paso ' + (st.step + 1) + ' de ' + N + '</p><h2>' + f.t + '</h2><p>' + f.x + '</p>' +
      '<div class="fact"><b>Dato curioso</b><p>' + f.fact + '</p></div>' +
      '<h3>El camino completo</h3><ol class="chain">' + FAB.map((s, i) => '<li class="' + (i === st.step ? 'now' : i < st.step ? 'done' : '') + '"><button type="button" data-go="' + i + '">' + (i + 1) + '. ' + s.t + '</button></li>').join('') + '</ol>';
    ctx.panel.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(+b.dataset.go)));
  }
  function renderDock() {
    const d = ctx.setDock('<button class="btn" id="fPrev" aria-label="Paso anterior">◀</button><div class="dots">' + FAB.map((_, i) => '<i class="' + (i === st.step ? 'on' : '') + '"></i>').join('') + '</div><span class="count">' + (st.step + 1) + ' / ' + N + '</span><button class="btn primary" id="fPlay">' + (st.playing ? 'Pausar' : 'Reproducir') + '</button><button class="btn" id="fNext" aria-label="Paso siguiente">▶</button>');
    d.querySelector('#fPrev').onclick = () => go(st.step - 1);
    d.querySelector('#fNext').onclick = () => go(st.step + 1);
    d.querySelector('#fPlay').onclick = () => { st.playing = !st.playing; st.playT = 0; renderDock(); };
  }
  function go(n) { st.step = (n + N) % N; st.playT = 0; ctx.audio.play('step'); build(); }

  return {
    enter() { st.step = 0; st.playing = false; build(); },
    exit() { st.playing = false; ctx.setLabels([]); },
    update(dt) {
      st.t += dt; if (st.cur) st.cur(st.t);
      if (st.playing) { st.playT += dt; if (st.playT > 8) { st.playT = 0; if (st.step === N - 1) { st.playing = false; renderDock(); } else go(st.step + 1); } }
    },
    key(dir) { go(st.step + dir); }
  };
};
