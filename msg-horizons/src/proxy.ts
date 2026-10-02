import { NextResponse, type NextRequest } from "next/server";

/** "/" → "/ar" for Arabic-preferring browsers, otherwise "/en". */
export function proxy(request: NextRequest) {
  const accept = request.headers.get("accept-language") || "";
  const prefersArabic = /^\s*ar\b/i.test(accept) || (/\bar\b/i.test(accept) && !/\ben\b/i.test(accept));
  const url = request.nextUrl.clone();
  url.pathname = prefersArabic ? "/ar" : "/en";
  const res = NextResponse.redirect(url, 307);
  res.headers.set("Vary", "Accept-Language");
  return res;
}

export const config = { matcher: ["/"] };
