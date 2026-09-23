/* NOCTELLE · the trail */
(() => {
'use strict';

/* ---------- settings you may change ---------- */
// Drop a scrub-encoded video in assets/ and put its path here to replace the drawn hero with footage.
const HERO_VIDEO = '';            // e.g. 'assets/hero-scrub.mp4'
// Paste a Formspree (or similar) endpoint here to receive discovery-set requests by email.
const FORM_ENDPOINT = '';         // e.g. 'https://formspree.io/f/xxxxxxx'

/* ---------- the collection ---------- */
const SCENTS = [
  { id:'minuit', name:'Minuit Ambré', kind:'parfum', type:'Extrait de parfum', price:210, a:'#E4A660', b:'#86461C',
    card:'Saffron · amber · labdanum', top:'Saffron, pink pepper', heart:'Dark rose, benzoin', base:'Labdanum, amber, vanilla absolute' },
  { id:'vetiver', name:'Vétiver Noir', kind:'parfum', type:'Eau de parfum', price:185, a:'#7F9A66', b:'#233220',
    card:'Smoked vetiver · pepper · cedar', top:'Black pepper, grapefruit', heart:'Smoked vetiver, cypress', base:'Cedar, birch tar, musk' },
  { id:'rose', name:'Rose Fumée', kind:'parfum', type:'Eau de parfum', price:195, a:'#C2566C', b:'#4C1221',
    card:'Turkish rose · incense · oud', top:'Raspberry, elemi', heart:'Turkish rose, incense', base:'Oud, patchouli' },
  { id:'iris', name:'Iris Poudre', kind:'parfum', type:'Eau de parfum', price:190, a:'#D3C0EC', b:'#76649A',
    card:'Orris butter · violet leaf · suede', top:'Violet leaf, bergamot', heart:'Orris butter, heliotrope', base:'Suede, white musk' },
  { id:'absolue', name:'Cologne Absolue', kind:'cologne', type:'Cologne intense', price:150, a:'#F3E6AE', b:'#C4A24A',
    card:'Bergamot · neroli · white musk', top:'Bergamot, neroli, lemon', heart:'Orange blossom, petitgrain', base:'White musk, ambrette' },
  { id:'cuir', name:'Cuir de Nuit', kind:'cologne', type:'Cologne intense', price:160, a:'#AE8566', b:'#3B281E',
    card:'Soft leather · cardamom · tonka', top:'Cardamom, clary sage', heart:'Soft leather, iris', base:'Tonka, guaiac wood' }
];

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smoothstep = (p, e0, e1) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- the flacon, drawn by hand ---------- */
let uidN = 0;
function bottleSVG(a, b, opts = {}) {
  const u = 'b' + (uidN++);
  return `<svg viewBox="0 0 200 320" aria-hidden="true">
  <defs>
    <linearGradient id="${u}g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset=".22" stop-color="#fff" stop-opacity=".05"/><stop offset=".75" stop-color="#fff" stop-opacity=".03"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient>
    <linearGradient id="${u}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
    <linearGradient id="${u}c" x1="0" x2="1"><stop offset="0" stop-color="#3A2F37"/><stop offset=".35" stop-color="#120D11"/><stop offset=".7" stop-color="#2A2128"/><stop offset=".86" stop-color="#4B3F48"/><stop offset="1" stop-color="#150F14"/></linearGradient>
    <linearGradient id="${u}m" x1="0" x2="1"><stop offset="0" stop-color="#6F6269"/><stop offset=".45" stop-color="#EDE3DC"/><stop offset="1" stop-color="#5E5259"/></linearGradient>
    <linearGradient id="${u}s" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="${u}k"><path d="M40 96H160L172 108V292L160 304H40L28 292V108Z"/></clipPath>
  </defs>
  <rect x="96" y="60" width="8" height="24" rx="2" fill="url(#${u}m)"/>
  <rect x="84" y="80" width="32" height="17" rx="2" fill="url(#${u}m)"/>
  <path d="M40 96H160L172 108V292L160 304H40L28 292V108Z" fill="rgba(30,22,28,.55)"/>
  <path d="M46 134H154L160 140V282L152 290H48L40 282V140Z" fill="url(#${u}l)" opacity=".92"/>
  <path d="M46 134H154" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/>
  <path d="M40 96H160L172 108V292L160 304H40L28 292V108Z" fill="url(#${u}g)"/>
  <path d="M40 290H160V304H40Z" fill="#fff" fill-opacity=".07"/>
  <rect x="33" y="112" width="5" height="176" fill="#fff" fill-opacity=".22"/>
  <rect x="163" y="112" width="3" height="176" fill="#000" fill-opacity=".25"/>
  <g clip-path="url(#${u}k)"><polygon class="sweep" points="-60,90 -20,90 -70,320 -110,320" fill="url(#${u}s)"/></g>
  <path d="M40 96H160L172 108V292L160 304H40L28 292V108Z" fill="none" stroke="#EFE7E2" stroke-opacity=".35" stroke-width="1.2"/>
  <path d="M40 96L28 108M160 96L172 108M28 292L40 304M172 292L160 304" stroke="#EFE7E2" stroke-opacity=".3"/>
  <rect x="66" y="196" width="68" height="40" fill="rgba(20,14,19,.35)" stroke="#EFE7E2" stroke-opacity=".55" stroke-width=".8"/>
  <text x="100" y="213" text-anchor="middle" fill="#EFE7E2" font-family="Marcellus, serif" font-size="9" letter-spacing="2.6">NOCTELLE</text>
  <text x="100" y="227" text-anchor="middle" fill="#EFE7E2" fill-opacity=".7" font-family="DM Mono, monospace" font-size="5.2" letter-spacing="1.2">${opts.label || 'PARIS · 50 ML'}</text>
  <g class="cap">
    <rect x="70" y="18" width="60" height="64" rx="4" fill="url(#${u}c)"/>
    <rect x="70" y="18" width="60" height="64" rx="4" fill="none" stroke="#EFE7E2" stroke-opacity=".22"/>
    <rect x="76" y="22" width="3" height="56" fill="#fff" fill-opacity=".16"/>
    <rect x="70" y="76" width="60" height="6" fill="url(#${u}m)" opacity=".75"/>
  </g>
</svg>`;
}

/* =================================================================
   HERO: the trail (scrub engine; drawn scene now, video-ready)
   ================================================================= */
const hero = $('.hero'), stage = $('.stage'), flacon = $('.flacon');
const ribbonSvg = $('.ribbon'), rGlow = $('.r-glow'), rLine = $('.r-line');
const mist = $('.mist'), mctx = mist.getContext('2d');
const video = $('.hero-video');
const bands = $$('.band').map((el, i, all) => ({
  el, a: +el.dataset.a, b: +el.dataset.b, ramp: +el.dataset.ramp || 0,
  first: i === 0, last: i === all.length - 1, op: -1, k: -1
}));

flacon.innerHTML = bottleSVG('#D8C4EE', '#5A3E6E');
const cap = $('.cap', flacon), sweep = $('.sweep', flacon);
cap.style.transformBox = 'fill-box'; cap.style.transformOrigin = '50% 100%';

/* text splitting, seeded so every load looks the same */
$$('.band .split').forEach((el, n) => {
  const band = el.closest('.band');
  const fx = [...band.classList].find(c => c.startsWith('fx-'));
  const spread = +band.dataset.spread || 0.55;
  const r = rng(1234 + n * 97);
  const text = el.textContent.trim();
  el.textContent = '';
  const sr = document.createElement('span'); sr.className = 'sr'; sr.textContent = text; el.appendChild(sr);
  const build = cls => {
    const vis = document.createElement('span'); vis.className = 'vis ' + cls; vis.setAttribute('aria-hidden', 'true');
    const words = text.split(' ');
    const total = text.replace(/ /g, '').length;
    let ci = 0;
    words.forEach((w, wi) => {
      const ws = document.createElement('span'); ws.className = 'w';
      if (fx === 'fx-drift') ws.style.setProperty('--th', (wi / words.length * 0.5).toFixed(3));
      if (fx === 'fx-rise') ws.style.setProperty('--th', (wi / words.length * 0.35).toFixed(3));
      [...w].forEach(ch => {
        const cs = document.createElement('span'); cs.className = 'c'; cs.textContent = ch;
        if (fx === 'fx-scatter') {
          cs.style.setProperty('--th', (r() * spread).toFixed(3));
          cs.style.setProperty('--jx', ((r() - .5) * 140).toFixed(1) + 'px');
          cs.style.setProperty('--jy', ((r() - .5) * 90).toFixed(1) + 'px');
          cs.style.setProperty('--jr', ((r() - .5) * 70).toFixed(1) + 'deg');
        }
        ws.appendChild(cs); ci++;
      });
      vis.appendChild(ws);
      if (wi < words.length - 1) vis.appendChild(document.createTextNode(' '));
    });
    void total; return vis;
  };
  el.appendChild(build('sharp'));
  if (fx === 'fx-blur') el.appendChild(build('soft'));
});

/* progress through the pinned hero, 0..1 */
function heroProgress() {
  const range = hero.offsetHeight - innerHeight;
  if (range <= 0) return 0;
  return clamp(-hero.getBoundingClientRect().top / range, 0, 1);
}

/* captions: paced in scroll distance, delta-gated writes */
let loadK = 0;
function updateCaptions(p) {
  for (const bd of bands) {
    const { a, b } = bd;
    const f = Math.min(0.03, (b - a) / 3);
    const inO = bd.first ? (p >= a ? 1 : 0) : smoothstep(p, a, a + f);
    const outO = bd.last ? 1 : 1 - smoothstep(p, b - f, b);
    const op = +(inO * outO).toFixed(3);
    let k = clamp((p - a) / (bd.ramp || Math.min(0.045, (b - a) * 0.35)), 0, 1);
    if (bd.first) k = Math.max(k, loadK);
    if (Math.abs(op - bd.op) > 0.004) { bd.op = op; bd.el.style.opacity = op; bd.el.style.visibility = op < 0.01 ? 'hidden' : 'visible'; }
    if (Math.abs(k - bd.k) > 0.008 || (k === 1 && bd.k !== 1) || (k === 0 && bd.k !== 0)) { bd.k = k; bd.el.style.setProperty('--k', k.toFixed(3)); }
  }
}

/* the drawn scene, driven by the same eased progress */
const sc = { cap: -1, sweep: -9, halo: -1, rib: -1, bs: -1, cue: null };
let emit = 0;
function updateScene(p) {
  const c = smoothstep(p, 0.2, 0.34);
  emit = c * (1 - 0.6 * smoothstep(p, 0.85, 1));
  if (Math.abs(c - sc.cap) > 0.002) { sc.cap = c; cap.style.transform = `translateY(${(-38 * c).toFixed(2)}px) rotate(${(-5 * c).toFixed(2)}deg)`; }
  const sw = -40 + 360 * p;
  if (Math.abs(sw - sc.sweep) > 0.5) { sc.sweep = sw; sweep.style.transform = `translateX(${sw.toFixed(1)}px)`; }
  const halo = 0.45 + 0.45 * smoothstep(p, 0.12, 0.5);
  if (Math.abs(halo - sc.halo) > 0.004) { sc.halo = halo; stage.style.setProperty('--halo', halo.toFixed(3)); }
  const rib = smoothstep(p, 0.27, 0.97);
  if (Math.abs(rib - sc.rib) > 0.001) { sc.rib = rib; const o = (1 - rib).toFixed(4); rGlow.style.strokeDashoffset = o; rLine.style.strokeDashoffset = o; }
  const bs = 1 - 0.05 * smoothstep(p, 0.78, 1);
  if (Math.abs(bs - sc.bs) > 0.001) { sc.bs = bs; flacon.style.setProperty('--bs', bs.toFixed(4)); }
  const cue = p > 0.02;
  if (cue !== sc.cue) { sc.cue = cue; hero.classList.toggle('scrolled', cue); }
}

/* gated seeks (only used once a video is set) */
let seekBusy = false, pendingTime = null, videoReady = false;
function requestSeek(t) {
  if (!videoReady || !video.duration) return;
  if (seekBusy) { pendingTime = t; return; }
  seekBusy = true; video.currentTime = t;
}
video.addEventListener('seeked', () => {
  seekBusy = false;
  if (pendingTime !== null) { const t = pendingTime; pendingTime = null; requestSeek(t); }
});
video.addEventListener('error', () => { seekBusy = false; pendingTime = null; videoReady = false; hero.classList.remove('has-video'); });

/* the lerp loop: frame-rate independent, rests when converged */
let target = 0, shown = 0, rafId = null, lastTick = 0, heroOnScreen = true;
function tick(now) {
  const dt = Math.min(100, now - (lastTick || now));
  lastTick = now;
  shown += (target - shown) * (1 - Math.pow(1 - 0.14, dt / 16.667));
  if (Math.abs(target - shown) < 0.0005) { shown = target; rafId = null; lastTick = 0; }
  else rafId = requestAnimationFrame(tick);
  if (videoReady) requestSeek(shown * video.duration);
  updateScene(shown);
  updateCaptions(shown);
}
function onScroll() {
  if (!scrubOn) return;
  target = heroProgress();
  if (rafId === null && heroOnScreen) rafId = requestAnimationFrame(tick);
}
new IntersectionObserver(es => { heroOnScreen = es[0].isIntersecting; if (heroOnScreen) { onScroll(); startMist(); } }).observe(hero);

/* optional video: fetched whole as a Blob so seeking works on any host */
let heroInit = false;
function initHeroOnce() {
  if (heroInit) return; heroInit = true;
  // band one assembles on load, then hands over to scroll
  const t0 = performance.now();
  const ramp = now => {
    loadK = clamp((now - t0) / 1400, 0, 1);
    loadK = 1 - Math.pow(1 - loadK, 3);
    updateCaptions(shown);
    if (loadK < 1) requestAnimationFrame(ramp);
  };
  requestAnimationFrame(ramp);
  if (!HERO_VIDEO) return;
  fetch(HERO_VIDEO, { priority: 'low' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
    .then(blob => {
      video.src = URL.createObjectURL(blob);
      video.load();
      video.addEventListener('canplay', () => {
        videoReady = true; hero.classList.add('has-video');
        requestSeek(heroProgress() * video.duration);
      }, { once: true });
    })
    .catch(() => { /* the drawn scene stays: the page is complete without video */ });
}

/* the five static-hero gates: identical strings live in style.css */
const GATES = [
  '(max-width: 720px)',
  '(orientation: portrait) and (max-width: 1024px)',
  '(orientation: portrait) and (pointer: coarse)',
  '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
  '(prefers-reduced-motion: reduce)'
];
let scrubOn = false;
function enableScrub() {
  if (scrubOn) return; scrubOn = true;
  initHeroOnce();
  addEventListener('scroll', onScroll, { passive: true });
  bands.forEach(b => { b.op = -1; b.k = -1; });
  Object.assign(sc, { cap: -1, sweep: -9, halo: -1, rib: -1, bs: -1, cue: null });
  layout();
  shown = target = heroProgress();
  updateScene(shown); updateCaptions(shown);
  onScroll();
  startMist();
}
function disableScrub() {
  if (!scrubOn) return; scrubOn = false;
  removeEventListener('scroll', onScroll);
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  // hand the stage back to the static composition
  cap.style.transform = ''; rGlow.style.strokeDashoffset = ''; rLine.style.strokeDashoffset = '';
  flacon.style.removeProperty('--bs'); stage.style.setProperty('--halo', '.8');
  layout();
}
function applyHeroMode() { if (GATES.some(q => matchMedia(q).matches)) disableScrub(); else enableScrub(); }
const MQLS = GATES.map(q => matchMedia(q));
MQLS.forEach(m => m.addEventListener('change', applyHeroMode));

/* ---------- mist: scent rising from the atomizer, dust settling ---------- */
let W = 0, H = 0, dpr = 1, nozzle = { x: 0, y: 0 }, parts = [], mistRaf = null, mistLast = 0;
const sprite = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(226,212,244,.55)'); gr.addColorStop(.4, 'rgba(205,184,232,.18)'); gr.addColorStop(1, 'rgba(205,184,232,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c;
})();
const dust = Array.from({ length: 46 }, (_, i) => { const r = rng(77 + i); return { x: r(), y: r(), s: 0.6 + r() * 1.6, v: 0.004 + r() * 0.012, a: 0.15 + r() * 0.35, ph: r() * 6.28 }; });
function mistFrame(now) {
  mistRaf = null;
  if (!scrubOn || !heroOnScreen || document.hidden) return;
  const dt = Math.min(50, now - (mistLast || now)) / 16.667; mistLast = now;
  mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  mctx.clearRect(0, 0, W, H);
  // settling dust: falls as the page goes down
  mctx.fillStyle = '#EFE7E2';
  for (const d of dust) {
    d.y += d.v * dt / 60 * (1 + 3 * Math.abs(target - shown) * 60);
    if (d.y > 1.02) d.y = -0.02;
    const x = d.x * W + Math.sin(now / 3000 + d.ph) * 12;
    mctx.globalAlpha = d.a * 0.5; mctx.beginPath(); mctx.arc(x, d.y * H, d.s, 0, 6.283); mctx.fill();
  }
  // mist from the atomizer
  if (emit > 0.02 && parts.length < 110) {
    let n = emit * 0.9 * dt;
    while (n > 0) { if (Math.random() < n) parts.push({ x: nozzle.x + (Math.random() - .5) * 6, y: nozzle.y, vx: (Math.random() - .3) * .5, vy: -(.7 + Math.random() * 1.1), life: 0, max: 90 + Math.random() * 90, s: 8 + Math.random() * 10 }); n -= 1; }
  }
  mctx.globalCompositeOperation = 'lighter';
  for (let i = parts.length - 1; i >= 0; i--) {
    const q = parts[i];
    q.life += dt; q.x += q.vx * dt + Math.sin((q.life + i) / 18) * .25; q.y += q.vy * dt; q.vy *= .992; q.vx += .006 * dt; q.s += .22 * dt;
    const t = q.life / q.max;
    if (t >= 1) { parts.splice(i, 1); continue; }
    mctx.globalAlpha = Math.sin(t * Math.PI) * .22;
    mctx.drawImage(sprite, q.x - q.s, q.y - q.s, q.s * 2, q.s * 2);
  }
  mctx.globalCompositeOperation = 'source-over'; mctx.globalAlpha = 1;
  mistRaf = requestAnimationFrame(mistFrame);
}
function startMist() { if (mistRaf === null && scrubOn && heroOnScreen && !document.hidden) { mistLast = 0; mistRaf = requestAnimationFrame(mistFrame); } }

/* ---------- layout: ribbon path, mist canvas, page trail ---------- */
function layout() {
  const sr = stage.getBoundingClientRect();
  W = sr.width; H = sr.height;
  dpr = Math.min(1.5, devicePixelRatio || 1);
  mist.width = Math.round(W * dpr); mist.height = Math.round(H * dpr);
  const fr = flacon.getBoundingClientRect();
  const fx = fr.left - sr.left, fy = fr.top - sr.top, fw = fr.width, fh = fr.height;
  const cx = fx + fw / 2, ny = fy + fh * (64 / 320);
  nozzle = { x: cx, y: ny - 6 };
  ribbonSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const narrow = W < 720;
  const lane = narrow ? 0.38 : 0.12, curl = narrow ? 0.2 : 0.09;
  const d = `M${cx} ${ny}` +
    ` C${cx + 4} ${ny - H * .07} ${cx + W * curl * .8} ${ny - H * .11} ${cx + W * curl} ${ny - H * .05}` +
    ` C${cx + W * curl * 1.35} ${ny + H * .01} ${cx + W * curl * .9} ${ny + H * .1} ${cx + W * lane * 1.02} ${ny + H * .19}` +
    ` C${cx + W * lane * 1.3} ${ny + H * .3} ${cx + W * lane * 1.25} ${H * .55} ${cx + W * lane * 1.1} ${H * .7}` +
    ` C${cx + W * lane * .95} ${H * .82} ${cx + W * lane * 1.05} ${H * .92} ${cx + W * lane} ${H + 20}`;
  rGlow.setAttribute('d', d); rLine.setAttribute('d', d);
  trailStartX = (cx + W * lane) / W;
  buildTrail();
}

/* ---------- the sillage trail: one line drawn down the whole page ---------- */
const journey = $('.journey'), trailSvg = $('.trail'), tGlow = $('.t-glow'), tLine = $('.t-line');
let trailStartX = 0.62, trailLUT = [], trailLast = -1;
function buildTrail() {
  const Wj = journey.clientWidth, Hj = journey.offsetHeight;
  if (!Wj || !Hj) return;
  trailSvg.setAttribute('viewBox', `0 0 ${Wj} ${Hj}`);
  $('#trailGrad').setAttribute('y2', Hj);
  const content = Math.min(1200, Wj - 48);
  const g = Math.max(10, (Wj - content) / 4);
  const secs = $$('.sec', journey);
  let px = Wj * trailStartX, py = 0;
  let d = `M${px} ${py}`;
  secs.forEach((s, i) => {
    const pad = parseFloat(getComputedStyle(s).paddingTop) || 100;
    const x = i % 2 === 0 ? Wj - g : g;
    const y0 = s.offsetTop + pad * (i === 0 ? 0.8 : 0.55);
    const y1 = s.offsetTop + s.offsetHeight - pad * 0.55;
    const my = (py + y0) / 2;
    d += ` C${px} ${my} ${x} ${my} ${x} ${y0} L${x} ${y1}`;
    px = x; py = y1;
  });
  const endY = Hj - 4, my = (py + endY) / 2;
  d += ` C${px} ${my} ${Wj / 2} ${my} ${Wj / 2} ${endY}`;
  tGlow.setAttribute('d', d); tLine.setAttribute('d', d);
  // arc-length to height lookup, so the drawn tip follows the reader's eye
  const len = tLine.getTotalLength();
  trailLUT = [];
  for (let i = 0; i <= 240; i++) trailLUT.push(tLine.getPointAtLength(len * i / 240).y);
  trailLast = -1;
  updateTrail();
}
function trailFraction(y) {
  const L = trailLUT; if (!L.length) return 0;
  if (y <= L[0]) return 0; if (y >= L[L.length - 1]) return 1;
  let lo = 0, hi = L.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (L[mid] < y) lo = mid; else hi = mid; }
  const span = L[hi] - L[lo] || 1;
  return (lo + (y - L[lo]) / span) / (L.length - 1);
}
let trailQueued = false;
function updateTrail() {
  trailQueued = false;
  const f = reducedMQ.matches ? 1 : trailFraction(innerHeight * 0.72 - journey.getBoundingClientRect().top);
  if (Math.abs(f - trailLast) < 0.0008) return;
  trailLast = f;
  const o = (1 - f).toFixed(4);
  tGlow.style.strokeDashoffset = o; tLine.style.strokeDashoffset = o;
}
addEventListener('scroll', () => { if (!trailQueued) { trailQueued = true; requestAnimationFrame(updateTrail); } }, { passive: true });

let resizeT;
addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(layout, 120); });
new ResizeObserver(() => { clearTimeout(resizeT); resizeT = setTimeout(buildTrail, 120); }).observe(journey);

