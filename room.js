// The room. Pick a timber and see it laid: floor, skirting, door and bench in that species, sun through the
// window. Loaded only when someone opens it (site.js imports this file on the first click), so three.js never
// costs a visitor who doesn't. An illustration built from the species swatch, not a photo of a job.
import * as THREE from "/vendor/three.module.min.js";
import { RoomEnvironment } from "/vendor/RoomEnvironment.js";

const species = JSON.parse(document.getElementById("species-data").textContent);
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 4);
const arrow = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2 8h12M9 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;

/* ---------- The dialog ---------- */
const dlg = document.createElement("dialog");
dlg.className = "room";
dlg.setAttribute("aria-label", "Timber in a room");
dlg.innerHTML = `
  <canvas class="room__canvas"></canvas>
  <div class="room__planks" aria-hidden="true">${"<i></i>".repeat(7)}</div>
  <div class="room__top">
    <p class="mono room__hint">Drag to look around</p>
    <button class="room__close" type="button" data-room-close>Close</button>
  </div>
  <div class="room__info">
    <p class="mono" data-r-meta></p>
    <h2 class="h-xl" data-r-name></h2>
    <p class="room__text" data-r-text></p>
    <div class="room__lay" role="group" aria-label="How the floor is laid">
      <button class="chip" type="button" aria-pressed="true" data-lay="boards">Boards</button>
      <button class="chip" type="button" aria-pressed="false" data-lay="herringbone">Herringbone</button>
    </div>
    <a class="btn btn--primary" href="/contact#quote" data-r-ask><span></span><i class="btn__cell">${arrow}</i></a>
  </div>
  <div class="room__strip" role="group" aria-label="Choose a timber">
    ${species.map((s) => `<button type="button" data-pick="${s.slug}" aria-label="${s.name}" title="${s.name}"><img src="/images/species/${s.slug}-v.webp" alt="" loading="lazy"></button>`).join("")}
  </div>
  <p class="room__note">An illustration made from our sample of each timber. Real boards vary in colour and grain; see them at the yard.</p>`;
document.body.append(dlg);
const $ = (s) => dlg.querySelector(s);
const canvas = $(".room__canvas");

