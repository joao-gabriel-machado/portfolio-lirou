import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { navbarVariants, staggerChild } from '@/lib/motion';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language].navbar;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const navItems = [
    { href: '#home', label: t.home },
    { href: '#about', label: t.about },
    { href: '#skills', label: t.skills },
    { href: '#experience', label: t.experience },
    { href: '#projects', label: t.projects },
    { href: '#education', label: t.education },
    { href: '#contact', label: t.contact },
  ];

  return (
    <>
      <motion.nav
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
        className={`fixed top-5 left-0 right-0 mx-auto w-fit z-50 transition-all duration-500 ease-out-expo rounded-full ${
          isScrolled
            ? 'glass px-3 py-2 shadow-lg shadow-black/30'
            : 'bg-white/[0.03] backdrop-blur-md border border-white/[0.04] px-3 py-2'
        }`}
      >
        <div className="flex items-center gap-1">
          {/* Logo */}
          <a
            href="#home"
            className="flex items-center gap-2.5 px-4 py-2 rounded-full hover:bg-white/[0.06] transition-colors duration-200"
          >
            <img
              src="https://github.com/joao-gabriel-machado.png"
              alt="João Gabriel"
              className="w-8 h-8 rounded-full border border-white/10"
            />
            <span className="text-sm font-semibold text-foreground hidden sm:inline">
              LirouDev
            </span>
          </a>

          {/* Separator */}
          <div className="hidden md:block w-px h-5 bg-white/10 mx-1" />

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-full hover:bg-white/[0.06] transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Separator */}
          <div className="hidden md:block w-px h-5 bg-white/10 mx-1" />

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-full hover:bg-white/[0.06] transition-colors duration-200 uppercase tracking-widest"
            title={t.toggleLang}
          >
            {language === 'pt' ? 'BR' : 'EN'}
          </button>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2.5 rounded-full hover:bg-white/[0.06] transition-colors duration-200 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Fullscreen Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
              }}
              className="flex flex-col items-center gap-8"
            >
              {navItems.map((item) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  variants={staggerChild}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-3xl font-medium text-foreground hover:text-primary transition-colors duration-200"
                >
                  {item.label}
                </motion.a>
              ))}

              <motion.button
                variants={staggerChild}
                onClick={() => { toggleLanguage(); setIsMobileMenuOpen(false); }}
                className="mt-6 px-8 py-3 rounded-full glass text-sm font-bold text-muted-foreground hover:text-foreground transition-colors duration-200 uppercase tracking-widest"
              >
                {language === 'pt' ? 'English' : 'Português'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
