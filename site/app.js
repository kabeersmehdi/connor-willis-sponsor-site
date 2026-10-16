// Back Connor Willis: page logic and the 3D car.
// Everything content-related comes from config.json. Three.js is loaded from the import map in index.html.
// three.js is loaded on demand in main(), after the page content has rendered, so a blocked or slow CDN
// (ad blocker, corporate network, outage) costs only the 3D car, never the prices, partners and footer.
let THREE, OrbitControls, GLTFLoader, DRACOLoader, RGBELoader, DecalGeometry, RoomEnvironment;
async function loadThree() {
  const [core, orbit, gltf, draco, rgbe, decal, room] = await Promise.all([
    import('three'),
    import('three/addons/controls/OrbitControls.js'),
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/loaders/DRACOLoader.js'),
    import('three/addons/loaders/RGBELoader.js'),
    import('three/addons/geometries/DecalGeometry.js'),
    import('three/addons/environments/RoomEnvironment.js'),
  ]);
  THREE = core;
  ({ OrbitControls } = orbit); ({ GLTFLoader } = gltf); ({ DRACOLoader } = draco);
  ({ RGBELoader } = rgbe); ({ DecalGeometry } = decal); ({ RoomEnvironment } = room);
}

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const params = new URLSearchParams(location.search);
if (params.has('embed')) document.body.classList.add('embed');
const DEBUG = params.has('debug');
const POLAR = 1.2; // fixed camera elevation: the car only spins around its vertical axis

const state = {
  cfg: null,
  currency: 'USD',
  view: 'spots',
  activeId: null,
  claimSpot: null,
  T: null,                 // three.js handles
  spotObjs: new Map(),     // id -> { spot, decals: [], pin, point, normal }
  numberDecals: [],
  rendering: true,
};

/* ------------------------------------------------------------------ helpers */
function money(usd) {
  if (state.currency === 'GBP') {
    const v = Math.round((usd * state.cfg.site.currency.gbpPerUsd) / 100) * 100;
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(v);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(usd);
}
const isTaken = (s) => s.status === 'taken';
function raised() {
  const c = state.cfg;
  if (c.site.raisedOverride != null) return c.site.raisedOverride;
  return c.spots.filter(isTaken).reduce((a, s) => a + (s.paid ?? s.price), 0);
}
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
function roundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
const nextFrame = () => new Promise((r) => setTimeout(r, 0)); // yield to the UI without depending on animation frames
// Hosts that only serve text media types get the binary assets wrapped as base64 JSON; both forms load.
function b64ToBuf(b64) { const bin = atob(b64); const bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i); return bytes.buffer; }
async function fetchWrapped(url, key) { const r = await fetch(url); if (!r.ok) throw new Error(`${url} ${r.status}`); const j = await r.json(); return b64ToBuf(j[key]); }

/* ------------------------------------------------------------ static render */
function renderFunding() {
  const c = state.cfg, r = raised(), g = c.site.goal;
  $('#raised').textContent = money(r);
  $('#goal').textContent = money(g);
  const pct = Math.max(0, Math.min(100, (r / g) * 100));
  const bar = $('#bar');
  bar.querySelector('i').style.width = pct + '%';
  bar.setAttribute('aria-valuenow', String(Math.round(pct)));
  const open = c.spots.filter((s) => !isTaken(s)).length;
  $('#funding-meta').textContent = r > 0
    ? `${Math.round(pct)}% of the goal. ${open} of ${c.spots.length} spots still open.`
    : `${c.spots.length} spots on the car and the driver kit. Be the first partner on it.`;
}

