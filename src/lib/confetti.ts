import confetti from "canvas-confetti";

interface ConfettiOptions {
  origin?: { x: number; y: number };
  colors?: string[];
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  gravity?: number;
  ticks?: number;
}

const defaultColors = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];

export function triggerConfetti(options: ConfettiOptions = {}) {
  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  confetti({
    particleCount: options.particleCount || 100,
    spread: options.spread || 70,
    startVelocity: options.startVelocity || 30,
    gravity: options.gravity || 0.8,
    ticks: options.ticks || 200,
    colors: options.colors || defaultColors,
    origin: options.origin || { x: Math.random(), y: Math.random() - 0.2 },
    disableForReducedMotion: true,
  });
}

export function triggerNodeConfetti(nodeRef: HTMLElement | null) {
  if (!nodeRef) return;
  const rect = nodeRef.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  triggerConfetti({
    origin: { x, y },
    particleCount: 60,
    spread: 60,
    startVelocity: 25,
  });
}

export function triggerCelebration() {
  const duration = 2000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: defaultColors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: defaultColors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}
