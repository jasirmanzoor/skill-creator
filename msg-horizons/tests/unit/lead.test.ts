import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePhone, validateLead } from "../../src/lib/lead.ts";

test("normalises Saudi mobile formats", () => {
  for (const v of ["0558951422", "558951422", "+966558951422", "00966558951422", "966 55 895 1422", "٠٥٥٨٩٥١٤٢٢"]) {
    assert.equal(normalizePhone(v), "+966558951422", v);
  }
});

test("rejects garbage phone numbers", () => {
  for (const v of ["123", "abc", "05512"]) assert.equal(normalizePhone(v), null, v);
});

test("requires name and phone, validates email", () => {
  assert.deepEqual(validateLead({}).errors, { name: "required", phone: "required" });
  assert.equal(validateLead({ name: "A", phone: "0558951422", email: "nope" }).errors.email, "invalid");
  const ok = validateLead({ name: " Sara ", phone: "0558951422", email: "s@x.sa", lang: "ar", interest: "seller" });
  assert.equal(ok.lead?.name, "Sara");
  assert.equal(ok.lead?.lang, "ar");
});

test("strips control characters and truncates", () => {
  const r = validateLead({ name: "A\u0000B", phone: "0558951422", message: "x".repeat(5000) });
  assert.equal(r.lead?.name, "A B");
  assert.equal(r.lead?.message?.length, 2000);
});
