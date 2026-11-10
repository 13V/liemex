import { site, categories, species, reviews, catalogues } from "../data.mjs";
import { esc, arrow, btn, img, quoteSection, roomData, roomPromo } from "../ui.mjs";
import { drawings, bench, ruler } from "../draw.mjs";

const work = [
  ["Australian chestnut floor", "Flooring"],
  ["Entrance doors with leadlight", "Doors"],
  ["Feature-grade chestnut, galley kitchen", "Flooring"],
  ["Wormy chestnut, kitchen and living", "Flooring"],
  ["Hardwood deck, mitred corner", "Decking"],
  ["Slatted pivot entrance door", "Doors"],
  ["Parquetry entrance hall", "Flooring"],
  ["Hallway floor under an open stair", "Flooring"],
  ["Baltic pine glazed doors", "Doors"],
  ["Hardwood floor, open dining", "Flooring"],
];

const steps = [
  ["Sawn", "It comes in as sawn timber: Baltic and Nordic pine, green or kiln-dried Australian hardwood."],
  ["Dressed", "Planed square and true to size. This one is the traditional 152 × 22 Baltic pine board."],
  ["Profiled", "Our moulders cut the tongue and groove, or whatever profile your drawing calls for."],
  ["Finished", "Lacquered to an architect's specification if you want it ready to fix."],
  ["Laid", "Tongue into groove, board after board. It leaves the yard ready for installation."],
];

