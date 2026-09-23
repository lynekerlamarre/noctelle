/* NOCTELLE · fragrance boutique */
(() => {
'use strict';

/* =================================================================
   YOUR STORE SETTINGS: edit these, nothing else needs to change
   ================================================================= */

// Each product: set `price` (a number, or null for "Ask for price") and
// `stripe` (the Stripe Payment Link for that bottle). With no link yet,
// the button opens the request form with the product filled in.
const PRODUCTS = [
  { id: 'kayali-marrakesh', brand: 'Kayali', name: 'Marrakesh in a Bottle', variant: 'Orange Blossom | 24',
    type: 'Eau de parfum', size: '100 ml', for: 'Feminine', img: 'assets/products/kayali-marrakesh-orange-blossom.jpg',
    price: null, stripe: '', tint: '#E8A868',
    card: 'Orange blossom · Turkish rose · cedar',
    top: 'Bergamot, orange blossom', heart: 'Pink pepper, Turkish rose', base: 'Neroli, cedarwood' },
  { id: 'rabanne-1-million', brand: 'Paco Rabanne', name: '1 Million', variant: '',
    type: 'Eau de toilette', size: '100 ml', for: 'Masculine', img: 'assets/products/rabanne-1-million.jpg',
    price: null, stripe: '', tint: '#D8B45A',
    card: 'Blood mandarin · cinnamon · leather',
    top: 'Blood mandarin, grapefruit, mint', heart: 'Cinnamon, spice, rose', base: 'Amber, leather, patchouli, woods' },
  { id: 'xerjoff-erba-gold', brand: 'Xerjoff', name: 'Erba Gold', variant: '',
    type: 'Eau de parfum', size: '100 ml', for: 'Shared', img: 'assets/products/xerjoff-erba-gold.jpg',
    price: null, stripe: '', tint: '#F0C24A',
    card: 'Citrus · ginger · pear · vanilla',
    top: 'Brazilian orange, bergamot, lemon, ginger', heart: 'Melon, pear, green apple, cinnamon, cardamom', base: 'White musk, vanilla, amber, woods' }
];

// Paste a Formspree (or similar) endpoint to receive fragrance requests by email.
const FORM_ENDPOINT = '';         // e.g. 'https://formspree.io/f/xxxxxxx'
// Drop a scrub-encoded video in assets/ and put its path here to replace the smoke with footage.
const HERO_VIDEO = '';            // e.g. 'assets/hero-scrub.mp4'

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smoothstep = (p, e0, e1) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
function rng(seed) {   // mulberry32: nearby seeds give unrelated sequences
  let s = (seed * 2654435761) >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => '$' + (Number.isInteger(n) ? n : n.toFixed(2));
const fullName = p => `${p.brand} ${p.name}${p.variant ? ' ' + p.variant : ''}`;
const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');

/* =================================================================
   HERO: golden smoke (scrub engine; video-ready)
   ================================================================= */
const hero = $('.hero'), stage = $('.stage');
const ribbonSvg = $('.ribbon'), rGlow = $('.r-glow'), rLine = $('.r-line');
const smoke = $('.smoke'), sctx = smoke.getContext('2d');
const video = $('.hero-video');
const bands = $$('.band').map((el, i, all) => ({
  el, a: +el.dataset.a, b: +el.dataset.b, ramp: +el.dataset.ramp || 0,
  first: i === 0, last: i === all.length - 1, op: -1, k: -1
}));

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
        ws.appendChild(cs);
      });
      vis.appendChild(ws);
      if (wi < words.length - 1) vis.appendChild(document.createTextNode(' '));
    });
    return vis;
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

