import { Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { revealVariants, staggerContainer, staggerChild, viewportConfig } from '@/lib/motion';

const ExperienceSection = () => {
  const { language } = useLanguage();
  const t = translations[language].experience;

  const experienceAssets = [
    {
      technologies: ['Java', 'Quarkus', 'Spring Boot', 'Microserviços', 'Delphi', 'Docker', 'Claude Code', 'REST APIs'],
      current: true,
    },
    {
      technologies: ['C#', 'Java', 'Quarkus', 'React', 'Next.js', 'SQL Server', 'Relatórios', 'Scrum', 'Git'],
      current: true,
    },
    {
      technologies: ['Mapeamento de processos', 'SQL Server', 'Relatórios', 'Análise de Dados'],
      current: false,
    },
  ];

  const experiences = t.list.map((exp, index) => ({
    ...exp,
    ...experienceAssets[index],
  }));

  return (
    <section id="experience" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="text-center mb-16"
          >
            <p className="text-sm uppercase tracking-widest text-primary font-medium mb-4">
              {t.label}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.subtitle}
            </p>
          </motion.div>

          {/* Timeline */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="relative"
          >
            {/* Timeline line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />

            <div className="space-y-10">
              {experiences.map((exp, index) => (
                <motion.div
                  key={index}
                  variants={staggerChild}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-[18px] md:left-[26px] w-3 h-3 rounded-full bg-primary animate-pulse-soft z-10" />

                  {/* Content */}
                  <div className="ml-14 md:ml-20">
                    <div className="card-outer hover-lift glow-primary-hover transition-all duration-300">
                      <div className="card-inner">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                          <div>
                            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                              {exp.title}
                            </h3>
                            <p className="text-lg text-primary font-semibold">
                              {exp.company}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="w-3.5 h-3.5" />
                              {exp.period}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5" />
                              {exp.location}
                            </span>
                            {exp.current && (
                              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                                {t.current}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5 whitespace-pre-line">
                          {exp.description}
                        </p>

                        {/* Technologies */}
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-3">{t.technologies}</p>
                          <div className="flex flex-wrap gap-2">
                            {exp.technologies.map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="px-3 py-1 rounded-full glass text-xs text-muted-foreground border border-primary/10 hover:border-primary/30 transition-colors duration-200"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
