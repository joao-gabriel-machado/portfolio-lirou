import type { Transition, Variants } from "framer-motion";

// ── Shared spring for interactive elements ──
export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

// ── Scroll reveal: blur + slide up ──
export const revealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 32,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1], // out-expo
    },
  },
};

// ── Stagger container ──
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// ── Stagger child (used inside staggerContainer) ──
export const staggerChild: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// ── Viewport config for whileInView ──
export const viewportConfig = {
  once: true,
  margin: "-80px" as const,
};

// ── Scale reveal for hero image, stats, etc. ──
export const scaleReveal: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// ── Navbar entrance ──
export const navbarVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 25,
      delay: 0.2,
    },
  },
};
