import { motion } from 'framer-motion';
import { revealVariants, viewportConfig } from '@/lib/motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      className="py-8 border-t border-border"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-2">
              <img
                src="https://github.com/joao-gabriel-machado.png"
                alt="João Gabriel"
                className="w-6 h-6 rounded-full border border-white/10"
              />
              <span className="text-xs font-medium text-foreground">LirouDev</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>&copy; {currentYear}</span>
              <span className="text-foreground">João Gabriel</span>
              <span>&middot;</span>
              <span>Full-Stack Developer</span>
            </div>

            <div className="text-xs text-muted-foreground">
              React + Tailwind CSS
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
