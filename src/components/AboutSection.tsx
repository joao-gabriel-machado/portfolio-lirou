import { Code, Heart, Target } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const AboutSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  const stats = [
    { label: 'Anos de Experiência', value: '+3', icon: Code },
    { label: 'Projetos Entregues', value: '+10', icon: Target },
    { label: 'Tecnologias', value: '+15', icon: Heart },
  ];

  return (
    <section id="about" className="py-12 md:py-20 relative" ref={ref}>
      <div className={`container mx-auto px-4 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 md:mb-20 text-center lg:text-left">
            <p className="text-sm uppercase tracking-widest text-primary font-medium mb-4">
              Sobre
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Full-Stack Developer<br className="hidden sm:block" /> com foco em UX
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
                  <span className="text-primary font-semibold">Desenvolvedor Full-Stack</span> com 
                  3+ anos criando soluções completas e modernas.
                </p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Especialista em React, TypeScript e Tailwind CSS no front-end, e Java com QUARKUS no back-end. 
                  Transformo designs em código limpo e performático, com foco em UX e arquitetura escalável.
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Experiência sólida com Java me permite desenvolver APIs RESTful robustas, implementar 
                  padrões de design e garantir qualidade através de testes automatizados.
                </p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Busco sempre o equilíbrio entre design, performance e boas práticas. Movido por desafios 
                  e pela evolução constante em toda a stack de desenvolvimento.
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