import { categories, productTotal, catalogues } from "../data.mjs";
import { arrow, btn, photo, pageHead, quoteSection } from "../ui.mjs";
import { drawings } from "../draw.mjs";

export default {
  title: "Timber Products | Flooring, Doors, Cladding, Mouldings | Liemex",
  description: "The Liemex range: solid timber flooring, doors, cladding and lining, mouldings, decking, lattice and stair treads, supplied from Port Adelaide.",
  body: `
${pageHead({ kicker: `${productTotal} lines, most of them machined here`, title: "What leaves the yard", lede: "Nearly all of it can be run in another species or to another size. If you can't see it, ask." })}

<nav class="chips wrap" aria-label="Product categories">
  ${categories.map((c) => `<a class="chip" href="#${c.slug}">${c.name} <span class="mono">${c.count}</span></a>`).join("")}
</nav>

<div class="wrap ranges">
  ${categories.map((c, i) => `
  <section class="prod" id="${c.slug}" data-rule>
    ${photo(c.img, c.alt, { w: 1200, h: 1500, lazy: i > 0 })}
    <div class="prod__copy">
      <div class="prod__top"><p class="mono">${String(i + 1).padStart(2, "0")} / ${c.count} lines</p>${drawings[c.slug]}</div>
      <h2 class="h-lg" data-split>${c.name}</h2>
      <p class="lede">${c.blurb}</p>
      <ul class="ticks">${c.items.map((t) => `<li><i class="dot"></i>${t}</li>`).join("")}</ul>
      ${btn(`Ask about ${c.name.toLowerCase()}`, "#quote", "primary", `data-interest="${c.name}"`)}
    </div>
  </section>`).join("")}
</div>

<section class="band band--tight band--sand cats">
  <div class="wrap cats__in">
    <h2 class="h-md">Catalogues</h2>
    <ul class="cats__list">
      ${catalogues.map((c) => `
      <li data-rule data-reveal><a href="${c.href}" target="_blank" rel="noopener"><strong>${c.name}</strong><span class="mono">${c.size}</span>${arrow}</a></li>`).join("")}
    </ul>
  </div>
</section>

${quoteSection("products")}
`,
};
