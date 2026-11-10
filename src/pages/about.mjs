import { site, productTotal } from "../data.mjs";
import { btn, photo, pageHead, quoteSection } from "../ui.mjs";
import { bench } from "../draw.mjs";

export default {
  title: "About Liemex | Solid Timber Specialists, Port Adelaide",
  description: "Liemex has imported, machined and supplied solid timber fixtures and fittings from Port Adelaide for over 30 years.",
  body: `
${pageHead({ kicker: "About the yard", title: "Thirty years of sawdust", lede: "Liemex, trading as Baltic Pine &amp; European Timber, imports and produces solid timber fixtures and fittings from a yard and machine shop in Port Adelaide." })}

<div class="wrap">${photo("about", "Parquetry floor in an entrance hall with a curved staircase", { w: 1400, h: 932, lazy: false, frame: "banner" })}</div>

<section class="band statement">
  <div class="wrap">
    <p class="statement__text" data-words>We specialise in timber that is meant to last: floors, doors, mouldings and joinery timber, produced by experienced machinists and sold with straight advice.</p>
    <div class="about-cols">
      <div data-rule>
        <h2>The range</h2>
        <p>Hardwood flooring, decking, cladding, lining, benchtops and custom fixtures, ${productTotal} lines in all. It suits a villa restoration as well as a commercial fit-out, and most of it can be machined to another size or species.</p>
      </div>
      <div data-rule>
        <h2>Who we supply</h2>
        <p>Resellers, builders and joiners have bought from us for three decades, from standard profiles to one-off runs. Homeowners are just as welcome: bring your plans and we'll go through them with you.</p>
      </div>
    </div>
  </div>
</section>

<section class="band band--ink">
  <div class="wrap bench__in">
    <div class="bench__head"><h2 class="h-lg" data-split>Sawn, dressed, profiled, finished</h2></div>
    <div class="bench__stage">${bench}</div>
    <p class="lede">The traditional 152 × 22 Baltic pine floorboard, end on. We saw, dress and profile hardwood and softwood on our own moulders, laminate benchtops and posts, and lacquer profiles to an architect's specification.</p>
  </div>
</section>

<section class="band">
  <div class="wrap visit">
    <div>
      <h2 class="h-lg" data-split>${site.street}, ${site.suburb}</h2>
      <p class="lede">See the species in the flesh, pick up samples and go through your job at the counter.</p>
      ${btn("Get directions", site.maps, "primary", `target="_blank" rel="noopener"`)}
    </div>
    <dl class="hours hours--lg">${site.hours.map(([d, t]) => `<div><dt>${d}</dt><dd>${t}</dd></div>`).join("")}</dl>
  </div>
</section>

${quoteSection("about")}
`,
};
