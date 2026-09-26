import { validateLead, type Lead } from "@/lib/lead";
import { decodePlan, buildPlan } from "@/lib/planner";
import { size } from "@/lib/sizer";

/**
 * Lead intake. Delivery channels (configure in Vercel env vars):
 *   LEAD_WEBHOOK_URL  → JSON POST (Zapier / Make / n8n / CRM / Slack workflow)
 *   RESEND_API_KEY    → email to LEAD_EMAIL_TO (default info@msg-horizons.com)
 * Returns { ok, delivered }. When nothing is configured (or delivery fails) the client
 * hands the lead off to WhatsApp / email so no enquiry is ever silently lost.
 */

const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 8;
}

type LeadRecord = Lead & { planModules?: string[]; network?: object; receivedAt: string };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function toWebhook(url: string, lead: LeadRecord) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
    signal: AbortSignal.timeout(8000),
  });
  return r.ok;
}

async function toEmail(key: string, lead: LeadRecord) {
  const rows = Object.entries(lead)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td>${esc(Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : String(v))}</td></tr>`)
    .join("");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.LEAD_EMAIL_FROM || "MSG Horizons Website <onboarding@resend.dev>",
      to: [process.env.LEAD_EMAIL_TO || "info@msg-horizons.com"],
      reply_to: lead.email || undefined,
      subject: `New website enquiry — ${lead.name} (${lead.interest})`,
      html: `<h2>New enquiry from msg-horizons website</h2><table>${rows}</table>`,
    }),
    signal: AbortSignal.timeout(8000),
  });
  return r.ok;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });


  // Progressive enhancement: the form also works before JavaScript loads (native POST).
  // Native posts get a 303 redirect back to the page; personal data never goes into a URL.
  const type = req.headers.get("content-type") || "";
  const isForm = type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data");
  let body: Record<string, unknown>;
  try {
    body = isForm ? Object.fromEntries((await req.formData()).entries()) : await req.json();
  } catch {
    return Response.json({ ok: false, error: "bad_body" }, { status: 400 });
  }
  const back = (state: "sent" | "handoff" | "invalid") =>
    Response.redirect(new URL(`/${body.lang === "ar" ? "ar" : "en"}?lead=${state}#contact`, req.url), 303);

  if (typeof body.website === "string" && body.website) return isForm ? back("sent") : Response.json({ ok: true, delivered: true }); // honeypot

  const { lead, errors } = validateLead(body);
  if (!lead) return isForm ? back("invalid") : Response.json({ ok: false, errors }, { status: 422 });

  const planInput = decodePlan(lead.plan);
  const record = {
    ...lead,
    planModules: planInput ? buildPlan(planInput).modules.map((m) => m.id) : undefined,
    network: planInput?.net ? { inputs: planInput.net, ...pick(size(planInput.net, planInput.persona)) } : undefined,
    receivedAt: new Date().toISOString(),
  };

  const tasks: Promise<boolean>[] = [];
  if (process.env.LEAD_WEBHOOK_URL) tasks.push(toWebhook(process.env.LEAD_WEBHOOK_URL, record).catch(() => false));
  if (process.env.RESEND_API_KEY) tasks.push(toEmail(process.env.RESEND_API_KEY, record).catch(() => false));

  const results = await Promise.all(tasks);
  const delivered = results.some(Boolean);
  if (tasks.length && !delivered) console.error("[lead] all delivery channels failed");
  if (isForm) return back(delivered ? "sent" : "handoff");
  return Response.json({ ok: true, delivered }, { status: 200 });
}

/** The sizing numbers MSG's team needs first on a new enquiry. */
function pick(s: ReturnType<typeof size>) {
  const { baseRoutes, baseCouriers, peakCouriers, flex, pickup, cadence, linehaul } = s;
  return { baseRoutes, baseCouriers, peakCouriers, flex, pickup, cadence, linehaul };
}
