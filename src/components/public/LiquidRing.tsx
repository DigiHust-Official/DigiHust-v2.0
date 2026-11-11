import { useEffect, useRef } from 'react';
import { VERT, FRAG } from './liquidRingShader';
import './LiquidRing.css';

const FPS = 30;
const MAX_PX = 900; // backing-store cap, keeps the GPU cost tiny
const SPEED = 1; // 1 = the speed I tested; lower is calmer

/** Decorative animated glass ring drawn with WebGL. Transparent background, no video. */
export function LiquidRing({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    if (!gl || gl.isContextLost()) return; // no WebGL: the ring simply isn't shown
    gl.getExtension('OES_standard_derivatives');

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uT = gl.getUniformLocation(prog, 'u_t');
    const uDark = gl.getUniformLocation(prog, 'u_dark');
    gl.clearColor(0, 0, 0, 0);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let t = reduced ? 6 : 0; // static frame for reduced motion
    let dark = 1;
    let visible = true;
    let raf = 0;
    let last = 0;

    const readTheme = () => {
      const v = getComputedStyle(canvas).getPropertyValue('--ring-dark').trim();
      const next = v === '0' ? 0 : 1;
      const changed = next !== dark;
      dark = next;
      return changed;
    };

    const resize = () => {
      const css = canvas.clientWidth || 720;
      const px = Math.min(MAX_PX, Math.round(css * Math.min(window.devicePixelRatio || 1, 1.5)));
      if (canvas.width !== px) {
        canvas.width = px;
        canvas.height = px;
      }
      gl.viewport(0, 0, px, px);
    };

    const draw = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uT, t);
      gl.uniform1f(uDark, dark);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      const dt = last ? (now - last) / 1000 : 0;
      last = now;
      t += Math.min(dt, 0.1) * SPEED;
      if ((Math.floor(now / 500) & 1) === 0) readTheme();
      draw();
    };

    const start = () => {
      if (reduced || raf || !visible || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    readTheme();
    resize();
    draw();
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        visible ? start() : stop();
      },
      { rootMargin: '150px' },
    );
    io.observe(canvas);

    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);

    // Static (reduced motion): still follow theme changes.
    const poll = reduced
      ? window.setInterval(() => {
          if (readTheme()) draw();
        }, 500)
      : 0;

    const onLost = (e: Event) => {
      e.preventDefault();
      stop();
      canvas.style.visibility = 'hidden';
    };
    canvas.addEventListener('webglcontextlost', onLost);

    start();
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      if (poll) clearInterval(poll);
    };
  }, []);

  return <canvas ref={ref} className={`dh-ring ${className}`.trim()} aria-hidden="true" tabIndex={-1} />;
}
