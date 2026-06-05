import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';

const QuoteSuccess = () => {
  const { language } = useLanguage();
  const t = translations[language].quote;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="text-center py-6"
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
        className="mx-auto mb-7 w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center"
      >
        <Check className="w-8 h-8 text-primary" strokeWidth={3} />
      </motion.div>

      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t.success.title}</h2>
      <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto mb-8">
        {t.success.subtitle}
      </p>

      <a
        href="/"
        className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm transition-colors duration-200 hover:bg-primary/90"
      >
        {t.success.cta}
      </a>
    </motion.div>
  );
};

export default QuoteSuccess;
