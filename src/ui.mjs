// Shared pieces the pages are built from.
import { site, categories, species } from "./data.mjs";

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const arrow = `<svg class="i-arrow" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2 8h12M9 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;

// Primary buttons carry the split arrow cell; secondary ones are words only.
export const btn = (label, href, kind = "primary", attrs = "") =>
  `<a class="btn btn--${kind}" href="${href}"${attrs ? ` ${attrs}` : ""}><span>${label}</span>${kind === "primary" || kind === "light" ? `<i class="btn__cell">${arrow}</i>` : ""}</a>`;

export const img = (name, alt, { w, h, lazy = true, cls = "" } = {}) =>
  `<img src="/images/${name}.webp" alt="${esc(alt)}"${w ? ` width="${w}" height="${h}"` : ""}${lazy ? ` loading="lazy" decoding="async"` : ` fetchpriority="high"`}${cls ? ` class="${cls}"` : ""}>`;

// A photo in a frame. The planks lift off it when it scrolls in (site.js adds them).
export const photo = (name, alt, opts = {}) => `<div class="frame${opts.frame ? ` ${opts.frame}` : ""}" data-reveal="photo">${img(name, alt, opts)}</div>`;

// The header of every inner page.
export const pageHead = ({ kicker, title, lede }) => `
<section class="page-head">
  <div class="wrap">
    <p class="kicker"><i class="dot"></i>${kicker}</p>
    <h1 class="h-xl" data-split>${title}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ""}
  </div>
</section>`;

export const quoteForm = (source) => `
<form class="form" data-enquiry data-source="${source}" novalidate>
  <div class="form__row">
    <label class="field"><span>Name</span><input name="name" autocomplete="name" required></label>
    <label class="field"><span>Phone</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" required></label>
  </div>
  <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required></label>
  <label class="field"><span>What are you after?</span>
    <select name="interest">
      <option value="">Choose one</option>
      ${categories.map((c) => `<option>${c.name}</option>`).join("")}
      <option>Benchtops and joinery timber</option>
      <option>Something else</option>
    </select>
  </label>
  <label class="field"><span>The job</span><textarea name="message" rows="4" placeholder="Species, sizes, quantities, or what you're building." required></textarea></label>
  <label class="field field--hp" aria-hidden="true"><span>Company website</span><input name="website" tabindex="-1" autocomplete="off"></label>
  <div class="form__foot">
    <button class="btn btn--primary" type="submit"><span>Send it to the yard</span><i class="btn__cell">${arrow}</i></button>
    <p class="form__note">Answered in trading hours. Or ring <a href="${site.phoneHref}">${site.phone}</a>.</p>
  </div>
  <p class="form__status" role="status" aria-live="polite" data-status></p>
</form>`;

export const quoteSection = (source) => `
<section class="band band--ink quote" id="quote">
  <div class="wrap quote__in">
    <div class="quote__copy">
      <h2 class="h-xl" data-split>What are you building?</h2>
      <p class="lede">Send a species, a size and a quantity, or a set of plans and a rough idea. You'll hear back from someone who handles the timber.</p>
      <dl class="lines" data-rule>
        <div><dt>Ring</dt><dd><a href="${site.phoneHref}">${site.phone}</a></dd></div>
        <div><dt>Email</dt><dd><a href="mailto:${site.email}">${site.email}</a></dd></div>
        <div><dt>Yard</dt><dd><a href="${site.maps}" target="_blank" rel="noopener">${site.street}, ${site.suburb}</a></dd></div>
      </dl>
    </div>
    <div class="docket" data-reveal>
      <p class="docket__head"><span>Quote request</span><span>Liemex · Port Adelaide</span></p>
      ${quoteForm(source)}
    </div>
  </div>
</section>`;

// What room.js needs to know about each timber. Put it once on any page with [data-room] buttons.
export const roomData = `<script type="application/json" id="species-data">${JSON.stringify(species.map(({ slug, name, type, text }) => ({ slug, name, type, text })))}</script>`;
