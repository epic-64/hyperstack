interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  decay: number;
}

const colors = [
  '#ff6b6b',
  '#4ecdc4',
  '#45b7d1',
  '#f9ca24',
  '#6c5ce7',
  '#a29bfe',
  '#fd79a8',
  '#fdcb6e',
  '#00b894',
  '#ff7675',
];

const createParticle = (x: number, y: number): Particle => {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 5 + 3;

  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 6 + 3,
    life: 1,
    decay: Math.random() * 0.015 + 0.01,
  };
};

const updateParticle = (particle: Particle): Particle => {
  return {
    ...particle,
    x: particle.x + particle.vx,
    y: particle.y + particle.vy,
    vy: particle.vy + 0.3,
    life: particle.life - particle.decay,
  };
};

const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle): void => {
  ctx.save();
  ctx.globalAlpha = particle.life;
  ctx.fillStyle = particle.color;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const celebrate = (element: HTMLElement): void => {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }

  const particleCount = 30;
  let particles: Particle[] = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle(centerX, centerY));
  }

  const animate = (): void => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles
      .map(updateParticle)
      .filter(particle => particle.life > 0);

    particles.forEach(particle => drawParticle(ctx, particle));

    if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      document.body.removeChild(canvas);
    }
  };

  animate();
};

