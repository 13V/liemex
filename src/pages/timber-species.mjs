import { species } from "../data.mjs";
import { arrow, photo, pageHead, quoteSection, roomData } from "../ui.mjs";

const n = (t) => species.filter((s) => s.type === t).length;

export default {
  title: "Timber Species | Australian Hardwoods and Softwoods | Liemex",
  description: "Compare the hardwoods and softwoods Liemex supplies in Adelaide: Tasmanian oak, Baltic pine, spotted gum, jarrah, Victorian ash and more.",
  body: `
${pageHead({ kicker: "Timber species", title: "In the rack", lede: "Pick a timber and see it laid in a room. Grain and colour change from board to board, so come and see the real thing in daylight too." })}

<div class="wrap">
  <div class="filter" role="group" aria-label="Filter species" data-filter="species">
    <button class="chip" type="button" aria-pressed="true" data-value="all">All <span class="mono">${species.length}</span></button>
    <button class="chip" type="button" aria-pressed="false" data-value="Hardwood">Hardwood <span class="mono">${n("Hardwood")}</span></button>
    <button class="chip" type="button" aria-pressed="false" data-value="Softwood">Softwood <span class="mono">${n("Softwood")}</span></button>
  </div>
  <ul class="species" id="species">
    ${species.map((s, i) => `
    <li class="specie" id="${s.slug}" data-item data-tags="${s.type}">
      ${photo(`species/${s.slug}`, `${s.name} grain`, { w: 640, h: 400 })}
      <div class="specie__body">
        <p class="mono">${String(i + 1).padStart(2, "0")} · ${s.type}</p>
        <h2>${s.name}</h2>
        <p>${s.text}</p>
        <p class="specie__uses">${s.uses.join(" · ")}</p>
        <p><a class="tlink" href="/contact#quote" data-room="${s.slug}">See it in a room ${arrow}</a></p>
      </div>
    </li>`).join("")}
  </ul>
</div>

${roomData}
${quoteSection("timber-species")}
`,
};
