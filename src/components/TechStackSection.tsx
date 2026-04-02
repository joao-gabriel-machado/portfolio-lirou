import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { revealVariants, staggerContainer, staggerChild, viewportConfig } from '@/lib/motion';

const techStack = {
  frontend: [
    { name: 'React', icon: '⚛' },
    { name: 'Next.js', icon: 'N' },
    { name: 'TypeScript', icon: 'TS' },
    { name: 'TailwindCSS', icon: '🌊' },
    { name: 'HTML5', icon: '<>' },
    { name: 'CSS3', icon: '#' },
    { name: 'Vite', icon: '⚡' },
  ],
  backend: [
    { name: 'Java', icon: '☕' },
    { name: 'Quarkus', icon: 'Q' },
    { name: 'C#', icon: 'C#' },
    { name: 'Node.js', icon: 'N' },
    { name: 'SQL Server', icon: 'DB' },
    { name: 'REST APIs', icon: '{}' },
  ],
  tools: [
    { name: 'Git', icon: '⎇' },
    { name: 'GitHub Actions', icon: 'CI' },
    { name: 'Figma', icon: 'F' },
    { name: 'Scrum', icon: '🔄' },
    { name: 'Docker', icon: '🐳' },
  ],
};

const TechStackSection = () => {
  const { language } = useLanguage();
  const t = translations[language].techStack;

  const categories = [
    { key: 'frontend' as const, label: t.categories.frontend, items: techStack.frontend },
    { key: 'backend' as const, label: t.categories.backend, items: techStack.backend },
    { key: 'tools' as const, label: t.categories.tools, items: techStack.tools },
  ];

  return (
    <section id="skills" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
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

          {/* Categories */}
          <div className="space-y-12">
            {categories.map((category) => (
              <motion.div
                key={category.key}
                variants={revealVariants}
                initial="hidden"
                whileInView="visible"
                viewport={viewportConfig}
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-5 text-center">
                  {category.label}
                </p>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportConfig}
                  className="flex flex-wrap justify-center gap-3"
                >
                  {category.items.map((tech) => (
                    <motion.div
                      key={tech.name}
                      variants={staggerChild}
                    >
                      <motion.div
                        whileHover={{ y: -4, scale: 1.05 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="card-outer group glow-primary-hover transition-shadow duration-300"
                      >
                        <div className="card-inner !p-0">
                          <div className="flex items-center gap-3 px-5 py-3">
                            <span className="text-lg w-7 text-center font-mono text-primary/70 group-hover:text-primary transition-colors duration-200 select-none">
                              {tech.icon}
                            </span>
                            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200 whitespace-nowrap">
                              {tech.name}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
