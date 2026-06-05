import { ReactNode } from 'react';

interface StepShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** Title + subtitle header shared by every step, with the step body below. */
const StepShell = ({ title, subtitle, children }: StepShellProps) => (
  <div>
    <div className="mb-7">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-sm md:text-base text-muted-foreground">{subtitle}</p>
      )}
    </div>
    {children}
  </div>
);

export default StepShell;
