import { useFormContext } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { DESIGN_OPTIONS, QuoteFormData } from '@/lib/quoteSchema';
import StepShell from '../StepShell';
import { SelectCard, QuoteField, inputClass } from '../QuoteControls';

const StepDesign = () => {
  const { language } = useLanguage();
  const t = translations[language].quote;
  const { watch, setValue, register, formState: { errors } } = useFormContext<QuoteFormData>();
  const value = watch('design');

  return (
    <StepShell title={t.steps.design.title} subtitle={t.steps.design.subtitle}>
      <div className="grid gap-3">
        {DESIGN_OPTIONS.map((key) => (
          <SelectCard
            key={key}
            selected={value === key}
            onClick={() => setValue('design', key, { shouldValidate: true, shouldDirty: true })}
            title={t.options.design[key]}
            description={t.options.designDesc[key]}
          />
        ))}
      </div>
      {errors.design && (
        <p className="text-xs text-destructive mt-3">{errors.design.message}</p>
      )}

      <div className="mt-6">
        <QuoteField label={t.steps.design.refsLabel} error={errors.references?.message}>
          <textarea
            {...register('references')}
            rows={3}
            placeholder={t.steps.design.refsPlaceholder}
            className={inputClass + ' resize-none'}
          />
        </QuoteField>
      </div>
    </StepShell>
  );
};

export default StepDesign;
