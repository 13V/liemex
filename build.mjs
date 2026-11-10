// Builds the static pages:  node build.mjs
// Pages live in src/pages/*.mjs and share the header, footer and data in src/. Never hand-edit the
// generated .html files in the repo root.
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { site, nav, categories } from "./src/data.mjs";
import { esc, btn } from "./src/ui.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));

// PREVIEW keeps the redesign out of Google while the current site is still live on the same content.
// Set it to false at launch (and update robots.txt).
const PREVIEW = true;

const header = (current, overlay) => `
<a class="skip" href="#main">Skip to content</a>
<header class="hdr${overlay ? " hdr--over" : ""}" data-header>
  <div class="wrap hdr__in">
    <a class="logo" href="/" aria-label="${site.name}, home"><b>Liemex</b><i class="dot"></i><span>Solid timber<br>specialists</span></a>
    <nav class="hdr__nav" aria-label="Main">
      ${nav.map(([label, href]) => `<a href="${href}"${href === current ? ` aria-current="page"` : ""}>${label}</a>`).join("\n      ")}
    </nav>
    <a class="hdr__tel" href="${site.phoneHref}"><span class="mono">Ring</span> ${site.phone}</a>
    ${btn("Get a quote", "/contact#quote", "primary")}
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu-btn>
      <span>Menu</span><span class="menu-btn__bars" aria-hidden="true"><i></i><i></i></span>
    </button>
  </div>
  <div class="menu" id="menu" data-menu hidden>
    <nav class="wrap menu__in" aria-label="Menu">
      ${nav.map(([label, href], i) => `<a class="menu__link" style="--i:${i}" href="${href}"${href === current ? ` aria-current="page"` : ""}><span class="mono">0${i + 1}</span>${label}</a>`).join("\n      ")}
      <div class="menu__foot">
        ${btn("Get a quote", "/contact#quote", "primary")}
        ${btn(`Ring ${site.phone}`, site.phoneHref, "line")}
      </div>
    </nav>
  </div>
</header>`;

const footer = () => `
<footer class="ftr">
  <div class="wrap">
    <p class="kicker kicker--light"><i class="dot"></i>Ring the yard</p>
    <a class="ftr__tel" href="${site.phoneHref}" data-split>${site.phone.replace(/[()]/g, "")}</a>
    <div class="ftr__grid" data-rule>
      <div>
        <a class="logo logo--ftr" href="/"><b>Liemex</b><i class="dot"></i></a>
        <p>Trading as ${esc(site.trading)}. Solid timber, machined in Port Adelaide.</p>
      </div>
      <div>
        <h2>Yard</h2>
        <p>${site.street}<br>${site.suburb} ${site.state} ${site.postcode}</p>
        <p><a href="${site.maps}" target="_blank" rel="noopener">Directions</a></p>
        <dl class="hours">${site.hours.map(([d, t]) => `<div><dt>${d}</dt><dd>${t}</dd></div>`).join("")}</dl>
      </div>
      <div>
        <h2>Range</h2>
        <ul>${categories.map((c) => `<li><a href="/products#${c.slug}">${c.name}</a></li>`).join("")}</ul>
      </div>
      <div>
        <h2>More</h2>
        <ul>
          <li><a href="/timber-species">Timber species</a></li>
          <li><a href="/gallery">Gallery</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="mailto:${site.email}">${site.email}</a></li>
          <li><a href="${site.instagram}" target="_blank" rel="noopener">Instagram</a></li>
          <li><a href="${site.facebook}" target="_blank" rel="noopener">Facebook</a></li>
        </ul>
      </div>
    </div>
    <div class="ftr__base">
      <p>&copy; ${new Date().getFullYear()} ${site.name}</p>
      <p><a href="/privacy">Privacy</a></p>
      <p>Website by <a href="https://www.lumenadl.com" target="_blank" rel="noopener">Lumen adl</a></p>
    </div>
  </div>
</footer>
<div class="callbar" data-callbar><a href="${site.phoneHref}">Ring ${site.phone}</a><a class="callbar__q" href="/contact#quote">Get a quote</a></div>`;

const jsonLd = () => JSON.stringify({
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": `${site.url}/#business`,
  name: `${site.name} (${site.trading})`,
  url: site.url,
  telephone: "+61884441800",
  email: site.email,
  image: `${site.url}/images/og.jpg`,
  address: { "@type": "PostalAddress", streetAddress: site.street, addressLocality: site.suburb, addressRegion: site.state, postalCode: site.postcode, addressCountry: "AU" },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "17:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "10:00", closes: "11:00" },
  ],
  sameAs: [site.facebook, site.instagram],
});

const layout = (page, file) => {
  const pathName = file === "index" ? "/" : `/${file}`;
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
${PREVIEW || page.noindex ? `<meta name="robots" content="noindex, nofollow">` : `<link rel="canonical" href="${site.url}${pathName === "/" ? "/" : pathName}">`}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:image" content="${site.url}/images/og.jpg">
<meta name="theme-color" content="#14100c">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/archivo.woff2" as="font" type="font/woff2" crossorigin>
${page.preload || ""}
<link rel="stylesheet" href="/site.css">
<script>document.documentElement.classList.add("js")</script>
<script type="application/ld+json">${jsonLd()}</script>
</head>
<body class="${page.bodyClass || ""}">
${header(pathName, page.overlay)}
<main id="main">
${page.body.trim()}
</main>
${footer()}
<script src="/site.js" defer></script>
</body>
</html>
`;
};

const dir = path.join(ROOT, "src/pages");
const only = process.argv[2];
for (const f of (await readdir(dir)).filter((f) => f.endsWith(".mjs")).sort()) {
  const name = f.slice(0, -4);
  if (only && only !== name) continue;
  const page = (await import(pathToFileURL(path.join(dir, f)))).default;
  await writeFile(path.join(ROOT, `${name}.html`), layout(page, name));
  console.log(`built ${name}.html`);
}
