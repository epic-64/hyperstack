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

const retroColors = [
  '#FF0040',
  '#00FFFF',
  '#FFFF00',
  '#00FF00',
  '#FF00FF',
  '#FF8800',
  '#0088FF',
  '#FFFFFF',
];

const pixelSizes = [6, 8, 10, 12];

const createParticle = (x: number, y: number): Particle => {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 6 + 2;

  return {
    x: Math.floor(x),
    y: Math.floor(y),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - Math.random() * 2,
    color: retroColors[Math.floor(Math.random() * retroColors.length)],
    size: pixelSizes[Math.floor(Math.random() * pixelSizes.length)],
    life: 1,
    decay: Math.random() * 0.012 + 0.008,
  };
};

const updateParticle = (particle: Particle): Particle => {
  return {
    ...particle,
    x: particle.x + particle.vx,
    y: particle.y + particle.vy,
    vy: particle.vy + 0.25,
    life: particle.life - particle.decay,
  };
};

const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle): void => {
  ctx.save();
  ctx.globalAlpha = particle.life;
  ctx.fillStyle = particle.color;
  ctx.fillRect(
    Math.floor(particle.x - particle.size / 2),
    Math.floor(particle.y - particle.size / 2),
    particle.size,
    particle.size
  );
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

  ctx.imageSmoothingEnabled = false;

  const particleCount = 40;
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

