import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowUpRight, Github, Linkedin, Instagram, MessageCircle } from 'lucide-react';
import MeshGradient from '@/components/ui/MeshGradient';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import perfilImg from '@/assets/perfil.webp';

const MotionLink = motion(Link);

const ease = [0.16, 1, 0.3, 1] as const;

const socialLinks = [
  { icon: Github, href: 'https://github.com/joao-gabriel-machado', label: 'GitHub' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/jo%C3%A3o-gabriel-machado-231880205/', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://www.instagram.com/liroujohn_/', label: 'Instagram' },
  { icon: MessageCircle, href: 'https://wa.me/5512987083178', label: 'WhatsApp' },
];

const LinksPage = () => {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language].links;

  useEffect(() => {
    const prev = document.title;
    document.title = t.seo;
    return () => {
      document.title = prev;
    };
  }, [t.seo]);

  const buttons = [
    { to: '/', icon: ArrowUpRight, label: t.portfolio, desc: t.portfolioDesc, primary: false },
    { to: '/orcamento', icon: FileText, label: t.quote, desc: t.quoteDesc, primary: true },
  ];

  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-hidden">
      <MeshGradient />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background pointer-events-none" />

      {/* Language toggle */}
      <div className="relative z-10 flex justify-end px-4 py-5">
        <button
          onClick={toggleLanguage}
          className="px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground rounded-full hover:bg-white/[0.06] transition-colors duration-200 uppercase tracking-widest"
        >
          {language === 'pt' ? 'BR' : 'EN'}
        </button>
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease }}
          className="w-full max-w-md"
        >
          {/* Profile */}
          <div className="text-center mb-9">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease, delay: 0.1 }}
              className="inline-block mb-5"
            >
              <div className="card-outer glow-primary w-fit mx-auto rounded-full">
                <div className="card-inner !p-1 rounded-full">
                  <img
                    src={perfilImg}
                    alt="João Gabriel"
                    className="w-28 h-28 object-cover rounded-full"
                  />
                </div>
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">João Gabriel</h1>
            <p className="text-sm text-primary font-medium mt-1">{t.role}</p>
            <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto leading-relaxed">
              {t.tagline}
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3.5">
            {buttons.map((btn, i) => {
              const Icon = btn.icon;
              return (
                <MotionLink
                  key={btn.to}
                  to={btn.to}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.2 + i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group flex items-center gap-4 w-full rounded-2xl px-5 py-4 transition-colors duration-200 ${
                    btn.primary
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'glass border border-white/10 text-foreground hover:border-primary/30'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0 ${
                      btn.primary ? 'bg-black/10' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold">{btn.label}</span>
                    <span
                      className={`block text-xs mt-0.5 ${
                        btn.primary ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {btn.desc}
                    </span>
                  </span>
                  <ArrowUpRight
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                      btn.primary ? 'text-primary-foreground/60' : 'text-muted-foreground/50'
                    }`}
                  />
                </MotionLink>
              );
            })}
          </div>

          {/* Socials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease, delay: 0.5 }}
            className="flex justify-center gap-3 mt-9"
          >
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-11 h-11 rounded-xl glass flex items-center justify-center border border-white/[0.06] hover:border-primary/30 text-muted-foreground hover:text-primary transition-all duration-200"
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default LinksPage;
