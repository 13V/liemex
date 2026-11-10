import { btn } from "../ui.mjs";
import { drawings } from "../draw.mjs";
export default {
  title: "Page not found | Liemex",
  description: "That page isn't here.",
  noindex: true,
  body: `
<section class="page-head page-head--center">
  <div class="wrap">
    <p class="kicker"><i class="dot"></i>404</p>
    <h1 class="h-xl" data-split>Cut too short</h1>
    <p class="lede">That page isn't here. It may have moved when the site was rebuilt.</p>
    <p class="acts">${btn("See the range", "/products", "primary")} ${btn("Contact the yard", "/contact", "line")}</p>
  </div>
</section>
`,
};
