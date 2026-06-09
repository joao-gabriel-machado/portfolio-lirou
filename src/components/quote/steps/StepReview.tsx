import { useFormContext } from 'react-hook-form';
import { Pencil } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { QuoteFormData } from '@/lib/quoteSchema';
import StepShell from '../StepShell';
import { QuoteField, inputClass } from '../QuoteControls';

interface StepReviewProps {
  onEdit: (step: number) => void;
}

const StepReview = ({ onEdit }: StepReviewProps) => {
  const { language } = useLanguage();
  const t = translations[language].quote;
  const { watch, register } = useFormContext<QuoteFormData>();
  const data = watch();

  const Row = ({ label, value, step }: { label: string; value: string; step: number }) => (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-white/[0.06] last:border-0">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="text-sm text-foreground break-words">{value || t.steps.review.empty}</p>
      </div>
      <button
        type="button"
        onClick={() => onEdit(step)}
        className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary transition-colors duration-200"
      >
        <Pencil className="w-3 h-3" />
        {t.steps.review.edit}
      </button>
    </div>
  );

  const scopeBase = (data.scope ?? []).map((s) => t.options.scope[s]).join(', ');
  const scopeText = data.scopeNote
    ? [scopeBase, `“${data.scopeNote}”`].filter(Boolean).join(' · ')
    : scopeBase;
  const budgetText = data.budget ? t.options.budget[data.budget] : '';
  const timelineText = [
    data.timeline ? t.options.timeline[data.timeline] : '',
    budgetText && `· ${budgetText}`,
  ]
    .filter(Boolean)
    .join(' ');
  const contactText = [data.name, data.email, data.whatsapp, data.company]
    .filter(Boolean)
    .join(' · ');

  return (
    <StepShell title={t.steps.review.title} subtitle={t.steps.review.subtitle}>
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] px-5 py-1 mb-6">
        <Row label={t.steps.review.type} value={data.projectType ? t.options.projectType[data.projectType] : ''} step={0} />
        <Row label={t.steps.review.scope} value={scopeText} step={1} />
        <Row label={t.steps.review.design} value={data.design ? t.options.design[data.design] : ''} step={2} />
        <Row label={t.steps.review.timeline} value={timelineText} step={3} />
        <Row label={t.steps.review.contact} value={contactText} step={4} />
      </div>

      <QuoteField label={t.steps.review.messageLabel}>
        <textarea
          {...register('message')}
          rows={3}
          placeholder={t.steps.review.messagePlaceholder}
          className={inputClass + ' resize-none'}
        />
      </QuoteField>
    </StepShell>
  );
};

export default StepReview;
