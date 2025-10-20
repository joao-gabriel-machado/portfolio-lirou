import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send, Github, Linkedin, Instagram } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const ContactSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'jgomachado@hotmail.com',
      href: 'mailto:jgomachado@hotmail.com',
    },
    {
      icon: Phone,
      label: 'Telefone',
      value: '+55 (12) 98708-3178',
      href: 'tel:+5512987083178',
    },
    {
      icon: MapPin,
      label: 'Localização',
      value: 'São José dos Campos, SP',
      href: '#',
    },
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com/joao-gabriel-machado', label: 'GitHub' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/jo%C3%A3o-gabriel-machado-231880205/', label: 'LinkedIn' },
    { icon: Instagram, href: 'https://www.instagram.com/liroujohn_/', label: 'Instagram' },
  ];

  return (
    <section id="contact" className="py-12 md:py-20 relative bg-gradient-subtle" ref={ref}>
      <div className={`container mx-auto px-4 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 md:mb-20 text-center lg:text-left">
            <p className="text-sm uppercase tracking-widest text-primary font-medium mb-4">
              Contato
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
              Vamos conversar?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              Aberto a novos projetos e oportunidades
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 md:gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <div className="space-y-4 md:space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <a
                      key={index}
                      href={info.href}
                      className="group flex items-start gap-3 md:gap-4 p-3 md:p-4 glass border-border hover:border-primary/50 rounded-lg transition-smooth hover-lift"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                          {info.label}
                        </p>
                        <p className="text-sm md:text-base text-foreground font-medium group-hover:text-primary transition-smooth">
                          {info.value}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Social Links */}
              <div className="pt-6 md:pt-8 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-4">
                  Redes Sociais
                </p>
                <div className="flex gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <Button
                        key={social.label}
                        size="icon"
                        variant="outline"
                        className="glass hover-lift border-border hover:border-primary/50 transition-smooth"
                        onClick={() => window.open(social.href, '_blank')}
                        aria-label={social.label}
                      >
                        <Icon className="w-4 h-4" />
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="lg:col-span-3 glass border-border">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl text-foreground">
                  Enviar mensagem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Nome
                    </label>
                    <Input 
                      placeholder="Seu nome" 
                      className="glass border-border focus:border-primary transition-smooth"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Email
                    </label>
                    <Input 
                      type="email" 
                      placeholder="seu@email.com" 
                      className="glass border-border focus:border-primary transition-smooth"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Assunto
                  </label>
                  <Input 
                    placeholder="Assunto da mensagem" 
                    className="glass border-border focus:border-primary transition-smooth"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Mensagem
                  </label>
                  <Textarea 
                    placeholder="Conte-me sobre seu projeto..." 
                    rows={6}
                    className="glass border-border focus:border-primary transition-smooth resize-none"
                  />
                </div>

                <Button 
                  size="lg" 
                  className="w-full bg-foreground text-background hover:bg-foreground/90 transition-smooth group"
                >
                  <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-smooth" />
                  Enviar mensagem
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;