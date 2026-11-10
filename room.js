// The room. Pick a timber and see it laid in a bright living room: the floor, the door, the skirting and two
// turned stools are in that species; the furniture stays cream and pale so the timber is the colour.
// Loaded only when someone opens it (site.js imports this file on the first click).
// An illustration: sharp grain is drawn over the real colours of our sample of each timber.
import * as THREE from "/vendor/three.module.min.js";
import { RoomEnvironment } from "/vendor/RoomEnvironment.js";
import { RoundedBoxGeometry } from "/vendor/jsm/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "/vendor/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "/vendor/jsm/meshopt_decoder.module.js";
import { EffectComposer } from "/vendor/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/vendor/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "/vendor/jsm/postprocessing/GTAOPass.js";
import { OutputPass } from "/vendor/jsm/postprocessing/OutputPass.js";

const species = JSON.parse(document.getElementById("species-data").textContent);
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const big = matchMedia("(min-width: 900px) and (pointer: fine)").matches;   // a desktop: afford the fine detail
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 4);
const rand = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const TAU = Math.PI * 2;
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
  <p class="room__note">An illustration drawn from our sample of each timber. Real boards vary in colour and grain; see them at the yard.</p>`;
document.body.append(dlg);
const $ = (s) => dlg.querySelector(s);
const canvas = $(".room__canvas");

/* ---------- Renderer ---------- */
const lite = !!window.__roomLite;   // set by film/film.html: skip the occlusion pass, which software rendering can't afford
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, powerPreference: "high-performance" });   // filming in software: every sample costs seconds
let ratio = lite ? 1 : Math.min(devicePixelRatio, 1.25);
renderer.setPixelRatio(ratio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;   // the cheaper filter; the sun's edges are softened by the blobs under things
renderer.shadowMap.autoUpdate = false;   // nothing in the room moves, so shadows are drawn once and reused
const reshadow = () => { renderer.shadowMap.needsUpdate = true; requestAnimationFrame(() => wake()); };
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.localClippingEnabled = true;
const maxAniso = renderer.capabilities.getMaxAnisotropy();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf3efe8);
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
const C = new THREE.Vector3(-1.0, 0, -0.6);          // the middle of the seating
const target = new THREE.Vector3(-0.9, 0.5, -0.5);

/* ---------- Small texture makers ---------- */
const tex = (c, rx = 1, ry = 1, color = true) => {
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = maxAniso;
  return t;
};
const cv = (w, h = w) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; };

// Bouclé and wool: a field of small loops, used as a bump map.
const loops = (size, n, seed) => {
  const [c, ctx] = cv(size);
  const r = rand(seed);
  ctx.fillStyle = "#777"; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < n; i++) {
    const g = 60 + r() * 190;
    ctx.strokeStyle = `rgb(${g},${g},${g})`;
    ctx.lineWidth = 1 + r() * 1.6;
    ctx.beginPath();
    ctx.arc(r() * size, r() * size, 1.5 + r() * 3.5, r() * TAU, r() * TAU + 2 + r() * 3);
    ctx.stroke();
  }
  return c;
};
const boucleBump = tex(loops(512, 9000, 7), 5, 5, false);
const boucle = new THREE.MeshStandardMaterial({ color: 0xf1ece2, roughness: 1, bumpMap: boucleBump, bumpScale: 1.6 });

const rugMaps = (() => {
  const [c, ctx] = cv(1024);
  const r = rand(11);
  ctx.fillStyle = "#ddd6c9"; ctx.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 26000; i++) {       // short woollen strokes in three off-whites
    ctx.strokeStyle = ["rgba(250,246,238,.5)", "rgba(196,186,170,.45)", "rgba(226,218,204,.6)"][i % 3];
    ctx.lineWidth = 1 + r() * 2;
    const x = r() * 1024, y = Math.round(r() * 128) * 8;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6 + r() * 14, y + (r() - 0.5) * 3); ctx.stroke();
  }
  return { map: tex(c, 2.4, 1.8), bump: tex(loops(512, 12000, 3), 7, 5.5, false) };
})();

const marble = (() => {
  const [c, ctx] = cv(1024);
  const r = rand(23);
  ctx.fillStyle = "#f2efea"; ctx.fillRect(0, 0, 1024, 1024);
  try { ctx.filter = "blur(3px)"; } catch {}
  for (let i = 0; i < 26; i++) {          // veins: wandering lines, a few bold, most faint
    const bold = i < 5;
    ctx.strokeStyle = bold ? `rgba(150,138,122,${0.3 + r() * 0.25})` : `rgba(170,160,148,${0.08 + r() * 0.16})`;
    ctx.lineWidth = bold ? 3 + r() * 7 : 1 + r() * 3;
    let x = r() * 1024, y = -40, a = 0.9 + r() * 1.3;
    ctx.beginPath(); ctx.moveTo(x, y);
    while (y < 1070 && x > -60 && x < 1090) { a += (r() - 0.5) * 0.7; x += Math.cos(a) * 46; y += Math.abs(Math.sin(a)) * 46 + 6; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  return new THREE.MeshPhysicalMaterial({ map: tex(c), roughness: 0.22, clearcoat: 0.5, clearcoatRoughness: 0.2 });
})();

const blob = (() => {                     // a soft contact shadow to sit under furniture
  const [c, ctx] = cv(256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(40,28,16,.55)"); g.addColorStop(0.55, "rgba(40,28,16,.22)"); g.addColorStop(1, "rgba(40,28,16,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
})();
const shadowBlob = (w, d, x, z, y = 0.006, o = 1) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: blob, transparent: true, opacity: o, depthWrite: false }));
  m.position.set(x, y, z);
  m.renderOrder = 2;
  scene.add(m);
  return m;
};

/* ---------- Shell ---------- */
const wallMat = new THREE.MeshStandardMaterial({ color: 0xf4f0e8, roughness: 0.96 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x24201c, roughness: 0.5, metalness: 0.4 });
const add = (geo, mat, x, y, z, cast = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = cast;
  m.receiveShadow = true;
  scene.add(m);
  return m;
};
const box = (w, h, d, mat, x, y, z, cast = true) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, cast);

const H = 2.9, BACK = -3.4, LEFT = -4.1, HEAD = 2.78;          // ceiling, back wall, glass wall, window head
box(13, H, 0.2, wallMat, 0.6, H / 2, BACK - 0.1);
box(13, 0.2, 12, wallMat, 0.6, H + 0.1, 1.6);
box(0.2, H - HEAD, 12, wallMat, LEFT - 0.1, (H + HEAD) / 2, 1.6);   // bulkhead over the glass
box(0.2, H, 0.5, wallMat, LEFT - 0.1, H / 2, BACK + 0.15);          // corner
// The glass wall: black aluminium frames, a head and a sill, a sliding door pair in the middle, and real glass.
const frameMat = new THREE.MeshStandardMaterial({ color: 0x17140f, roughness: 0.35, metalness: 0.7 });
const GX = LEFT - 0.04, SILL = 0.08;
box(0.12, 0.09, 12, frameMat, GX, HEAD - 0.045, 1.6, false);                 // head
box(0.14, SILL, 12, frameMat, GX, SILL / 2, 1.6, false);                     // sill
const posts = [BACK + 0.42, BACK + 1.95, BACK + 3.5, BACK + 5.05, BACK + 6.6, BACK + 8.15];
posts.forEach((z, i) => box(0.1, HEAD, i === 2 || i === 3 ? 0.11 : 0.075, frameMat, GX, HEAD / 2, z));
box(0.1, 0.06, 1.53, frameMat, GX, 2.06, BACK + 1.185, false);               // a transom over the first light
box(0.03, 0.2, 0.03, frameMat, GX + 0.07, 1.05, BACK + 3.62, false);         // door pull
const glass = new THREE.Mesh(new THREE.PlaneGeometry(12, HEAD).rotateY(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.1, envMapIntensity: 1.6, depthWrite: false }));
glass.position.set(GX, HEAD / 2, 1.6);
scene.add(glass);
// Outside: a bright, hazy outlook from high up, on a wide curved backdrop, with a terrace and a glass balustrade.
// It is pale on purpose: from inside a sunlit room the view is always washed out.
const outside = (() => {
  const t = new THREE.TextureLoader().load("/images/room-outlook.jpg");
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = maxAniso;
  const g = new THREE.CylinderGeometry(15, 15, 11.8, 48, 1, true, Math.PI * 1.5 - 0.92, 1.84);   // an arc facing the room
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, toneMapped: false, fog: false }));
  t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1;   // seen from inside the arc, so un-mirror the picture
  m.position.set(-3, 2.9, 0.6);   // the horizon sits low: mostly sky, a far suburb below it
  scene.add(m);
  const deck = box(2.7, 0.06, 13, new THREE.MeshStandardMaterial({ color: 0xb9b2a6, roughness: 0.9 }), LEFT - 1.42, -0.014, 1.6, false);   // its top sits just above the timber, which would otherwise show outside
  const rail = new THREE.Mesh(new THREE.PlaneGeometry(13, 1.05).rotateY(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xdfeee9, roughness: 0.05, transparent: true, opacity: 0.16, depthWrite: false }));
  rail.position.set(LEFT - 2.5, 0.55, 1.6);
  scene.add(rail);
  box(0.04, 0.04, 13, frameMat, LEFT - 2.5, 1.09, 1.6, false);
  return m;
})();
// Recessed downlights.
const spot = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.0, 1.7) });
[[-2.2, -2.2], [0.2, -2.2], [-2.2, 0.4], [0.2, 0.4], [2.4, -1]].forEach(([x, z]) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.05, 20).rotateX(Math.PI / 2), spot); d.position.set(x, H - 0.002, z); scene.add(d); });

// Sheers: floor-to-ceiling linen in an S-fold, hung from a recessed track. Thin enough to see the outlook
// through, brighter where the folds overlap less, and gathered a little tighter at each end.
const weave = (() => {
  const [c, ctx] = cv(256);
  const r = rand(5);
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 2) { ctx.fillStyle = `rgba(120,110,95,${0.05 + r() * 0.12})`; ctx.fillRect(i, 0, 1, 256); }
  for (let i = 0; i < 256; i += 3) { ctx.fillStyle = `rgba(120,110,95,${0.03 + r() * 0.08})`; ctx.fillRect(0, i, 256, 1); }
  return c;
})();
const sheer = (glow, opacity) => new THREE.MeshStandardMaterial({ color: 0xf3ece0, emissive: 0xfff3e0, emissiveIntensity: glow, roughness: 1, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false, map: tex(weave, 1, 1), alphaMap: tex(weave, 1, 1, false) });
const curtain = (len, mat, x, z, alongZ, seed) => {
  const DROP = HEAD - 0.02, COLS = Math.round(len * 90), ROWS = 10;
  const g = new THREE.PlaneGeometry(len, DROP, COLS, ROWS);
  const p = g.attributes.position, r = rand(seed);
  const ph = r() * 6, wob = r() * 6;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i), v = p.getY(i) / DROP + 0.5;                       // v: 0 at the hem, 1 at the track
    const fold = Math.sin(u * 26 + ph);                                    // one S-fold every 24 cm
    const loose = 1 + (1 - v) * 0.35;                                      // folds open a little towards the hem
    p.setZ(i, (fold * 0.055 + Math.sin(u * 7.3 + wob) * 0.012 * (1 - v)) * loose);
    p.setX(i, u + Math.sin(u * 26 + ph + 1.57) * 0.012 * (1 - v));
  }
  g.computeVertexNormals();
  g.attributes.uv.array.forEach((_, i, a) => { if (i % 2 === 0) a[i] *= len * 3; else a[i] *= 6; });
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, DROP / 2 + 0.012, z);
  if (alongZ) m.rotation.y = Math.PI / 2;
  m.renderOrder = 2;
  scene.add(m);
};
const day = sheer(0.34, 0.62), dim = sheer(0.4, 0.9);
const CX = LEFT + 0.24;
curtain(2.9, day, CX, BACK + 1.6, true, 3);            // over the glass at the back
curtain(4.4, day, CX, BACK + 7.9, true, 9);            // over the glass towards you; between them the doors are clear
curtain(2.7, dim, LEFT + 1.6, BACK + 0.22, false, 14); // returning along the back wall
// A shadow-gap track recessed into the ceiling, running the length of the glass and round the corner.
const gap = new THREE.MeshBasicMaterial({ color: 0x0f0d0a });
box(0.16, 0.012, 12.2, gap, CX, H - 0.004, 1.5, false);
box(3.2, 0.012, 0.16, gap, LEFT + 1.6, H - 0.004, BACK + 0.22, false);

/* ---------- Timber: one material for the door, skirting and stools ---------- */
const timber = new THREE.MeshStandardMaterial({ roughness: 0.36 });
box(8.6, 0.14, 0.02, timber, 1.6, 0.07, BACK + 0.01);                      // skirting
const DX = 1.9;                                                             // a four-panel door, as in the catalogue
box(0.86, 2.1, 0.04, timber, DX, 1.05, BACK + 0.03);
[[-0.2, 1.52, 0.27, 0.78], [0.2, 1.52, 0.27, 0.78], [-0.2, 0.55, 0.27, 0.72], [0.2, 0.55, 0.27, 0.72]].forEach(([x, y, w, h]) => {
  box(w, h, 0.012, timber, DX + x, y, BACK + 0.052);
  box(w + 0.05, 0.02, 0.02, timber, DX + x, y + h / 2 + 0.01, BACK + 0.056, false);
  box(w + 0.05, 0.02, 0.02, timber, DX + x, y - h / 2 - 0.01, BACK + 0.056, false);
});
box(0.09, 2.1, 0.03, timber, DX - 0.475, 1.05, BACK + 0.02);
box(0.09, 2.1, 0.03, timber, DX + 0.475, 1.05, BACK + 0.02);
box(1.04, 0.09, 0.03, timber, DX, 2.145, BACK + 0.02);
add(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 12), darkMat, DX + 0.33, 1.02, BACK + 0.085);
// Turned stools.
const stoolGeo = new THREE.LatheGeometry([[0, 0], [0.17, 0], [0.185, 0.03], [0.17, 0.1], [0.11, 0.17], [0.1, 0.22], [0.13, 0.27], [0.19, 0.33], [0.2, 0.4], [0.19, 0.46], [0.165, 0.48], [0, 0.48]].map(([x, y]) => new THREE.Vector2(x, y)), 48);
add(stoolGeo, timber, -0.35, 0, 0.95);
add(stoolGeo, timber, 1.75, 0, -1.0);
shadowBlob(0.8, 0.8, -0.35, 0.95);
shadowBlob(0.8, 0.8, 1.75, -1.0);

/* ---------- Furniture ----------
   Nine models made for this room (models/tripo, each about one unit across, facing +z), set to real sizes here.
   The rug is drawn in code. */
const rug = add(new RoundedBoxGeometry(3.9, 0.02, 3.3, 2, 0.01), new THREE.MeshStandardMaterial({ map: rugMaps.map, bumpMap: rugMaps.bump, bumpScale: 2.2, roughness: 1 }), -0.75, 0.01, -0.75, false);
shadowBlob(4.4, 3.8, -0.75, -0.75, 0.004, 0.5);               // under the rug's edge

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const model = (id, x, y, z, ry = 0, s = 1, tweak) => loader.loadAsync(`/models/tripo/${id}.glb`).then((g) => {
  g.scene.position.set(x, y, z);
  g.scene.rotation.y = ry;
  g.scene.scale.setScalar(s);
  g.scene.traverse((m) => { if (!m.isMesh) return; m.castShadow = m.receiveShadow = true; if (m.material.map) m.material.map.anisotropy = maxAniso; tweak?.(m); });
  scene.add(g.scene);
  reshadow();
}).catch(() => {});
const SX = -2.72, SZ = -0.75;                                  // sofa, its back to the glass
const TX = -0.95, TZ = -0.75, TOP = 0.3 * 1.36;                // coffee table and the height of its top
const CHX = 0.95, CHZ = -1.85;                                 // lounge chair
const LAMP = new THREE.Vector3(TX, 1.62, TZ);                  // foot of the paper lantern
const cool = (m) => m.material.color.setRGB(0.93, 0.97, 1.08);   // the low sun is warm; keep the cream upholstery from going yellow
const furniture = Promise.all([
  model("sofa", SX, 0, SZ, Math.PI / 2, 3.1, cool),
  model("coffee-table", TX, 0, TZ, Math.PI / 2, 1.36),
  model("books", TX + 0.02, TOP, TZ + 0.3, 0.25, 0.36),
  model("vase", TX - 0.05, TOP, TZ - 0.36, 0.6, 0.44),
  model("chair", CHX, 0, CHZ, Math.atan2(TX - CHX, TZ - CHZ), 1.08, cool),
  model("olive-tree", -3.2, 0, 1.45, 0.8, 1.95, (m) => m.material.color.setRGB(1.35, 1.35, 1.3)),
  model("sideboard", 0.1, 0, BACK + 0.34, 0, 2.05),
  model("floor-lamp", -3.0, 0, -2.75, 0, 1.6, (m) => { m.castShadow = false; }),
  model("pendant", LAMP.x, LAMP.y, LAMP.z, 0, 0.74, (m) => { m.castShadow = false; m.material.emissive = new THREE.Color(0xfff0d6); m.material.emissiveMap = m.material.map; m.material.emissiveIntensity = 0.75; }),
]);
box(0.006, H - LAMP.y - 0.7, 0.006, darkMat, LAMP.x, (H + LAMP.y + 0.7) / 2, LAMP.z, false);   // the lantern's cord, up to the ceiling
shadowBlob(2.4, 4.0, SX + 0.1, SZ, 0.021, 0.75);
shadowBlob(1.5, 2.1, TX, TZ, 0.022, 0.9);
shadowBlob(1.5, 1.5, CHX, CHZ, 0.022);
shadowBlob(1.0, 1.0, -3.2, 1.45);
shadowBlob(2.5, 1.0, 0.1, BACK + 0.4);
shadowBlob(0.6, 0.6, -3.0, -2.75);

/* ---------- Light ---------- */
scene.add(new THREE.HemisphereLight(0xffffff, 0xd8c4a8, 1.25));
const sun = new THREE.DirectionalLight(0xfff0dc, 4.4);
sun.position.set(-12, 6.2, 4.4);
sun.target.position.set(-0.6, 0, -0.9);
sun.castShadow = true;
sun.shadow.mapSize.set(big ? 2048 : 1024, big ? 2048 : 1024);
Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
sun.shadow.bias = -0.0003;
sun.shadow.normalBias = 0.02;
sun.shadow.radius = 6;
scene.add(sun, sun.target);
const fill = new THREE.DirectionalLight(0xfff4e6, 0.55);      // bounce back from the room behind you
fill.position.set(5, 3, 6);
scene.add(fill);
const glow = new THREE.PointLight(0xffd9a8, 1.6, 6, 2);       // the paper lantern
glow.position.set(LAMP.x, LAMP.y + 0.35, LAMP.z);
scene.add(glow);

// Reflections: what the room itself looks like from its middle, so the glass wall glints across the floor.
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.5;
const bakeEnv = () => {
  const hide = [floor, laying, rug];
  hide.forEach((m) => { m.visible = false; });
  const spare = scene.environment;
  scene.environment = null;
  const p = scene.position.clone();
  scene.position.set(-C.x, -1.1, -C.z);            // PMREM looks out from the origin
  scene.updateMatrixWorld(true);
  const t = pmrem.fromScene(scene, 0.02, 0.1, 40).texture;
  scene.position.copy(p);
  scene.updateMatrixWorld(true);
  hide.forEach((m) => { m.visible = true; });
  laying.visible = false;
  spare.dispose();
  scene.environment = t;
  scene.environmentIntensity = 0.85;
};

/* ---------- The floor ----------
   Real colour comes from our sample of the timber (a strip of it under every board). Real sharpness comes from
   grain drawn over the top, in tones taken from that sample, so it holds up close on a big screen. A second,
   grey canvas gives each board its own sheen and a hairline shadow at every joint. */
const SIZE = 2048, K = 1, FLOOR = 13;   // 4096 looked no better at room distance and took four times as long to paint
const images = new Map();
const loadImage = (slug) => images.get(slug) || images.set(slug, new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = `/images/species/${slug}-v.webp`; })).get(slug);
const tones = new Map();
const tonesOf = (slug, im) => {
  if (tones.has(slug)) return tones.get(slug);
  const [, ctx] = cv(24, 60);
  ctx.drawImage(im, 0, 0, 24, 60);
  const d = ctx.getImageData(0, 0, 24, 60).data, px = [];
  for (let i = 0; i < d.length; i += 4) px.push([d[i], d[i + 1], d[i + 2], d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11]);
  px.sort((a, b) => a[3] - b[3]);
  const avg = (a) => a.reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0]).map((v) => Math.round(v / a.length));
  const n = px.length, dark = avg(px.slice(0, n * 0.12)).map((v) => Math.round(v * 0.62)), light = avg(px.slice(n * 0.9)).map((v) => Math.min(255, Math.round(v * 1.1 + 12)));
  return tones.set(slug, { dark: dark.join(","), light: light.join(",") }).get(slug);
};

const plank = (ctx, gtx, im, tn, r, x, y, w, h, across) => {
  [ctx, gtx].forEach((c) => { c.save(); c.translate(x, y); if (across) { c.rotate(-Math.PI / 2); c.translate(-h, 0); } });
  if (across) [w, h] = [h, w];
  const sw = im.width * (0.17 + r() * 0.3), sh = im.height * (0.4 + r() * 0.48);   // a strip of the sample, whatever its size
  ctx.drawImage(im, r() * (im.width - sw), r() * (im.height - sh), sw, sh, 0, 0, w, h);
  const tone = r() - 0.5;
  ctx.fillStyle = tone > 0 ? `rgba(${tn.light},${tone * 0.22})` : `rgba(${tn.dark},${-tone * 0.3})`;
  ctx.fillRect(0, 0, w, h);
  ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
  // Grain: fine lines running the length of the board, wandering a little.
  const n = Math.round((w / K) * (0.55 + r() * 0.5)), seg = 9;
  for (let i = 0; i < n; i++) {
    const u = r() * w, amp = (0.6 + r() * 3.6) * K, fq = 0.5 + r() * 1.8, ph = r() * TAU, lean = (r() - 0.5) * 5 * K;
    ctx.strokeStyle = r() < 0.72 ? `rgba(${tn.dark},${0.05 + r() * 0.2})` : `rgba(${tn.light},${0.05 + r() * 0.14})`;
    ctx.lineWidth = (0.4 + r() * 1.3) * K;
    ctx.beginPath();
    for (let s = 0; s <= seg; s++) { const t = s / seg; ctx.lineTo(u + Math.sin(t * TAU * fq + ph) * amp + lean * t, t * h); }
    ctx.stroke();
  }
  if (r() < 0.3) {                         // a back-sawn board: cathedral arches up the middle
    const cx = w * (0.35 + r() * 0.3), cy = h * (0.2 + r() * 0.6);
    for (let k = 1; k < 7; k++) { ctx.strokeStyle = `rgba(${tn.dark},${0.1 + r() * 0.12})`; ctx.lineWidth = (0.6 + r()) * K; ctx.beginPath(); ctx.ellipse(cx, cy, w * 0.07 * k, h * 0.07 * k * (1 + r() * 0.3), 0, Math.PI, TAU); ctx.stroke(); }
  }
  ctx.strokeStyle = `rgba(${tn.dark},0.85)`; ctx.lineWidth = 1.6 * K; ctx.strokeRect(0, 0, w, h);
  const g = Math.round(150 + r() * 95);    // sheen and height of this board
  gtx.fillStyle = `rgb(${g},${g},${g})`; gtx.fillRect(0, 0, w, h);
  gtx.strokeStyle = "rgb(30,30,30)"; gtx.lineWidth = 2.4 * K; gtx.strokeRect(0, 0, w, h);
  ctx.restore(); gtx.restore();
};

const paint = (im, tn, lay, seed) => {
  const [c, ctx] = cv(SIZE), [gc, gtx] = cv(SIZE);
  const r = rand(seed);
  ctx.drawImage(im, 0, 0, SIZE, SIZE);     // undercoat, so no gap can ever show through
  gtx.fillStyle = "#aaa"; gtx.fillRect(0, 0, SIZE, SIZE);
  if (lay === "herringbone") {
    // Blocks five times as long as wide. The pattern repeats every 2L both ways, so the canvas tiles.
    const L = SIZE / 8, W = L / 5;
    for (let a = -12; a < 54; a++) for (let b = -9; b < 6; b++) {
      const x = a * W + b * 2 * L, y = a * W;
      if (x > SIZE || x < -2 * L) continue;
      for (const oy of [0, -SIZE, SIZE]) { plank(ctx, gtx, im, tn, r, x, y + oy, L, W, true); plank(ctx, gtx, im, tn, r, x + L, y + oy - (L - W), W, L, false); }
    }
  } else {
    const n = 26, W = SIZE / n;
    for (let i = 0; i < n; i++) {
      let y = -r() * 600 * K;
      while (y < SIZE) { const len = (520 + r() * 620) * K; plank(ctx, gtx, im, tn, r, i * W, y, W, len, false); if (y + len > SIZE) plank(ctx, gtx, im, tn, r, i * W, y - SIZE, W, len, false); y += len; }
    }
  }
  const span = lay === "herringbone" ? 3.6 : 3.9;   // metres one canvas covers: 90 mm blocks, 150 mm boards
  const make = (cnv, color) => { const t = tex(cnv, FLOOR / span, FLOOR / span, color); if (lay === "herringbone") { t.center.set(0.5, 0.5); t.rotation = Math.PI / 4; } return t; };
  return { map: make(c, true), grey: make(gc, false) };
};

// The door, skirting and stools: long boards of the same timber.
const paintTimber = (im, tn, seed) => {
  const [c, ctx] = cv(1024, 2048), [, gtx] = cv(8);
  const r = rand(seed), k = K;
  ctx.drawImage(im, 0, 0, 1024, 2048);
  for (let i = 0; i < 4; i++) plank(ctx, gtx, im, tn, r, i * 256, -4, 256, 2056, false);
  return tex(c);
};

const floorGeo = new THREE.PlaneGeometry(FLOOR, FLOOR).rotateX(-Math.PI / 2);
const makeFloor = (y) => {
  const m = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ roughness: 0.5, bumpScale: 0.9, envMapIntensity: 1.35 }));   // a plain material: the lacquer layer doubled the cost of every floor pixel
  m.position.set(0.6, y, 1.6);
  m.receiveShadow = true;
  scene.add(m);
  return m;
};
const floor = makeFloor(0), laying = makeFloor(0.0015);
const edge = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);   // boards are laid from the back wall towards you
laying.material.clippingPlanes = [edge];
laying.visible = false;
const dress = (m, t) => { m.material.map = t.map; m.material.roughnessMap = t.grey; m.material.bumpMap = t.grey; m.material.needsUpdate = true; };

/* ---------- Fine detail on a desktop: soft occlusion where things meet ---------- */
let composer = null, gtao = null;
if (false) {   // the occlusion pass cost more than half of every frame; the soft blobs under the furniture do its job
  composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 }));
  composer.addPass(new RenderPass(scene, camera));
  gtao = new GTAOPass(scene, camera, 4, 4);
  gtao.blendIntensity = 0.85;
  gtao.updateGtaoMaterial({ radius: 0.45, distanceExponent: 1.4, thickness: 1.2, scale: 1.15, samples: 16 });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
  composer.addPass(gtao);
  composer.addPass(new OutputPass());
}
let fine = false, frames = 0, spent = 0, last = 0;
const draw = () => (fine ? composer.render() : renderer.render(scene, camera));
// If the first second of frames is slow, this machine can't afford the fine detail: drop to the plain renderer.
// Watch the frame time while the camera is moving and step the resolution down until it is smooth.
const pace = (now) => {
  if (lite) return;   // being filmed: keep full resolution
  if (last && now - last < 200) { spent += now - last; frames++; }
  last = now;
  if (frames < 24) return;
  const avg = spent / frames;
  frames = 0; spent = 0;
  if (avg > 21 && ratio > 0.7) { ratio = Math.max(0.7, ratio - 0.2); renderer.setPixelRatio(ratio); fit(); }
};

/* ---------- State ---------- */
let current = null, lay = "boards", open = false, raf = 0, job = 0, baked = false;
let az = 0, pol = 0, azT = 0, polT = 0, t0 = 0, layT = null, pending = null;
const fit = () => {
  const w = dlg.clientWidth, h = dlg.clientHeight;
  renderer.setSize(w, h, false);
  composer?.setPixelRatio(renderer.getPixelRatio());
  composer?.setSize(w, h);
  camera.aspect = w / h;
  camera.fov = w < h ? 60 : 38;
  if (w > 900) camera.setViewOffset(w, h, -w * 0.07, 0, w, h); else camera.clearViewOffset();   // leave room for the panel
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
  dlg.querySelectorAll("[data-pick]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pick === s.slug)));
  const im = await loadImage(s.slug);
  if (mine !== job) return;
  const tn = tonesOf(s.slug, im), seed = species.indexOf(s) * 97 + (lay === "boards" ? 1 : 5);
  const t0 = performance.now();
  const next = paint(im, tn, lay, seed), wood = paintTimber(im, tn, seed + 3);
  window.__roomPaintMs = Math.round(performance.now() - t0);
  const done = () => {
    floor.material.map?.dispose(); floor.material.roughnessMap?.dispose();
    dress(floor, next);
    timber.map?.dispose();
    timber.map = wood;
    timber.needsUpdate = true;
    laying.visible = false;
    layT = null;
    wake();
  };
  if (instant || reduce.matches || !floor.material.map) return done();
  dress(laying, next);
  laying.visible = true;
  layT = performance.now();
  wake();
  pending = done;
};

// Draw only while something is changing: the arrival, a drag settling, or a floor being laid. Then stop, so the
// page stays quick and the graphics card rests. wake() starts it again.
let running = false, still = 0;
const wake = () => { still = 0; if (!running && open) { running = true; last = 0; raf = requestAnimationFrame(tick); } };
const tick = (now) => {
  pace(now);
  const arriving = !reduce.matches && now - t0 < 3200;
  const arrive = reduce.matches ? 1 : easeOut(clamp((now - t0 - 250) / 2800));
  const moved = Math.abs(azT - az) + Math.abs(polT - pol);
  az += (azT - az) * 0.2;                        // follows the hand closely
  pol += (polT - pol) * 0.2;
  const a = 0.74 + az, p = 0.24 + pol, d = 7.4 * (1.36 - 0.36 * arrive);
  camera.position.set(target.x + Math.sin(a) * Math.cos(p) * d, target.y + Math.sin(p) * d + 0.3, target.z + Math.cos(a) * Math.cos(p) * d);
  camera.lookAt(target);
  if (layT !== null) {
    const t = clamp((now - layT) / 1600);
    edge.constant = BACK + easeIO(t) * 11;
    if (t === 1) { pending?.(); pending = null; }
  }
  draw();
  still = arriving || drag || layT !== null || moved > 0.0004 ? 0 : still + 1;
  if (still > 3) { running = false; return; }
  raf = requestAnimationFrame(tick);
};

/* ---------- Controls ---------- */
let drag = null;
canvas.addEventListener("pointerdown", (e) => { wake(); drag = { x: e.clientX, y: e.clientY, az: azT, pol: polT }; canvas.setPointerCapture(e.pointerId); dlg.classList.add("is-dragged"); });
canvas.addEventListener("pointermove", (e) => {
  if (!drag) return;
  azT = clamp(drag.az - ((e.clientX - drag.x) / innerWidth) * 1.6, -0.5, 0.32);
  wake();
  polT = clamp(drag.pol + ((e.clientY - drag.y) / innerHeight) * 0.6, -0.1, 0.24);
});
const drop = () => { drag = null; };
canvas.addEventListener("pointerup", drop);
canvas.addEventListener("pointercancel", drop);
dlg.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") azT = clamp(azT + 0.12, -0.5, 0.32);
  if (e.key === "ArrowRight") azT = clamp(azT - 0.12, -0.5, 0.32);
  wake();
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
dlg.addEventListener("close", () => { open = false; running = false; cancelAnimationFrame(raf); document.documentElement.classList.remove("room-open"); });
addEventListener("resize", () => { if (open) { fit(); wake(); } });
document.addEventListener("visibilitychange", () => { if (!open) return; cancelAnimationFrame(raf); running = false; if (!document.hidden) wake(); });

export async function openRoom(slug) {
  if (open) return show(slug);
  open = true;
  az = azT = pol = polT = 0;
  dlg.classList.remove("is-ready", "is-dragged");
  document.documentElement.classList.add("room-open");
  dlg.showModal();
  fit();
  // Wait for the timber and (briefly) the furniture, so the planks lift on a finished room.
  await Promise.all([show(slug, true), Promise.race([furniture, new Promise((r) => setTimeout(r, 1200))])]);
  reshadow();
  if (!baked) { baked = true; furniture.then(() => { bakeEnv(); reshadow(); }); }
  t0 = performance.now();
  last = 0;
  running = false;
  wake();
  requestAnimationFrame(() => dlg.classList.add("is-ready"));
}
