import { useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Send, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import {
  createQuoteSchema,
  emptyQuote,
  STEP_FIELDS,
  TOTAL_STEPS,
  type QuoteFormData,
} from '@/lib/quoteSchema';
import QuoteProgress from './QuoteProgress';
import QuoteSuccess from './QuoteSuccess';
import StepProjectType from './steps/StepProjectType';
import StepScope from './steps/StepScope';
import StepDesign from './steps/StepDesign';
import StepTimeline from './steps/StepTimeline';
import StepContact from './steps/StepContact';
import StepReview from './steps/StepReview';

const DRAFT_KEY = 'quote-draft';

type SubmitState = 'idle' | 'submitting' | 'error';

function loadDraft(locale: 'pt' | 'en'): QuoteFormData {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return { ...emptyQuote, ...JSON.parse(raw), locale };
  } catch {
    /* ignore corrupt draft */
  }
  return { ...emptyQuote, locale };
}

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0, filter: 'blur(4px)' }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0, filter: 'blur(4px)' }),
};

const QuoteWizard = () => {
  const { language } = useLanguage();
  const t = translations[language].quote;
  const schema = useMemo(() => createQuoteSchema(t.validation), [t.validation]);

  const methods = useForm<QuoteFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: loadDraft(language),
  });

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [success, setSuccess] = useState(false);

  // Persist a draft on every change so a refresh doesn't lose progress.
  useEffect(() => {
    const sub = methods.watch((values) => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      } catch {
        /* storage may be unavailable */
      }
    });
    return () => sub.unsubscribe();
  }, [methods]);

  // Keep the stored locale in sync with the active language.
  useEffect(() => {
    methods.setValue('locale', language);
  }, [language, methods]);

  const isLast = step === TOTAL_STEPS - 1;

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const valid = fields.length === 0 ? true : await methods.trigger(fields);
    if (!valid) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const goTo = (target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  };

  const onSubmit = async (data: QuoteFormData) => {
    setSubmitState('submitting');
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      setSuccess(true);
    } catch {
      setSubmitState('error');
    }
  };

  if (success) return <QuoteSuccess />;

  const renderStep = () => {
    switch (step) {
      case 0: return <StepProjectType />;
      case 1: return <StepScope />;
      case 2: return <StepDesign />;
      case 3: return <StepTimeline />;
      case 4: return <StepContact />;
      case 5: return <StepReview onEdit={goTo} />;
      default: return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <QuoteProgress
        step={step}
        total={TOTAL_STEPS}
        label={t.progress
          .replace('{current}', String(step + 1))
          .replace('{total}', String(TOTAL_STEPS))}
      />

      {/* Honeypot — hidden from humans, catches bots. */}
      <input
        {...methods.register('_honeypot')}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] w-px h-px opacity-0 pointer-events-none"
      />

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {submitState === 'error' && (
        <div className="mt-6 flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">{t.error.title}</p>
            <p className="text-xs text-muted-foreground">{t.error.subtitle}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goBack}
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 ${
            step === 0 ? 'invisible pointer-events-none' : ''
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          {t.nav.back}
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={methods.handleSubmit(onSubmit)}
            disabled={submitState === 'submitting'}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm transition-colors duration-200 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitState === 'submitting' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.nav.sending}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {submitState === 'error' ? t.error.retry : t.nav.send}
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm transition-colors duration-200 hover:bg-primary/90"
          >
            {t.nav.next}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </FormProvider>
  );
};

export default QuoteWizard;