/* the scene: the golden thread, driven by the same eased progress */
const sc = { rib: -1, cue: null };
function updateScene(p) {
  const rib = smoothstep(p, 0.04, 0.96);
  if (Math.abs(rib - sc.rib) > 0.001) { sc.rib = rib; const o = (1 - rib).toFixed(4); rGlow.style.strokeDashoffset = o; rLine.style.strokeDashoffset = o; }
  const cue = p > 0.02;
  if (cue !== sc.cue) { sc.cue = cue; hero.classList.toggle('scrolled', cue); }
  startSmoke();
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
new IntersectionObserver(es => { heroOnScreen = es[0].isIntersecting; if (heroOnScreen) { onScroll(); startSmoke(); } }).observe(hero);

/* optional video: fetched whole as a Blob so seeking works on any host */
let heroInit = false;
function initHeroOnce() {
  if (heroInit) return; heroInit = true;
  const t0 = performance.now();
  const ramp = now => {   // band one assembles on load, then hands over to scroll
    loadK = 1 - Math.pow(1 - clamp((now - t0) / 1400, 0, 1), 3);
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
    .catch(() => { /* the smoke stays: the page is complete without video */ });
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
  Object.assign(sc, { rib: -1, cue: null });
  layout();
  shown = target = heroProgress();
  updateScene(shown); updateCaptions(shown);
  onScroll();
}
function disableScrub() {
  if (!scrubOn) return; scrubOn = false;
  removeEventListener('scroll', onScroll);
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  rGlow.style.strokeDashoffset = ''; rLine.style.strokeDashoffset = '';
  layout();
}
function applyHeroMode() { if (GATES.some(q => matchMedia(q).matches)) disableScrub(); else enableScrub(); }
const MQLS = GATES.map(q => matchMedia(q));
MQLS.forEach(m => m.addEventListener('change', applyHeroMode));

/* ---------- golden smoke: drifts down as the page goes down, parts at the end ---------- */
let W = 0, H = 0, dpr = 1, smokeRaf = null;
const SMOKE_COLORS = ['236,178,84', '248,214,146', '255,238,206', '214,138,58', '128,64,92'];
const sprites = SMOKE_COLORS.map(c => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const g = cv.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, `rgba(${c},1)`); gr.addColorStop(.35, `rgba(${c},.45)`); gr.addColorStop(1, `rgba(${c},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return cv;
});
const puffs = Array.from({ length: 64 }, (_, i) => {
  const r = rng(900 + i * 13);
  const c = i % 9 === 0 ? 4 : Math.floor(r() * 4);          // mostly gold, a little plum
  return { x: 0.04 + r() * 0.92, y: r() * 1.8, s: 0.14 + r() * 0.3, c, a: (c === 2 ? 0.05 : 0.08) + r() * 0.12,
           sp: 0.5 + r() * 1.1, ph: r() * 6.283, wob: 0.02 + r() * 0.05, dr: 0.4 + r(),
           st: 1.4 + r() * 1.6, rot: (r() - 0.5) * 0.9, spin: (r() - 0.5) * 0.08 };   // stretched into wisps
});
const dust = Array.from({ length: 60 }, (_, i) => { const r = rng(77 + i); return { x: r(), y: r(), s: 0.5 + r() * 1.4, v: 0.3 + r(), a: 0.2 + r() * 0.5, ph: r() * 6.28 }; });
function drawSmoke(now) {
  const p = scrubOn ? shown : 0.35;
  const t = reducedMQ.matches ? 0 : now / 1000;
  sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  sctx.clearRect(0, 0, W, H);
  const m = Math.max(W, H);
  const glow = 0.8 + 0.45 * smoothstep(p, 0.08, 0.5);
  const part = smoothstep(p, 0.74, 1);          // the smoke parts for the final line
  sctx.globalCompositeOperation = 'screen';
  for (const q of puffs) {
    const y = (q.y + p * q.sp * 1.1 + t * 0.006 * q.dr) % 1.8 - 0.4;
    let x = q.x + Math.sin(t * 0.12 + q.ph) * q.wob;
    const side = x < 0.5 ? -1 : 1;
    x += side * part * 0.28 * (1 - Math.abs(x - 0.5));
    const size = q.s * m * (1 + 0.15 * Math.sin(t * 0.2 + q.ph));
    const edge = Math.min(1, (y + 0.4) / 0.3, (1.4 - y) / 0.3);   // fade in at the top, out at the bottom
    sctx.globalAlpha = Math.max(0, q.a * glow * edge);
    sctx.save();
    sctx.translate(x * W, y * H);
    sctx.rotate(q.rot + t * q.spin + p * q.rot);
    sctx.drawImage(sprites[q.c], -size * q.st / 2, -size / 2 / q.st * 1.6, size * q.st, size / q.st * 1.6);
    sctx.restore();
  }
  // fine gold dust, settling downward
  sctx.globalCompositeOperation = 'lighter';
  sctx.fillStyle = '#F0D49A';
  for (const d of dust) {
    const y = (d.y + p * 0.9 * d.v + t * 0.01 * d.v) % 1;
    const x = d.x * W + Math.sin(t * 0.3 + d.ph) * 10;
    sctx.globalAlpha = d.a * (0.4 + 0.6 * Math.abs(Math.sin(t * 0.8 + d.ph))) * 0.6;
    sctx.beginPath(); sctx.arc(x, y * H, d.s, 0, 6.283); sctx.fill();
  }
  sctx.globalCompositeOperation = 'source-over'; sctx.globalAlpha = 1;
}
function smokeFrame(now) {
  smokeRaf = null;
  if (!heroOnScreen || document.hidden) return;
  drawSmoke(now);
  if (!reducedMQ.matches) smokeRaf = requestAnimationFrame(smokeFrame);   // reduced motion: one still frame
}
function startSmoke() { if (smokeRaf === null && heroOnScreen && !document.hidden) smokeRaf = requestAnimationFrame(smokeFrame); }

/* ---------- layout: canvas size, golden thread, page trail ---------- */
function layout() {
  const sr = stage.getBoundingClientRect();
  W = sr.width; H = sr.height;
  dpr = Math.min(1.5, devicePixelRatio || 1);
  smoke.width = Math.round(W * dpr); smoke.height = Math.round(H * dpr);
  ribbonSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const cx = W / 2, narrow = W < 720;
  const endX = narrow ? W * 0.9 : cx + W * 0.24;
  const d = narrow
    ? `M${W * 0.72} -10 C${W * 0.95} ${H * .2} ${W * 0.8} ${H * .45} ${W * 0.93} ${H * .6} C${W * 1.02} ${H * .75} ${W * 0.86} ${H * .9} ${endX} ${H + 20}`
    : `M${cx} -10 C${cx - W * .08} ${H * .12} ${cx + W * .16} ${H * .22} ${cx + W * .2} ${H * .38}` +
      ` C${cx + W * .24} ${H * .54} ${cx + W * .26} ${H * .72} ${endX} ${H + 20}`;
  rGlow.setAttribute('d', d); rLine.setAttribute('d', d);
  trailStartX = endX / W;
  buildTrail();
  startSmoke();
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

/* ---------- shop ---------- */
const cards = $('#cards');
cards.innerHTML = PRODUCTS.map(p => `
  <li class="card" data-for="${esc(p.for)}">
    <div class="photo"><span class="tag chip label">${esc(p.for)}</span><img src="${esc(p.img)}" alt="${esc(fullName(p))}, ${esc(p.type.toLowerCase())}, ${esc(p.size)}" loading="lazy" width="800" height="1000"></div>
    <div class="body">
      <p class="brandname">${esc(p.brand)}</p>
      <h3>${esc(p.name).replace(/(\d+)/g, '<span class="num">$1</span>')}</h3>
      <p class="type">${esc(p.variant ? p.variant + ' · ' : '')}${esc(p.type)}</p>
      <p class="notes">${esc(p.card)}</p>
      <div class="row"><span class="size">${esc(p.size.toUpperCase())}</span>${p.price != null ? `<span class="price">${money(p.price)}</span>` : '<span class="price ask">ASK FOR PRICE</span>'}</div>
      ${p.stripe
        ? `<a class="btn btn-wide buy" href="${esc(p.stripe)}" rel="noopener">Buy now</a>`
        : `<a class="btn btn-wide buy" href="#request" data-want="${esc(fullName(p) + ', ' + p.size)}">${p.price != null ? 'Order now' : 'Ask about this bottle'}</a>`}
    </div>
  </li>`).join('');
cards.addEventListener('click', e => {
  const a = e.target.closest('[data-want]');
  if (!a) return;
  $('#f-want').value = a.dataset.want;
  setTimeout(() => $('#f-name').focus({ preventScroll: true }), 700);
});
// filter chips appear once the collection is big enough to need them
const kinds = [...new Set(PRODUCTS.map(p => p.for))];
const filters = $('.filters');
if (PRODUCTS.length > 6 && kinds.length > 1) {
  filters.hidden = false;
  filters.innerHTML = ['All', ...kinds].map((k, i) => `<button type="button" class="chip-btn" aria-pressed="${i === 0}" data-filter="${esc(k)}">${esc(k)}</button>`).join('');
  filters.addEventListener('click', e => {
    const btn = e.target.closest('.chip-btn'); if (!btn) return;
    $$('.chip-btn', filters).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    $$('.card', cards).forEach(c => {
      const on = btn.dataset.filter === 'All' || c.dataset.for === btn.dataset.filter;
      c.classList.toggle('off', !on); c.classList.remove('show');
      if (on) { void c.offsetWidth; c.classList.add('show'); }
    });
  });
}

/* ---------- reveals ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target; el.classList.add('in'); io.unobserve(el);
  if (el === cards) setTimeout(() => cards.classList.add('settled'), 1400);
}), { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
$$('.reveal').forEach(el => io.observe(el));
io.observe(cards);

/* ---------- the interactive moment: wear it through a night ---------- */
const picker = $('#picker'), holdBtn = $('#hold'), hourEl = $('#hour'), verb = $('.h-verb'), done = $('#wear-done');
const layers = $$('#layers li');
let current = PRODUCTS[0], hp = 0, holding = false, worn = false, holdRaf = null, holdLast = 0, hourLast = '', hourAt = 0, hpLast = -1;
picker.innerHTML = PRODUCTS.map((p, i) => `<button type="button" class="pick" role="radio" aria-checked="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-id="${esc(p.id)}" style="--tint:${esc(p.tint)}"><i></i>${esc(p.brand + ' ' + p.name)}</button>`).join('');
function choose(p) {
  current = p;
  $$('.pick', picker).forEach(b => { const on = b.dataset.id === p.id; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
  holdBtn.style.setProperty('--tint', p.tint);
  layers[0].querySelector('.l-notes').textContent = p.top;
  layers[1].querySelector('.l-notes').textContent = p.heart;
  layers[2].querySelector('.l-notes').textContent = p.base;
  hp = 0; worn = false; holding = false; renderHold(true);
  verb.textContent = 'Hold'; done.classList.remove('on');
}
picker.addEventListener('click', e => { const b = e.target.closest('.pick'); if (b) choose(PRODUCTS.find(p => p.id === b.dataset.id)); });
picker.addEventListener('keydown', e => {
  const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
  if (!(e.key in keys)) return;
  e.preventDefault();
  const i = (PRODUCTS.indexOf(current) + keys[e.key] + PRODUCTS.length) % PRODUCTS.length;
  choose(PRODUCTS[i]); $$('.pick', picker)[i].focus();
});
function renderHold(force) {
  if (force || Math.abs(hp - hpLast) > 0.002) { hpLast = hp; holdBtn.style.setProperty('--hp', hp.toFixed(3)); }
  const now = performance.now();
  const h = 'Hour ' + Math.min(10, Math.floor(hp * 10.2));
  if (h !== hourLast && (force || now - hourAt > 100)) { hourLast = h; hourAt = now; hourEl.textContent = h; }
  layers.forEach(li => li.classList.toggle('lit', hp >= +li.dataset.at));
}
function complete() {
  hp = 1; worn = true; holding = false; renderHold(true);
  verb.textContent = 'Worn';
  done.textContent = `Hour 10. ${current.brand} ${current.name} is still on your skin.`;
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
  if (worn) choose(current);
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
choose(PRODUCTS[0]);

/* ---------- request form ---------- */
const form = $('#order-form'), err = $('#form-error'), success = $('#success');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const fName = $('#f-name'), fEmail = $('#f-email'), fWant = $('#f-want');
  const name = fName.value.trim(), email = fEmail.value.trim(), want = fWant.value.trim();
  const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const bad = [];
  fName.setAttribute('aria-invalid', !name); if (!name) bad.push('your name');
  fEmail.setAttribute('aria-invalid', !okEmail); if (!okEmail) bad.push('a valid email');
  fWant.setAttribute('aria-invalid', !want); if (!want) bad.push('the fragrance you want');
  if (bad.length) {
    err.textContent = 'Please add ' + bad.join(', ').replace(/, ([^,]*)$/, ' and $1') + '.';
    (!name ? fName : !okEmail ? fEmail : fWant).focus(); return;
  }
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
      btn.disabled = false; btn.textContent = 'Send my request';
    }
  } else showSuccess(first, true);
});
function showSuccess(first, preview) {
  form.hidden = true; success.hidden = false;
  $('#success-h').textContent = `Thanks, ${first}. Request received.`;
  if (preview) { const n = document.createElement('p'); n.className = 'note'; n.textContent = "Preview site: it isn't connected to an inbox yet, so nothing was sent."; success.appendChild(n); }
  success.focus();
}

/* ---------- reduced motion, live in both directions ---------- */
function pinToFinalStates() {
  updateTrail();
  $$('.reveal').forEach(el => el.classList.add('in')); cards.classList.add('in', 'settled');
  if (!worn && hp > 0) complete();
  drawSmoke(0);
}
reducedMQ.addEventListener('change', e => {
  if (e.matches) pinToFinalStates();
  else { trailLast = -1; updateTrail(); applyHeroMode(); startSmoke(); }
});

/* ---------- pause everything on hidden tabs ---------- */
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('paused', document.hidden);
  if (!document.hidden) startSmoke();
});

/* ---------- go ---------- */
applyHeroMode();
if (!scrubOn) layout();
if (reducedMQ.matches) pinToFinalStates();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
})();
