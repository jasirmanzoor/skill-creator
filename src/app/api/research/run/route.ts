import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = 'claude-opus-5';
// Published list rates (see Anthropic API pricing): Opus 5 tokens + $10/1,000 web searches.
const INPUT_PER_TOKEN = 5 / 1_000_000;
const OUTPUT_PER_TOKEN = 25 / 1_000_000;
const PER_SEARCH = 10 / 1_000;

interface RunRequestBody {
  dealership: { id: string; nameEn: string; nameAr: string; lat: number; lng: number };
  task: { instruction: string; targetField: string; sources: string[] };
}

interface FindingPayload {
  found: boolean;
  value: string | null;
  confidence: 'high' | 'medium' | 'low';
  sourceUrl: string | null;
  summary: string;
}

function extractJson(text: string): FindingPayload | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const braceStart = candidate.indexOf('{');
  const braceEnd = candidate.lastIndexOf('}');
  if (braceStart === -1 || braceEnd === -1) return null;
  try {
    const parsed = JSON.parse(candidate.slice(braceStart, braceEnd + 1));
    if (typeof parsed.found !== 'boolean') return null;
    return {
      found: parsed.found,
      value: typeof parsed.value === 'string' ? parsed.value : null,
      confidence: ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'low',
      sourceUrl: typeof parsed.sourceUrl === 'string' ? parsed.sourceUrl : null,
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: 'ANTHROPIC_API_KEY is not set on this deployment. Add it in your hosting provider\'s environment variables to enable research.' },
      { status: 400 }
    );
  }

  let body: RunRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 });
  }

  const { dealership, task } = body;
  if (!dealership?.nameEn || !task?.instruction) {
    return NextResponse.json({ ok: false, error: 'Missing dealership name or task instruction' }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const system = `You are a research assistant helping verify public information about small independent car dealerships in the Al Qadisiyah car market, East Riyadh, Saudi Arabia. You will be given one dealership's name and approximate location, and a specific research instruction.

Search the web — try both English and Arabic search terms, since these are small local businesses with a stronger Arabic footprint. Sources worth checking: Google Maps/Business listings, Saudi car marketplaces (Haraj, Motory, OpenSooq, Syarah, YallaMotor, Soum), Instagram, X/Twitter, WhatsApp Business, and the Saudi Ministry of Commerce registry where accessible.

Rules:
- Only report something you actually found on a real page. Never guess, infer, or fabricate a value.
- If you cannot find the specific thing asked for, set "found": false and explain what you checked in "summary".
- Confidence "high" = the source clearly names this exact business; "medium" = plausible match but not fully certain (e.g. name similar but no address/phone confirmation); "low" = weak or indirect signal.
- Respond with ONLY a single JSON object, no other text, no markdown fences:
{"found": boolean, "value": string|null, "confidence": "high"|"medium"|"low", "sourceUrl": string|null, "summary": string}`;

  const userPrompt = `Dealership: ${dealership.nameEn}${dealership.nameAr ? ` (Arabic: ${dealership.nameAr})` : ''}
Location: Al Qadisiyah district, East Riyadh, Saudi Arabia (approx. ${dealership.lat.toFixed(4)}, ${dealership.lng.toFixed(4)})
Sources to prioritise: ${task.sources.join(', ') || 'any relevant public source'}

Research task: ${task.instruction}`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system,
      tools: [
        { type: 'web_search_20260209', name: 'web_search', max_uses: 5 } satisfies Anthropic.WebSearchTool20260209,
      ],
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textBlocks = response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text');
    const lastText = textBlocks[textBlocks.length - 1]?.text ?? '';
    const parsed = extractJson(lastText);

    const searchCount = response.content.filter((b) => b.type === 'server_tool_use' && b.name === 'web_search').length;
    const costUsd =
      response.usage.input_tokens * INPUT_PER_TOKEN +
      response.usage.output_tokens * OUTPUT_PER_TOKEN +
      searchCount * PER_SEARCH;

    if (!parsed) {
      return NextResponse.json({
        ok: true,
        finding: {
          found: false,
          value: null,
          confidence: 'low' as const,
          sourceUrl: null,
          summary: 'Could not parse a structured answer from the research run.',
          model: MODEL,
          costUsd,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      finding: { ...parsed, model: MODEL, costUsd },
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ ok: false, error: 'Invalid ANTHROPIC_API_KEY.' }, { status: 401 });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ ok: false, error: 'Rate limited — try again shortly.' }, { status: 429 });
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json({ ok: false, error: `API error: ${err.message}` }, { status: 502 });
    }
    return NextResponse.json({ ok: false, error: 'Research run failed unexpectedly.' }, { status: 500 });
  }
}
