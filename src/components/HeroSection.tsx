import { Button } from '@/components/ui/button';
import { ArrowDown, Download, Mail } from 'lucide-react';
import profileImage from '@/assets/perfil.jpg';
import { AuroraBackground } from '@/components/ui/aurora-background';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen  overflow-hidden">
      <AuroraBackground>
        <div className="relative min-h-screen flex items-center justify-center pt-20 md:pt-0 z-10">
          <div className="container mx-auto px-4 py-12 md:py-8">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-8 mt-36 md:mt-0 animate-fade-in text-center lg:text-left">
                <div className="space-y-6">
                  <div className="inline-block">
                    <p className="text-sm uppercase tracking-widest dark:text-white/80 text-primary font-medium">
                      Full-Stack Developer
                    </p>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl dark:text-white text-primary md:text-6xl lg:text-6xl font-bold leading-tight">
                    Olá, meu nome é João Gabriel
                  </h1>
                  
                  <p className="text-lg sm:text-xl dark:text-white/80 max-w-lg text-primary tracking-tighter leading-relaxed mx-auto lg:mx-0">
                    Transformando ideias em interfaces modernas e funcionais
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    size="lg" 
                    className="group relative hover-lift overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90 transition-smooth"
                    onClick={() => window.location.href = '#contact'}
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Contato
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="group relative hover-lift overflow-hidden bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black transition-smooth"
                    asChild
                  >
                    <a 
                      href="/CV_JoaoMachado.pdf"
                      download="CV_JoaoMachado.pdf"
                    >
                      <Download className="w-5 h-5 mr-2 transition-smooth" />
                      Baixar CV
                    </a>
                  </Button>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end animate-scale-in mt-8 lg:mt-0">
                <div className="relative group">
                  <div className="absolute inset-0 rounded-lg blur-3xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-smooth duration-700" />
                  
                  <div className="relative w-[280px] h-[350px] sm:w-[300px] sm:h-[380px] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-smooth">
                    <img
                      src={profileImage}
                      alt="João Gabriel - Desenvolvedor Front-End"
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-smooth duration-500"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    
                    <div className="absolute inset-0 rounded-lg transition-smooth" />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
              <ArrowDown className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </AuroraBackground>
    </section>
  );
};

export default HeroSection;

