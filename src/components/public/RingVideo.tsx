import { useEffect, useRef, useState } from 'react';
import { LiquidRing } from './LiquidRing';
import './RingVideo.css';

const SRC = '/media/services-ring-alpha.webm'; // VP9 with a real alpha channel (transparent background)
const STILL_TIME = 12; // seconds: the frame shown when reduced motion is on

/** Chrome, Edge and Firefox play VP9 alpha. Safari and iOS do not, so they get the WebGL ring. */
function supportsAlphaWebm(): boolean {
  const ua = navigator.userAgent;
  const apple = /iPad|iPhone|iPod/.test(ua) || (/Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|Android|CriOS|FxiOS/.test(ua));
  if (apple) return false;
  return !!document.createElement('video').canPlayType('video/webm; codecs="vp9"');
}

type Mode = 'pending' | 'video' | 'shader';

/** Decorative ring: the real video with a transparent background, or the WebGL ring as a fallback. */
export function RingVideo({ className = '' }: { className?: string }) {
  const [mode, setMode] = useState<Mode>('pending');
  const ref = useRef<HTMLVideoElement>(null);

  // Decide on the client only, so prerendered HTML and hydration stay identical.
  useEffect(() => {
    setMode(supportsAlphaWebm() ? 'video' : 'shader');
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (mode !== 'video' || !v) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    let visible = true;

    const play = () => {
      if (reduced || saveData || !visible || document.hidden) return;
      v.play().catch(() => {});
    };
    const onMeta = () => {
      if (reduced || saveData) {
        v.currentTime = STILL_TIME;
        v.pause();
      } else {
        play();
      }
    };
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        visible ? play() : v.pause();
      },
      { rootMargin: '150px' },
    );
    io.observe(v);
    const onVis = () => (document.hidden ? v.pause() : play());
    document.addEventListener('visibilitychange', onVis);
    v.addEventListener('loadedmetadata', onMeta);
    if (v.readyState >= 1) onMeta();

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      v.removeEventListener('loadedmetadata', onMeta);
      v.pause();
    };
  }, [mode]);

  if (mode === 'shader') return <LiquidRing className={className} />;
  if (mode === 'pending') {
    // Reserves the same space, so nothing shifts when the choice is made.
    return <div className={className} aria-hidden="true" style={{ width: 'var(--ring-size, 720px)', height: 'var(--ring-size, 720px)' }} />;
  }
  return (
    <video
      ref={ref}
      className={`dh-ring-video ${className}`.trim()}
      src={SRC}
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      onError={() => setMode('shader')}
    />
  );
}
