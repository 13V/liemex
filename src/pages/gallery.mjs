import { gallery } from "../data.mjs";
import { img, pageHead, quoteSection } from "../ui.mjs";

const cats = [["flooring", "Flooring"], ["doors", "Doors"], ["decking", "Decking"], ["joinery", "Joinery"]];

export default {
  title: "Gallery | Timber Floors, Doors and Decks | Liemex",
  description: "Finished projects using Liemex timber: solid floors, parquetry, entrance doors, decking, vanities and benchtops across Adelaide.",
  body: `
${pageHead({ kicker: "Gallery", title: "Where it ended up", lede: "Floors, doors, decks and joinery built with timber from the Port Adelaide yard." })}

<div class="wrap">
  <div class="filter" role="group" aria-label="Filter gallery" data-filter="gallery">
    <button class="chip" type="button" aria-pressed="true" data-value="all">All <span class="mono">${gallery.length}</span></button>
    ${cats.map(([k, n]) => `<button class="chip" type="button" aria-pressed="false" data-value="${k}">${n} <span class="mono">${gallery.filter((g) => g.cat === k).length}</span></button>`).join("")}
  </div>
  <div class="masonry" id="gallery">
    ${gallery.map((g, i) => `
    <figure class="shot" data-item data-tags="${g.cat}">
      <button type="button" data-zoom aria-label="Enlarge: ${g.alt}"><span class="frame" data-reveal="photo" style="display:block">${img(g.src, g.alt, { w: g.w, h: g.h, lazy: i > 3 })}</span></button>
      <figcaption>${g.alt}</figcaption>
    </figure>`).join("")}
  </div>
</div>

<dialog class="lightbox" data-lightbox aria-label="Photo">
  <button class="lightbox__close" type="button" data-close>Close</button>
  <img alt="">
  <p></p>
</dialog>

${quoteSection("gallery")}
`,
};
