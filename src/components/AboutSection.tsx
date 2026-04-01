import { Code, Heart, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { revealVariants, staggerContainer, staggerChild, viewportConfig } from '@/lib/motion';

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
            className="mb-16 text-center lg:text-left"
          >
            <p className="text-sm uppercase tracking-widest text-primary font-medium mb-4">
              {t.label}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {t.title}<br className="hidden sm:block" /> {t.titleSuffix}
            </h2>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="grid sm:grid-cols-3 gap-6 md:gap-8 mb-16"
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

          {/* About Content */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="prose prose-invert max-w-none"
          >
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-4">
                <p className="text-base md:text-lg text-foreground leading-relaxed">
                  {t.p1}
                </p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {t.p2}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {t.p3}
                </p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {t.p4}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