/* ---------- Scene ---------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x14100c);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.42;

const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
const target = new THREE.Vector3(-0.5, 0.95, -1.2);

const wallMat = new THREE.MeshStandardMaterial({ color: 0xece5d8, roughness: 0.95 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x1b1612, roughness: 0.6, metalness: 0.2 });
const box = (w, h, d, mat, x, y, z, shadow = true) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  scene.add(m);
  return m;
};

// Shell: back wall, a window wall on the left, a ceiling. The sun only gets in through the window.
const H = 3.1, BACK = -3, LEFT = -3.6;
box(11, H, 0.2, wallMat, 0.4, H / 2, BACK - 0.1);
box(11, 0.2, 10, wallMat, 0.4, H + 0.1, 1.5);
const W0 = -2.2, W1 = 1.9, S0 = 0.35, S1 = 2.75;                      // window opening along z, sill to head
box(0.2, H, BACK + 6 - W1 + 4, wallMat, LEFT - 0.1, H / 2, (W1 + 7) / 2);   // wall in front of the window
box(0.2, H, W0 - BACK + 0.2, wallMat, LEFT - 0.1, H / 2, (BACK - 0.2 + W0) / 2);
box(0.2, S0, W1 - W0, wallMat, LEFT - 0.1, S0 / 2, (W0 + W1) / 2);
box(0.2, H - S1, W1 - W0, wallMat, LEFT - 0.1, (H + S1) / 2, (W0 + W1) / 2);
for (let i = 0; i <= 4; i++) box(0.05, S1 - S0, 0.05, darkMat, LEFT - 0.1, (S0 + S1) / 2, W0 + ((W1 - W0) * i) / 4); // steel mullions
box(0.05, 0.05, W1 - W0, darkMat, LEFT - 0.1, 1.85, (W0 + W1) / 2);
box(0.05, 0.05, W1 - W0, darkMat, LEFT - 0.1, S0 + 0.02, (W0 + W1) / 2);
box(0.05, 0.05, W1 - W0, darkMat, LEFT - 0.1, S1 - 0.02, (W0 + W1) / 2);
const sky = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), new THREE.MeshBasicMaterial({ color: 0xf4f8fb, toneMapped: false }));
sky.position.set(LEFT - 3, 2.2, 0);
sky.rotation.y = Math.PI / 2;
scene.add(sky);

// Timber parts share one material so a change of species changes them together.
const timber = new THREE.MeshStandardMaterial({ roughness: 0.5 });
box(10.4, 0.15, 0.022, timber, 0.5, 0.075, BACK + 0.011);               // skirting
const DX = 1.55;                                                         // the door, a four-panel like the catalogue's
box(0.86, 2.1, 0.04, timber, DX, 1.05, BACK + 0.03);
[[-0.2, 1.52, 0.27, 0.78], [0.2, 1.52, 0.27, 0.78], [-0.2, 0.55, 0.27, 0.72], [0.2, 0.55, 0.27, 0.72]].forEach(([x, y, w, h]) => {
  const p = box(w, h, 0.012, timber, DX + x, y, BACK + 0.052);
  p.material = timber;
  box(w + 0.05, 0.02, 0.02, timber, DX + x, y + h / 2 + 0.01, BACK + 0.056, false);
  box(w + 0.05, 0.02, 0.02, timber, DX + x, y - h / 2 - 0.01, BACK + 0.056, false);
});
box(0.09, 2.1, 0.03, timber, DX - 0.475, 1.05, BACK + 0.02);            // architraves
box(0.09, 2.1, 0.03, timber, DX + 0.475, 1.05, BACK + 0.02);
box(1.04, 0.09, 0.03, timber, DX, 2.145, BACK + 0.02);
box(0.02, 0.12, 0.05, darkMat, DX + 0.33, 1.02, BACK + 0.075);           // handle
box(1.7, 0.055, 0.42, timber, -1.5, 0.46, -2.2);                         // bench
box(0.04, 0.44, 0.38, darkMat, -2.2, 0.22, -2.2);
box(0.04, 0.44, 0.38, darkMat, -0.8, 0.22, -2.2);
const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.34, 32), new THREE.MeshStandardMaterial({ color: 0xc4432a, roughness: 0.35 }));
vase.position.set(-1.9, 0.66, -2.2);
vase.castShadow = true;
scene.add(vase);
const shade = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 16), new THREE.MeshStandardMaterial({ color: 0xfff4dc, emissive: 0xffd9a0, emissiveIntensity: 1.1, roughness: 0.4 }));
shade.position.set(0.1, 2.25, -1.4);
scene.add(shade);
box(0.008, H - 2.42, 0.008, darkMat, 0.1, (H + 2.42) / 2, -1.4, false);

// Light: a low sun through the window, sky fill, a warm pendant.
scene.add(new THREE.HemisphereLight(0xfff3e0, 0x4a3a2a, 0.5));
const sun = new THREE.DirectionalLight(0xffdcae, 7.5);
sun.position.set(-10.5, 4.3, 3.4);
sun.target.position.set(0.4, 0, -0.9);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 26 });
sun.shadow.bias = -0.0004;
sun.shadow.radius = 5;
scene.add(sun, sun.target);
const lamp = new THREE.PointLight(0xffc98a, 2.2, 7, 2);
lamp.position.copy(shade.position);
scene.add(lamp);

/* ---------- The floor: a canvas of boards, each cut from a different part of the sample ---------- */
const SIZE = 2048, FLOOR = 11;
const images = new Map();
const loadImage = (slug) => images.get(slug) || images.set(slug, new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = `/images/species/${slug}-v.webp`; })).get(slug);
const rand = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

