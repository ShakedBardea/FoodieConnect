// Lightweight Canvas confetti (no dependencies)
// Usage: import { triggerConfetti } from './Canvas/Confetti'; triggerConfetti({ durationMs: 1800 });

export function triggerConfetti({ durationMs = 1800 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H;
  const resize = () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const colors = [
    '#f94144', '#f3722c', '#f8961e', '#f9844a', '#f9c74f',
    '#90be6d', '#43aa8b', '#577590', '#277da1'
  ];

  const gravity = 0.25;
  const drag = 0.005;
  const particles = [];
  const count = Math.min(180, Math.floor(W / 10));

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI - Math.PI / 2;
    const speed = 8 + Math.random() * 6;
    particles.push({
      x: W / 2,
      y: H / 3,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6,
      size: 6 + Math.random() * 6,
      color: colors[(Math.random() * colors.length) | 0],
      tilt: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.25
    });
  }

  let raf;
  const start = performance.now();

  const draw = (t) => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.vx *= (1 - drag);
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.tilt += p.spin;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.tilt);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    if (t - start < durationMs) {
      raf = requestAnimationFrame(draw);
    } else {
      cleanup();
    }
  };

  const cleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    canvas.parentNode && canvas.parentNode.removeChild(canvas);
  };

  raf = requestAnimationFrame(draw);
}