/* ---------- nav ---------- */
const nav = $('.nav');
let navSolid = null;
const navCheck = () => { const s = scrollY > 40; if (s !== navSolid) { navSolid = s; nav.classList.toggle('solid', s); } };
addEventListener('scroll', navCheck, { passive: true }); navCheck();

/* ---------- collection ---------- */
const cards = $('#cards');
cards.innerHTML = SCENTS.map(s => `
  <li class="card" data-kind="${s.kind}" style="--tint:${s.a}">
    <div class="bottle">${bottleSVG(s.a, s.b, { label: s.type.toUpperCase() })}</div>
    <p class="type">${s.type}</p>
    <h3>${s.name}</h3>
    <p class="notes">${s.card}</p>
    <div class="row"><span class="size">50 ML</span><span class="price">$${s.price}</span></div>
  </li>`).join('');
$$('.filters .chip-btn').forEach(btn => btn.addEventListener('click', () => {
  $$('.filters .chip-btn').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
  const f = btn.dataset.filter;
  $$('.card', cards).forEach(c => {
    const on = f === 'all' || c.dataset.kind === f;
    c.classList.toggle('off', !on);
    c.classList.remove('show');
    if (on) { void c.offsetWidth; c.classList.add('show'); }
  });
}));

/* ---------- reveals, counters ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target; el.classList.add('in'); io.unobserve(el);
  if (el === cards) setTimeout(() => cards.classList.add('settled'), 1400);
  if (el.classList.contains('stats')) runCounters(el);
}), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
$$('.reveal').forEach(el => io.observe(el));
io.observe(cards);
const stats = $('.stats'); io.observe(stats);
function runCounters(root) {
  $$('[data-count]', root).forEach(el => {
    const end = +el.dataset.count, pre = el.dataset.prefix || '';
    if (reducedMQ.matches) { el.textContent = pre + end; return; }
    const t0 = performance.now(), dur = 1600;
    let last = '';
    const step = now => {
      const t = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - t, 3);
      const s = pre + Math.round(end * e);
      if (s !== last) { last = s; el.textContent = s; }
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* ---------- the interactive moment: wear it through a night ---------- */
const picker = $('#picker'), holdBtn = $('#hold'), hourEl = $('#hour'), verb = $('.h-verb'), done = $('#wear-done');
const layers = $$('#layers li');
let current = SCENTS[0], hp = 0, holding = false, worn = false, holdRaf = null, holdLast = 0, hourLast = '', hourAt = 0, hpLast = -1;
picker.innerHTML = SCENTS.map((s, i) => `<button type="button" class="pick" role="radio" aria-checked="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-id="${s.id}" style="--tint:${s.a}"><i></i>${s.name}</button>`).join('');
function choose(s) {
  current = s;
  $$('.pick', picker).forEach(b => { const on = b.dataset.id === s.id; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
  holdBtn.style.setProperty('--tint', s.a);
  layers[0].querySelector('.l-notes').textContent = s.top;
  layers[1].querySelector('.l-notes').textContent = s.heart;
  layers[2].querySelector('.l-notes').textContent = s.base;
  hp = 0; worn = false; holding = false; renderHold(true);
  verb.textContent = 'Hold'; done.classList.remove('on');
}
picker.addEventListener('click', e => { const b = e.target.closest('.pick'); if (b) choose(SCENTS.find(s => s.id === b.dataset.id)); });
picker.addEventListener('keydown', e => {
  const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
  if (!(e.key in keys)) return;
  e.preventDefault();
  const i = (SCENTS.indexOf(current) + keys[e.key] + SCENTS.length) % SCENTS.length;
  choose(SCENTS[i]); $$('.pick', picker)[i].focus();
});
function renderHold(force) {
  if (force || Math.abs(hp - hpLast) > 0.002) { hpLast = hp; holdBtn.style.setProperty('--hp', hp.toFixed(3)); }
  const now = performance.now();
  const h = 'Hour ' + Math.min(12, Math.floor(hp * 12.2));
  if (h !== hourLast && (force || now - hourAt > 100)) { hourLast = h; hourAt = now; hourEl.textContent = h; }
  layers.forEach(li => li.classList.toggle('lit', hp >= +li.dataset.at));
}
function complete() {
  hp = 1; worn = true; holding = false; renderHold(true);
  verb.textContent = 'Worn';
  done.textContent = `Hour 12. ${current.name} is still on your skin.`;
  done.classList.add('on');
}
function holdLoop(now) {
  holdRaf = null;
  const dt = Math.min(250, now - (holdLast || now)); holdLast = now;
  if (worn) return;
  if (holding) hp = Math.min(1, hp + dt / 4200);
  else hp = Math.max(0, hp - dt / 2600 * (0.35 + hp));   // eases back, never snaps
  renderHold(false);
  if (hp >= 1) { complete(); return; }
  if (holding || hp > 0) holdRaf = requestAnimationFrame(holdLoop);
  else { holdLast = 0; renderHold(true); }
}
function startHold() {
  if (worn) { choose(current); }
  if (reducedMQ.matches) { complete(); return; }
  holding = true;
  if (holdRaf === null) { holdLast = 0; holdRaf = requestAnimationFrame(holdLoop); }
}
function endHold() { holding = false; }
holdBtn.addEventListener('pointerdown', e => { if (e.button !== 0) return; holdBtn.setPointerCapture(e.pointerId); startHold(); });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => holdBtn.addEventListener(t, endHold));
holdBtn.addEventListener('contextmenu', e => e.preventDefault());
holdBtn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); startHold(); } });
holdBtn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') endHold(); });
choose(SCENTS[0]);

