import { z } from 'zod';

/**
 * Shared quote model — used by the frontend wizard (react-hook-form) AND the
 * serverless function (api/quote.ts) so validation is identical on both sides.
 *
 * Option *values* are stable, language-agnostic strings. Their human labels
 * live in `translations.ts` (keyed by these same values), so the email/sheet
 * always receive consistent data regardless of the UI language.
 */

// ── Stable option values ──────────────────────────────────────────────
export const PROJECT_TYPES = [
  'institutional',
  'landing',
  'ecommerce',
  'system',
  'app',
  'other',
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const SCOPE_OPTIONS = [
  'auth',
  'admin',
  'payments',
  'dashboard',
  'blog',
  'cms',
  'multilang',
  'integrations',
  'chat',
  'seo',
  'responsive',
  'animations',
] as const;
export type ScopeOption = (typeof SCOPE_OPTIONS)[number];

/** Curated, most-relevant scope options shown per project type. */
export const SCOPE_BY_TYPE: Record<ProjectType, readonly ScopeOption[]> = {
  institutional: ['responsive', 'seo', 'animations', 'blog', 'multilang', 'integrations'],
  landing: ['responsive', 'seo', 'animations', 'integrations', 'multilang'],
  ecommerce: ['payments', 'auth', 'admin', 'dashboard', 'integrations', 'seo', 'responsive'],
  system: ['auth', 'admin', 'dashboard', 'integrations', 'chat', 'responsive'],
  app: ['auth', 'payments', 'dashboard', 'chat', 'integrations', 'responsive'],
  other: SCOPE_OPTIONS,
};

export const DESIGN_OPTIONS = ['has_figma', 'has_brand', 'from_scratch'] as const;
export type DesignOption = (typeof DESIGN_OPTIONS)[number];

export const TIMELINE_OPTIONS = ['urgent', '1to3', '3to6', 'flexible'] as const;
export type TimelineOption = (typeof TIMELINE_OPTIONS)[number];

export const BUDGET_OPTIONS = ['undecided', 'lt5', '5to15', '15to30', 'gt30'] as const;
export type BudgetOption = (typeof BUDGET_OPTIONS)[number];

// ── Validation messages (injectable for i18n) ─────────────────────────
export interface QuoteMessages {
  required: string;
  selectOne: string;
  nameMin: string;
  email: string;
  whatsapp: string;
  tooLong: string;
}

const DEFAULT_MESSAGES: QuoteMessages = {
  required: 'Campo obrigatório',
  selectOne: 'Selecione uma opção',
  nameMin: 'Informe seu nome',
  email: 'E-mail inválido',
  whatsapp: 'Informe um WhatsApp válido',
  tooLong: 'Texto muito longo',
};

/**
 * Builds the zod schema with the given (optionally localized) messages.
 * Backend calls it with no args (messages don't matter server-side).
 */
export function createQuoteSchema(m: QuoteMessages = DEFAULT_MESSAGES) {
  const optionalText = (max: number) =>
    z.string().trim().max(max, m.tooLong).optional().or(z.literal(''));

  return z.object({
    projectType: z.enum(PROJECT_TYPES, {
      errorMap: () => ({ message: m.selectOne }),
    }),
    scope: z.array(z.enum(SCOPE_OPTIONS)).default([]),
    scopeNote: optionalText(1000),
    design: z.enum(DESIGN_OPTIONS, {
      errorMap: () => ({ message: m.selectOne }),
    }),
    references: optionalText(2000),
    timeline: z.enum(TIMELINE_OPTIONS, {
      errorMap: () => ({ message: m.selectOne }),
    }),
    budget: z.enum(BUDGET_OPTIONS).optional(),
    name: z.string().trim().min(2, m.nameMin).max(120, m.tooLong),
    email: z.string().trim().min(1, m.required).email(m.email).max(200, m.tooLong),
    whatsapp: z.string().trim().min(8, m.whatsapp).max(40, m.tooLong),
    company: optionalText(160),
    message: optionalText(2000),
    locale: z.enum(['pt', 'en']).default('pt'),
    // Honeypot: bots fill it, humans never see it. Must stay empty.
    _honeypot: z.string().max(0).optional().or(z.literal('')),
  });
}

export const quoteSchema = createQuoteSchema();
export type QuoteFormData = z.infer<typeof quoteSchema>;

/** Fields validated at each step (index = step number, 0-based). Step 6 = review. */
export const STEP_FIELDS: readonly (keyof QuoteFormData)[][] = [
  ['projectType'],
  ['scope'],
  ['design', 'references'],
  ['timeline', 'budget'],
  ['name', 'email', 'whatsapp', 'company'],
  [],
];

export const TOTAL_STEPS = STEP_FIELDS.length;

/** Empty defaults for a fresh form. */
export const emptyQuote: QuoteFormData = {
  projectType: undefined as unknown as ProjectType,
  scope: [],
  scopeNote: '',
  design: undefined as unknown as DesignOption,
  references: '',
  timeline: undefined as unknown as TimelineOption,
  budget: undefined,
  name: '',
  email: '',
  whatsapp: '',
  company: '',
  message: '',
  locale: 'pt',
  _honeypot: '',
};
