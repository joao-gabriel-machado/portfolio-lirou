import { GraduationCap, Award, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { revealVariants, staggerContainer, staggerChild, viewportConfig } from '@/lib/motion';

const EducationSection = () => {
  const { language } = useLanguage();
  const t = translations[language].education;

  return (
    <section id="education" className="py-24 relative">
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

          {/* Degree Card */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="mb-12"
          >
            <div className="card-outer glow-primary-hover transition-shadow duration-300">
              <div className="card-inner">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                      {t.degree.title}
                    </h3>
                    <p className="text-base text-primary font-semibold mb-2">
                      {t.degree.institution}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5" />
                      {t.degree.period}
                    </p>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {t.degree.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Courses */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            <p className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2 justify-center">
              <Award className="w-4 h-4 text-primary" />
              {t.coursesTitle}
            </p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
              className="flex flex-wrap justify-center gap-3"
            >
              {t.courses.map((course, index) => (
                <motion.div
                  key={index}
                  variants={staggerChild}
                >
                  <motion.div
                    whileHover={{ y: -2, scale: 1.03 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="px-4 py-2.5 rounded-xl glass border border-white/[0.06] hover:border-primary/20 transition-all duration-300 group"
                  >
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                      {course.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {course.provider}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
