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

  // Build a clickable WhatsApp link (assume BR if no country code present).
  const waDigits = data.whatsapp.replace(/\D/g, '');
  const waLink = `https://wa.me/${waDigits.length <= 11 ? '55' + waDigits : waDigits}`;
  const companyLine = data.company
    ? `<span style="color:#6b7177;font-weight:500;"> · ${escapeHtml(data.company)}</span>`
    : '';

  // Only the project details go in the table; the contact lives in the hero.
  const details: [string, string][] = [
    ['Tipo de projeto', projectType],
    ['Funcionalidades', scope],
    ['Design', design],
    ['Prazo', timeline],
    ['Investimento', budget],
    ['Referências', data.references || '—'],
    ['Mensagem', data.message || '—'],
  ];

  const detailRows = details
    .map(
      ([label, value]) => `
          <tr>
            <td bgcolor="#ffffff" style="padding:13px 16px;border-bottom:1px solid #eef0f2;color:#8a9097;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;white-space:nowrap;vertical-align:top;">${label}</td>
            <td bgcolor="#ffffff" style="padding:13px 16px;border-bottom:1px solid #eef0f2;color:#16191d;font-size:14px;line-height:1.5;vertical-align:top;">${escapeHtml(value)}</td>
          </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="${data.locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>
    :root { color-scheme: light; supported-color-schemes: light; }
  </style>
</head>
<body style="margin:0;padding:0;background:#eef0f3;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef0f3" style="background:#eef0f3;padding:32px 12px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

          <!-- Brand bar -->
          <tr><td style="padding:0 4px 18px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
              <td align="left" style="color:#16191d;font-size:14px;font-weight:700;letter-spacing:0.02em;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#12a89f;"></span>
                &nbsp;LirouDev
              </td>
              <td align="right" style="color:#0e9b93;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;">Novo orçamento</td>
            </tr></table>
          </td></tr>

          <!-- Hero: client name + contact (destaque) -->
          <tr><td bgcolor="#ffffff" style="background:#ffffff;border:1px solid #e3e6ea;border-left:3px solid #12a89f;border-radius:12px;padding:24px;">
            <p style="margin:0 0 6px;color:#8a9097;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;">Cliente</p>
            <p style="margin:0 0 18px;color:#16191d;font-size:24px;font-weight:700;line-height:1.2;">${escapeHtml(data.name)}${companyLine}</p>
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="padding-right:10px;">
                <a href="mailto:${escapeHtml(data.email)}" style="display:inline-block;background:#12a89f;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:10px 18px;border-radius:999px;">Responder e-mail</a>
              </td>
              <td>
                <a href="${waLink}" style="display:inline-block;background:#ffffff;color:#0e9b93;font-size:13px;font-weight:700;text-decoration:none;padding:10px 18px;border-radius:999px;border:1px solid #bfe7e4;">WhatsApp</a>
              </td>
            </tr></table>
            <p style="margin:16px 0 0;font-size:13px;color:#6b7177;line-height:1.6;">
              <a href="mailto:${escapeHtml(data.email)}" style="color:#3f464c;text-decoration:none;">${escapeHtml(data.email)}</a>
              &nbsp;·&nbsp;
              <a href="${waLink}" style="color:#3f464c;text-decoration:none;">${escapeHtml(data.whatsapp)}</a>
            </p>
          </td></tr>

          <tr><td style="height:16px;line-height:16px;">&nbsp;</td></tr>

          <!-- Project details -->
          <tr><td>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="background:#ffffff;border:1px solid #e3e6ea;border-radius:12px;overflow:hidden;">
              ${detailRows}
            </table>
          </td></tr>

          <!-- Footer -->
          <tr><td style="padding:22px 4px 0;color:#9aa0a6;font-size:11px;line-height:1.6;">
            Enviado pelo formulário de orçamento do portfólio · liroudev
          </td></tr>

        </table>
      </td></tr>
    </table>
</body>
</html>`;

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

  // Send human-readable labels (same as the email) instead of raw codes.
  const o = translations[data.locale].quote.options;
  const payload = {
    submittedAt: new Date().toISOString(),
    projectType: o.projectType[data.projectType] ?? data.projectType,
    scope: data.scope.map((s) => o.scope[s] ?? s),
    design: o.design[data.design] ?? data.design,
    timeline: o.timeline[data.timeline] ?? data.timeline,
    budget: data.budget ? o.budget[data.budget] : '',
    references: data.references || '',
    name: data.name,
    email: data.email,
    whatsapp: data.whatsapp,
    company: data.company || '',
    message: data.message || '',
    locale: data.locale === 'pt' ? 'Português' : 'English',
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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
