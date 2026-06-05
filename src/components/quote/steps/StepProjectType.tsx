import { useFormContext } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { PROJECT_TYPES, QuoteFormData } from '@/lib/quoteSchema';
import StepShell from '../StepShell';
import { SelectCard } from '../QuoteControls';

const StepProjectType = () => {
  const { language } = useLanguage();
  const t = translations[language].quote;
  const { watch, setValue, formState: { errors } } = useFormContext<QuoteFormData>();
  const value = watch('projectType');

  return (
    <StepShell title={t.steps.type.title} subtitle={t.steps.type.subtitle}>
      <div className="grid sm:grid-cols-2 gap-3">
        {PROJECT_TYPES.map((key) => (
          <SelectCard
            key={key}
            selected={value === key}
            onClick={() => setValue('projectType', key, { shouldValidate: true, shouldDirty: true })}
            title={t.options.projectType[key]}
            description={t.options.projectTypeDesc[key]}
          />
        ))}
      </div>
      {errors.projectType && (
        <p className="text-xs text-destructive mt-3">{errors.projectType.message}</p>
      )}
    </StepShell>
  );
};

export default StepProjectType;
