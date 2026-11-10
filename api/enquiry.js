// POST /api/enquiry: emails a website enquiry to Liemex through Resend.
// Answers 200 only when the email was accepted, so the page never says "thanks" for a lost enquiry.
//
// Vercel environment variables:
//   RESEND_API_KEY      Resend API key
//   ENQUIRY_EMAIL_FROM  a sender on a domain verified in Resend, e.g. "Liemex website <website@liemex.com.au>"
//   ENQUIRY_EMAIL_TO    where enquiries go (defaults to admin@liemex.com.au)

const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u0008\u000b-\u001f]/g, "").trim().slice(0, max);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method" });
  }
  const body = typeof req.body === "string" ? safeParse(req.body) : req.body || {};
  if (clean(body.website, 200)) return res.status(200).json({ ok: true }); // honeypot: a bot filled the hidden field

  const lead = {
    name: clean(body.name, 120),
    phone: clean(body.phone, 40),
    email: clean(body.email, 160),
    interest: clean(body.interest, 80),
    message: clean(body.message, 4000),
    source: clean(body.source, 40),
    page: clean(body.page, 200),
  };
  if (!lead.name || !lead.phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) || !lead.message) {
    return res.status(400).json({ ok: false, error: "invalid" });
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.ENQUIRY_EMAIL_FROM;
  if (!key || !from) {
    console.error("enquiry: RESEND_API_KEY or ENQUIRY_EMAIL_FROM is not set");
    return res.status(503).json({ ok: false, error: "not_configured" });
  }

  const rows = [["Name", lead.name], ["Phone", lead.phone], ["Email", lead.email], ["Interested in", lead.interest || "Not given"], ["Page", `${lead.page} (${lead.source})`]];
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        from,
        to: [process.env.ENQUIRY_EMAIL_TO || "admin@liemex.com.au"],
        reply_to: lead.email,
        subject: `Website enquiry: ${lead.name}${lead.interest ? ` (${lead.interest})` : ""}`,
        text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${lead.message}`,
        html: `<table cellpadding="6">${rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v)}</td></tr>`).join("")}</table><p style="white-space:pre-wrap">${esc(lead.message)}</p>`,
      }),
    });
    if (!r.ok) {
      console.error("enquiry: Resend answered", r.status, await r.text());
      return res.status(502).json({ ok: false, error: "send_failed" });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("enquiry: send error", err);
    return res.status(502).json({ ok: false, error: "send_failed" });
  }
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
