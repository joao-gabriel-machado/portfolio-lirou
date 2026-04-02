import { ExternalLink, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import metrificaImg from '@/assets/metrifica.webp';
import redesDoValeImg from '@/assets/redes-do-vale.webp';
import twinitiImg from '@/assets/twiniti.webp';
import delpupoImg from '@/assets/delpupo-homes.webp';
import coffeeImg from '@/assets/coffee.webp';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { revealVariants, staggerContainer, staggerChild, viewportConfig } from '@/lib/motion';

type ProjectKey = 'metrifica' | 'redes' | 'twiniti' | 'delpupo' | 'coffee';

const ProjectsSection = () => {
  const { language } = useLanguage();
  const t = translations[language].projects;

  const projectsAssets: {
    key: ProjectKey;
    image: string;
    technologies: string[];
    live: string;
  }[] = [
    {
      key: 'metrifica',
      image: metrificaImg,
      technologies: ['React', 'TypeScript', 'Supabase', 'TailwindCSS', 'PWA', 'jsPDF'],
      live: 'https://metrifica.vercel.app/',
    },
    {
      key: 'redes',
      image: redesDoValeImg,
      technologies: ['React', 'Next.js', 'TypeScript', 'EmailJs', 'TailwindCSS'],
      live: 'https://redesdovale.com.br/',
    },
    {
      key: 'twiniti',
      image: twinitiImg,
      technologies: ['React', 'Vite', 'TypeScript', 'TailwindCSS'],
      live: 'https://www.twiniti.com.br/',
    },
    {
      key: 'delpupo',
      image: delpupoImg,
      technologies: ['React', 'Next.js', 'TypeScript', 'TailwindCSS'],
      live: 'https://www.delpupohomes.com/',
    },
    {
      key: 'coffee',
      image: coffeeImg,
      technologies: ['React', 'TailwindCSS', 'Vite'],
      live: 'https://coffee-delivery-two-murex.vercel.app/',
    },
  ];

  const projects = projectsAssets.map((asset) => ({
    ...asset,
    ...t.items[asset.key],
  }));

  return (
    <section id="projects" className="py-24 relative">
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

          {/* Uniform Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="grid md:grid-cols-2 gap-6 mb-12"
          >
            {projects.map((project, index) => (
              <motion.div key={project.key} variants={staggerChild}>
                <motion.a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="block h-full card-outer group glow-primary-hover transition-shadow duration-300"
                >
                  <div className="card-inner !p-0 overflow-hidden h-full flex flex-col">
                    {/* Image area - consistent for all cards */}
                    <div className="relative overflow-hidden h-52 bg-card">
                      {project.image ? (
                        <>
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover object-left-top group-hover:scale-[1.05] transition-transform duration-700 ease-out-expo"
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-5">
                            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                              <ExternalLink className="w-3.5 h-3.5" />
                              {t.viewProject}
                            </span>
                          </div>
                        </>
                      ) : (
                        /* Placeholder for projects without image */
                        <div className="w-full h-full flex items-center justify-center relative">
                          {/* Decorative grid pattern */}
                          <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                          }} />
                          {/* Large index number */}
                          <span className="text-7xl font-bold text-white/[0.04] select-none">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-card/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                              <ExternalLink className="w-3.5 h-3.5" />
                              {t.viewProject}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content - same structure for all */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-baseline gap-3">
                          <span className="text-xs font-mono text-primary/50">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                            {project.title}
                          </h3>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary flex-shrink-0 mt-1 transition-colors duration-200" />
                      </div>

                      <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-3 py-1 rounded-full glass text-xs text-muted-foreground border border-primary/10 group-hover:border-primary/20 transition-colors duration-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.a>
              </motion.div>
            ))}
          </motion.div>

          {/* View More on GitHub */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="text-center"
          >
            <motion.a
              href="https://github.com/joao-gabriel-machado?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full glass text-sm font-medium text-foreground hover:border-white/20 border border-white/10 transition-colors duration-200"
            >
              <Github className="w-5 h-5" />
              {t.viewGithub}
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