function statusCell(s) {
  if (isTaken(s)) {
    const name = esc(s.holder || 'Taken');
    return `<span class="chip chip-taken">Taken</span> <span class="holder">${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${name}</a>` : name}</span>`;
  }
  return `<span class="chip chip-open">Available</span>`;
}

function renderTable() {
  const tb = $('#spot-table tbody');
  tb.innerHTML = state.cfg.spots.map((s) => `
    <tr data-id="${s.id}" class="${state.activeId === s.id ? 'is-active' : ''}">
      <td class="num">${s.id}</td>
      <td><div class="name">${esc(s.name)}</div><div class="loc">${esc(s.location)}</div></td>
      <td><span class="chip chip-size">${esc(s.size)}</span></td>
      <td>${esc(s.dims)}</td>
      <td>${statusCell(s)}</td>
      <td class="right price">${money(s.price)}</td>
      <td class="right">${isTaken(s)
        ? (s.url ? `<a class="btn btn-ghost btn-sm" href="${esc(s.url)}" target="_blank" rel="noopener">Visit</a>` : '')
        : `<button type="button" class="btn btn-primary btn-sm" data-claim="${s.id}">Claim</button>`}</td>
    </tr>`).join('');
  const total = state.cfg.spots.reduce((a, s) => a + s.price, 0);
  $('#table-note').textContent = `The full list adds up to ${money(total)}, the season goal. Asking prices in ${state.currency === 'GBP' ? 'pounds at an approximate rate' : 'US dollars'}. Print sizes are approximate and confirmed on the real car.`;
}

function renderKit() {
  const kit = state.cfg.spots.filter((s) => s.offCar);
  $('#kit').innerHTML = kit.map((s) => `
    <article class="kit-card" data-id="${s.id}">
      <img src="${esc(s.image)}" alt="" loading="lazy">
      <div class="kit-body">
        <div class="name">${s.id}. ${esc(s.name)}</div>
        <div class="loc">${esc(s.location.replace(/^Driver kit, /, ''))}</div>
        <div class="kit-foot">
          <span class="price">${money(s.price)}</span>
          ${isTaken(s) ? `<span class="chip chip-taken">${esc(s.holder || 'Taken')}</span>` : `<button type="button" class="btn btn-ghost btn-sm" data-claim="${s.id}">Claim</button>`}
        </div>
      </div>
    </article>`).join('');
}

function renderPartners() {
  const p = state.cfg.partners || [];
  $('#partner-logos').innerHTML = p.map((x) => `<img src="${esc(x.logo)}" alt="${esc(x.name)}" title="${esc(x.name)}" loading="lazy">`).join('')
    + `<a class="you" href="#spots">Your logo here</a>`;
}

function renderFooter() {
  const L = state.cfg.site.links || {};
  const items = [['Website', L.website], ['Instagram', L.instagram], ['YouTube', L.youtube], ['LinkedIn', L.linkedin], ['Facebook', L.facebook], ['GB4 standings', L.standings], ['Hillspeed', L.team]].filter((x) => x[1]);
  $('#foot-links').innerHTML = items.map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${n}</a>`).join('');
  const email = state.cfg.site.contactEmail;
  if (email) $('#foot-contact').innerHTML = `Sponsorship enquiries: <a href="mailto:${esc(email)}">${esc(email)}</a>`;
  $('#credits').textContent = `Photos: Connor Willis Racing. ${state.cfg.model.credit} Studio lighting: Poly Haven (CC0). Built with three.js.`;
}

function renderDraft() {
  const banner = $('#draft-banner');
  if (banner) banner.hidden = state.cfg.site.draft === false;
}

function renderAll() { renderDraft(); renderFunding(); renderTable(); renderKit(); renderPartners(); renderFooter(); }

