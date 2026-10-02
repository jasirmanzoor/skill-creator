/** Lead payload validation — shared by the client form and the /api/lead route. */

export type Lead = {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  interest: string;
  message?: string;
  plan?: string;
  lang: "en" | "ar";
  source?: string;
};

export type LeadErrors = Partial<Record<"name" | "phone" | "email", "required" | "invalid">>;

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "";

/** Normalises Saudi and international numbers. Accepts 05XXXXXXXX, 5XXXXXXXX, +9665XXXXXXXX, 009665... */
export function normalizePhone(raw: string): string | null {
  // Map Arabic-Indic and Eastern Arabic digits to ASCII first.
  const ascii = raw.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
  let d = ascii.replace(/[^\d+]/g, "");
  if (d.startsWith("00")) d = "+" + d.slice(2);
  if (/^05\d{8}$/.test(d)) return "+966" + d.slice(1);
  if (/^5\d{8}$/.test(d)) return "+966" + d;
  if (/^\+9665\d{8}$/.test(d)) return d;
  if (/^9665\d{8}$/.test(d)) return "+" + d;
  if (/^\+\d{8,15}$/.test(d)) return d; // other international numbers
  if (/^0\d{8,9}$/.test(d)) return "+966" + d.slice(1); // Saudi landline e.g. 011...
  return null;
}

export function validateLead(input: Record<string, unknown>): { lead?: Lead; errors: LeadErrors } {
  const errors: LeadErrors = {};
  const name = clean(input.name, 120);
  const phoneRaw = clean(input.phone, 40);
  const email = clean(input.email, 160);
  if (!name) errors.name = "required";
  const phone = phoneRaw ? normalizePhone(phoneRaw) : null;
  if (!phoneRaw) errors.phone = "required";
  else if (!phone) errors.phone = "invalid";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "invalid";
  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    lead: {
      name,
      phone: phone!,
      email: email || undefined,
      company: clean(input.company, 160) || undefined,
      interest: clean(input.interest, 60) || "general",
      message: clean(input.message, 2000) || undefined,
      plan: clean(input.plan, 400) || undefined,
      lang: input.lang === "ar" ? "ar" : "en",
      source: clean(input.source, 60) || undefined,
    },
  };
}
