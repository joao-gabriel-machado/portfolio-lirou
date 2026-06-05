import { Mail, Phone, MapPin, Github, Linkedin, Instagram, ArrowUpRight, MessageCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { revealVariants, staggerContainer, staggerChild, viewportConfig } from '@/lib/motion';

const MotionLink = motion(Link);

const ContactSection = () => {
  const { language } = useLanguage();
  const t = translations[language].contact;

  const contactInfo = [
    {
      icon: Mail,
      label: t.email,
      value: 'jgomachado@hotmail.com',
      href: 'mailto:jgomachado@hotmail.com',
    },
    {
      icon: Phone,
      label: t.whatsapp,
      value: '+55 (12) 98708-3178',
      href: 'https://wa.me/5512987083178',
    },
    {
      icon: MapPin,
      label: t.location,
      value: 'São José dos Campos, SP',
      href: '#',
    },
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com/joao-gabriel-machado', label: 'GitHub' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/jo%C3%A3o-gabriel-machado-231880205/', label: 'LinkedIn' },
    { icon: Instagram, href: 'https://www.instagram.com/liroujohn_/', label: 'Instagram' },
  ];

  return (
    <section id="contact" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* CTA Banner */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="mb-16"
          >
            <div className="card-outer glow-primary transition-shadow duration-500">
              <div className="card-inner !py-12 !px-8 text-center relative overflow-hidden">
                {/* Subtle gradient accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.04] pointer-events-none" />

                <div className="relative z-10">
                  <p className="text-sm uppercase tracking-widest text-primary font-medium mb-4">
                    {t.label}
                  </p>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                    {t.title}
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                    {t.subtitle}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <MotionLink
                      to="/orcamento"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: '0 0 40px hsl(178 70% 41% / 0.35)',
                      }}
                      whileTap={{ scale: 0.96 }}
                      className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-sm transition-colors duration-200 hover:bg-primary/90"
                    >
                      <FileText className="w-4 h-4" />
                      {t.quoteCta}
                    </MotionLink>
                    <motion.a
                      href="https://wa.me/5512987083178"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full border border-white/10 text-foreground font-semibold text-sm glass hover:border-primary/30 transition-all duration-200"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t.cta}
                    </motion.a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact cards - horizontal grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="grid sm:grid-cols-3 gap-5 mb-14"
          >
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.a
                  key={index}
                  href={info.href}
                  target={info.href.startsWith('http') ? '_blank' : undefined}
                  rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  variants={staggerChild}
                  className="block"
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="card-outer group glow-primary-hover transition-shadow duration-300 h-full"
                  >
                    <div className="card-inner h-full flex flex-col items-center text-center gap-4 py-8">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/20 transition-all duration-300">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">
                          {info.label}
                        </p>
                        <p className="text-sm md:text-base text-foreground font-semibold group-hover:text-primary transition-colors duration-200">
                          {info.value}
                        </p>
                      </div>
                      {info.href !== '#' && (
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors duration-200" />
                      )}
                    </div>
                  </motion.div>
                </motion.a>
              );
            })}
          </motion.div>

          {/* Social Links */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="text-center"
          >
            <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest">
              {t.socials}
            </p>
            <div className="flex gap-4 justify-center">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-xl glass flex items-center justify-center border border-white/[0.06] hover:border-primary/30 glow-primary-hover text-muted-foreground hover:text-primary transition-all duration-300"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
