// Liemex. No dependencies. The motion engine first, then the page, then one block per section.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => t * t * (3 - 2 * t);
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  const motionOK = () => !mq.matches;
  const wide = matchMedia("(min-width: 1000px)");

  /* ---------- Engine ---------- */
  // One scroll loop. Jobs read layout and return a function that writes, so reads and writes never interleave.
  const jobs = [];
  let queued = false;
  const frame = () => {
    queued = false;
    const writes = jobs.map((fn) => fn()).filter(Boolean);
    writes.forEach((w) => w());
  };
  const kick = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  const onScrollFrame = (fn) => { jobs.push(fn); kick(); };
  addEventListener("scroll", kick, { passive: true });
  addEventListener("resize", kick);

  // Headings: wrap each word in a mask so it can rise.
  $$("[data-split]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><span style="--n:${i}">${w}</span></span>`).join(" ");
  });
  // Photos: five planks lift off.
  $$('[data-reveal="photo"]').forEach((el) => {
    el.insertAdjacentHTML("beforeend", `<span class="planks" aria-hidden="true">${[2, 0, 3, 1, 4].map((k) => `<i style="--k:${k}"></i>`).join("")}</span>`);
  });
  // Drawings: strokes draw in order.
  $$("[data-draw]").forEach((svg) => $$("[pathLength]", svg).forEach((p, k) => p.style.setProperty("--k", k)));

  // Reveal on scroll. Things already on screen at load rest in place; siblings arriving together are staggered.
  const all = $$("[data-split], [data-reveal], [data-rule], [data-draw], [data-rack]");
  all.filter((el) => el.closest("[data-hero]")).forEach((el) => el.classList.add("is-in")); // the hero runs its own opening
  const targets = all.filter((el) => !el.closest("[data-hero]"));
  if ("IntersectionObserver" in window) {
    let first = true;
    const io = new IntersectionObserver((entries) => {
      const batch = entries.filter((e) => e.isIntersecting);
      batch.forEach((e, i) => {
        const el = e.target;
        if (first) el.classList.add("is-instant");
        else el.style.setProperty("--d", `${Math.min(i, 5) * 80}ms`);
        el.classList.add("is-in");
        io.unobserve(el);
      });
      if (first) { first = false; requestAnimationFrame(() => requestAnimationFrame(() => $$(".is-instant").forEach((el) => el.classList.remove("is-instant")))); }
    }, { rootMargin: "0px 0px -10% 0px" });
    targets.forEach((el) => io.observe(el));
  } else targets.forEach((el) => el.classList.add("is-in"));

  // Statements: words darken as they cross the reading line.
  $$("[data-words]").forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="wd">${w}</span>`).join(" ");
    const words = $$(".wd", el);
    onScrollFrame(() => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = motionOK() ? clamp((innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.3)) : 1;
      const lit = p * (words.length + 6);
      return () => words.forEach((w, i) => { w.style.opacity = clamp(0.16 + (lit - i) / 6 * 0.84, 0.16, 1); });
    });
  });

  /* ---------- Page ---------- */
  // Header: clear over the hero, hides on the way down, returns on the way up.
  const header = $("[data-header]");
  const callbar = $("[data-callbar]");
  let lastY = scrollY;
  onScrollFrame(() => {
    const y = scrollY;
    const away = y > 400 && y > lastY + 2 ? true : y < lastY - 2 ? false : null;
    lastY = y;
    return () => {
      header.classList.toggle("is-stuck", y > 40);
      if (away !== null) header.classList.toggle("is-away", away);
      if (callbar) callbar.classList.toggle("is-on", y > innerHeight * 0.8);
    };
  });

  const btn = $("[data-menu-btn]");
  const menu = $("[data-menu]");
  const setMenu = (open) => {
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    header.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  btn.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
  addEventListener("keydown", (e) => e.key === "Escape" && !menu.hidden && (setMenu(false), btn.focus()));
  matchMedia("(min-width: 1101px)").addEventListener("change", (e) => e.matches && setMenu(false));

  // Hero: the photo and the ruler drift as the page leaves.
  const hero = $("[data-hero]");
  if (hero) onScrollFrame(() => {
    const p = clamp(scrollY / innerHeight);
    if (!motionOK() || scrollY > innerHeight * 1.2) return;
    return () => hero.style.setProperty("--hp", p.toFixed(4));
  });

  /* ---------- The rack ---------- */
  const rack = $("[data-rack]");
  if (rack) {
    const boards = $$("[data-board]", rack);
    const count = $("[data-rack-count]");
    const open = (b) => {
      boards.forEach((x) => x.classList.toggle("is-open", x === b));
      if (count) count.textContent = `${String(boards.indexOf(b) + 1).padStart(2, "0")} / ${boards.length}`;
    };
    const hover = matchMedia("(hover: hover) and (min-width: 821px)");
    boards.forEach((b) => {
      b.addEventListener("pointerenter", () => hover.matches && open(b));
      b.addEventListener("focus", () => open(b));
      // On touch the first tap opens a board; a tap on the open board lays it in the room.
      b.addEventListener("click", (e) => { if (!hover.matches && !b.classList.contains("is-open")) { e.preventDefault(); e.stopImmediatePropagation(); open(b); b.scrollIntoView({ behavior: motionOK() ? "smooth" : "auto", inline: "center", block: "nearest" }); } });
    });
  }

  /* ---------- The bench: one board, sawn to laid ---------- */
  const benchEl = $("[data-bench]");
  if (benchEl) {
    const X0 = 296, X1 = 904, Y0 = 206, Y1 = 294, T1 = 236, T2 = 264, TG = 24, W = X1 - X0;
    const jit = [[-5, -7], [6, -4], [4, 3], [5, -2], [3, 4], [6, 2], [-3, 6], [5, 7], [-6, 2], [-4, -3], [-5, 4], [-7, -2]]; // saw wobble
    const polys = $$("[data-b-poly], [data-b-clip]", benchEl);
    const stage = $("[data-b-stage]", benchEl);
    const rings = $("[data-b-rings]", benchEl);
    const finish = $("[data-b-finish]", benchEl);
    const dims = $("[data-b-dims]", benchEl);
    const nbs = $$("[data-b-nb] polygon", benchEl);
    const stepEls = $$("[data-bench-step]", benchEl);
    const countEl = $("[data-bench-count]", benchEl);
    const shape = (rough, tg) => [[X0, Y0], [X1, Y0], [X1, T1], [X1 + tg, T1], [X1 + tg, T2], [X1, T2], [X1, Y1], [X0, Y1], [X0, T2], [X0 + tg, T2], [X0 + tg, T1], [X0, T1]]
      .map(([x, y], i) => `${(x + jit[i][0] * rough * 1.6).toFixed(1)},${(y + jit[i][1] * rough * 1.6 + (y < 250 ? -8 : 8) * rough).toFixed(1)}`).join(" ");
    const draw = (s) => {
      const rough = 1 - ease(clamp(s));               // 0→1 sawn to dressed
      const tg = TG * ease(clamp(s - 1));              // 1→2 tongue and groove
      const fin = ease(clamp(s - 2));                  // 2→3 lacquer
      const laid = ease(clamp(s - 3));                 // 3→4 laid
      const pts = shape(rough, tg);
      polys.forEach((p) => p.setAttribute("points", pts));
      rings.style.opacity = clamp(0.35 + s * 1.2);
      finish.style.strokeDashoffset = 1 - fin;
      dims.style.opacity = clamp((s - 0.55) * 3) * (1 - clamp(laid * 3));
      const sc = lerp(1, 0.62, laid);
      stage.setAttribute("transform", `translate(${600 * (1 - sc)} ${250 * (1 - sc)}) scale(${sc})`);
      nbs.forEach((n) => {
        const k = +n.dataset.k;
        const t = ease(clamp(laid * 1.5 - (Math.abs(k) - 1) * 0.35));
        n.setAttribute("points", shape(0, TG).split(" ").map((pt) => { const [x, y] = pt.split(","); return `${(+x + k * W + Math.sign(k) * 520 * (1 - t)).toFixed(1)},${y}`; }).join(" "));
        n.style.opacity = t;
      });
      const idx = Math.min(4, Math.round(s));
      stepEls.forEach((el, i) => el.classList.toggle("is-on", i === idx));
      if (countEl) countEl.textContent = `0${idx + 1} / 05`;
    };
    const setup = () => {
      const pin = motionOK();
      benchEl.classList.toggle("is-pinned", pin);
      if (!pin) { draw(4); stepEls.forEach((el) => el.classList.add("is-on")); }
    };
    setup();
    mq.addEventListener("change", setup);
    onScrollFrame(() => {
      if (!benchEl.classList.contains("is-pinned")) return;
      const r = benchEl.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      const p = clamp(-r.top / (r.height - innerHeight));
      return () => draw(clamp(p * 4.4 - 0.2, 0, 4));
    });
  }

  /* ---------- Work: the section holds while the photos run sideways ---------- */
  const track = $("[data-track]");
  if (track) {
    const run = $("[data-track-run]", track);
    const bar = $("[data-track-bar]", track);
    const count = $("[data-track-count]", track);
    const cards = $$(".tk", run);
    let dist = 0;
    const measure = () => {
      const pin = motionOK() && wide.matches;
      track.classList.toggle("is-pinned", pin);
      if (!pin) { track.style.height = ""; run.style.transform = ""; return; }
      dist = Math.max(0, run.scrollWidth - innerWidth);
      track.style.height = `${innerHeight + dist}px`;
    };
    measure();
    addEventListener("resize", measure);
    addEventListener("load", measure);
    mq.addEventListener("change", measure);
    const view = $(".work__view", track);
    onScrollFrame(() => {
      const pinned = track.classList.contains("is-pinned");
      const r = track.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      const p = pinned ? clamp(-r.top / Math.max(1, r.height - innerHeight)) : clamp(view.scrollLeft / Math.max(1, view.scrollWidth - view.clientWidth));
      const mid = innerWidth * 0.5;
      let idx = 0;
      cards.forEach((c, i) => { if (c.getBoundingClientRect().left < mid) idx = i; });
      return () => {
        if (pinned) run.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
        bar.style.setProperty("--tp", p.toFixed(4));
        count.textContent = `${String(idx + 1).padStart(2, "0")} / ${cards.length}`;
      };
    });
    view.addEventListener("scroll", kick, { passive: true });
  }

  /* ---------- Calculator ---------- */
  const area = $("[data-calc-area]");
  if (area) {
    const width = $("[data-calc-width]");
    const out = $("[data-calc-out]");
    const areaOut = $("[data-calc-area-out]");
    const floor = $("[data-calc-floor]");
    const send = $("[data-calc-send]");
    let shown = 0, raf = 0;
    const metres = () => Math.ceil((+area.value / (+width.value / 1000)) * 1.1);
    const update = () => {
      const target = metres();
      areaOut.textContent = `${area.value} m²`;
      floor.style.setProperty("--bw", `${Math.round(+width.value * 0.42)}px`);
      cancelAnimationFrame(raf);
      if (!motionOK()) { shown = target; out.textContent = target.toLocaleString("en-AU"); return; }
      const from = shown, t0 = performance.now();
      const tick = (now) => {
        const t = clamp((now - t0) / 500);
        shown = Math.round(lerp(from, target, 1 - Math.pow(1 - t, 3)));
        out.textContent = shown.toLocaleString("en-AU");
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    area.addEventListener("input", update);
    width.addEventListener("change", update);
    update();
    send.addEventListener("click", () => {
      const msg = $('[data-enquiry] textarea[name="message"]');
      const name = width.selectedOptions[0].dataset.name;
      if (msg && !msg.value) msg.value = `${name}: about ${metres()} lineal metres for ${area.value} m² (from the website calculator).`;
    });
  }

  /* ---------- The room: three.js loads on the first click, never before ---------- */
  const canGL = (() => { try { return !!document.createElement("canvas").getContext("webgl2"); } catch { return false; } })();
  if (canGL && $("#species-data")) {
    document.documentElement.classList.add("has-room");
    let loading = null;
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-room]");
      if (!el || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      el.classList.add("is-loading");
      loading = loading || import("/room.js");
      loading.then((m) => m.openRoom(el.dataset.room)).catch(() => { location.href = el.href; }).finally(() => el.classList.remove("is-loading"));
    });
  }
  // A timber chosen in the room is carried into the quote form.
  const carry = () => {
    let ask = "";
    try { ask = sessionStorage.getItem("liemex-ask") || ""; sessionStorage.removeItem("liemex-ask"); } catch {}
    const msg = $('[data-enquiry] textarea[name="message"]');
    const sel = $('[data-enquiry] select[name="interest"]');
    if (!ask || !msg) return;
    if (!msg.value) msg.value = `${ask}: `;
    if (sel && !sel.value) sel.value = "Flooring";
    msg.focus({ preventScroll: true });
  };
  document.addEventListener("liemex:ask", carry);
  carry();

  /* ---------- Filters, lightbox, enquiry type ---------- */
  $$("[data-filter]").forEach((group) => {
    const items = $$("[data-item]", document.getElementById(group.dataset.filter));
    group.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-value]");
      if (!chip) return;
      $$("[data-value]", group).forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      items.forEach((el) => { el.hidden = chip.dataset.value !== "all" && el.dataset.tags !== chip.dataset.value; });
    });
  });

  const box = $("[data-lightbox]");
  if (box && box.showModal) {
    const big = $("img", box);
    const cap = $("p", box);
    document.addEventListener("click", (e) => {
      const zoom = e.target.closest("[data-zoom]");
      if (zoom) {
        const src = $("img", zoom);
        big.src = src.currentSrc || src.src;
        big.alt = src.alt;
        cap.textContent = src.alt;
        box.showModal();
      } else if (e.target === box || e.target.closest("[data-close]")) box.close();
    });
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-interest]");
    const select = $('[data-enquiry] select[name="interest"]');
    if (a && select) select.value = a.dataset.interest;
  });

  /* ---------- Enquiry form: "thanks" only after the server confirms it has the enquiry ---------- */
  $$("[data-enquiry]").forEach((form) => {
    const status = $("[data-status]", form);
    const button = $('button[type="submit"]', form);
    const label = button.innerHTML;
    const say = (text, ok) => { status.textContent = text; status.classList.toggle("is-ok", !!ok); };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      say("");
      let firstBad = null;
      $$("[required]", form).forEach((el) => {
        const bad = !el.value.trim() || !el.checkValidity();
        el.closest(".field").classList.toggle("is-invalid", bad);
        el.setAttribute("aria-invalid", String(bad));
        if (bad && !firstBad) firstBad = el;
      });
      if (firstBad) { say("We need your name, phone, a valid email and a line about the job."); firstBad.focus(); return; }
      const data = Object.fromEntries(new FormData(form));
      data.source = form.dataset.source;
      data.page = location.pathname;
      button.disabled = true;
      button.firstElementChild.textContent = "Sending…";
      try {
        const res = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        say("Got it. Your enquiry is with the yard and we'll reply in trading hours.", true);
      } catch {
        say("That didn't send. Please ring (08) 8444 1800 or email admin@liemex.com.au and we'll sort it out.");
      } finally {
        button.disabled = false;
        button.innerHTML = label;
      }
    });
  });
})();
