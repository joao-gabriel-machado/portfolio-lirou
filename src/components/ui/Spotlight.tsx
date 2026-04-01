import { useRef, useState } from 'react';

/**
 * Interactive spotlight that follows the mouse cursor.
 * Renders a radial gradient glow at cursor position over a dot grid.
 *
 * The parent element must call `onMouseMove`, `onMouseEnter`, and `onMouseLeave`
 * and pass props via the returned setters, OR use the standalone version that
 * listens on its own container.
 */
const Spotlight = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  // Exposed for parent to call
  const handleMouseMove = (e: MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  // Attach to the parent section so it works even over text/buttons
  const parentRef = useRef(false);
  const attachToParent = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (node && !parentRef.current) {
      parentRef.current = true;
      const section = node.closest('section');
      if (section) {
        section.addEventListener('mousemove', handleMouseMove as EventListener, { passive: true });
        section.addEventListener('mouseenter', () => setIsHovering(true));
        section.addEventListener('mouseleave', () => setIsHovering(false));
      }
    }
  };

  return (
    <div
      ref={attachToParent}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: `radial-gradient(ellipse 50% 50% at ${pos.x}% ${pos.y}%, black 20%, transparent 70%)`,
          WebkitMaskImage: `radial-gradient(ellipse 50% 50% at ${pos.x}% ${pos.y}%, black 20%, transparent 70%)`,
          transition: isHovering ? 'none' : 'mask-position 0.5s ease, -webkit-mask-position 0.5s ease',
        }}
      />

      {/* Spotlight glow */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, hsl(var(--primary) / 0.06), transparent 50%)`,
        }}
      />

      {/* Secondary smaller glow - brighter core */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(250px circle at ${pos.x}% ${pos.y}%, hsl(var(--primary) / 0.1), transparent 50%)`,
        }}
      />
    </div>
  );
};

export default Spotlight;
