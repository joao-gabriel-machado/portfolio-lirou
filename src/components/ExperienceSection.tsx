import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';

const ExperienceSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const experiences = [
    {
      title: 'Freelancer',
      company: 'Autônomo',
      period: 'Jan/2024',
      location: 'Remote',
      type: 'Freelance',
      description: 'Desenvolvedor Full-Stack especializado na criação de soluções web completas. Utilizo Java para construir back-ends robustos e Next.js para desenvolver interfaces de usuário modernas e performáticas.',
      technologies: ["Java", 'React', 'Next.js', 'Figma', 'UI/UX', 'TailwindCSS', "Quarkus", "Prototipagem"],
      current: true,
    },
    {
      title: 'Desenvolvedor de Software',
      company: 'Titaniumfix',
      period: 'Jan/2024',
      location: 'São José dos Campos, SP',
      type: 'CLT',
      description: 'Desenvolvedor com experiência em criação de soluções completas, incluindo desenvolvimento frontend com Next.js e backend em C# e Java. Proficiente na criação de interfaces intuitivas com Figma, manutenção e evolução de softwares existentes.',
      technologies: ['C#', 'Java', 'Quarkus', 'React', 'Next.js', 'SQL Server', 'Relatórios', 'Scrum', 'Git'],
      current: true,
    },
    {
      title: 'Auxiliar de Informática',
      company: 'Titaniumfix',
      period: 'fev/2023 - Dez/2023',
      location: 'São José dos Campos, SP',
      type: 'CLT',
      description: 'Auxílio na implementação de software (ERP), e mapeamento de processos com objetivo de estudar e implementar o sistema de acordo com as regras de negócio, e trabalho diretamente com o desenvolvimento e manutenção dos softwares da empresa, utilizando a linguagem de programação C#, JavaScript, e ReactJS. E realizo consultas e alterações no BD com SQL.',
      technologies: ['Mapeamento de processos', 'SQL Server', 'Relatórios', 'Análise de Dados'],
      current: false,
    },
  ];

  return (
    <section id="experience" className="py-12 md:py-20 relative" ref={ref}>
      <div className={`container mx-auto px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16 animate-fade-in-up">
            <p className="text-sm uppercase tracking-widest text-primary font-medium mb-4">
              Experiência
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Trajetória Profissional
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Principais experiências e tecnologias
            </p>
          </div>

          {/* Experience Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-8 lg:left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary opacity-30" />

            <div className="space-y-8 md:space-y-12">
              {experiences.map((exp, index) => (
                <div 
                  key={index} 
                  className="relative animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-4 md:left-6 lg:left-10 w-4 h-4 bg-primary rounded-full border-4 border-background animate-pulse-glow z-10" />
                  
                  {/* Content */}
                  <div className="ml-16 md:ml-20 lg:ml-24">
                    <Card className="gradient-card border-primary/20 hover-lift">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                          <div>
                            <CardTitle className="text-xl md:text-2xl text-foreground mb-2">
                              {exp.title}
                            </CardTitle>
                            <h4 className="text-lg md:text-xl text-accent font-semibold">
                              {exp.company}
                            </h4>
                          </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {exp.period}
                          </div>
                          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {exp.location}
                          </div>
                          {exp.current && (
                            <Badge className="bg-primary text-primary-foreground border-primary animate-pulse-glow">
                              Atual
                            </Badge>
                          )}
                        </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4 md:mb-6">
                          {exp.description}
                        </p>
                        
                        <div className="space-y-3">
                          <h5 className="text-sm md:text-base font-semibold text-foreground">Tecnologias:</h5>
                          <div className="flex flex-wrap gap-2">
                            {exp.technologies.map((tech, techIndex) => (
                              <Badge 
                                key={techIndex}
                                variant="secondary" 
                                className="glass border border-primary/20 hover:border-primary/40 transition-smooth"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;