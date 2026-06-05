import { motion } from 'framer-motion';

interface QuoteProgressProps {
  step: number; // 0-based
  total: number;
  label: string; // already interpolated "Passo X de Y"
}

/** Minimal animated progress bar shown at the top of the wizard card. */
const QuoteProgress = ({ step, total, label }: QuoteProgressProps) => {
  const pct = ((step + 1) / total) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          {label}
        </span>
        <span className="text-xs font-mono text-primary/70">
          {String(step + 1).padStart(2, '0')}
          <span className="text-muted-foreground/40">/{String(total).padStart(2, '0')}</span>
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
};

export default QuoteProgress;
