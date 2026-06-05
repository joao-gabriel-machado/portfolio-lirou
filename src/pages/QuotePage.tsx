import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import MeshGradient from '@/components/ui/MeshGradient';
import QuoteWizard from '@/components/quote/QuoteWizard';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';

const QuotePage = () => {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language].quote;

  // Update document title for this route.
  useEffect(() => {
    const prev = document.title;
    document.title = t.meta.seo;
    return () => {
      document.title = prev;
    };
  }, [t.meta.seo]);

  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-hidden">
      {/* Dark animated gradient background */}
      <MeshGradient />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background pointer-events-none" />

      {/* Minimal header */}
      <header className="relative z-10 w-full">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.meta.backToSite}
          </a>

          <button
            onClick={toggleLanguage}
            className="px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground rounded-full hover:bg-white/[0.06] transition-colors duration-200 uppercase tracking-widest"
          >
            {language === 'pt' ? 'BR' : 'EN'}
          </button>
        </div>
      </header>

      {/* Wizard card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl card-outer glow-primary"
        >
          <div className="card-inner !p-6 md:!p-9">
            <QuoteWizard />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default QuotePage;
