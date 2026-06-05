import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * Large selectable card — used for single-choice steps (project type, design,
 * timeline, budget). `multi` only changes the indicator shape (square vs circle).
 */
export const SelectCard = ({
  selected,
  onClick,
  title,
  description,
  multi = false,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  multi?: boolean;
}) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    aria-pressed={selected}
    className={`relative w-full text-left rounded-xl p-px transition-colors duration-200 ${
      selected
        ? 'bg-gradient-to-br from-primary/60 to-accent/40'
        : 'bg-gradient-to-br from-white/10 to-white/[0.03] hover:from-primary/30'
    }`}
  >
    <div
      className={`rounded-[11px] px-5 py-4 flex items-center gap-4 transition-colors duration-200 ${
        selected ? 'bg-primary/[0.07]' : 'bg-card'
      }`}
    >
      {/* Indicator */}
      <span
        className={`flex-shrink-0 flex items-center justify-center w-5 h-5 border transition-all duration-200 ${
          multi ? 'rounded-md' : 'rounded-full'
        } ${
          selected
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-white/20 text-transparent'
        }`}
      >
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
      </span>

      <span className="min-w-0">
        <span
          className={`block text-sm md:text-base font-semibold transition-colors duration-200 ${
            selected ? 'text-primary' : 'text-foreground'
          }`}
        >
          {title}
        </span>
        {description && (
          <span className="block text-xs md:text-sm text-muted-foreground mt-0.5">
            {description}
          </span>
        )}
      </span>
    </div>
  </motion.button>
);

/** Compact toggle pill — used for the multi-select scope step. */
export const TogglePill = ({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileTap={{ scale: 0.96 }}
    aria-pressed={selected}
    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-colors duration-200 ${
      selected
        ? 'bg-primary/15 border-primary/40 text-primary'
        : 'bg-white/[0.03] border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground'
    }`}
  >
    <span
      className={`flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-200 ${
        selected ? 'bg-primary border-primary text-primary-foreground' : 'border-white/25 text-transparent'
      }`}
    >
      <Check className="w-2.5 h-2.5" strokeWidth={3.5} />
    </span>
    {label}
  </motion.button>
);

/** Styled text input/textarea matching the dark glass theme. */
export const QuoteField = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="block text-sm font-medium text-foreground mb-2">{label}</span>
    {children}
    {error && <span className="block text-xs text-destructive mt-1.5">{error}</span>}
  </label>
);

export const inputClass =
  'w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors duration-200 focus:border-primary/50 focus:bg-white/[0.05]';
