/* Procesador por Dentro — sonidos sintetizados con Web Audio (no usa archivos). */
window.PXD = window.PXD || {};
PXD.audio = (function () {
  'use strict';
  let ctx = null, master = null, fanGain = null, fanFilter = null, hum = null, humGain = null, on = false;

  function init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    // ruido café en bucle para el aire del ventilador
    const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    fanFilter = ctx.createBiquadFilter(); fanFilter.type = 'bandpass'; fanFilter.frequency.value = 300; fanFilter.Q.value = 0.6;
    fanGain = ctx.createGain(); fanGain.gain.value = 0;
    src.connect(fanFilter); fanFilter.connect(fanGain); fanGain.connect(master); src.start();
    // zumbido del motor
    hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 60;
    humGain = ctx.createGain(); humGain.gain.value = 0; hum.connect(humGain); humGain.connect(master); hum.start();
    return true;
  }

  function setEnabled(v) {
    on = !!v;
    if (on && !ctx && !init()) { on = false; return false; }
    if (!ctx) return on;
    if (on && ctx.state === 'suspended') ctx.resume();
    master.gain.setTargetAtTime(on ? 0.7 : 0, ctx.currentTime, 0.05);
    return on;
  }

  /* level: 0 (apagado) a 1 (máximo) */
  function setFan(level) {
    if (!ctx || !on) return;
    const t = ctx.currentTime, l = Math.max(0, Math.min(1, level));
    fanGain.gain.setTargetAtTime(l * 0.32, t, 0.25);
    fanFilter.frequency.setTargetAtTime(220 + l * 900, t, 0.25);
    humGain.gain.setTargetAtTime(l > 0.02 ? 0.015 + l * 0.02 : 0, t, 0.25);
    hum.frequency.setTargetAtTime(40 + l * 140, t, 0.25);
  }

  function tone(freq, dur, type, vol, when, slideTo) {
    const t = ctx.currentTime + (when || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function noiseBurst(dur, freq, vol) {
    const t = ctx.currentTime, n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx.createBufferSource(); s.buffer = b;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq;
    const g = ctx.createGain(); g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }

  /* efectos: place, wrong, step, done, pick, record */
  function play(kind) {
    if (!ctx || !on) return;
    switch (kind) {
      case 'place': noiseBurst(0.08, 2500, 0.5); tone(180, 0.18, 'sine', 0.35, 0, 80); break;
      case 'pick': tone(520, 0.06, 'triangle', 0.08); break;
      case 'wrong': tone(140, 0.22, 'square', 0.08); tone(110, 0.25, 'square', 0.06, 0.12); break;
      case 'step': tone(880, 0.09, 'sine', 0.08); break;
      case 'done': [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, 'triangle', 0.12, i * 0.1)); break;
      case 'record': [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.22, 'sine', 0.12, i * 0.08)); break;
    }
  }

  return { setEnabled, setFan, play, get enabled() { return on; } };
})();
