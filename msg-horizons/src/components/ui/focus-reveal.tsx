"use client";

/**
 * Scroll focus: a photo starts out of focus (a directional progressive blur with colour fringing and grain) and
 * sharpens as it scrolls into view. The shader is adapted from Unfocused+ by Jayzhushi (reveals.cool), BSD licence.
 *
 * Changes from the original: plain WebGL instead of OGL and Framer, the blur follows scroll position instead of a
 * timed animation, cover-fit honours an object-position, and the context is created only near the viewport and
 * released when it leaves. The real <img> always sits underneath, so the photo is there without WebGL, under
 * reduced motion, and once it has come into focus (the canvas then hides itself).
 */
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform sampler2D uTexture;
uniform vec2 uMediaSize;
uniform vec2 uPanelSize;
uniform vec2 uRatio;
uniform vec2 uShift;
uniform float uBlur;
uniform float uAngle;
uniform vec2 uOrigin;
uniform float uDispersion;
uniform float uNoise;
uniform float uFalloff;
varying vec2 vUv;
const float PI2 = 6.28318530718;
const int SAMPLES = 24;
const float INV_SAMPLES = 1.0 / 24.0;
float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
float noise(vec2 uv) { return rand(uv) * 2.0 - 1.0; }
void main() {
  vec2 tc = vUv * uRatio + uShift;
  tc.y = 1.0 - tc.y;
  if (uBlur <= 0.0) { gl_FragColor = texture2D(uTexture, tc); return; }
  vec2 dir = vec2(cos(uAngle), sin(uAngle));
  float t = clamp(max(dot(vUv - uOrigin, dir), 0.0) / 0.7, 0.0, 1.0);
  float keep = 1.0 - smoothstep(0.0, 1.0, t);
  float blur = mix(uBlur, keep * uBlur, uFalloff);
  float disp = mix(uDispersion, keep * uDispersion, uFalloff) * blur * 0.5;
  vec2 texel = 1.0 / uMediaSize;
  vec2 pr = uPanelSize / uMediaSize;
  float radius = blur * max(texel.x, texel.y) * max(pr.x, pr.y) * 0.5;
  vec2 ddir = vec2(-sin(uAngle), cos(uAngle));
  vec2 rOff = ddir * disp * texel * -0.7;
  vec2 bOff = ddir * disp * texel * 0.7;
  vec3 acc = vec3(0.0);
  float wsum = 0.0;
  for (int i = 0; i < SAMPLES; i++) {
    float fi = float(i);
    float a = fi * INV_SAMPLES * PI2;
    float r = rand(vec2(fi, vUv.x + vUv.y)) * 0.5 + 0.5;
    r = clamp(r + noise(vUv + vec2(fi * 0.1)) * uNoise * 0.3, 0.1, 1.0);
    vec2 o = vec2(cos(a), sin(a)) * radius * r;
    float w = max((1.0 - smoothstep(0.0, 1.0, length(o) / max(radius, 1e-5))) * (1.0 + noise(vUv + vec2(fi * 0.05 + 13.7)) * uNoise * 0.2), 0.0);
    vec2 sc = clamp(tc + o, 0.0, 1.0);
    acc.r += texture2D(uTexture, clamp(sc + rOff, 0.0, 1.0)).r * w;
    acc.g += texture2D(uTexture, sc).g * w;
    acc.b += texture2D(uTexture, clamp(sc + bOff, 0.0, 1.0)).b * w;
    wsum += w;
  }
  vec3 col = wsum > 0.0 ? acc / wsum : texture2D(uTexture, tc).rgb;
  col = clamp(col + vec3(noise(vUv * 10.0 + vec2(31.4, 17.2)) * uNoise * 0.1), 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}`;

type Props = {
  src: string;
  alt: string;
  /** object-position for the crop, e.g. "50% 40%" */
  pos?: string;
  /** blur at the start of the reveal (the original's default is 200; a scroll reveal wants it stronger) */
  blur?: number;
  className?: string;
  imgClassName?: string;
};

export default function FocusReveal({ src, alt, pos = "50% 50%", blur = 320, className, imgClassName }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const host = box.current;
    const cv = canvas.current;
    if (!host || !cv || reduce) return;
    const [px, py] = pos.split(/\s+/).map((v) => parseFloat(v) / 100);

    let gl: WebGLRenderingContext | null = null;
    let uni: Record<string, WebGLUniformLocation | null> = {};
    let media = { w: 1, h: 1 };
    let ready = false;
    let raf = 0;
    let drawn = -1;
    const img = new Image();
    img.decoding = "async";

    const progress = () => {
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight;
      // out of focus as it enters from below, sharp once its top is a quarter of the way up the screen
      return Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75)));
    };

    const draw = () => {
      raf = 0;
      if (!gl || !ready) return;
      const p = progress();
      const amount = blur * (1 - p) * (1 - p); // ease out: most of the sharpening happens early
      cv.style.opacity = amount < 0.5 ? "0" : "1";
      if (amount < 0.5 && drawn < 0.5) return;
      // a blurred frame needs few pixels: render small while soft and at full size only near focus
      const dpr = amount > 40 ? 0.6 : amount > 8 ? 0.85 : Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(host.clientWidth * dpr));
      const h = Math.max(1, Math.round(host.clientHeight * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      gl.viewport(0, 0, w, h);
      // cover fit with object-position
      const pa = w / h, ma = media.w / media.h;
      const ratio = [Math.min(pa / ma, 1), Math.min(ma / pa, 1)];
      gl.uniform2f(uni.uRatio, ratio[0], ratio[1]);
      gl.uniform2f(uni.uShift, (1 - ratio[0]) * px, (1 - ratio[1]) * (1 - py));
      gl.uniform2f(uni.uPanelSize, host.clientWidth, host.clientHeight); // page pixels: the blur looks the same at any resolution
      gl.uniform1f(uni.uBlur, amount);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      drawn = amount;
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(draw); };

    const start = () => {
      if (gl) return;
      gl = cv.getContext("webgl", { premultipliedAlpha: false, antialias: false });
      if (!gl) return;
      const sh = (type: number, code: string) => { const s = gl!.createShader(type)!; gl!.shaderSource(s, code); gl!.compileShader(s); return s; };
      const prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { stop(); return; }
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      uni = Object.fromEntries(["uMediaSize", "uPanelSize", "uRatio", "uShift", "uBlur", "uAngle", "uOrigin", "uDispersion", "uNoise", "uFalloff"].map((n) => [n, gl!.getUniformLocation(prog, n)]));
      // the original's 45° blur from the left edge with colour fringing; here the whole photo starts soft
      // (partial falloff) and the grain is halved, so a soft frame reads as out of focus rather than noisy
      gl.uniform1f(uni.uAngle, Math.PI / 4);
      gl.uniform2f(uni.uOrigin, 0, 0.5);
      gl.uniform1f(uni.uDispersion, 0.35);
      gl.uniform1f(uni.uNoise, 0.5);
      gl.uniform1f(uni.uFalloff, 0.55);
      const upload = () => {
        if (!gl) return;
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        media = { w: img.naturalWidth, h: img.naturalHeight };
        gl.uniform2f(uni.uMediaSize, media.w, media.h);
        ready = true;
        drawn = -1;
        schedule();
      };
      if (img.complete && img.naturalWidth) upload();
      else { img.onload = upload; if (!img.src) img.src = src; }
    };
    const stop = () => {
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      gl = null;
      ready = false;
      cv.style.opacity = "0";
    };

    // one context per photo, only while it is near the screen
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { start(); schedule(); } else stop(); }, { rootMargin: "200px 0px" });
    io.observe(host);
    const ro = new ResizeObserver(() => { drawn = -1; schedule(); });
    ro.observe(host);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
      stop();
    };
  }, [src, pos, blur, reduce]);

  return (
    <div ref={box} className={cn("absolute inset-0", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- the shader samples this same file */}
      <img src={src} alt={alt} loading="lazy" decoding="async" className={cn("absolute inset-0 size-full object-cover", imgClassName)} style={{ objectPosition: pos }} />
      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full opacity-0" />
    </div>
  );
}