/* ---------------------------------------------------------------- currency */
function setCurrency(cur) {
  state.currency = cur;
  $$('[data-cur]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cur === cur)));
  try { localStorage.setItem('cwr-currency', cur); } catch (e) { /* ignore */ }
  renderFunding(); renderTable(); renderKit();
  if (state.claimSpot) fillDialogHead(state.claimSpot);
}

/* ------------------------------------------------------------------- claim */
const dialog = $('#claim-dialog');
function fillDialogHead(s) {
  $('#dlg-title').textContent = `Claim spot ${s.id}: ${s.name}`;
  $('#dlg-sub').textContent = `${s.location} · ${s.dims} · ${money(s.price)} per season`;
}
function openClaim(id) {
  const s = state.cfg.spots.find((x) => x.id === id);
  if (!s || isTaken(s)) return;
  state.claimSpot = s;
  fillDialogHead(s);
  $('#dlg').classList.remove('is-done');
  $('#done-copy').hidden = true;
  if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  setTimeout(() => $('#f-company').focus(), 50);
}
function closeClaim() { if (dialog.open) dialog.close(); state.claimSpot = null; }

function composeMessage(s, f) {
  return [
    `Sponsorship request: spot ${s.id}, ${s.name} (${s.location})`,
    `Asking price: ${money(s.price)} per season`,
    ``,
    `Company: ${f.company}`,
    `Name: ${f.name}`,
    `Email: ${f.email}`,
    f.website ? `Website: ${f.website}` : null,
    f.message ? `` : null,
    f.message ? `Message: ${f.message}` : null,
    ``,
    `Sent from ${location.href.split('#')[0]}`,
  ].filter((x) => x !== null).join('\n');
}

async function submitClaim(ev) {
  ev.preventDefault();
  const s = state.claimSpot; if (!s) return;
  const form = ev.target;
  if (!form.reportValidity()) return;
  const f = Object.fromEntries(new FormData(form).entries());
  const text = composeMessage(s, f);
  const site = state.cfg.site;
  const payload = { spotId: s.id, spot: s.name, location: s.location, priceUsd: s.price, ...f, sentAt: new Date().toISOString(), page: location.href };
  const btn = form.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'Sending';
  let done = false;
  if (site.claimEndpoint) {
    try {
      const r = await fetch(site.claimEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
      done = r.ok;
    } catch (e) { done = false; }
  }
  btn.disabled = false; btn.textContent = 'Send request';
  const doneText = $('#done-text'), copy = $('#done-copy');
  if (done) {
    doneText.textContent = `Request sent for spot ${s.id}, ${s.name}. Connor's team will reply to ${f.email}.`;
  } else if (site.contactEmail) {
    const subject = encodeURIComponent(`Sponsorship request: spot ${s.id}, ${s.name}`);
    const body = encodeURIComponent(text);
    window.location.href = `mailto:${site.contactEmail}?subject=${subject}&body=${body}`;
    doneText.innerHTML = `Your email app should open with the request ready to send to <b>${esc(site.contactEmail)}</b>. If it did not, copy the text below and send it yourself.`;
    copy.textContent = text; copy.hidden = false;
  } else {
    const ig = site.links && site.links.instagram;
    doneText.innerHTML = `Copy the request below and send it to Connor ${ig ? `on <a href="${esc(ig)}" target="_blank" rel="noopener">Instagram</a>` : 'through his website'}. The team replies with next steps.`;
    copy.textContent = text; copy.hidden = false;
  }
  $('#dlg').classList.add('is-done');
  form.reset();
}

/* ------------------------------------------------------------ highlighting */
function setActive(id, scrollRow = false) {
  state.activeId = id;
  $$('#spot-table tr[data-id]').forEach((tr) => tr.classList.toggle('is-active', Number(tr.dataset.id) === id));
  state.spotObjs.forEach((o) => o.pin.classList.toggle('is-active', o.spot.id === id));
  if (scrollRow) { const tr = $(`#spot-table tr[data-id="${id}"]`); if (tr) tr.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
}

const pop = $('#spot-pop');
function showPop(id, pinEl) {
  const s = state.cfg.spots.find((x) => x.id === id); if (!s) return;
  const stage = $('#stage');
  const section = stage.parentElement; // .stage-section is the offset parent
  const pr = pinEl.getBoundingClientRect(), sr = section.getBoundingClientRect();
  pop.innerHTML = `
    <b>${s.id}. ${esc(s.name)}</b>
    <div class="pop-meta">${esc(s.location)} · ${esc(s.dims)}</div>
    <div class="pop-price">${money(s.price)} <span class="pop-meta" style="font-size:13px;font-weight:500">per season</span></div>
    ${isTaken(s)
      ? `<div class="pop-meta" style="margin-top:6px">Taken by <b>${esc(s.holder || 'a partner')}</b></div>${s.url ? `<a class="btn btn-ghost btn-sm" href="${esc(s.url)}" target="_blank" rel="noopener">Visit</a>` : ''}`
      : `<button type="button" class="btn btn-primary btn-sm" data-claim="${s.id}">Claim this spot</button>`}`;
  pop.classList.add('is-open');
  let left = pr.left - sr.left + pr.width / 2 - pop.offsetWidth / 2;
  left = Math.max(8, Math.min(left, sr.width - pop.offsetWidth - 8));
  let top = pr.top - sr.top - pop.offsetHeight - 12;
  if (top < 0) top = pr.top - sr.top + pr.height + 12;
  pop.style.left = left + 'px'; pop.style.top = top + 'px';
  setActive(id);
}
function hidePop() { pop.classList.remove('is-open'); }

/* ------------------------------------------------------------------ three */
function fallbackStage(msg) {
  const stage = $('#stage');
  $('#stage-loading').hidden = true;
  const img = document.createElement('img');
  img.className = 'stage-fallback'; img.src = 'assets/img/panning.jpg'; img.alt = 'Connor Willis on track';
  stage.appendChild(img);
  $('#pins').innerHTML = '';
  if (DEBUG) console.warn(msg);
}

function makeLiveryMaterial(liv, halfLen, carH) {
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.0, roughness: 0.3, clearcoat: 1.0, clearcoatRoughness: 0.06, envMapIntensity: 1.0 });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, {
      uFront: { value: new THREE.Color(liv.front) },
      uRear: { value: new THREE.Color(liv.rear) },
      uStripe: { value: new THREE.Color(liv.stripe) },
      uSplit: { value: liv.split }, uSlope: { value: liv.slope }, uStripeW: { value: liv.stripeWidth },
      uHalfLen: { value: halfLen }, uCarH: { value: carH },
    });
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLivPos;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvLivPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
varying vec3 vLivPos;
uniform vec3 uFront; uniform vec3 uRear; uniform vec3 uStripe;
uniform float uSplit; uniform float uSlope; uniform float uStripeW; uniform float uHalfLen; uniform float uCarH;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{
  float t = vLivPos.z / uHalfLen;
  float yn = clamp(vLivPos.y / uCarH, 0.0, 1.0);
  float d = t - (uSplit + uSlope * (yn - 0.42));
  float e = 0.004;
  float redMix = smoothstep(-e, e, d);
  float stripeMix = smoothstep(-uStripeW - e, -uStripeW + e, d) * (1.0 - redMix);
  vec3 col = mix(uRear, uStripe, stripeMix);
  col = mix(col, uFront, redMix);
  diffuseColor.rgb *= col;
}`);
  };
  mat.customProgramCacheKey = () => 'cwr-livery';
  mat.name = 'Livery';
  return mat;
}

function decalTexture(renderer, kind, spot, w, h) {
  const W = 1024, H = Math.max(96, Math.round((1024 * h) / w));
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const pad = Math.round(H * 0.08), r = Math.round(H * 0.16);
  const font = (wt, px) => `${wt} ${px}px "Barlow Semi Condensed", "Barlow", Arial, sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (kind === 'available') {
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = Math.max(5, H * 0.04); g.setLineDash([H * 0.14, H * 0.09]);
    roundRect(g, pad, pad, W - 2 * pad, H - 2 * pad, r); g.stroke(); g.setLineDash([]);
    g.fillStyle = 'rgba(255,255,255,0.10)'; roundRect(g, pad, pad, W - 2 * pad, H - 2 * pad, r); g.fill();
    const cr = H * 0.17, cx = pad + cr * 1.6, cy = H / 2;
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(cx, cy, cr, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#d8141e'; g.font = font(700, cr * 1.35); g.fillText(String(spot.id), cx, cy + cr * 0.06);
    g.fillStyle = 'rgba(255,255,255,0.95)'; g.font = font(600, H * 0.3);
    try { g.letterSpacing = '0.06em'; } catch (e) { /* older browsers */ }
    g.fillText('YOUR LOGO', W / 2 + cr * 0.9, H / 2 + H * 0.02);
  } else if (kind === 'taken') {
    g.fillStyle = '#ffffff'; roundRect(g, pad, pad, W - 2 * pad, H - 2 * pad, r); g.fill();
    if (spot._logoImg) {
      const img = spot._logoImg, iw = W - 4 * pad, ih = H - 4 * pad;
      const sc = Math.min(iw / img.width, ih / img.height);
      const dw = img.width * sc, dh = img.height * sc;
      g.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      g.fillStyle = '#111114'; g.font = font(700, H * 0.36); g.fillText(spot.holder || 'Partner', W / 2, H / 2 + H * 0.02);
    }
  } else if (kind === 'number') {
    g.fillStyle = '#ffffff'; g.font = font(700, H * 0.98); g.fillText(String(spot.number), W / 2, H / 2 + H * 0.06);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

function placeDecal(T, spec, texture, opts = {}) {
  const b = T.bounds;
  const origin = new THREE.Vector3(spec.from[0] * b.hw, spec.from[1] * b.h, spec.from[2] * b.hl);
  const dir = new THREE.Vector3(spec.dir[0], spec.dir[1], spec.dir[2]).normalize();
  const ray = new THREE.Raycaster(origin, dir, 0, 100);
  const allowed = (opts.anyMaterial || spec.any) ? null : new Set(['Livery', 'carbon', 'Black', 'generic']);
  const hits = ray.intersectObject(T.car, true).filter((h) => h.object.isMesh && (!allowed || allowed.has(h.object.material.name)));
  if (!hits.length) { if (DEBUG) console.warn('decal miss', spec); return null; }
  const hit = hits[0];
  const p = hit.point.clone();
  const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
  if (spec.pinOnly || opts.pinOnly) return { point: p, normal: n, mesh: null };
  const helper = new THREE.Object3D();
  helper.position.copy(p);
  helper.up.set(0, 1, 0);
  if (spec.up === '-z') helper.up.set(0, 0, -1); else if (spec.up === 'z') helper.up.set(0, 0, 1); else if (spec.up === 'x') helper.up.set(1, 0, 0);
  helper.lookAt(p.clone().add(n));
  const depth = Math.max(spec.w, spec.h) * 0.5 + 0.12;
  const geo = new DecalGeometry(hit.object, p, helper.rotation, new THREE.Vector3(spec.w, spec.h, depth));
  const mat = new THREE.MeshStandardMaterial({ map: texture, transparent: true, depthTest: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -2, roughness: 0.45, metalness: 0, envMapIntensity: 0.6 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 2; mesh.castShadow = false; mesh.receiveShadow = false;
  T.scene.add(mesh);
  return { point: p, normal: n, mesh };
}

function loadImage(src) {
  return new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
}

async function buildDecals(T) {
  const cfg = state.cfg;
  try { await Promise.race([document.fonts.load('700 40px "Barlow Semi Condensed"'), new Promise((r) => setTimeout(r, 1500))]); } catch (e) { /* ignore */ }
  // race number
  for (const spec of cfg.model.numberDecals || []) {
    const tex = decalTexture(T.renderer, 'number', { number: cfg.livery.number }, spec.w, spec.h);
    const d = placeDecal(T, spec, tex); if (d && d.mesh) state.numberDecals.push(d.mesh);
  }
  await nextFrame();
  const pinsEl = $('#pins');
  for (const spot of cfg.spots) {
    if (spot.offCar || !spot.decals || !spot.decals.length) continue;
    if (isTaken(spot) && spot.logo) spot._logoImg = await loadImage(spot.logo);
    const obj = { spot, decals: [], pin: null, point: null, normal: null };
    for (const spec of spot.decals) {
      const kind = isTaken(spot) ? 'taken' : 'available';
      const tex = spec.pinOnly ? null : decalTexture(T.renderer, kind, spot, spec.w, spec.h);
      const d = placeDecal(T, spec, tex, { anyMaterial: !!spec.pinOnly });
      if (!d) continue;
      if (d.mesh) { d.mesh.userData.available = !isTaken(spot); obj.decals.push(d.mesh); }
      if (!obj.point) { obj.point = d.point.clone().addScaledVector(d.normal, 0.03); obj.normal = d.normal.clone(); }
    }
    if (!obj.point) continue;
    const pin = document.createElement('button');
    pin.type = 'button'; pin.className = 'pin is-hidden ' + (isTaken(spot) ? 'is-taken' : 'is-available');
    pin.textContent = String(spot.id);
    pin.setAttribute('aria-label', `Spot ${spot.id}: ${spot.name}, ${money(spot.price)}, ${isTaken(spot) ? 'taken' : 'available'}`);
    pin.dataset.id = String(spot.id);
    pin.addEventListener('click', (e) => { e.stopPropagation(); if (pop.classList.contains('is-open') && state.activeId === spot.id) { hidePop(); return; } showPop(spot.id, pin); });
    pinsEl.appendChild(pin);
    obj.pin = pin;
    state.spotObjs.set(spot.id, obj);
    if (state.spotObjs.size % 4 === 0) await nextFrame();
  }
  applyView();
  updatePins(T);
}

function applyView() {
  const showSpots = state.view === 'spots';
  state.spotObjs.forEach((o) => {
    o.decals.forEach((m) => { m.visible = showSpots || !m.userData.available; });
    if (!showSpots) o.pin.classList.add('is-hidden');
  });
  if (!showSpots) hidePop();
}

function initThree() {
  const stage = $('#stage'), canvas = $('#car-canvas');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { fallbackStage('WebGL unavailable: ' + e); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 200);
  const controls = new OrbitControls(camera, canvas);
  Object.assign(controls, { enablePan: false, enableZoom: false, enableDamping: true, dampingFactor: 0.07, rotateSpeed: 0.55, autoRotate: !params.has('still'), autoRotateSpeed: 0.45 });
  controls.minPolarAngle = POLAR; controls.maxPolarAngle = POLAR;
  canvas.style.touchAction = 'pan-y';

  const key = new THREE.DirectionalLight(0xffffff, 1.7);
  key.position.set(4, 9, 6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02; key.shadow.radius = 5;
  Object.assign(key.shadow.camera, { left: -4.5, right: 4.5, top: 4.5, bottom: -4.5, near: 1, far: 40 });
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.5); rim.position.set(-6, 3, -7); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd4d4da, 0.3));

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.26 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  const T = state.T = { renderer, scene, camera, controls, car: null, bounds: null, stage, canvas, key, size: { w: 1, h: 1 } };
  if (DEBUG) scene.add(new THREE.AxesHelper(3));

  const envFile = state.cfg.env || 'assets/env/studio.hdr';
  const applyEnv = (tex) => {
    tex.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = tex;
    if ('environmentIntensity' in scene) scene.environmentIntensity = 0.95;
  };
  const envFallback = () => {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  };
  if (envFile.endsWith('.json')) {
    fetchWrapped(envFile, 'hdr').then((buf) => {
      const d = new RGBELoader().parse(buf);
      if (!d) throw new Error('hdr parse');
      const tex = new THREE.DataTexture(d.data, d.width, d.height, THREE.RGBAFormat, d.type);
      tex.colorSpace = THREE.LinearSRGBColorSpace; tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false; tex.flipY = true; tex.needsUpdate = true;
      applyEnv(tex);
    }).catch(envFallback);
  } else {
    new RGBELoader().load(envFile, applyEnv, undefined, envFallback);
  }

  const draco = new DRACOLoader(); draco.setDecoderPath('assets/draco/');
  if (state.cfg.model.decoder === 'js') draco.setDecoderConfig({ type: 'js' });
  const loader = new GLTFLoader(); loader.setDRACOLoader(draco);
  const modelFile = state.cfg.model.file;
  const onLoad = (gltf) => onModel(T, gltf);
  const onErr = (err) => fallbackStage('model failed: ' + err);
  if (modelFile.endsWith('.json')) fetchWrapped(modelFile, 'glb').then((buf) => loader.parse(buf, 'assets/', onLoad, onErr)).catch(onErr);
  else loader.load(modelFile, onLoad, undefined, onErr);

  // sizing
  const ro = new ResizeObserver(() => resize(T)); ro.observe(stage);
  resize(T);

  // pause rendering when off screen
  const io = new IntersectionObserver((ents) => { state.rendering = ents[0].isIntersecting; }, { threshold: 0, rootMargin: '240px 0px' });
  io.observe(stage);

  // auto-rotate pauses while the user drags, resumes after a pause
  let idleTimer = null;
  controls.addEventListener('start', () => { controls.autoRotate = false; clearTimeout(idleTimer); hidePop(); });
  controls.addEventListener('end', () => { clearTimeout(idleTimer); idleTimer = setTimeout(() => { if (!params.has('still')) controls.autoRotate = true; }, 5000); });

  let frame = 0;
  const loop = () => {
    requestAnimationFrame(loop);
    if (!state.rendering) return;
    try {
      controls.update();
      renderer.render(scene, camera);
      if ((frame++ & 1) === 0) updatePins(T);
    } catch (e) { if (!T.loopErr) { T.loopErr = e; console.error('render loop', e); } }
  };
  loop();
}

function resize(T) {
  const r = T.stage.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
  T.size = { w, h };
  T.renderer.setSize(w, h, false);
  T.camera.aspect = w / h; T.camera.updateProjectionMatrix();
  if (T.bounds) fitCamera(T);
}

function fitCamera(T) {
  const { camera, controls, bounds, size } = T;
  const aspect = size.w / size.h;
  const fovV = THREE.MathUtils.degToRad(camera.fov);
  const fovH = 2 * Math.atan(Math.tan(fovV / 2) * aspect);
  const r = bounds.len * 0.5 * (aspect < 1.2 ? 0.98 : 0.8);
  const dist = r / Math.sin(Math.min(fovV, fovH) / 2);
  const target = new THREE.Vector3(0, bounds.h * 0.4, 0);
  controls.target.copy(target);
  const az = T.hasAz ? controls.getAzimuthalAngle() : parseFloat(params.get('az') || '0.72');
  T.hasAz = true;
  camera.position.setFromSphericalCoords(dist, POLAR, az).add(target);
  controls.update();
}

function onModel(T, gltf) {
  const car = gltf.scene;
  const cfgM = state.cfg.model;
  if (cfgM.rotateY) car.rotation.y = THREE.MathUtils.degToRad(cfgM.rotateY);
  car.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(car);
  let size = box.getSize(new THREE.Vector3());
  const s = cfgM.length / Math.max(size.x, size.z);
  car.scale.setScalar(s);
  car.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(car);
  const c = box.getCenter(new THREE.Vector3());
  car.position.set(-c.x, -box.min.y, -c.z);
  car.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(car); size = box.getSize(new THREE.Vector3());
  T.bounds = { hw: size.x / 2, h: size.y, hl: size.z / 2, len: size.z };
  if (DEBUG) console.log('bounds', T.bounds);

  const livery = makeLiveryMaterial(state.cfg.livery, T.bounds.hl, T.bounds.h);
  const tyre = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.88, metalness: 0.0 });
  tyre.name = 'tyres';
  car.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    const name = o.material && o.material.name;
    if (name === 'Livery' || name === 'Livery_Wings') o.material = livery;
    else if (name === 'tyres') o.material = tyre;
    else if (o.material) {
      o.material.envMapIntensity = (name === 'chrome' || name === 'rims' || name === 'mirror') ? 1.2 : 0.9;
      if (name === 'carbon') { o.material.roughness = 0.45; o.material.metalness = 0.2; }
    }
  });
  T.car = car; T.scene.add(car);
  fitCamera(T);
  $('#stage-loading').hidden = true;
  buildDecals(T).catch((e) => { if (DEBUG) console.error(e); });
}

