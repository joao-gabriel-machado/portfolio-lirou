import { useFormContext } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { QuoteFormData } from '@/lib/quoteSchema';
import StepShell from '../StepShell';
import { QuoteField, inputClass } from '../QuoteControls';

const StepContact = () => {
  const { language } = useLanguage();
  const t = translations[language].quote;
  const { register, formState: { errors } } = useFormContext<QuoteFormData>();

  return (
    <StepShell title={t.steps.contact.title} subtitle={t.steps.contact.subtitle}>
      <div className="grid gap-5">
        <QuoteField label={t.steps.contact.name} error={errors.name?.message}>
          <input
            {...register('name')}
            type="text"
            autoComplete="name"
            placeholder={t.steps.contact.namePlaceholder}
            className={inputClass}
          />
        </QuoteField>

        <div className="grid sm:grid-cols-2 gap-5">
          <QuoteField label={t.steps.contact.email} error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder={t.steps.contact.emailPlaceholder}
              className={inputClass}
            />
          </QuoteField>

          <QuoteField label={t.steps.contact.whatsapp} error={errors.whatsapp?.message}>
            <input
              {...register('whatsapp')}
              type="tel"
              autoComplete="tel"
              placeholder={t.steps.contact.whatsappPlaceholder}
              className={inputClass}
            />
          </QuoteField>
        </div>

        <QuoteField label={t.steps.contact.company} error={errors.company?.message}>
          <input
            {...register('company')}
            type="text"
            autoComplete="organization"
            placeholder={t.steps.contact.companyPlaceholder}
            className={inputClass}
          />
        </QuoteField>
      </div>
    </StepShell>
  );
};

export default StepContact;
