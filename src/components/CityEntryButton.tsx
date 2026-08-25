import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';

/** Botão fixo no canto superior direito da landing → /cidade. */
const CityEntryButton = () => {
  const { language } = useLanguage();
  const label = translations[language].city.entryButton;
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-5 right-4 z-30"
    >
      <Link
        to="/cidade"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass border border-primary/20 text-sm font-semibold text-primary hover:border-primary/50 glow-primary-hover transition-all duration-200"
      >
        <Building2 className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    </motion.div>
  );
};

export default CityEntryButton;
