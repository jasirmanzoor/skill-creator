import { validateLead, type Lead } from "@/lib/lead";
import { decodePlan, buildPlan } from "@/lib/planner";

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

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function toWebhook(url: string, lead: Lead & { planModules?: string[]; receivedAt: string }) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
    signal: AbortSignal.timeout(8000),
  });
  return r.ok;
}

async function toEmail(key: string, lead: Lead & { planModules?: string[]; receivedAt: string }) {
  const rows = Object.entries(lead)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td>${esc(Array.isArray(v) ? v.join(", ") : String(v))}</td></tr>`)
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

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  if (typeof body.website === "string" && body.website) return Response.json({ ok: true, delivered: true }); // honeypot

  const { lead, errors } = validateLead(body);
  if (!lead) return Response.json({ ok: false, errors }, { status: 422 });

  const planInput = decodePlan(lead.plan);
  const record = {
    ...lead,
    planModules: planInput ? buildPlan(planInput).modules.map((m) => m.id) : undefined,
    receivedAt: new Date().toISOString(),
  };

  const tasks: Promise<boolean>[] = [];
  if (process.env.LEAD_WEBHOOK_URL) tasks.push(toWebhook(process.env.LEAD_WEBHOOK_URL, record).catch(() => false));
  if (process.env.RESEND_API_KEY) tasks.push(toEmail(process.env.RESEND_API_KEY, record).catch(() => false));

  const results = await Promise.all(tasks);
  const delivered = results.some(Boolean);
  if (tasks.length && !delivered) console.error("[lead] all delivery channels failed");
  return Response.json({ ok: true, delivered }, { status: 200 });
}