// One board on the canvas: a random strip of the sample, grain along the board, a touch lighter or darker.
const plank = (ctx, im, r, x, y, w, h, across) => {
  ctx.save();
  ctx.translate(x, y);
  if (across) { ctx.rotate(-Math.PI / 2); ctx.translate(-h, 0); [w, h] = [h, w]; }
  const sw = 70 + r() * 110, sh = 380 + r() * 420;
  ctx.drawImage(im, r() * (im.width - sw), r() * (im.height - sh), sw, sh, 0, 0, w, h);
  const tone = r() - 0.5;
  ctx.fillStyle = tone > 0 ? `rgba(255,236,205,${tone * 0.2})` : `rgba(30,16,6,${-tone * 0.26})`;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(24,13,6,0.6)";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, w, h);
  ctx.restore();
};

const paint = (im, lay, seed) => {
  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  const ctx = c.getContext("2d");
  const r = rand(seed);
  ctx.drawImage(im, 0, 0, SIZE, SIZE);   // undercoat, so no gap can ever show black
  if (lay === "herringbone") {
    // Blocks five times as long as wide. The pattern repeats every 2L both ways, so the canvas tiles.
    const L = SIZE / 8, W = L / 5;
    for (let a = -12; a < 54; a++) for (let b = -9; b < 6; b++) {
      if (a * W + b * 2 * L > SIZE || a * W + b * 2 * L < -2 * L) continue;
      const x = a * W + b * 2 * L, y = a * W;
      for (const oy of [0, -SIZE, SIZE]) { // wrap vertically
        plank(ctx, im, r, x, y + oy, L, W, true);
        plank(ctx, im, r, x + L, y + oy - (L - W), W, L, false);
      }
    }
  } else {
    const n = 30, W = SIZE / n;
    for (let i = 0; i < n; i++) {
      let y = -r() * 600;
      while (y < SIZE) { const len = 420 + r() * 520; plank(ctx, im, r, i * W, y, W, len, false); if (y + len > SIZE) plank(ctx, im, r, i * W, y - SIZE, W, len, false); y += len; }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const span = lay === "herringbone" ? 3.6 : 3.9;   // metres the canvas covers: blocks 90 mm, boards 130 mm
  t.repeat.set(FLOOR / span, FLOOR / span);
  if (lay === "herringbone") { t.center.set(0.5, 0.5); t.rotation = Math.PI / 4; }
  return t;
};

const floorGeo = new THREE.PlaneGeometry(FLOOR, FLOOR).rotateX(-Math.PI / 2);
const makeFloor = (y) => {
  const m = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ roughness: 0.36, envMapIntensity: 1.5 }));
  m.position.set(0.4, y, 1.6);
  m.receiveShadow = true;
  scene.add(m);
  return m;
};
const floor = makeFloor(0), laying = makeFloor(0.002);
const edge = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);   // boards are laid from the back wall towards you
laying.material.clippingPlanes = [edge];
laying.visible = false;

/* ---------- State ---------- */
let current = null, lay = "boards", open = false, raf = 0, job = 0;
let az = 0, pol = 0, azT = 0, polT = 0, dolly = 1, t0 = 0, layT = null, pending = null;
const fit = () => {
  const w = dlg.clientWidth, h = dlg.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < h ? 58 : 40;
  camera.updateProjectionMatrix();
};

