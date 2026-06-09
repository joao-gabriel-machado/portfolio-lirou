import { useFormContext } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { QuoteFormData, SCOPE_BY_TYPE, SCOPE_OPTIONS } from '@/lib/quoteSchema';
import StepShell from '../StepShell';
import { SelectCard, QuoteField, inputClass } from '../QuoteControls';

const StepScope = () => {
  const { language } = useLanguage();
  const t = translations[language].quote;
  const { watch, setValue, register } = useFormContext<QuoteFormData>();

  const projectType = watch('projectType');
  const scope = watch('scope') ?? [];
  const options = (projectType && SCOPE_BY_TYPE[projectType]) || SCOPE_OPTIONS;

  const toggle = (key: (typeof SCOPE_OPTIONS)[number]) => {
    const next = scope.includes(key) ? scope.filter((s) => s !== key) : [...scope, key];
    setValue('scope', next, { shouldDirty: true });
  };

  return (
    <StepShell title={t.steps.scope.title} subtitle={t.steps.scope.subtitle}>
      <div className="grid sm:grid-cols-2 gap-3">
        {options.map((key) => (
          <SelectCard
            key={key}
            selected={scope.includes(key)}
            onClick={() => toggle(key)}
            title={t.options.scope[key]}
            description={t.options.scopeDesc[key]}
            multi
          />
        ))}
      </div>

      <div className="mt-6">
        <QuoteField label={t.steps.scope.noteLabel}>
          <textarea
            {...register('scopeNote')}
            rows={3}
            placeholder={t.steps.scope.notePlaceholder}
            className={inputClass + ' resize-none'}
          />
        </QuoteField>
      </div>
    </StepShell>
  );
};

export default StepScope;