let _v, _d;
function updatePins(T) {
  if (!state.spotObjs.size) return;
  if (!_v) { _v = new THREE.Vector3(); _d = new THREE.Vector3(); }
  const { camera, size } = T;
  const showSpots = state.view === 'spots';
  camera.updateMatrixWorld();
  state.spotObjs.forEach((o) => {
    _v.copy(o.point).project(camera);
    _d.subVectors(camera.position, o.point).normalize();
    const facing = o.normal.dot(_d);
    const visible = showSpots && facing > 0.18 && _v.z < 1;
    o.pin.classList.toggle('is-hidden', !visible);
    if (visible) {
      o.pin.style.left = ((_v.x * 0.5 + 0.5) * size.w).toFixed(1) + 'px';
      o.pin.style.top = ((-_v.y * 0.5 + 0.5) * size.h).toFixed(1) + 'px';
    } else if (state.activeId === o.spot.id && pop.classList.contains('is-open')) {
      hidePop();
    }
  });
}

/* ------------------------------------------------------------------- boot */
async function main() {
  const res = await fetch(params.get('config') || 'config.json', { cache: 'no-cache' });
  state.cfg = await res.json();
  try { const c = localStorage.getItem('cwr-currency'); if (c === 'GBP' || c === 'USD') state.currency = c; } catch (e) { /* ignore */ }
  $$('[data-cur]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cur === state.currency)));
  renderAll();

  document.addEventListener('click', (e) => {
    const claim = e.target.closest('[data-claim]');
    if (claim) { e.preventDefault(); hidePop(); openClaim(Number(claim.dataset.claim)); return; }
    const cur = e.target.closest('[data-cur]');
    if (cur) { setCurrency(cur.dataset.cur); return; }
    const view = e.target.closest('[data-view]');
    if (view) {
      state.view = view.dataset.view;
      $$('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === state.view)));
      applyView(); return;
    }
    const row = e.target.closest('#spot-table tr[data-id]');
    if (row) { setActive(Number(row.dataset.id)); return; }
    if (!e.target.closest('#spot-pop') && !e.target.closest('.pin')) hidePop();
  });
  $('#claim-form').addEventListener('submit', submitClaim);
  $('#dlg-close').addEventListener('click', closeClaim);
  $('#dlg-done-close').addEventListener('click', closeClaim);
  dialog.addEventListener('click', (e) => { if (e.target === dialog) closeClaim(); });
  dialog.addEventListener('close', () => { state.claimSpot = null; });

  if (DEBUG) window.__cwr = state;
  try {
    await loadThree();
  } catch (e) {
    fallbackStage('three.js did not load: ' + e);
    return;
  }
  if (DEBUG) window.__THREE = THREE;
  initThree();
}
main().catch((e) => { console.error(e); fallbackStage(String(e)); });
