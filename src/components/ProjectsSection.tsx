import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Github } from 'lucide-react';
import redesDoValeImg from '@/assets/redes-do-vale.png'
import twinitiImg from '@/assets/twiniti.png'
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const ProjectsSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const projects = [
    {
      title: 'Redes do vale',
      description: 'Site institucional desenvolvido para uma empresa de redes de proteção, com foco em navegação simples, visual limpo e comunicação direta dos serviços. O projeto reforça a confiança e facilita o contato com clientes da região.',
      image: redesDoValeImg,
      technologies: ['React', 'Next.js', 'TypeScript', 'EmailJs', 'TailwindCSS'],
      github: '#',
      live: 'https://redesdovale.com.br/',
      featured: true,
    },
    {
      title: 'Twiniti Tech',
      description: 'Site institucional desenvolvido para uma empresa de tecnologia especializada em softwares sob medida, com foco em inovação, performance e apresentação clara dos serviços e cases.',
      image: twinitiImg,
      technologies: ['React', 'Vite', 'TypeScript', 'TailwindCSS'],
      github: '#',
      live: '#',
      featured: true,
    },
    {
      title: 'Vitta Soluções Ergonômicas',
      description: 'Site institucional desenvolvido para uma empresa de ergonomia, com design limpo, navegação intuitiva e foco na apresentação clara dos serviços e captação de clientes.',
      image: '',
      technologies: ['React', 'Next.js', 'TypeScript', 'TailwindCSS'],
      github: '#',
      live: 'https://vittasolucoesergonomicas.com.br/',
      featured: false,
    },
    {
      title: 'Coffee Delivery (projeto de front-end para estudo)',
      description: 'Protótipo de site focado em entrega de café, desenvolvido com ênfase em front-end. Interface moderna, responsiva, boa usabilidade, visual atraente e detalhamento na apresentação dos produtos.',
      image: '#',
      technologies: ['React', 'TailwindCSS', 'Vite'],
      github: '#',
      live: 'https://coffee-delivery-two-murex.vercel.app/',
      featured: false,
    },
  ];

  return (
    <section id="projects" className="py-12 md:py-20 relative" ref={ref}>
      <div className={`container mx-auto px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16 animate-fade-in-up">
            <p className="text-sm uppercase tracking-widest text-primary font-medium mb-4">
              Portfólio
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Projetos Recentes
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Trabalhos desenvolvidos com tecnologias modernas
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {projects.filter(p => p.featured).map((project, index) => (
              <Card 
                key={index} 
                className="gradient-card border-primary/20 hover-lift group overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="relative overflow-hidden">
                  <div className="h-64 flex items-center justify-center overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="object-cover object-left-top w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth flex items-end justify-center pb-6">
                    <div className="flex gap-4">
                      <Button size="sm" className="gradient-primary">
                        <a href={project.live} target='_blank' className='flex items-center'>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver projeto
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    {project.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge 
                        key={techIndex}
                        variant="secondary" 
                        className="glass border border-primary/20"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {projects.filter(p => !p.featured).map((project, index) => (
              <Card 
                key={index + 2} 
                className="gradient-card border-primary/20 hover-lift group animate-fade-in-up"
                style={{ animationDelay: `${(index + 2) * 0.2}s` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-foreground">
                      {project.title}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="p-2">
                        <a href={project.live} target='_blank' className='flex items-center'>
                        <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 3).map((tech, techIndex) => (
                      <Badge 
                        key={techIndex}
                        variant="secondary" 
                        className="text-xs glass border border-primary/20"
                      >
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.technologies.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View More Button */}
          <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <Button size="lg" variant="outline" className="glass hover-lift">
              <a href='https://github.com/joao-gabriel-machado?tab=repositories' target='_blank' className='flex items-center'>
                <Github className="w-5 h-5 mr-2" />
                  Ver mais no GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
