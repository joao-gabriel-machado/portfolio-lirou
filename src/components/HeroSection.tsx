import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Mail } from 'lucide-react';
import Spotlight from '@/components/ui/Spotlight';
import MeshGradient from '@/components/ui/MeshGradient';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';

const ease = [0.16, 1, 0.3, 1] as const;

// Characters to cycle through during decode
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>/';

/**
 * Tech decode text effect - characters scramble then resolve to the real text.
 */
const DecodeText = ({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) => {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    let frame = 0;
    const totalFrames = text.length * 3; // 3 scramble cycles per char
    let rafId: number;

    const animate = () => {
      frame++;
      const resolved = Math.floor(frame / 3); // chars fully resolved
      let result = '';

      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          result += ' ';
        } else if (i < resolved) {
          result += text[i];
        } else if (i === resolved) {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        } else {
          result += '';
        }
      }

      setDisplayed(result);

      if (frame < totalFrames) {
        rafId = requestAnimationFrame(animate);
      } else {
        setDisplayed(text);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [started, text]);

  if (!started) return <span className={className}>&nbsp;</span>;

  return (
    <span className={className}>
      {displayed.split('').map((char, i) => (
        <span
          key={i}
          className={
            i < text.length && char === text[i]
              ? 'text-foreground'
              : 'text-primary/70'
          }
        >
          {char || '\u00A0'}
        </span>
      ))}
    </span>
  );
};

/**
 * Horizontal beam that shoots across the screen
 */
const Beam = ({
  top,
  delay,
  duration,
  direction = 'left',
}: {
  top: string;
  delay: number;
  duration: number;
  direction?: 'left' | 'right';
}) => (
  <motion.div
    className="absolute h-px pointer-events-none"
    style={{ top, [direction === 'left' ? 'right' : 'left']: '100%' }}
    initial={{ width: 0, opacity: 0 }}
    animate={{
      width: ['0%', '40%', '0%'],
      opacity: [0, 1, 0],
      [direction === 'left' ? 'right' : 'left']: ['100%', '30%', '-10%'],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      repeatDelay: duration * 1.5,
      ease: 'linear',
    }}
  >
    <div
      className={`w-full h-full ${
        direction === 'left'
          ? 'bg-gradient-to-l from-primary/60 via-primary/20 to-transparent'
          : 'bg-gradient-to-r from-primary/60 via-primary/20 to-transparent'
      }`}
    />
  </motion.div>
);

const HeroSection = () => {
  const { language } = useLanguage();
  const t = translations[language].hero;

  return (
    <section
      id="home"
      className="relative min-h-[100dvh] overflow-hidden flex items-center justify-center"
    >
      {/* Layer 1: Mesh gradient blobs */}
      <MeshGradient />

      {/* Layer 2: Interactive spotlight + dot grid */}
      <Spotlight />

      {/* Layer 3: Animated beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <Beam top="20%" delay={1} duration={3} direction="left" />
        <Beam top="45%" delay={3.5} duration={2.5} direction="right" />
        <Beam top="70%" delay={6} duration={3.5} direction="left" />
        <Beam top="85%" delay={8} duration={2} direction="right" />
      </div>

      {/* Layer 4: Corner accents */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {/* Top-left bracket */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute top-[12%] left-[6%] w-16 h-16"
        >
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-primary/30 to-transparent" />
          <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-primary/30 to-transparent" />
        </motion.div>

        {/* Bottom-right bracket */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="absolute bottom-[12%] right-[6%] w-16 h-16"
        >
          <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-primary/30 to-transparent" />
          <div className="absolute bottom-0 right-0 w-px h-full bg-gradient-to-t from-primary/30 to-transparent" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Role badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
              {t.role}
            </span>
          </motion.div>

          {/* Name - decode effect */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-8">
            <DecodeText
              text={t.greeting}
              className="text-gradient font-bold"
              delay={0.5}
            />
          </h1>

          {/* Tagline - fade in after decode finishes */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 1.8 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed mx-auto mb-12"
          >
            {t.tagline}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 2.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.a
              href="#contact"
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 40px hsl(178 70% 41% / 0.35)',
              }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-sm transition-colors duration-200 hover:bg-primary/90"
            >
              <Mail className="w-4 h-4" />
              {t.contactBtn}
            </motion.a>

            <motion.a
              href={t.downloadCvLink}
              download
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full border border-white/10 text-foreground font-semibold text-sm glass hover:border-primary/30 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              {t.downloadCvBtn}
            </motion.a>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
