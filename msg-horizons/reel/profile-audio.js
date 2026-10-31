/*
 * The profile film's soundtrack, written in code and rendered offline (Web Audio, OfflineAudioContext) to a 16-bit
 * WAV, like the reel's (audio.js). 100 BPM in A minor: desert air under the opening, a soft pad through Am F C G, a
 * pulse (kick and hats) from the moment HORIZONS resolves, a hit on every section change, risers into the title and
 * the end card, plucks while the figures count, and a bell on the end card. The film renderer passes the times.
 * Deterministic: the noise comes from a seeded generator.
 */
(() => {
  const SR = 48000, BEAT = 0.6, BAR = 2.4;

  function seeded(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
  }
  function noise(ctx, seconds, seed) {
    const buf = ctx.createBuffer(1, Math.ceil(SR * seconds), SR);
    const d = buf.getChannelData(0), r = seeded(seed);
    for (let i = 0; i < d.length; i++) d[i] = r();
    return buf;
  }
  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  function air(ctx, out, t0, t1, peak) {
    const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    n.buffer = noise(ctx, t1 - t0, 77);
    f.type = "bandpass"; f.Q.value = 0.6;
    f.frequency.setValueAtTime(500, t0); f.frequency.linearRampToValueAtTime(1800, (t0 + t1) / 2); f.frequency.linearRampToValueAtTime(700, t1);
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(peak, t0 + 1.2); g.gain.linearRampToValueAtTime(0.0001, t1);
    n.connect(f).connect(g).connect(out); n.start(t0); n.stop(t1);
  }

  function pad(ctx, out, t0, t1) {
    // Am, F, C, G, two bars each
    const chords = [[57, 60, 64, 69], [53, 57, 60, 65], [55, 60, 64, 67], [55, 59, 62, 67]];
    const lp = ctx.createBiquadFilter(), g = ctx.createGain();
    lp.type = "lowpass"; lp.frequency.value = 1100; lp.Q.value = 0.4;
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.06, t0 + 2.5);
    g.gain.setValueAtTime(0.06, t1 - 2.5); g.gain.linearRampToValueAtTime(0.0001, t1);
    lp.connect(g).connect(out);
    for (let v = 0; v < 4; v++) {
      [-6, 6].forEach((cents) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth"; o.detune.value = cents;
        for (let t = t0, k = 0; t < t1; t += BAR * 2, k++) o.frequency.setTargetAtTime(hz(chords[k % 4][v] - 12), t, 0.08);
        o.connect(lp); o.start(t0); o.stop(t1);
      });
    }
  }

  function kick(ctx, out, t, big = 1) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.12);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.8 * big, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.connect(g).connect(out); o.start(t); o.stop(t + 0.5);
  }
  function hat(ctx, out, t, level = 0.06) {
    const n = ctx.createBufferSource(), g = ctx.createGain(), hp = ctx.createBiquadFilter();
    n.buffer = noise(ctx, 0.06, 99 + Math.round(t * 100));
    hp.type = "highpass"; hp.frequency.value = 7800;
    g.gain.setValueAtTime(level, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    n.connect(hp).connect(g).connect(out); n.start(t);
  }
  function hit(ctx, out, t, size = 1) {
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(200, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.3);
    og.gain.setValueAtTime(0.42 * size, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.6 * size);
    o.connect(og).connect(out); o.start(t); o.stop(t + 0.7 * size + 0.1);
    const n = ctx.createBufferSource(), ng = ctx.createGain(), bp = ctx.createBiquadFilter();
    n.buffer = noise(ctx, 1.2, 300 + Math.round(t * 10));
    bp.type = "bandpass"; bp.frequency.value = 1200; bp.Q.value = 0.6;
    ng.gain.setValueAtTime(0.3 * size, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.9 * size);
    n.connect(bp).connect(ng).connect(out); n.start(t);
  }
  function riser(ctx, out, t0, t1) {
    const n = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    n.buffer = noise(ctx, t1 - t0 + 0.1, 4242);
    f.type = "bandpass"; f.Q.value = 2.5;
    f.frequency.setValueAtTime(300, t0); f.frequency.exponentialRampToValueAtTime(6500, t1 - 0.02);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.22, t1 - 0.04); g.gain.linearRampToValueAtTime(0, t1);
    n.connect(f).connect(g).connect(out); n.start(t0); n.stop(t1);
  }
  function pluck(ctx, out, t, midi, level = 0.09) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = hz(midi);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(level, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g).connect(out); o.start(t); o.stop(t + 0.4);
  }
  function bell(ctx, out, t, level = 0.12) {
    [880, 1318.5, 1760].forEach((f, k) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(level / (k + 1), t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      o.connect(g).connect(out); o.start(t); o.stop(t + 1.7);
    });
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

  /** cue: { len, title, hits: [t], end, counters: [t0, t1] } in seconds */
  window.renderProfileAudio = async (cue) => {
    const ctx = new OfflineAudioContext(2, Math.ceil(SR * cue.len), SR);
    const master = ctx.createDynamicsCompressor();
    master.threshold.value = -12; master.ratio.value = 3.5; master.attack.value = 0.004; master.release.value = 0.15;
    const out = ctx.createGain(); out.gain.value = 0.6;
    out.connect(master).connect(ctx.destination);

    air(ctx, out, 0, cue.title + 1.5, 0.12);
    pad(ctx, out, 0.2, cue.len);
    riser(ctx, out, Math.max(0.3, cue.title - 2.2), cue.title);
    bell(ctx, out, cue.title, 0.1);
    hit(ctx, out, cue.title, 1.3);
    // the pulse runs from the title to the end card
    for (let t = cue.title; t < cue.end - 0.05; t += BEAT) {
      kick(ctx, out, t, 0.85);
      hat(ctx, out, t + BEAT / 2);
    }
    cue.hits.forEach((t) => hit(ctx, out, t, 1));
    const [c0, c1] = cue.counters;
    const arp = [69, 72, 76, 81, 76, 72];
    for (let t = c0, k = 0; t < c1; t += BEAT / 2, k++) pluck(ctx, out, t, arp[k % arp.length]);
    riser(ctx, out, cue.end - 2, cue.end);
    hit(ctx, out, cue.end, 1.5);
    bell(ctx, out, cue.end + 0.05, 0.14);
    const buffer = await ctx.startRendering();
    return wav(buffer);
  };
})();
