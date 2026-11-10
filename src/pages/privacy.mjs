import { site } from "../data.mjs";
import { pageHead } from "../ui.mjs";

export default {
  title: "Privacy | Liemex",
  description: "How Liemex handles the details you send through this website.",
  body: `
${pageHead({ kicker: "The small print", title: "Privacy" })}
<div class="wrap prose--page">
  <p>When you send an enquiry through this site we receive the name, phone number, email address and message you enter. We use them to answer your enquiry and prepare a quote, and for nothing else.</p>
  <p>We don't sell or share your details. Enquiries are delivered to us by email through our website and email providers.</p>
  <p>To see, correct or delete what we hold about you, call <a href="${site.phoneHref}">${site.phone}</a> or email <a href="mailto:${site.email}">${site.email}</a>.</p>
</div>
`,
};