/* ---------- discovery set art: six vials in a box ---------- */
$('#disc-art').innerHTML = `<svg viewBox="0 0 520 400">
  <defs>
    <linearGradient id="boxF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34273A"/><stop offset="1" stop-color="#1A1219"/></linearGradient>
    <linearGradient id="boxT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E0A0D"/><stop offset="1" stop-color="#241A22"/></linearGradient>
    <radialGradient id="boxGlow" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#CDB8E8" stop-opacity=".22"/><stop offset="1" stop-color="#CDB8E8" stop-opacity="0"/></radialGradient>
    ${SCENTS.map((s, i) => `<linearGradient id="vl${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.a}"/><stop offset="1" stop-color="${s.b}"/></linearGradient>`).join('')}
  </defs>
  <ellipse cx="260" cy="240" rx="260" ry="150" fill="url(#boxGlow)"/>
  <path d="M40 220L78 196H442L480 220Z" fill="url(#boxT)" stroke="#7A6775" stroke-opacity=".5"/>
  ${SCENTS.map((s, i) => { const x = 104 + i * 62; return `
  <g>
    <rect x="${x}" y="70" width="28" height="18" rx="2" fill="#120D11" stroke="#EFE7E2" stroke-opacity=".25"/>
    <rect x="${x + 2}" y="86" width="24" height="136" rx="11" fill="rgba(239,231,226,.06)" stroke="#EFE7E2" stroke-opacity=".4"/>
    <rect class="vial-liquid" x="${x + 5}" y="120" width="18" height="98" rx="8" fill="url(#vl${i})"/>
    <rect x="${x + 6}" y="92" width="3" height="120" rx="1.5" fill="#fff" fill-opacity=".22"/>
  </g>`; }).join('')}
  <path d="M40 220H480V346L466 360H54L40 346Z" fill="url(#boxF)" stroke="#7A6775" stroke-opacity=".55"/>
  <path d="M40 220H480" stroke="#CDB8E8" stroke-opacity=".5"/>
  <text x="260" y="292" text-anchor="middle" fill="#EFE7E2" font-family="Marcellus, serif" font-size="22" letter-spacing="9">NOCTELLE</text>
  <text x="260" y="318" text-anchor="middle" fill="#B7A9B2" font-family="DM Mono, monospace" font-size="10" letter-spacing="4">DÉCOUVERTE · 6 × 2 ML</text>
</svg>`;

