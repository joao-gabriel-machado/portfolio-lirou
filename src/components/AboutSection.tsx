import { Code, Heart, Target } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';

const AboutSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { language } = useLanguage();
  const t = translations[language].about;

  const stats = [
    { label: t.stats.experience, value: '+3', icon: Code },
    { label: t.stats.projects, value: '+10', icon: Target },
    { label: t.stats.technologies, value: '+15', icon: Heart },
  ];

  return (
    <section id="about" className="py-12 md:py-20 relative" ref={ref}>
      <div className={`container mx-auto px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 md:mb-20 text-center lg:text-left">
            <p className="text-sm uppercase tracking-widest text-primary font-medium mb-4">
              {t.label}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {t.title}<br className="hidden sm:block" /> {t.titleSuffix}
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="group p-6 md:p-8 glass border-border hover:border-primary/50 rounded-lg transition-smooth hover-lift text-center"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-smooth mx-auto" />
                  <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* About Content */}
          <div className="prose prose-invert max-w-none">
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;