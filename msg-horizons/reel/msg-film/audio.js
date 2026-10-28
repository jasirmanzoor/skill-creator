/*
 * The MSG Horizons film's soundtrack, written in code and rendered offline (Web Audio, OfflineAudioContext) to a 16-bit WAV.
 * 120 BPM: a kick on every beat (30), quiet hats on the off-beats, a bass that ducks under each kick, a plucked
 * arpeggio from the first scene, a hit on every scene change (2, 4, 6, 10 s), soft ticks on the cursor's clicks, a riser
 * from 10 s into the last full bar, the biggest hit as the network fires at 12 s, a sweep as the dot flies to the
 * mark, and a bell as the logo lands. Deterministic: the noise comes from a seeded generator.
 */
(() => {
  const SR = 48000, LEN = 15, BEAT = 0.5;

  function seeded(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
  }

  function noiseBuffer(ctx, seconds, seed) {
    const buf = ctx.createBuffer(1, Math.ceil(SR * seconds), SR);
    const d = buf.getChannelData(0), r = seeded(seed);
    for (let i = 0; i < d.length; i++) d[i] = r();
    return buf;
  }

  function kick(ctx, out, t, big = 1) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(165, t);
    o.frequency.exponentialRampToValueAtTime(46, t + 0.11);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.95 * big, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    o.connect(g).connect(out);
    o.start(t); o.stop(t + 0.45);
    // the click of the beater
    const n = ctx.createBufferSource(), ng = ctx.createGain(), hp = ctx.createBiquadFilter();
    n.buffer = noiseBuffer(ctx, 0.02, 7 + Math.round(t * 100));
    hp.type = "highpass"; hp.frequency.value = 2500;
    ng.gain.setValueAtTime(0.22 * big, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);
    n.connect(hp).connect(ng).connect(out);
    n.start(t);
  }

  function hat(ctx, out, t) {
    const n = ctx.createBufferSource(), g = ctx.createGain(), hp = ctx.createBiquadFilter();
    n.buffer = noiseBuffer(ctx, 0.06, 99 + Math.round(t * 100));
    hp.type = "highpass"; hp.frequency.value = 7500;
    g.gain.setValueAtTime(0.09, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    n.connect(hp).connect(g).connect(out);
    n.start(t);
  }

  function hit(ctx, out, t, size = 1) {
    // a body: a low tom falling, and a burst of band-passed noise
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.25);
    og.gain.setValueAtTime(0.5 * size, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.5 * size);
    o.connect(og).connect(out); o.start(t); o.stop(t + 0.6 * size + 0.1);
    const n = ctx.createBufferSource(), ng = ctx.createGain(), bp = ctx.createBiquadFilter();
    n.buffer = noiseBuffer(ctx, 0.8, 300 + Math.round(t * 10));
    bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = 0.7;
    ng.gain.setValueAtTime(0.42 * size, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.35 * size);
    n.connect(bp).connect(ng).connect(out); n.start(t);
  }

  function riser(ctx, out, t0, t1) {
    const n = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    n.buffer = noiseBuffer(ctx, t1 - t0 + 0.1, 4242);
    f.type = "bandpass"; f.Q.value = 3;
    f.frequency.setValueAtTime(300, t0); f.frequency.exponentialRampToValueAtTime(7000, t1 - 0.02);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.32, t1 - 0.04); g.gain.linearRampToValueAtTime(0, t1);
    n.connect(f).connect(g).connect(out); n.start(t0); n.stop(t1);
    const o = ctx.createOscillator(), og = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(110, t0); o.frequency.exponentialRampToValueAtTime(880, t1 - 0.02);
    lp.type = "lowpass"; lp.frequency.setValueAtTime(400, t0); lp.frequency.exponentialRampToValueAtTime(5000, t1);
    og.gain.setValueAtTime(0.0001, t0); og.gain.exponentialRampToValueAtTime(0.12, t1 - 0.04); og.gain.linearRampToValueAtTime(0, t1);
    o.connect(lp).connect(og).connect(out); o.start(t0); o.stop(t1);
  }

  function bass(ctx, out, duck) {
    // one root per bar: A, F, C, G, A, F, (riser bar on E), A
    const roots = [55, 43.65, 65.41, 49, 55, 43.65, 41.2, 55];
    const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = "sawtooth";
    roots.forEach((f, b) => o.frequency.setValueAtTime(f, b * 2));
    lp.type = "lowpass"; lp.frequency.value = 320; lp.Q.value = 1.2;
    g.gain.value = 0.0;
    // the kick ducks the bass on every beat (sidechain pump)
    for (let i = 0; i < 30; i++) {
      const t = i * BEAT;
      g.gain.setValueAtTime(0.0, t);
      g.gain.linearRampToValueAtTime(0.16 * duck(t), t + 0.18);
      g.gain.setValueAtTime(0.16 * duck(t), t + BEAT - 0.01);
    }
    g.gain.setValueAtTime(0, LEN - 0.05);
    o.connect(lp).connect(g).connect(out);
    o.start(0); o.stop(LEN);
  }

  function bell(ctx, out, t) {
    [880, 1318.5, 1760].forEach((f, k) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12 / (k + 1), t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      o.connect(g).connect(out); o.start(t); o.stop(t + 1);
    });
  }


  function pluck(ctx, out, t, midi, level = 0.07) {
    const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = "triangle"; o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    lp.type = "lowpass"; lp.frequency.value = 3200;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(level, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    o.connect(lp).connect(g).connect(out); o.start(t); o.stop(t + 0.32);
  }

  function tick(ctx, out, t, level = 0.16) {
    // a mouse click: a short filtered noise tick and a tiny low knock
    const n = ctx.createBufferSource(), g = ctx.createGain(), bp = ctx.createBiquadFilter();
    n.buffer = noiseBuffer(ctx, 0.05, 700 + Math.round(t * 50));
    bp.type = "bandpass"; bp.frequency.value = 3000; bp.Q.value = 1.2;
    g.gain.setValueAtTime(level, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    n.connect(bp).connect(g).connect(out); n.start(t);
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.05);
    og.gain.setValueAtTime(level * 0.7, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(og).connect(out); o.start(t); o.stop(t + 0.08);
  }

  function sweep(ctx, out, t0, t1) {
    const n = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    n.buffer = noiseBuffer(ctx, t1 - t0 + 0.1, 909);
    f.type = "bandpass"; f.Q.value = 1.5;
    f.frequency.setValueAtTime(5000, t0); f.frequency.exponentialRampToValueAtTime(250, t1);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.2, t0 + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t1);
    n.connect(f).connect(g).connect(out); n.start(t0); n.stop(t1 + 0.05);
  }

  function wav(buffer) {
    const ch = buffer.numberOfChannels, n = buffer.length, bytes = 44 + n * ch * 2;
    const v = new DataView(new ArrayBuffer(bytes));
    const str = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    str(0, "RIFF"); v.setUint32(4, bytes - 8, true); str(8, "WAVE"); str(12, "fmt ");
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true); v.setUint32(24, SR, true);
    v.setUint32(28, SR * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true);
    str(36, "data"); v.setUint32(40, n * ch * 2, true);
    const data = [...Array(ch)].map((_, c) => buffer.getChannelData(c));
    let o = 44;
    for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const s = Math.max(-1, Math.min(1, data[c][i])); v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2; }
    let bin = "";
    const u8 = new Uint8Array(v.buffer);
    for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode(...u8.subarray(i, i + 0x8000));
    return btoa(bin);
  }

  window.renderAudio = async () => {
    const ctx = new OfflineAudioContext(2, SR * LEN, SR);
    const master = ctx.createDynamicsCompressor();
    master.threshold.value = -10; master.ratio.value = 4; master.attack.value = 0.003; master.release.value = 0.12;
    const out = ctx.createGain(); out.gain.value = 0.55;
    out.connect(master).connect(ctx.destination);
    for (let i = 0; i < 30; i++) kick(ctx, out, i * BEAT, i === 24 ? 1.2 : 1);
    for (let i = 0; i < 30; i++) if (i % 4 !== 0 || i < 4) hat(ctx, out, i * BEAT + BEAT / 2);
    // scene changes: the price card (2), the plan builder (4), the driver's phone (6), the Kingdom (10), the network (12)
    [2, 4, 6, 10].forEach((t) => hit(ctx, out, t, 1));
    hit(ctx, out, 12, 1.7);
    hit(ctx, out, 13, 0.8);
    // the cursor's clicks
    [2.55, 3.5, 4.55, 5.55, 7.0].forEach((t) => tick(ctx, out, t));
    tick(ctx, out, 3.22, 0.1); // the slider let go
    // plucked arpeggio (A minor pentatonic) on eighth notes from the first scene to the riser
    const arp = [69, 72, 76, 79, 76, 72, 81, 79];
    for (let t = 2, k = 0; t < 10; t += 0.25, k++) pluck(ctx, out, t, arp[k % arp.length] - (Math.floor(t / 2) % 2 ? 0 : 0));
    riser(ctx, out, 10, 12);
    for (let t = 12.0, k = 0; t < 13.0; t += 0.25, k++) pluck(ctx, out, t, [81, 84, 88, 93][k % 4], 0.09);
    sweep(ctx, out, 12.5, 13.15);
    bass(ctx, out, (t) => (t >= 10 && t < 12 ? 0.6 : 1));
    bell(ctx, out, 13.15); bell(ctx, out, 13.85);
    const buffer = await ctx.startRendering();
    return wav(buffer);
  };
})();
