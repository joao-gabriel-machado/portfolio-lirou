import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { createQuoteSchema, type QuoteFormData } from '../src/lib/quoteSchema';
import { translations } from '../src/utils/translations';

/**
 * POST /api/quote — receives a quote request, validates it (same zod schema as
 * the frontend), then fans out to Resend (email) and an optional Google Sheets
 * webhook in parallel. Email is the primary channel: if it fails we report an
 * error; if only the sheet fails we still succeed (the lead isn't lost).
 */

// Best-effort in-memory rate limit (resets on cold start; not a hard guarantee).
const hits = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.ts > WINDOW_MS) {
    hits.set(ip, { count: 1, ts: now });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
}

const schema = createQuoteSchema();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const ip =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'rate_limited' });
  }

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }
  const data = parsed.data;

  // Honeypot triggered by a bot → silently accept and drop.
  if (data._honeypot) {
    return res.status(200).json({ ok: true });
  }

  const [email, sheet] = await Promise.allSettled([sendEmail(data), sendToSheet(data)]);

  if (email.status === 'rejected') {
    console.error('Resend failed:', email.reason);
    return res.status(502).json({ ok: false, error: 'email_failed' });
  }
  if (sheet.status === 'rejected') {
    // Non-fatal: the email already went out.
    console.error('Sheets webhook failed (non-fatal):', sheet.reason);
  }

  return res.status(200).json({ ok: true });
}

// ── Email via Resend ──────────────────────────────────────────────────
async function sendEmail(data: QuoteFormData) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.QUOTE_TO_EMAIL;
  const from = process.env.RESEND_FROM || 'Orçamentos <onboarding@resend.dev>';
  if (!apiKey || !to) {
    throw new Error('Missing RESEND_API_KEY or QUOTE_TO_EMAIL env vars');
  }

  const resend = new Resend(apiKey);
  const o = translations[data.locale].quote.options;

  const projectType = o.projectType[data.projectType] ?? data.projectType;
  const scope = data.scope.length ? data.scope.map((s) => o.scope[s]).join(', ') : '—';
  const design = o.design[data.design] ?? data.design;
  const timeline = o.timeline[data.timeline] ?? data.timeline;
  const budget = data.budget ? o.budget[data.budget] : '—';

  const rows: [string, string][] = [
    ['Tipo de projeto', projectType],
    ['Funcionalidades', scope],
    ['Design', design],
    ['Prazo', timeline],
    ['Investimento', budget],
    ['Referências', data.references || '—'],
    ['Nome', data.name],
    ['E-mail', data.email],
    ['WhatsApp', data.whatsapp],
    ['Empresa', data.company || '—'],
    ['Mensagem', data.message || '—'],
  ];

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="margin: 0 0 4px;">Novo pedido de orçamento</h2>
      <p style="margin: 0 0 20px; color: #666;">Enviado pelo formulário do portfólio.</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding: 10px 12px; background: #f5f5f5; border: 1px solid #eee; font-weight: 600; white-space: nowrap; vertical-align: top;">${label}</td>
            <td style="padding: 10px 12px; border: 1px solid #eee;">${escapeHtml(value)}</td>
          </tr>`
          )
          .join('')}
      </table>
    </div>`;

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: data.email,
    subject: `Novo orçamento — ${data.name} (${projectType})`,
    html,
  });

  if (error) throw error;
}

// ── Google Sheets (optional) ──────────────────────────────────────────
async function sendToSheet(data: QuoteFormData) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return; // disabled when no webhook configured

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, submittedAt: new Date().toISOString() }),
  });
  if (!resp.ok) throw new Error(`Sheet webhook responded ${resp.status}`);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