/* ---------- form ---------- */
const form = $('#order-form'), err = $('#form-error'), success = $('#success');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const fName = $('#f-name'), fEmail = $('#f-email');
  const name = fName.value.trim(), email = fEmail.value.trim();
  const bad = [];
  fName.setAttribute('aria-invalid', !name); if (!name) bad.push('your name');
  const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  fEmail.setAttribute('aria-invalid', !okEmail); if (!okEmail) bad.push('a valid email');
  if (bad.length) { err.textContent = 'Please add ' + bad.join(' and ') + '.'; (name ? fEmail : fName).focus(); return; }
  err.textContent = '';
  const btn = form.querySelector('button[type=submit]');
  const first = name.split(' ')[0];
  if (FORM_ENDPOINT) {
    btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const r = await fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error(r.status);
      showSuccess(first, false);
    } catch {
      err.textContent = "That didn't send. Please try again in a minute.";
      btn.disabled = false; btn.textContent = 'Reserve my discovery set';
    }
  } else showSuccess(first, true);
});
function showSuccess(first, preview) {
  form.hidden = true; success.hidden = false;
  $('#success-h').textContent = `Your set is reserved, ${first}.`;
  $('#success-p').textContent = preview ? "We'd email your checkout link next." : 'Check your inbox for the checkout link.';
  if (preview) { const n = document.createElement('p'); n.className = 'note'; n.textContent = "Preview site: it isn't connected to an inbox yet, so nothing was sent."; success.appendChild(n); }
  success.focus();
}

/* ---------- reduced motion, live in both directions ---------- */
function pinToFinalStates() {
  updateTrail();
  $$('[data-count]').forEach(el => { el.textContent = (el.dataset.prefix || '') + el.dataset.count; });
  $$('.reveal').forEach(el => el.classList.add('in')); cards.classList.add('in', 'settled');
  if (!worn && hp > 0) complete();
}
reducedMQ.addEventListener('change', e => {
  if (e.matches) pinToFinalStates();
  else { trailLast = -1; updateTrail(); applyHeroMode(); }
});

/* ---------- pause everything on hidden tabs ---------- */
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('paused', document.hidden);
  if (!document.hidden) startMist();
});

/* ---------- go ---------- */
applyHeroMode();
if (!scrubOn) layout();
if (reducedMQ.matches) pinToFinalStates();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
})();