const show = async (slug, instant) => {
  const s = species.find((x) => x.slug === slug) || species[0];
  const mine = ++job;
  current = s;
  $("[data-r-meta]").textContent = `${String(species.indexOf(s) + 1).padStart(2, "0")} / ${species.length} · ${s.type}`;
  $("[data-r-name]").textContent = s.name;
  $("[data-r-text]").textContent = s.text;
  $("[data-r-ask] span").textContent = `Ask about ${s.name.toLowerCase()}`;
  $("[data-r-ask]").dataset.interest = s.name;
  dlg.querySelectorAll("[data-pick]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pick === s.slug)));
  const im = await loadImage(s.slug);
  if (mine !== job) return;
  const tex = paint(im, lay, species.indexOf(s) * 97 + (lay === "boards" ? 1 : 5));
  const swatch = new THREE.Texture(im);
  swatch.colorSpace = THREE.SRGBColorSpace;
  swatch.needsUpdate = true;
  const done = () => {
    floor.material.map?.dispose();
    floor.material.map = tex;
    floor.material.needsUpdate = true;
    timber.map?.dispose();
    timber.map = swatch;
    timber.needsUpdate = true;
    laying.visible = false;
    layT = null;
  };
  if (instant || reduce.matches || !floor.material.map) return done();
  laying.material.map = tex;
  laying.material.needsUpdate = true;
  laying.visible = true;
  layT = performance.now();
  pending = done;
};

const tick = (now) => {
  raf = requestAnimationFrame(tick);
  // Arrive: the camera eases in from further back. Then it follows the pointer, gently.
  const arrive = reduce.matches ? 1 : easeOut(clamp((now - t0 - 250) / 2600));
  dolly = 1.42 - 0.42 * arrive;
  az += (azT - az) * 0.06;
  pol += (polT - pol) * 0.06;
  const drift = reduce.matches ? 0 : Math.sin(now / 5200) * 0.03;
  const a = 0.62 + az + drift, p = 0.16 + pol, d = 6.5 * dolly;
  camera.position.set(target.x + Math.sin(a) * Math.cos(p) * d, target.y + Math.sin(p) * d + 0.25, target.z + Math.cos(a) * Math.cos(p) * d);
  camera.lookAt(target);
  if (layT !== null) {
    const t = clamp((now - layT) / 1500);
    edge.constant = BACK + easeIO(t) * 9.5;
    if (t === 1) { pending?.(); pending = null; }
  }
  renderer.render(scene, camera);
};

/* ---------- Controls ---------- */
let drag = null;
canvas.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, az: azT, pol: polT }; canvas.setPointerCapture(e.pointerId); dlg.classList.add("is-dragged"); });
canvas.addEventListener("pointermove", (e) => {
  if (!drag) return;
  azT = clamp(drag.az - ((e.clientX - drag.x) / innerWidth) * 1.6, -0.5, 0.42);
  polT = clamp(drag.pol + ((e.clientY - drag.y) / innerHeight) * 0.6, -0.1, 0.26);
});
const drop = () => { drag = null; };
canvas.addEventListener("pointerup", drop);
canvas.addEventListener("pointercancel", drop);
dlg.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") azT = clamp(azT + 0.12, -0.5, 0.42);
  if (e.key === "ArrowRight") azT = clamp(azT - 0.12, -0.5, 0.42);
});

dlg.addEventListener("click", (e) => {
  const pick = e.target.closest("[data-pick]");
  const how = e.target.closest("[data-lay]");
  if (pick && pick.dataset.pick !== current?.slug) show(pick.dataset.pick);
  if (how && how.dataset.lay !== lay) {
    lay = how.dataset.lay;
    dlg.querySelectorAll("[data-lay]").forEach((b) => b.setAttribute("aria-pressed", String(b === how)));
    show(current.slug);
  }
  if (e.target.closest("[data-room-close]")) dlg.close();
  if (e.target.closest("[data-r-ask]")) {
    // Carry the timber into the quote form, here or on the contact page.
    try { sessionStorage.setItem("liemex-ask", `${current.name}${lay === "herringbone" ? ", laid herringbone" : ""}`); } catch {}
    const form = document.querySelector("[data-enquiry]");
    if (form) { e.preventDefault(); dlg.close(); document.dispatchEvent(new CustomEvent("liemex:ask")); document.getElementById("quote")?.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth" }); }
  }
});
dlg.addEventListener("close", () => { open = false; cancelAnimationFrame(raf); document.documentElement.classList.remove("room-open"); });
addEventListener("resize", () => open && fit());
document.addEventListener("visibilitychange", () => { if (!open) return; cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(tick); });

export async function openRoom(slug) {
  if (open) return show(slug);
  open = true;
  az = azT = pol = polT = 0;
  dlg.classList.remove("is-ready", "is-dragged");
  document.documentElement.classList.add("room-open");
  dlg.showModal();
  fit();
  await show(slug, true);
  renderer.render(scene, camera);
  t0 = performance.now();
  raf = requestAnimationFrame(tick);
  requestAnimationFrame(() => dlg.classList.add("is-ready"));   // the planks lift
}
