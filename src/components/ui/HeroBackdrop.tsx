import React, { useEffect, useRef } from 'react';
import './HeroBackdrop.css';

export const POINTER_FIELD = true;

interface HeroBackdropProps {
  heroRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

function cellHash(cx: number, cy: number): number {
  const val = Math.sin(cx * 12.9898 + cy * 78.233) * 43758.5453;
  return (val - Math.floor(val)) * Math.PI;
}

export const HeroBackdrop: React.FC<HeroBackdropProps> = ({
  heroRef,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const heroEl = heroRef?.current || container;

    // Detect prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = reducedMotionQuery.matches;

    // Grid data
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let needleCount = 0;
    let xs: Float32Array = new Float32Array(0);
    let ys: Float32Array = new Float32Array(0);
    let a0s: Float32Array = new Float32Array(0);
    let as: Float32Array = new Float32Array(0);

    // Color tokens
    let needleBaseColor = 'rgba(255, 255, 255, 0.13)';
    let needleAccentRgb = '46, 196, 214';

    const updateThemeColors = () => {
      const style = getComputedStyle(heroEl);
      const base = style.getPropertyValue('--dh-needle').trim();
      const accent = style.getPropertyValue('--dh-needle-accent').trim();
      if (base) needleBaseColor = base;
      if (accent) needleAccentRgb = accent;
    };

    updateThemeColors();

    // MutationObserver to watch theme changes on <html>
    const themeObserver = new MutationObserver(() => {
      updateThemeColors();
      if (prefersReducedMotion) {
        drawStatic();
      }
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    // Real pointer tracking
    let realPointerX = -9999;
    let realPointerY = -9999;
    let isRealActive = false;
    let lastRealMoveTime = 0;
    let realFade = 0; // 0 = purely ghost, 1 = purely real

    const onPointerMove = (e: PointerEvent) => {
      if (!POINTER_FIELD || prefersReducedMotion) return;
      const rect = heroEl.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        realPointerX = e.clientX - rect.left;
        realPointerY = e.clientY - rect.top;
        isRealActive = true;
        lastRealMoveTime = performance.now();
      } else {
        isRealActive = false;
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Sizing and grid setup
    const initGrid = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));

      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.resetTransform?.();
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'butt';
      }

      // Spacing S = clamp(28, round(width / 56), 40) + 4px optimization if lower fps
      const S = Math.min(44, Math.max(32, Math.round(width / 56) + 4));
      cols = Math.ceil(width / S);
      rows = Math.ceil(height / S);
      needleCount = cols * rows;

      xs = new Float32Array(needleCount);
      ys = new Float32Array(needleCount);
      a0s = new Float32Array(needleCount);
      as = new Float32Array(needleCount);

      let idx = 0;
      for (let r = 0; r < rows; r++) {
        const cy = (r + 0.5) * S;
        for (let c = 0; c < cols; c++) {
          const cx = (c + 0.5) * S;
          xs[idx] = cx;
          ys[idx] = cy;
          const a0 = cellHash(c, r);
          a0s[idx] = a0;
          as[idx] = a0;
          idx++;
        }
      }
    };

    initGrid();

    // Debounced ResizeObserver
    let resizeTimer: NodeJS.Timeout;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initGrid();
        if (prefersReducedMotion) {
          drawStatic();
        }
      }, 60);
    });
    ro.observe(container);

    // Static frame for reduced motion
    const drawStatic = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx || needleCount === 0) return;

      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      const halfL = 4.5; // L = 9px
      for (let i = 0; i < needleCount; i++) {
        const x = xs[i];
        const y = ys[i];
        const a0 = a0s[i];
        const cos = Math.cos(a0);
        const sin = Math.sin(a0);
        ctx.moveTo(x - halfL * cos, y - halfL * sin);
        ctx.lineTo(x + halfL * cos, y + halfL * sin);
      }
      ctx.strokeStyle = needleBaseColor;
      ctx.lineWidth = 1.25;
      ctx.stroke();
    };

    if (prefersReducedMotion) {
      drawStatic();
      return () => {
        window.removeEventListener('pointermove', onPointerMove);
        themeObserver.disconnect();
        ro.disconnect();
        clearTimeout(resizeTimer);
      };
    }

    // Animation Loop
    let isIntersecting = true;
    let isVisible = !document.hidden;
    let rafId: number | null = null;
    let lastTime = performance.now();

    const io = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting && isVisible && !rafId) {
          lastTime = performance.now();
          rafId = requestAnimationFrame(loop);
        } else if (!isIntersecting && rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
      { threshold: 0.05 }
    );
    io.observe(heroEl);

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && isIntersecting && !rafId) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      } else if (!isVisible && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const loop = (now: number) => {
      let dt = (now - lastTime) / 1000;
      lastTime = now;
      if (dt > 0.05) dt = 0.05; // clamp dt to 50ms

      const t = now / 1000;

      // Update real pointer activity
      if (isRealActive && now - lastRealMoveTime > 2500) {
        isRealActive = false;
      }

      // Smooth fade between real and ghost pointer
      const targetFade = isRealActive && POINTER_FIELD ? 1 : 0;
      realFade += (targetFade - realFade) * Math.min(1, dt * 4);

      // Ghost Lissajous across right 60% of hero
      // Period ~ 24s
      const ghostX = width * (0.4 + 0.5 * (0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 24)));
      const ghostY = height * (0.5 + 0.38 * Math.sin((4 * Math.PI * t) / 24 + Math.PI / 3));

      // Effective pointer position
      const pointerX = realPointerX * realFade + ghostX * (1 - realFade);
      const pointerY = realPointerY * realFade + ghostY * (1 - realFade);

      const ctx = canvas.getContext('2d');
      if (ctx && needleCount > 0) {
        const dpr = Math.min(1.5, window.devicePixelRatio || 1);
        ctx.resetTransform?.();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        ctx.beginPath(); // Base needles batch

        const R = 240;
        const decayFactor = 1 - Math.exp(-dt / 0.12);

        for (let i = 0; i < needleCount; i++) {
          const x = xs[i];
          const y = ys[i];

          // Gentle scattered drift
          const driftAngle = a0s[i] + 0.35 * Math.sin(t * 0.6 + x * 0.01 + y * 0.013);

          // Distance to pointer
          const dx = pointerX - x;
          const dy = pointerY - y;
          const d = Math.hypot(dx, dy);

          let w = 0;
          if (d < R) {
            const u = Math.max(0, 1 - d / R);
            // smoothstep(0, 1, u)^1.5
            const s = u * u * (3 - 2 * u);
            w = Math.pow(s, 1.5);
          }

          let targetA = driftAngle;
          if (w > 0) {
            const pointerAngle = Math.atan2(dy, dx);
            let diffP = (pointerAngle - driftAngle) % Math.PI;
            if (diffP > Math.PI / 2) diffP -= Math.PI;
            if (diffP < -Math.PI / 2) diffP += Math.PI;
            targetA = driftAngle + w * diffP;
          }

          let diff = (targetA - as[i]) % Math.PI;
          if (diff > Math.PI / 2) diff -= Math.PI;
          if (diff < -Math.PI / 2) diff += Math.PI;

          as[i] += diff * decayFactor;

          const currentAngle = as[i];
          const L = 9 + 7 * w;
          const halfL = L / 2;
          const cos = Math.cos(currentAngle);
          const sin = Math.sin(currentAngle);
          const x1 = x - halfL * cos;
          const y1 = y - halfL * sin;
          const x2 = x + halfL * cos;
          const y2 = y + halfL * sin;

          if (w <= 0.08) {
            // Batch base needle
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
          }
        }

        // Stroke batched base needles
        ctx.strokeStyle = needleBaseColor;
        ctx.lineWidth = 1.25;
        ctx.stroke();

        // Draw active needles with accent color
        for (let i = 0; i < needleCount; i++) {
          const x = xs[i];
          const y = ys[i];
          const dx = pointerX - x;
          const dy = pointerY - y;
          const d = Math.hypot(dx, dy);
          if (d < R) {
            const u = Math.max(0, 1 - d / R);
            const s = u * u * (3 - 2 * u);
            const w = Math.pow(s, 1.5);
            if (w > 0.08) {
              const currentAngle = as[i];
              const L = 9 + 7 * w;
              const halfL = L / 2;
              const cos = Math.cos(currentAngle);
              const sin = Math.sin(currentAngle);
              ctx.beginPath();
              ctx.moveTo(x - halfL * cos, y - halfL * sin);
              ctx.lineTo(x + halfL * cos, y + halfL * sin);
              ctx.strokeStyle = `rgba(${needleAccentRgb}, ${(0.18 + 0.55 * w).toFixed(3)})`;
              ctx.lineWidth = 1.25;
              ctx.stroke();
            }
          }
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      themeObserver.disconnect();
      ro.disconnect();
      io.disconnect();
      clearTimeout(resizeTimer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [heroRef]);

  return (
    <div
      ref={containerRef}
      className={`dh-hero-backdrop ${className}`}
      aria-hidden="true"
    >
      {/* a) Static soft glow circle for glass refraction */}
      <div className="dh-hero-static-glow" />

      {/* b) Canvas 2D needle field with calming horizontal mask */}
      <div className="dh-hero-canvas-wrap">
        <canvas ref={canvasRef} className="dh-hero-canvas" />
      </div>
    </div>
  );
};
