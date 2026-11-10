// The drawings. Every stroke has pathLength="1" so [data-draw] can draw it in (site.css, "Motion").
// They are sections and elevations of what Liemex actually makes: a tongue and groove board, a shiplap
// wall, a skirting profile, a panel door, a decking board, lattice and a stair tread.

const svg = (body, box = "0 0 120 80") =>
  `<svg class="dwg" viewBox="${box}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true" data-draw>${body}</svg>`;
const p = (d, cls = "") => `<path pathLength="1"${cls ? ` class="${cls}"` : ""} d="${d}"/>`;

export const drawings = {
  // tongue and groove floorboard, end on
  flooring: svg(
    p("M10 26H98V35H108V45H98V54H10V45H20V35H10Z") +
    p("M22 54C30 38 52 30 76 30", "dwg__fine") + p("M36 54C42 44 58 38 80 38", "dwg__fine") + p("M52 54C56 50 66 46 84 46", "dwg__fine") +
    p("M10 16H98M10 12V20M98 12V20", "dwg__dim")),
  // four-panel door, elevation
  doors: svg(
    p("M38 6H82V74H38Z") + p("M44 12H57V36H44Z") + p("M63 12H76V36H63Z") + p("M44 44H57V68H44Z") + p("M63 44H76V68H63Z") +
    p("M78 40V42", "dwg__fine") + p("M28 74H92", "dwg__dim")),
  // shiplap boards, section through a wall
  cladding: svg(
    p("M48 6H62V24H56V30H48Z") + p("M48 30H56V24H62V48H56V54H48Z") + p("M48 54H56V48H62V74H48Z") +
    p("M40 6V74", "dwg__fine") + p("M70 10H86M70 40H86M70 70H86", "dwg__dim")),
  // skirting profile, section
  mouldings: svg(
    p("M44 74V22C44 12 48 8 53 8C58 8 59 13 59 17C59 22 62 24 66 25C72 27 74 32 74 40V74Z") +
    p("M44 60H74", "dwg__fine") + p("M34 74H88", "dwg__dim") + p("M84 8V74M80 8H88M80 74H88", "dwg__dim")),
  // decking boards, end on, with the gap between them
  decking: svg(
    p("M8 34C8 31 10 30 12 30H52C54 30 56 31 56 34V46C56 49 54 50 52 50H12C10 50 8 49 8 46Z") +
    p("M64 34C64 31 66 30 68 30H108C110 30 112 31 112 34V46C112 49 110 50 108 50H68C66 50 64 49 64 46Z") +
    p("M16 50V46M24 50V46M32 50V46M40 50V46M48 50V46M72 50V46M80 50V46M88 50V46M96 50V46M104 50V46", "dwg__fine") +
    p("M4 60H116M30 60V72M90 60V72", "dwg__dim")),
  // lattice panel
  screens: svg(
    p("M22 8H98V72H22Z") +
    p("M22 28L42 8M22 48L62 8M22 68L82 8M38 72L98 12M58 72L98 32M78 72L98 52", "dwg__fine") +
    p("M98 28L78 8M98 48L58 8M98 68L38 8M82 72L22 12M62 72L22 32M42 72L22 52", "dwg__fine")),
  // stair treads with a bullnose
  stairs: svg(
    p("M10 62H44V58C44 55 42 54 40 54H10") + p("M40 62V40H74V36C74 33 72 32 70 32H40") + p("M70 40V18H104V14C104 11 102 10 100 10H70") +
    p("M10 72H110", "dwg__dim")),
};

// The bench: one board, end on. site.js moves it through five states as the section scrolls; this markup is
// the finished, profiled board, which is what shows without JavaScript or with reduced motion.
const X0 = 296, X1 = 904, Y0 = 206, Y1 = 294, T1 = Y0 + 30, T2 = Y1 - 30, TG = 24;
const boardPts = (dx = 0) => [[X0, Y0], [X1, Y0], [X1, T1], [X1 + TG, T1], [X1 + TG, T2], [X1, T2], [X1, Y1], [X0, Y1], [X0, T2], [X0 + TG, T2], [X0 + TG, T1], [X0, T1]].map(([x, y]) => `${x + dx},${y}`).join(" ");
const rings = Array.from({ length: 11 }, (_, i) => `<circle cx="640" cy="560" r="${190 + i * 34}"/>`).join("");

export const bench = `
<svg class="bench__svg" viewBox="0 100 1200 300" role="img" aria-label="A floorboard, end on: sawn, dressed to 152 by 22, cut with a tongue and groove, finished, then laid beside its neighbours." data-bench-svg>
  <defs><clipPath id="bench-clip"><polygon points="${boardPts()}" data-b-clip/></clipPath></defs>
  <g data-b-stage>
    <g class="b-nb" data-b-nb>
      ${[-2, -1, 1, 2].map((k) => `<polygon points="${boardPts(k * (X1 - X0))}" data-k="${k}"/>`).join("")}
    </g>
    <polygon class="b-fill" points="${boardPts()}" data-b-poly/>
    <g class="b-rings" clip-path="url(#bench-clip)" data-b-rings>${rings}</g>
    <polygon class="b-line" points="${boardPts()}" data-b-poly/>
    <path class="b-finish" pathLength="1" d="M${X0} ${Y0}H${X1}" data-b-finish/>
  </g>
  <g class="b-dims" data-b-dims>
    <path d="M${X0} 150H${X1}M${X0} 140V160M${X1} 140V160"/>
    <text x="600" y="134" text-anchor="middle">152</text>
    <path d="M240 ${Y0}V${Y1}M230 ${Y0}H250M230 ${Y1}H250"/>
    <text x="218" y="256" text-anchor="end">22</text>
  </g>
</svg>`;

// The ruler along the foot of the hero: a tick every 10 mm, a number every 100.
export const ruler = () => {
  let d = "", t = "";
  for (let i = 0; i <= 240; i++) {
    const x = i * 10;
    d += `M${x} 0V${i % 10 === 0 ? 18 : i % 5 === 0 ? 12 : 7}`;
    if (i % 10 === 0 && i) t += `<text x="${x + 5}" y="30">${i * 10}</text>`;
  }
  return `<svg class="ruler" viewBox="0 0 2400 34" preserveAspectRatio="xMinYMin slice" aria-hidden="true"><path d="${d}"/>${t}</svg>`;
};
