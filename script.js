const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let W, H;

function resize() {
  const d = window.devicePixelRatio || 1;
  W = innerWidth;
  H = innerHeight;
  canvas.width = W * d;
  canvas.height = H * d;
  ctx.setTransform(d, 0, 0, d, 0, 0);
}
addEventListener("resize", resize);
resize();

const rockets = [];
const particles = [];
const GRAVITY = 0.3;
const randColor = () => "hsl(" + Math.floor(Math.random() * 360) + ", 100%, 65%)";

function launch(x = W * (0.1 + Math.random() * 0.8)) {
  const targetY = H * (0.1 + Math.random() * 0.4);
  rockets.push({
    x, y: H,
    vx: (Math.random() - 0.5) * 1.2,
    vy: -Math.sqrt(2 * GRAVITY * (H - targetY)),
    color: randColor(),
  });
}

function spark(x, y, vx, vy, color) {
  particles.push({
    x, y, vx, vy, color,
    size: Math.random() * 1.5 + 1,
    life: 40 + Math.random() * 30,
    age: 0,
  });
}

function circleFirework(x, y, color) {
  const speed = 6 + Math.random() * 3;
  for (let i = 0; i < 70; i++) {
    const a = (i / 70) * Math.PI * 2;
    spark(x, y, Math.cos(a) * speed, Math.sin(a) * speed, color);
  }
}

function ringFirework(x, y, color) {
  [3, 5.5].forEach((speed) => {
    for (let i = 0; i < 50; i++) {
      const a = (i / 50) * Math.PI * 2;
      spark(x, y, Math.cos(a) * speed, Math.sin(a) * speed, color);
    }
  });
}

function heartFirework(x, y, color) {
  for (let i = 0; i < 80; i++) {
    const t = (i / 80) * Math.PI * 2;
    const vx = 16 * Math.pow(Math.sin(t), 3);
    const vy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    spark(x, y, vx * 0.28, vy * 0.28, color);
  }
}

function randomFirework(x, y) {
  const shapes = [circleFirework, ringFirework, heartFirework];
  shapes[Math.floor(Math.random() * shapes.length)](x, y, randColor());
}

function loop() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(18, 8, 31, 0.2)"; // même couleur que le fond
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "lighter";

  for (let i = rockets.length - 1; i >= 0; i--) {
    const r = rockets[i];
    r.x += r.vx;
    r.y += r.vy;
    r.vy += GRAVITY;
    ctx.fillStyle = r.color;
    ctx.fillRect(r.x, r.y, 2, 6);
    if (r.vy >= -1) {
      randomFirework(r.x, r.y);
      rockets.splice(i, 1);
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vx *= 0.98;
    p.vy = p.vy * 0.98 + 0.04;
    p.x += p.vx;
    p.y += p.vy;
    p.age++;
    const alpha = 1 - p.age / p.life;
    if (alpha <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(loop);
}

// Les feux démarrent quand le gâteau est prêt (4 s)
setTimeout(() => setInterval(launch, 300), 4000);
addEventListener("pointerdown", (e) => launch(e.clientX));
loop();