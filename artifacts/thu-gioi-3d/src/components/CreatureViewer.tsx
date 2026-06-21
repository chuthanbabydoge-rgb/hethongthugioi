import { useEffect, useRef } from "react";
import { CreatureModel } from "../data/creatures";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}
function rgba(hex: string, a: number) {
  try {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  } catch { return `rgba(150,100,200,${a})`; }
}

function drawCreature(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  t: number,
  creature: CreatureModel
) {
  const bob   = Math.sin(t * 1.5) * 8;
  const sway  = Math.sin(t * 0.8) * 4;
  const scale = Math.min(ctx.canvas.width, ctx.canvas.height) / 520;

  ctx.save();
  ctx.translate(cx + sway, cy + bob);
  ctx.scale(scale, scale);

  const bc = creature.bodyColor;
  const ac = creature.accentColor;
  const gc = creature.glowColor;
  const pc = creature.particleColor;
  const ei = creature.emissiveIntensity;

  /* ── outer glow aura ── */
  const auraR = 160 * creature.auraScale * 0.55;
  const aura = ctx.createRadialGradient(0, 0, auraR * 0.2, 0, 0, auraR);
  aura.addColorStop(0, rgba(gc, 0.18 * ei));
  aura.addColorStop(0.5, rgba(gc, 0.08 * ei));
  aura.addColorStop(1, rgba(gc, 0));
  ctx.beginPath();
  ctx.ellipse(0, 0, auraR * 1.3, auraR, 0, 0, Math.PI * 2);
  ctx.fillStyle = aura;
  ctx.fill();

  /* ── wings ── */
  if (creature.hasWings) {
    const ws = creature.wingSpan * 28;
    const wingFlap = Math.sin(t * 3) * 0.15;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.scale(side, 1);
      ctx.rotate(wingFlap * side);
      ctx.beginPath();
      ctx.moveTo(30, -10);
      ctx.bezierCurveTo(ws * 0.4, -ws * 0.35, ws * 0.9, -ws * 0.1, ws, 0);
      ctx.bezierCurveTo(ws * 0.7, ws * 0.2, ws * 0.3, ws * 0.2, 20, 20);
      ctx.closePath();
      const wg = ctx.createLinearGradient(30, -20, ws, 0);
      wg.addColorStop(0, rgba(ac, 0.85));
      wg.addColorStop(0.5, rgba(gc, 0.5));
      wg.addColorStop(1, rgba(gc, 0.1));
      ctx.fillStyle = wg;
      ctx.fill();
      ctx.strokeStyle = rgba(gc, 0.4);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ── tail ── */
  if (creature.hasTail) {
    const tl = creature.tailLength * 55;
    const tailWag = Math.sin(t * 2) * 18;
    ctx.beginPath();
    ctx.moveTo(-10, 40);
    ctx.quadraticCurveTo(-tl * 0.5 + tailWag, 60 + tl * 0.3, -tl + tailWag * 1.5, 80 + tl * 0.5);
    ctx.lineWidth = 14;
    ctx.strokeStyle = bc;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.lineWidth = 6;
    ctx.strokeStyle = rgba(gc, 0.4);
    ctx.stroke();
  }

  /* ── legs ── */
  if (creature.legCount === 4) {
    const legPairs: [number, number][] = [[-38, 45], [38, 45], [-30, 50], [30, 50]];
    legPairs.forEach(([lx, ly], i) => {
      const legSwing = Math.sin(t * 2 + i * Math.PI * 0.5) * 5;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + legSwing, ly + 45);
      ctx.lineWidth = 12;
      ctx.strokeStyle = bc;
      ctx.lineCap = "round";
      ctx.stroke();
    });
  } else if (creature.legCount === 2) {
    [[-22, 55], [22, 55]].forEach(([lx, ly], i) => {
      const s = Math.sin(t * 2 + i * Math.PI) * 6;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + s, ly + 40);
      ctx.lineWidth = 12; ctx.strokeStyle = bc; ctx.lineCap = "round"; ctx.stroke();
    });
  } else if (creature.legCount === 8) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const lx = Math.cos(angle) * 55, ly = Math.sin(angle) * 25 + 20;
      const s = Math.sin(t * 3 + i) * 4;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + s + Math.cos(angle) * 30, ly + 30);
      ctx.lineWidth = 8; ctx.strokeStyle = bc; ctx.lineCap = "round"; ctx.stroke();
    }
  }

  /* ── body ── */
  const bx = (creature.bodyScale[0] - 1) * 30;
  const [bw, bh] = [75 + bx, 65];
  const bodyGrad = ctx.createRadialGradient(-15, -20, 5, 0, 0, 90);
  bodyGrad.addColorStop(0, rgba(ac, 0.9));
  bodyGrad.addColorStop(0.45, bc);
  bodyGrad.addColorStop(1, rgba(bc, 0.7));
  ctx.beginPath();
  ctx.ellipse(0, 15, bw, bh, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  /* body rim glow */
  ctx.strokeStyle = rgba(gc, 0.35 + 0.15 * Math.sin(t * 2));
  ctx.lineWidth = 3;
  ctx.stroke();

  /* ── chest accent ── */
  ctx.beginPath();
  ctx.ellipse(0, 10, 35, 30, 0, 0, Math.PI * 2);
  const chestG = ctx.createRadialGradient(-8, 0, 3, 0, 5, 35);
  chestG.addColorStop(0, rgba(ac, 0.8));
  chestG.addColorStop(1, rgba(ac, 0.1));
  ctx.fillStyle = chestG;
  ctx.fill();

  /* ── spikes ── */
  if (creature.hasSpikes) {
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 18, -40);
      ctx.lineTo(i * 18 - 7, -58 - Math.abs(i) * 4);
      ctx.lineTo(i * 18 + 7, -58 - Math.abs(i) * 4);
      ctx.closePath();
      ctx.fillStyle = rgba(gc, 0.7);
      ctx.fill();
    }
  }

  /* ── neck ── */
  ctx.beginPath();
  ctx.ellipse(2, -28, 22, 18, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = bc;
  ctx.fill();

  /* ── head ── */
  const hs = creature.headScale * 100;
  const headGrad = ctx.createRadialGradient(-10, -62, 5, 0, -58, hs * 0.7);
  headGrad.addColorStop(0, rgba(ac, 0.7));
  headGrad.addColorStop(0.6, bc);
  headGrad.addColorStop(1, rgba(bc, 0.8));
  ctx.beginPath();
  ctx.ellipse(0, -58, hs * 0.65, hs * 0.55, 0, 0, Math.PI * 2);
  ctx.fillStyle = headGrad;
  ctx.fill();
  ctx.strokeStyle = rgba(gc, 0.3);
  ctx.lineWidth = 2;
  ctx.stroke();

  /* ── snout ── */
  ctx.beginPath();
  ctx.ellipse(0, -38, 16, 11, 0, 0, Math.PI * 2);
  ctx.fillStyle = bc;
  ctx.fill();

  /* ── eyes ── */
  const eyeGlow = 0.6 + 0.4 * Math.sin(t * 2.5);
  [[-18, -62], [18, -62]].forEach(([ex, ey]) => {
    /* pupil */
    ctx.beginPath();
    ctx.arc(ex, ey, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#0a0a0a";
    ctx.fill();
    /* iris */
    ctx.beginPath();
    ctx.arc(ex, ey, 6, 0, Math.PI * 2);
    ctx.fillStyle = gc;
    ctx.fill();
    /* glow ring */
    const eg = ctx.createRadialGradient(ex, ey, 4, ex, ey, 16);
    eg.addColorStop(0, rgba(gc, eyeGlow * 0.9));
    eg.addColorStop(1, rgba(gc, 0));
    ctx.beginPath();
    ctx.arc(ex, ey, 16, 0, Math.PI * 2);
    ctx.fillStyle = eg;
    ctx.fill();
    /* highlight */
    ctx.beginPath();
    ctx.arc(ex - 2, ey - 2, 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();
  });

  /* ── horns ── */
  if (creature.hasHorns) {
    const hornPositions = creature.hornCount >= 2
      ? [[-20, -82], [20, -82]] : [[0, -88]];
    hornPositions.forEach(([hx, hy]) => {
      ctx.beginPath();
      ctx.moveTo(hx - 7, hy + 12);
      ctx.lineTo(hx, hy - 22);
      ctx.lineTo(hx + 7, hy + 12);
      ctx.closePath();
      const hornG = ctx.createLinearGradient(hx, hy - 22, hx, hy + 12);
      hornG.addColorStop(0, gc);
      hornG.addColorStop(1, ac);
      ctx.fillStyle = hornG;
      ctx.fill();
    });
  }

  ctx.restore();
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  t: number,
  creature: CreatureModel,
  particles: { angle: number; radius: number; speed: number; size: number; phase: number }[]
) {
  const pc = creature.particleColor;
  particles.forEach((p) => {
    const a = p.angle + t * p.speed;
    const bob = Math.sin(t * 1.5) * 8;
    const scale = Math.min(ctx.canvas.width, ctx.canvas.height) / 520;
    const x = cx + Math.cos(a) * p.radius * scale;
    const y = cy + bob + Math.sin(a) * p.radius * 0.5 * scale;
    const alpha = 0.3 + 0.5 * Math.sin(t * 2 + p.phase);
    const size = p.size * scale * (0.8 + 0.3 * Math.sin(t + p.phase));

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = rgba(pc, alpha);
    ctx.fill();

    /* tiny glow */
    const g = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
    g.addColorStop(0, rgba(pc, alpha * 0.5));
    g.addColorStop(1, rgba(pc, 0));
    ctx.beginPath();
    ctx.arc(x, y, size * 3, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  });
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  stars: { x: number; y: number; size: number; twinkle: number }[],
  t: number
) {
  stars.forEach((s) => {
    const alpha = 0.2 + 0.6 * Math.abs(Math.sin(t * s.twinkle));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  });
}

interface CreatureViewerProps {
  creature: CreatureModel;
}

export default function CreatureViewer({ creature }: CreatureViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const starsRef  = useRef<{ x: number; y: number; size: number; twinkle: number }[]>([]);
  const particlesRef = useRef<{ angle: number; radius: number; speed: number; size: number; phase: number }[]>([]);

  /* init static data once per creature */
  useEffect(() => {
    const seed = creature.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const rng = (i: number) => Math.abs(Math.sin(seed * (i + 1) * 127.1)) % 1;

    starsRef.current = Array.from({ length: 120 }, (_, i) => ({
      x: rng(i * 3) * window.innerWidth,
      y: rng(i * 3 + 1) * window.innerHeight,
      size: 0.4 + rng(i * 3 + 2) * 1.2,
      twinkle: 0.3 + rng(i * 3 + 3) * 1.5,
    }));

    const count = Math.min(creature.particleCount, 60);
    particlesRef.current = Array.from({ length: count }, (_, i) => ({
      angle: rng(i * 5) * Math.PI * 2,
      radius: 90 + rng(i * 5 + 1) * creature.auraScale * 60,
      speed: (0.2 + rng(i * 5 + 2) * 0.5) * (rng(i * 5 + 3) > 0.5 ? 1 : -1),
      size: 1.2 + rng(i * 5 + 4) * 2.5,
      phase: rng(i * 5 + 5) * Math.PI * 2,
    }));
  }, [creature.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let startTime = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width  = parent.clientWidth;
      canvas.height = parent.clientHeight;
      /* rescale stars to new size */
      starsRef.current = starsRef.current.map((s, i) => ({
        ...s,
        x: (s.x / (canvas.width || 1)) * parent.clientWidth,
        y: (s.y / (canvas.height || 1)) * parent.clientHeight,
      }));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const draw = (now: number) => {
      const t = (now - startTime) / 1000;
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2 + 20;

      /* background */
      const bg = ctx.createRadialGradient(cx, cy * 0.7, 30, cx, cy, Math.max(W, H) * 0.8);
      bg.addColorStop(0, "#0d0d2b");
      bg.addColorStop(1, "#050714");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      drawStars(ctx, starsRef.current, t);
      drawParticles(ctx, cx, cy, t, creature, particlesRef.current);
      drawCreature(ctx, cx, cy, t, creature);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [creature]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block", cursor: "default" }}
    />
  );
}
