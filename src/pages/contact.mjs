import { site } from "../data.mjs";
import { arrow, pageHead, quoteForm } from "../ui.mjs";

export default {
  title: "Contact Liemex | Timber Quotes and Advice, Port Adelaide",
  description: "Call (08) 8444 1800, email or visit Liemex at 1 Bedford Street, Port Adelaide for timber advice, quotes and stock availability.",
  body: `
${pageHead({ kicker: "Contact", title: "Ring, write or walk in", lede: "Timber advice, a quote or a stock check. Send plans if you have them." })}

<section class="wrap contact" id="quote">
  <div class="contact__info">
    <dl class="cards">
      <div><dt>Ring</dt><dd><a href="${site.phoneHref}">${site.phone}</a></dd></div>
      <div><dt>Email</dt><dd><a href="mailto:${site.email}">${site.email}</a></dd></div>
      <div><dt>Office and warehouse</dt><dd>${site.street}, ${site.suburb} ${site.state} ${site.postcode}<br><a class="tlink" href="${site.maps}" target="_blank" rel="noopener">Open in Maps ${arrow}</a></dd></div>
    </dl>
    <h2 class="mono">Trading hours</h2>
    <dl class="hours hours--lg">${site.hours.map(([d, t]) => `<div><dt>${d}</dt><dd>${t}</dd></div>`).join("")}</dl>
  </div>
  <div class="docket">
    <p class="docket__head"><span>Quote request</span><span>Liemex · Port Adelaide</span></p>
    ${quoteForm("contact")}
  </div>
</section>
`,
};
