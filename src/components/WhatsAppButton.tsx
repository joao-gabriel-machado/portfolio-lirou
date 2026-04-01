import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';

const WhatsAppButton = () => {
  const { language } = useLanguage();
  const t = translations[language].whatsapp;

  const phoneNumber = '5512987083178';
  const message = language === 'pt'
    ? 'Olá! Vim pelo seu portfólio e gostaria de conversar.'
    : 'Hello! I came from your portfolio and would like to chat.';

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: 2,
      }}
      className="fixed bottom-6 right-6 z-50"
    >
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 hover:shadow-xl hover:shadow-[#25D366]/30 transition-shadow duration-300"
        aria-label={t.tooltip}
      >
        <Phone className="w-6 h-6" fill="currentColor" />

        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg glass border border-white/10 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          <p className="text-sm font-medium text-foreground">{t.tooltip}</p>
        </div>
      </motion.a>
    </motion.div>
  );
};

export default WhatsAppButton;
