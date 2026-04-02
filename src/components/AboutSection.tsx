import { Code, Heart, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { revealVariants, staggerContainer, staggerChild, viewportConfig } from '@/lib/motion';
import perfilImg from '@/assets/perfil.webp';

/** Parses **bold** markers into <span> with primary color */
const HighlightedText = ({ text, className }: { text: string; className?: string }) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <p className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-primary font-semibold">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
};

const AboutSection = () => {
  const { language } = useLanguage();
  const t = translations[language].about;

  const stats = [
    { label: t.stats.experience, value: '+3', icon: Code },
    { label: t.stats.projects, value: '+10', icon: Target },
    { label: t.stats.technologies, value: '+15', icon: Heart },
  ];

  return (
    <section id="about" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="mb-16 text-center"
          >
            <p className="text-sm uppercase tracking-widest text-primary font-medium mb-4">
              {t.label}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {t.title}<br className="hidden sm:block" /> {t.titleSuffix}
            </h2>
          </motion.div>

          {/* Photo + About Content */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="mb-16"
          >
            <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-10 md:gap-14 items-start">
              {/* Photo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto md:mx-0"
              >
                <div className="card-outer glow-primary-hover transition-shadow duration-500 w-fit">
                  <div className="card-inner !p-2">
                    <img
                      src={perfilImg}
                      alt="João Gabriel"
                      className="w-56 h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 object-cover rounded-lg"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Text Content */}
              <div className="space-y-5">
                <p className="text-base md:text-lg text-foreground leading-relaxed">
                  {t.p1}
                </p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {t.p2}
                </p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {t.p3}
                </p>
                <HighlightedText
                  text={t.p4}
                  className="text-sm md:text-base text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-4"
                />
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="grid sm:grid-cols-3 gap-6 md:gap-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div key={index} variants={staggerChild}>
                  <div className="card-outer group hover-lift glow-primary-hover transition-all duration-300">
                    <div className="card-inner text-center">
                      <Icon className="w-8 h-8 text-primary mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 ease-out-expo" />
                      <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
