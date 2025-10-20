"use client";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/****
 * AuroraBackground
 * - Suave animação em ondas estilo aurora boreal
 * - Usa tokens de cor do design system (HSL via CSS vars) para respeitar light/dark
 * - Baixa opacidade + blend para não apagar textos
 * - Interativo: leve parallax com o mouse
 */
export const AuroraBackground = ({
  className,
  containerClassName,
  interactive = true,
}: {
  className?: string;
  containerClassName?: string;
  interactive?: boolean;
}) => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!interactive) return;
    const listener = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / 40;
      const y = (e.clientY - window.innerHeight / 2) / 60;
      setPos({ x, y });
    };
    window.addEventListener("mousemove", listener);
    return () => window.removeEventListener("mousemove", listener);
  }, [interactive]);

  return (
    <div
      className={cn("absolute inset-0 -z-10 overflow-hidden", containerClassName)}
      aria-hidden
      
    >
      {/* Fundo base do tema */}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,hsl(var(--background)),hsl(var(--muted)))]" />

      {/* Camada de aurora com parallax sutil */}
      <div
        ref={parallaxRef}
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
        className={cn("relative h-full w-full transition-transform duration-200 ease-out", className)}
      >
        {/* Lâmina 1 - primária */}
        <div
          className={cn(
            "absolute -inset-40 blur-3xl opacity-60",
            // máscara para dar forma de onda/aurora
            "[mask-image:radial-gradient(60%_60%_at_50%_30%,_black_30%,_transparent_70%)]",
            // cor e blend usando tokens do tema
            "[background:radial-gradient(120%_80%_at_40%_30%,_hsl(var(--primary)/0.28),_transparent_60%)]",
            "mix-blend-lighten animate-first"
          )}
        />

        {/* Lâmina 2 - acento */}
        <div
          className={cn(
            "absolute -inset-48 blur-[90px] opacity-55",
            "[mask-image:radial-gradient(70%_70%_at_70%_60%,_black_25%,_transparent_65%)]",
            "[background:radial-gradient(120%_80%_at_70%_60%,_hsl(var(--accent)/0.24),_transparent_60%)]",
            "mix-blend-lighten animate-second"
          )}
        />

        {/* Lâmina 3 - secundária/muted para profundidade */}
        <div
          className={cn(
            "absolute -inset-52 blur-[100px] opacity-50",
            "[mask-image:radial-gradient(80%_60%_at_30%_70%,_black_20%,_transparent_70%)]",
            "[background:radial-gradient(120%_80%_at_30%_70%,_hsl(var(--secondary)/0.20),_transparent_60%)]",
            "mix-blend-lighten animate-third"
          )}
        />

        {/* Lâmina 4 - leve brilho superior */}
        <div
          className={cn(
            "absolute -inset-32 blur-[80px] opacity-40",
            "[mask-image:radial-gradient(80%_50%_at_50%_-10%,_black_10%,_transparent_60%)]",
            "[background:radial-gradient(100%_60%_at_50%_-10%,_hsl(var(--primary)/0.18),_transparent_60%)]",
            "mix-blend-lighten animate-fourth"
          )}
        />
      </div>

      {/* Discreto granulado para textura (performance-friendly) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(hsl(var(--foreground)/0.15)_1px,transparent_1px)] [background-size:12px_12px]" />
    </div>
  );
};

export default AuroraBackground;