export default {
  title: "Liemex | Solid Timber Flooring, Doors and Mouldings, Port Adelaide",
  description: "Solid timber flooring, doors, decking, cladding and mouldings, machined and supplied from Port Adelaide for over 30 years. Ask for a quote.",
  overlay: true,
  preload: `<link rel="preload" as="image" href="/images/hero-wide.webp" media="(min-width: 700px)">
<link rel="preload" as="image" href="/images/hero-tall.webp" media="(max-width: 699px)">`,
  body: `
<section class="hero" data-hero>
  <picture class="hero__photo" data-hero-photo>
    <source media="(max-width: 699px)" srcset="/images/hero-tall.webp" width="1000" height="1613">
    <img src="/images/hero-wide.webp" alt="Herringbone oak parquetry in a double-height living room" width="1921" height="1191" fetchpriority="high">
  </picture>
  <div class="hero__planks" aria-hidden="true">${"<i></i>".repeat(9)}</div>
  <div class="wrap hero__in">
    <p class="kicker kicker--light"><i class="dot"></i>1 Bedford Street, Port Adelaide <span class="open" data-open-now></span></p>
    <h1 class="h-mega" data-split>Solid timber, machined here</h1>
    <div class="hero__row">
      <p class="hero__lede">Flooring, doors, decking, cladding and mouldings from a timber yard with its own machine shop. Supplying South Australian builders, joiners and homeowners for over 30 years.</p>
      <div class="hero__cta">
        ${btn("Get a quote", "/contact#quote", "light")}
        ${btn("See timber in a room", "/timber-species", "line-light", `data-room="tasmanian-oak"`)}
      </div>
    </div>
  </div>
  <p class="hero__cap">Herringbone oak parquetry</p>
  ${ruler()}
</section>

<section class="band statement">
  <div class="wrap">
    <p class="statement__text" data-words>We import it, saw it, dress it and run it through our own moulders. So when a heritage skirting has to be matched, a floor needs another forty metres, or a door has to fit an opening nobody makes a door for, the answer is usually yes.</p>
    <div class="statement__foot" data-rule>
      <p>Bring a drawing, a sample or an offcut. ${site.street}, weekdays 9 to 5.</p>
      ${btn("About the yard", "/about", "line")}
    </div>
  </div>
</section>

<section class="band band--ink rack" id="species">
  <div class="wrap rack__head">
    <h2 class="h-xl" data-split>In the rack</h2>
    <p class="lede">Hardwoods and softwoods we keep or bring in. Pick a board and we'll lay it in a room for you: floor, door, skirting and all.</p>
  </div>
  <div class="rack__boards" data-rack role="list">
    ${species.map((s, i) => `
    <a class="board${i === 0 ? " is-open" : ""}" role="listitem" href="/timber-species#${s.slug}" style="--i:${i}" data-board data-room="${s.slug}">
      <img src="/images/species/${s.slug}-v.webp" alt="" width="800" height="1415" loading="lazy" decoding="async">
      <span class="board__tag"><i class="dot"></i>${s.name}</span>
      <span class="board__info">
        <span class="mono">${String(i + 1).padStart(2, "0")} · ${s.type}</span>
        <strong>${s.name}</strong>
        <span>${s.text}</span>
        <span class="board__uses">${s.uses.join(" · ")}</span>
        <span class="board__go">See it in a room ${arrow}</span>
      </span>
    </a>`).join("")}
  </div>
  ${roomData}
  <div class="wrap rack__foot">
    <p class="mono"><span data-rack-count>01 / ${species.length}</span><span class="rack__hint"> · swipe along the boards, tap one to open it</span></p>
    <a class="tlink tlink--light" href="/timber-species">Compare all species ${arrow}</a>
  </div>
</section>

${roomPromo("spotted-gum")}

<section class="band range" id="range">
  <div class="wrap range__in">
    <div class="range__side">
      <h2 class="h-lg" data-split>What leaves the yard</h2>
      <p>Most of it can be run in another species or to another size. If it isn't on the list, ask.</p>
      ${btn("See the full range", "/products", "primary")}
    </div>
    <ul class="range__list">
      ${categories.map((c) => `
      <li data-rule data-reveal>
        <a class="rrow" href="/products#${c.slug}">
          <span class="rrow__dwg">${drawings[c.slug]}</span>
          <span class="rrow__name">${c.name}</span>
          <span class="rrow__blurb">${c.blurb}</span>
          <span class="rrow__n mono">${c.count} lines</span>
          <span class="rrow__photo">${img(c.img, "", { w: 1200, h: 1500 })}</span>
          ${arrow}
        </a>
      </li>`).join("")}
    </ul>
  </div>
</section>

<section class="bench band--ink" id="bench" data-bench>
  <div class="bench__pin">
    <div class="wrap bench__in">
      <div class="bench__head">
        <h2 class="h-lg" data-split>One board, start to floor</h2>
        <p class="mono bench__count" data-bench-count>01 / 05</p>
      </div>
      <div class="bench__stage">${bench}</div>
      <ol class="bench__steps">
        ${steps.map(([t, d], i) => `<li${i === 2 ? ` class="is-on"` : ""} data-bench-step><span class="mono">${String(i + 1).padStart(2, "0")}</span><h3>${t}</h3><p>${d}</p></li>`).join("")}
      </ol>
    </div>
  </div>
</section>

<section class="work" id="work" data-track>
  <div class="work__pin">
    <div class="wrap work__head">
      <h2 class="h-xl" data-split>Where it ended up</h2>
      <p class="mono" data-track-count>01 / ${work.length}</p>
    </div>
    <div class="work__view">
      <ol class="work__track" data-track-run>
        <li class="work__intro">
          <p>Floors, doors and decks built with timber from the yard, in homes around Adelaide.</p>
          <a class="tlink" href="/gallery">Open the gallery ${arrow}</a>
        </li>
        ${work.map(([t, c], i) => `
        <li class="tk">
          <div class="frame" data-reveal="photo">${img(`work-${i + 1}`, t, { w: 900, h: 1200 })}</div>
          <p class="tk__cap"><strong>${t}</strong><span>${c}</span></p>
        </li>`).join("")}
        <li class="work__end">
          <p class="h-md">Got a room like these in mind?</p>
          ${btn("Get a quote", "/contact#quote", "primary")}
        </li>
      </ol>
    </div>
    <div class="wrap"><div class="work__bar"><i data-track-bar></i></div></div>
  </div>
</section>

<section class="band band--sand said">
  <div class="wrap said__in">
    <figure class="said__main">
      <p class="stars" role="img" aria-label="Five stars">★★★★★ <span>Google review</span></p>
      <blockquote><p data-words>${esc(reviews[0].quote)}</p></blockquote>
      <figcaption><strong>${esc(reviews[0].name)}</strong> on Google, after ordering a solid timber door</figcaption>
    </figure>
    <div class="said__more">
      ${reviews.slice(1).map((r) => `
      <figure data-rule data-reveal>
        <blockquote><p>${esc(r.quote)}</p></blockquote>
        <figcaption><strong>${esc(r.name)}</strong> on Google</figcaption>
      </figure>`).join("")}
    </div>
  </div>
</section>

<section class="band calc" id="calculator">
  <div class="wrap calc__in">
    <div class="calc__copy">
      <h2 class="h-lg" data-split>How many metres is that?</h2>
      <p>Boards are sold by the lineal metre. Give us the area and a board width and we'll turn it into metres, with a tenth added for cuts.</p>
      <div class="calc__fields">
        <label class="field"><span>Area to cover</span>
          <span class="calc__area"><input type="range" min="4" max="200" value="40" step="1" data-calc-area aria-label="Area in square metres"><output class="mono" data-calc-area-out>40 m²</output></span>
        </label>
        <label class="field"><span>Board</span>
          <select data-calc-width>
            <option value="152" data-name="Baltic pine flooring 152 × 22">Baltic pine flooring, 152 wide</option>
            <option value="140" data-name="Merbau decking 140 × 19">Merbau decking, 140 wide</option>
            <option value="90" data-name="Kapur decking 90 × 18">Kapur decking, 90 wide</option>
            <option value="86" data-name="Spotted gum decking 86 × 19">Spotted gum decking, 86 wide</option>
            <option value="65" data-name="Jarrah decking 65 × 20">Jarrah decking, 65 wide</option>
          </select>
        </label>
      </div>
      <p class="calc__small">A guide only. Cover width changes with the profile and decking needs gaps, so we confirm the figure in your quote.</p>
    </div>
    <div class="calc__out" data-reveal>
      <div class="calc__floor" data-calc-floor aria-hidden="true"></div>
      <div class="calc__result">
        <p class="calc__num"><output data-calc-out>290</output><span>lineal metres</span></p>
        <a class="btn btn--primary" href="#quote" data-calc-send><span>Price this</span><i class="btn__cell">${arrow}</i></a>
      </div>
    </div>
  </div>
</section>

<section class="band band--tight cats">
  <div class="wrap cats__in">
    <h2 class="h-md">Catalogues</h2>
    <ul class="cats__list">
      ${catalogues.map((c) => `
      <li data-rule data-reveal><a href="${c.href}" target="_blank" rel="noopener"><strong>${c.name}</strong><span class="mono">${c.size}</span>${arrow}</a></li>`).join("")}
    </ul>
  </div>
</section>

${quoteSection("home")}
`,
};
