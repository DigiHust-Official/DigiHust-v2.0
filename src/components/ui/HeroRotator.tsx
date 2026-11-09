import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { HERO_MESSAGES, parseHead, HeadLine } from '../../data/heroMessages';
import './HeroRotator.css';

const DWELL_MS = 3000;
const START_DELAY_MS = 10;
const STAGGER_MS = 10;
const JITTER_MS = 40;
const FLICKER_MS = 25;
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&@$?!<>/{}[]=+*';
const GLYPHS_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GLYPHS_LOWER = 'abcdefghijklmnopqrstuvwxyz';

interface HeroRotatorProps {
  isButtonsHovered?: boolean;
  className?: string;
}

interface CharState {
  el: HTMLSpanElement;
  target: string;
  resolveAt: number;
  isResolved: boolean;
  lastFlicker: number;
  isUpper: boolean;
  isLower: boolean;
}

export const HeroRotator: React.FC<HeroRotatorProps> = ({
  isButtonsHovered = false,
  className = '',
}) => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRotHovered, setIsRotHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const [isDocHidden, setIsDocHidden] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const subRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;

  const currentRafId = useRef<number | null>(null);
  const subTimerId = useRef<NodeJS.Timeout | null>(null);
  const isInitialScrambled = useRef(false);

  // Parse messages once or per language change
  const parsedMessages: HeadLine[][] = HERO_MESSAGES.map((msg) =>
    parseHead(t(msg.headKey))
  );

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // IntersectionObserver to pause when off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Document visibility change listener
  useEffect(() => {
    const handler = () => {
      setIsDocHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  // Compute pause state
  const isPaused =
    prefersReducedMotion ||
    isRotHovered ||
    isButtonsHovered ||
    isFocusWithin ||
    !isIntersecting ||
    isDocHidden;

  // Scramble execution function (compressed to resolve <= 380ms, total change-over <= 500ms)
  const runScramble = useCallback(
    (newIndex: number, oldIndex?: number) => {
      if (prefersReducedMotion) return;

      // Cancel ongoing rAF loop and sub timer
      if (currentRafId.current !== null) {
        cancelAnimationFrame(currentRafId.current);
        currentRafId.current = null;
      }
      if (subTimerId.current !== null) {
        clearTimeout(subTimerId.current);
        subTimerId.current = null;
      }

      const newSlideEl = slideRefs.current[newIndex];
      const newSubEl = subRefs.current[newIndex];
      const oldSlideEl = oldIndex !== undefined ? slideRefs.current[oldIndex] : null;
      const oldSubEl = oldIndex !== undefined ? subRefs.current[oldIndex] : null;

      // 1. Fade out old slide in 120ms
      if (oldSlideEl && oldSlideEl !== newSlideEl) {
        oldSlideEl.style.transition = 'opacity 120ms ease-out';
        oldSlideEl.style.opacity = '0';
        setTimeout(() => {
          if (activeIndexRef.current !== oldIndex) {
            oldSlideEl.style.visibility = 'hidden';
          }
        }, 120);
      }
      if (oldSubEl && oldSubEl !== newSubEl) {
        oldSubEl.style.transition = 'opacity 120ms ease-out';
        oldSubEl.style.opacity = '0';
        setTimeout(() => {
          if (activeIndexRef.current !== oldIndex) {
            oldSubEl.style.visibility = 'hidden';
          }
        }, 120);
      }

      if (!newSlideEl) return;

      // Make new slide visible & reset its mark spans
      newSlideEl.style.visibility = 'visible';
      newSlideEl.style.opacity = '1';
      newSlideEl.style.transition = 'none';

      const markEls = Array.from(
        newSlideEl.querySelectorAll<HTMLSpanElement>('[data-mark-phrase="true"]')
      );
      markEls.forEach((m) => {
        m.style.transition = 'none';
        m.style.backgroundSize = '0% 100%';
        m.classList.remove('dh-mark--drawn');
      });

      // Prepare subslide to fade in starting 100ms after scramble starts (completes by 480ms)
      if (newSubEl) {
        newSubEl.style.visibility = 'visible';
        newSubEl.style.opacity = '0';
        newSubEl.style.transform = 'translateY(6px)';
        newSubEl.style.transition = 'none';

        subTimerId.current = setTimeout(() => {
          if (activeIndexRef.current === newIndex && newSubEl) {
            newSubEl.style.transition =
              'opacity 380ms cubic-bezier(0.16, 1, 0.3, 1), transform 380ms cubic-bezier(0.16, 1, 0.3, 1)';
            newSubEl.style.opacity = '1';
            newSubEl.style.transform = 'translateY(0)';
          }
        }, 100);
      }

      // Measure every char span's width and lock it
      const chEls = Array.from(
        newSlideEl.querySelectorAll<HTMLSpanElement>('.dh-ch:not(.dh-ch--space)')
      );

      const widths = chEls.map((el) => el.getBoundingClientRect().width);
      chEls.forEach((el, idx) => {
        const w = widths[idx];
        if (w > 0) {
          el.style.display = 'inline-block';
          el.style.width = `${w}px`;
          el.style.textAlign = 'center';
        }
        el.classList.add('dh-ch--scr');
      });

      // Setup character scramble schedules (capped at 380ms)
      const charStates: CharState[] = chEls.map((el, i) => {
        const target = el.getAttribute('data-target') || el.textContent || '';
        const rawResolve =
          START_DELAY_MS + i * STAGGER_MS + Math.floor(Math.random() * JITTER_MS);
        const resolveAt = Math.min(rawResolve, 380);

        return {
          el,
          target,
          resolveAt,
          isResolved: false,
          lastFlicker: 0,
          isUpper: /[A-Z]/.test(target),
          isLower: /[a-z]/.test(target),
        };
      });

      const startTime = performance.now();

      const rafLoop = (now: number) => {
        const elapsed = now - startTime;
        let allDone = true;

        for (let i = 0; i < charStates.length; i++) {
          const state = charStates[i];
          if (state.isResolved) continue;

          if (elapsed >= state.resolveAt) {
            state.isResolved = true;
            state.el.textContent = state.target;
            state.el.classList.remove('dh-ch--scr');
            state.el.style.width = '';
            state.el.style.textAlign = '';

            // Check if any mark phrases are fully resolved
            markEls.forEach((markEl) => {
              if (markEl.classList.contains('dh-mark--drawn')) return;
              const markChars = Array.from(
                markEl.querySelectorAll<HTMLSpanElement>('.dh-ch:not(.dh-ch--space)')
              );
              const markDone = markChars.every(
                (c) => !c.classList.contains('dh-ch--scr')
              );
              if (markDone) {
                markEl.classList.add('dh-mark--drawn');
                markEl.style.transition =
                  'background-size 350ms cubic-bezier(0.2, 0.7, 0.2, 1)';
                markEl.style.backgroundSize = '100% 100%';
              }
            });
          } else {
            allDone = false;
            if (now - state.lastFlicker >= FLICKER_MS) {
              state.lastFlicker = now;
              if (state.isUpper) {
                state.el.textContent =
                  GLYPHS_UPPER[Math.floor(Math.random() * GLYPHS_UPPER.length)];
              } else if (state.isLower) {
                state.el.textContent =
                  GLYPHS_LOWER[Math.floor(Math.random() * GLYPHS_LOWER.length)];
              } else {
                state.el.textContent =
                  GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
              }
            }
          }
        }

        if (!allDone) {
          currentRafId.current = requestAnimationFrame(rafLoop);
        } else {
          currentRafId.current = null;
          // Ensure all mark phrases in this slide have drawn
          markEls.forEach((markEl) => {
            markEl.classList.add('dh-mark--drawn');
            markEl.style.transition =
              'background-size 350ms cubic-bezier(0.2, 0.7, 0.2, 1)';
            markEl.style.backgroundSize = '100% 100%';
          });
        }
      };

      currentRafId.current = requestAnimationFrame(rafLoop);
    },
    [prefersReducedMotion]
  );

  // Initial load fonts.ready scramble trigger
  useEffect(() => {
    if (prefersReducedMotion) {
      const s0 = slideRefs.current[0];
      const sub0 = subRefs.current[0];
      if (s0) {
        s0.style.visibility = 'visible';
        s0.style.opacity = '1';
        const marks = s0.querySelectorAll<HTMLSpanElement>('[data-mark-phrase="true"]');
        marks.forEach((m) => {
          m.style.backgroundSize = '100% 100%';
        });
      }
      if (sub0) {
        sub0.style.visibility = 'visible';
        sub0.style.opacity = '1';
        sub0.style.transform = 'translateY(0)';
      }
      return;
    }

    if (isInitialScrambled.current) return;

    let hasRun = false;
    const fontsReady = (document as unknown as { fonts?: { ready: Promise<void> } }).fonts
      ? (document as unknown as { fonts: { ready: Promise<void> } }).fonts.ready
      : Promise.resolve();

    const safetyTimer = setTimeout(() => {
      if (!hasRun) {
        hasRun = true;
        isInitialScrambled.current = true;
        runScramble(0);
      }
    }, 900);

    fontsReady.then(() => {
      if (!hasRun) {
        setTimeout(() => {
          if (!hasRun) {
            hasRun = true;
            clearTimeout(safetyTimer);
            isInitialScrambled.current = true;
            runScramble(0);
          }
        }, 250);
      }
    });

    return () => {
      clearTimeout(safetyTimer);
    };
  }, [prefersReducedMotion, runScramble]);

  // Rotate to the next message every 3000ms looping forever
  const dwellAccRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let rafId: number;
    const tick = (now: number) => {
      if (lastTickRef.current === null) {
        lastTickRef.current = now;
      }
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;

      if (!isPaused) {
        dwellAccRef.current += dt;
        if (dwellAccRef.current >= DWELL_MS) {
          dwellAccRef.current = 0;
          const prev = activeIndexRef.current;
          const next = (prev + 1) % HERO_MESSAGES.length;
          activeIndexRef.current = next;
          setActiveIndex(next);
          runScramble(next, prev);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPaused, prefersReducedMotion, runScramble]);

  return (
    <div
      ref={containerRef}
      className={`dh-rot ${className}`}
      role="region"
      aria-label="DigiHust Hero Headline Rotator"
      aria-live="off"
      onMouseEnter={() => setIsRotHovered(true)}
      onMouseLeave={() => setIsRotHovered(false)}
      onPointerEnter={() => setIsRotHovered(true)}
      onPointerLeave={() => setIsRotHovered(false)}
      onFocus={() => setIsFocusWithin(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocusWithin(false);
        }
      }}
    >
      {/* ── HEADLINE (H1, 5 stacked slides, zero layout shift) ── */}
      <h1 className="dh-rot__h1">
        {HERO_MESSAGES.map((msg, i) => {
          const lines: HeadLine[] = parsedMessages[i];
          const isActive = activeIndex === i;
          return (
            <span
              key={msg.id}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className={`dh-slide ${isActive ? 'dh-slide--active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of 5`}
              aria-hidden={!isActive}
              style={{
                visibility: isActive ? 'visible' : 'hidden',
                opacity: isActive ? 1 : 0,
              }}
            >
              {lines.map((line: HeadLine, lIdx: number) => (
                <span key={lIdx} className="dh-rot__line">
                  {line.map((seg, sIdx: number) => {
                    const chars = Array.from(seg.text);
                    if (seg.mark) {
                      return (
                        <span
                          key={sIdx}
                          className="dh-rot__seg-wrap dh-mark"
                          data-mark-phrase="true"
                        >
                          {chars.map((ch: string, cIdx: number) => (
                            <span
                              key={cIdx}
                              className={`dh-ch ${ch === ' ' ? 'dh-ch--space' : ''}`}
                              data-target={ch}
                            >
                              {ch}
                            </span>
                          ))}
                        </span>
                      );
                    }
                    return (
                      <span key={sIdx} className="dh-rot__seg-wrap">
                        {chars.map((ch: string, cIdx: number) => (
                          <span
                            key={cIdx}
                            className={`dh-ch ${ch === ' ' ? 'dh-ch--space' : ''}`}
                            data-target={ch}
                          >
                            {ch}
                          </span>
                        ))}
                      </span>
                    );
                  })}
                </span>
              ))}
            </span>
          );
        })}
      </h1>

      {/* ── SUB-HEADING (5 stacked subslides, zero layout shift) ── */}
      <p className="dh-rot__sub">
        {HERO_MESSAGES.map((msg, i) => {
          const isActive = activeIndex === i;
          return (
            <span
              key={msg.id}
              ref={(el) => {
                subRefs.current[i] = el;
              }}
              className={`dh-subslide ${isActive ? 'dh-subslide--active' : ''}`}
              aria-hidden={!isActive}
              style={{
                visibility: isActive ? 'visible' : 'hidden',
                opacity: isActive ? 1 : 0,
              }}
            >
              {String(t(msg.subKey) || '')}
            </span>
          );
        })}
      </p>
    </div>
  );
};
