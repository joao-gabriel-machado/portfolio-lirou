import { lazy, Suspense, useEffect, useState } from 'react';

/**
 * Fixed full-viewport layer with the Three.js floating-shapes scene.
 * The heavy chunk (three + react-three-fiber) is lazy-loaded after the
 * first paint so it never competes with LCP or affects the initial bundle.
 * Renders nothing when WebGL is unavailable — the existing MeshGradient
 * remains as the natural fallback background.
 */

const FloatingShapesCanvas = lazy(() => import('./FloatingShapesCanvas'));

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

const FloatingShapesLayer = () => {
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!supportsWebGL()) return;

    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setIsMobile(window.matchMedia('(max-width: 767px), (pointer: coarse)').matches);

    // Defer mounting the 3D chunk until the browser is idle.
    const idle: (cb: () => void) => number =
      'requestIdleCallback' in window
        ? (cb) => window.requestIdleCallback(cb, { timeout: 2000 })
        : (cb) => window.setTimeout(cb, 300);
    const id = idle(() => setReady(true));

    return () => {
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, []);

  if (!ready) return null;

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden>
      <Suspense fallback={null}>
        <FloatingShapesCanvas reducedMotion={reducedMotion} isMobile={isMobile} />
      </Suspense>
    </div>
  );
};

export default FloatingShapesLayer;
