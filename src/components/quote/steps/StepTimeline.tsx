import { useFormContext } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { BUDGET_OPTIONS, QuoteFormData, TIMELINE_OPTIONS } from '@/lib/quoteSchema';
import StepShell from '../StepShell';
import { SelectCard } from '../QuoteControls';

const StepTimeline = () => {
  const { language } = useLanguage();
  const t = translations[language].quote;
  const { watch, setValue, formState: { errors } } = useFormContext<QuoteFormData>();
  const timeline = watch('timeline');
  const budget = watch('budget');

  return (
    <StepShell title={t.steps.timeline.title} subtitle={t.steps.timeline.subtitle}>
      {/* Timeline (required) */}
      <p className="text-sm font-medium text-foreground mb-3">{t.steps.timeline.timelineLabel}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {TIMELINE_OPTIONS.map((key) => (
          <SelectCard
            key={key}
            selected={timeline === key}
            onClick={() => setValue('timeline', key, { shouldValidate: true, shouldDirty: true })}
            title={t.options.timeline[key]}
          />
        ))}
      </div>
      {errors.timeline && (
        <p className="text-xs text-destructive mt-3">{errors.timeline.message}</p>
      )}

      {/* Budget (optional) */}
      <p className="text-sm font-medium text-foreground mb-3 mt-7">{t.steps.timeline.budgetLabel}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {BUDGET_OPTIONS.map((key) => (
          <SelectCard
            key={key}
            selected={budget === key}
            onClick={() =>
              setValue('budget', budget === key ? undefined : key, { shouldDirty: true })
            }
            title={t.options.budget[key]}
          />
        ))}
      </div>
    </StepShell>
  );
};

export default StepTimeline;
