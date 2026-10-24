import './slingshot.css';
import { gsap } from '../lib/gsap';
import { scroll } from '../lib/scroll';
import { setPageInert, trapFocus } from '../lib/a11y';

/**
 * N5: the Angry Birds easter egg. A canvas-2D slingshot on a fixed stage.
 * Drag the bird back and let go (mouse or touch), or aim with the arrow keys and launch with Space.
 * Runs on gsap.ticker only while open.
 */

interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  loose: boolean;
  hit: boolean;
}

const C = { bone: '#EDE8DC', gold: '#D9B45A', grey: '#8E8A80', dim: '#3A3934', ink2: '#151513' };
const GRAVITY = 1500;
const BIRD_R = 16;
const MAX_PULL = 130;
const LAUNCH = 9.5;

let root: HTMLElement;
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let scoreEl: HTMLElement;
let W = 0;
let H = 0;
let ground = 0;
let anchor = { x: 0, y: 0 };
let bird = { x: 0, y: 0, vx: 0, vy: 0, flying: false, restTimer: 0 };
let blocks: Block[] = [];
let shots = 0;
let dragging = false;
let aim = { angle: 0.6, power: 0.75 }; // keyboard aim
let keyboardAim = false;
let isOpen = false;
let release: (() => void) | null = null;
let opener: HTMLElement | null = null;
let reduceMotion = false;

export const renderSlingshot = (): string => `
  <div class="sling" id="sling" role="dialog" aria-modal="true" aria-labelledby="sling-title" hidden>
    <div class="sling__bar">
      <h2 class="sling__title" id="sling-title">Slingshot</h2>
      <p class="sling__score" aria-live="polite"></p>
      <button class="sling__btn" type="button" data-sling-reset>Reset</button>
      <button class="sling__btn" type="button" data-sling-close>Close</button>
    </div>
    <canvas class="sling__canvas" tabindex="0" data-cursor="DRAG"
      aria-label="Slingshot game. Drag the bird back and release, or use the arrow keys to aim and Space to launch."></canvas>
    <p class="sling__help">Drag the bird back and let go. Keyboard: arrows aim, Space launches.</p>
  </div>`;

function layout() {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = r.width;
  H = r.height;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ground = H - Math.max(48, H * 0.1);
  anchor = { x: Math.max(110, W * 0.16), y: ground - Math.min(170, H * 0.3) };
}

function resetLevel() {
  shots = 0;
  const unit = Math.min(W * 0.045, 54);
  const bx = W * 0.72;
  const post = { w: unit * 0.55, h: unit * 1.8 };
  const beam = { w: unit * 3.2, h: unit * 0.5 };
  const mk = (x: number, y: number, w: number, h: number): Block => ({ x, y, w, h, vx: 0, vy: 0, rot: 0, vr: 0, loose: false, hit: false });
  const y1 = ground - post.h;
  const y2 = y1 - beam.h;
  const y3 = y2 - post.h;
  const y4 = y3 - beam.h;
  blocks = [
    mk(bx, y1, post.w, post.h),
    mk(bx + beam.w - post.w, y1, post.w, post.h),
    mk(bx, y2, beam.w, beam.h),
    mk(bx + beam.w * 0.18, y3, post.w, post.h),
    mk(bx + beam.w * 0.82 - post.w, y3, post.w, post.h),
    mk(bx + beam.w * 0.1, y4, beam.w * 0.8, beam.h),
  ];
  resetBird();
  updateScore();
}

function resetBird() {
  bird = { x: anchor.x, y: anchor.y, vx: 0, vy: 0, flying: false, restTimer: 0 };
}

function updateScore() {
  const down = blocks.filter((b) => b.hit || b.loose).length;
  const done = down === blocks.length;
  // The score line is aria-live, so screen readers hear each change.
  scoreEl.textContent = done ? `Cleared in ${shots} ${shots === 1 ? 'shot' : 'shots'}` : `${down} of ${blocks.length} down, ${shots} ${shots === 1 ? 'shot' : 'shots'}`;
}

function launch(vx: number, vy: number) {
  bird.vx = vx;
  bird.vy = vy;
  bird.flying = true;
  shots++;
  updateScore();
}

/** Blocks resting on a block that has gone are loosened and fall too. */
function loosenAbove(b: Block) {
  for (const o of blocks) {
    if (o === b || o.loose || o.hit) continue;
    const overlaps = o.x < b.x + b.w && o.x + o.w > b.x;
    if (overlaps && Math.abs(o.y + o.h - b.y) < 2) {
      o.loose = true;
      o.vr = (Math.random() - 0.5) * 2;
      loosenAbove(o);
    }
  }
}

function step(dt: number) {
  if (bird.flying) {
    bird.vy += GRAVITY * dt;
    bird.x += bird.vx * dt;
    bird.y += bird.vy * dt;
    if (bird.y > ground - BIRD_R) {
      bird.y = ground - BIRD_R;
      bird.vy *= -0.35;
      bird.vx *= 0.7;
    }
    for (const b of blocks) {
      if (b.hit) continue;
      const cx = Math.max(b.x, Math.min(bird.x, b.x + b.w));
      const cy = Math.max(b.y, Math.min(bird.y, b.y + b.h));
      if ((bird.x - cx) ** 2 + (bird.y - cy) ** 2 < BIRD_R * BIRD_R) {
        b.hit = true;
        b.vx = bird.vx * 0.55;
        b.vy = Math.min(bird.vy * 0.4, 0) - 250;
        b.vr = (bird.vx > 0 ? 1 : -1) * (3 + Math.random() * 4);
        bird.vx *= 0.55;
        loosenAbove(b);
        updateScore();
      }
    }
    const slow = Math.hypot(bird.vx, bird.vy) < 40 && bird.y >= ground - BIRD_R - 1;
    if (slow || bird.x > W + 80 || bird.x < -80) bird.restTimer += dt;
    if (bird.restTimer > 0.9) resetBird();
  }
  for (const b of blocks) {
    if (!b.hit && !b.loose) continue;
    b.vy += GRAVITY * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.rot += b.vr * dt;
    if (b.y + b.h > ground) {
      b.y = ground - b.h;
      b.vy *= -0.25;
      b.vx *= 0.8;
      b.vr *= 0.7;
    }
  }
}

function drawTrajectory(vx: number, vy: number) {
  ctx.fillStyle = C.grey;
  let x = anchor.x;
  let y = anchor.y;
  for (let i = 0; i < 18; i++) {
    const t = 0.045;
    for (let k = 0; k < 2; k++) {
      vy += GRAVITY * t;
      x += vx * t;
      y += vy * t;
    }
    if (y > ground) break;
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

const keyboardVelocity = () => {
  const speed = MAX_PULL * LAUNCH * aim.power;
  return { vx: Math.cos(aim.angle) * speed, vy: -Math.sin(aim.angle) * speed };
};

function draw() {
  ctx.clearRect(0, 0, W, H);
  // ground
  ctx.fillStyle = C.dim;
  ctx.fillRect(0, ground, W, 2);
  // slingshot frame
  ctx.strokeStyle = C.bone;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(anchor.x, ground);
  ctx.lineTo(anchor.x, anchor.y + 46);
  ctx.moveTo(anchor.x, anchor.y + 46);
  ctx.lineTo(anchor.x - 22, anchor.y - 6);
  ctx.moveTo(anchor.x, anchor.y + 46);
  ctx.lineTo(anchor.x + 22, anchor.y - 6);
  ctx.stroke();
  // band
  if (!bird.flying) {
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(anchor.x - 22, anchor.y - 6);
    ctx.lineTo(bird.x, bird.y);
    ctx.lineTo(anchor.x + 22, anchor.y - 6);
    ctx.stroke();
  }
  // aim preview
  if (dragging) drawTrajectory((anchor.x - bird.x) * LAUNCH, (anchor.y - bird.y) * LAUNCH);
  else if (keyboardAim && !bird.flying) {
    const v = keyboardVelocity();
    drawTrajectory(v.vx, v.vy);
  }
  // blocks
  for (const b of blocks) {
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    ctx.rotate(b.rot);
    ctx.fillStyle = C.ink2;
    ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
    ctx.strokeStyle = b.hit || b.loose ? C.grey : C.bone;
    ctx.lineWidth = 2;
    ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
    ctx.restore();
  }
  // bird
  ctx.fillStyle = C.gold;
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, BIRD_R, 0, Math.PI * 2);
  ctx.fill();
}

const tick = (_t: number, deltaMs: number) => {
  const dt = Math.min(deltaMs, 40) / 1000;
  // two sub-steps keep fast shots from tunnelling through thin blocks
  step(dt / 2);
  step(dt / 2);
  draw();
};

function pointer(e: PointerEvent) {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function onDown(e: PointerEvent) {
  if (bird.flying) return;
  const p = pointer(e);
  if (Math.hypot(p.x - bird.x, p.y - bird.y) > 70) return;
  dragging = true;
  keyboardAim = false;
  canvas.setPointerCapture(e.pointerId);
}

function onMove(e: PointerEvent) {
  if (!dragging) return;
  const p = pointer(e);
  let dx = p.x - anchor.x;
  let dy = p.y - anchor.y;
  const d = Math.hypot(dx, dy);
  if (d > MAX_PULL) {
    dx = (dx / d) * MAX_PULL;
    dy = (dy / d) * MAX_PULL;
  }
  bird.x = anchor.x + dx;
  bird.y = anchor.y + dy;
}

function onUp() {
  if (!dragging) return;
  dragging = false;
  const vx = (anchor.x - bird.x) * LAUNCH;
  const vy = (anchor.y - bird.y) * LAUNCH;
  if (Math.hypot(vx, vy) < 120) {
    resetBird();
    return;
  }
  launch(vx, vy);
}

function onKey(e: KeyboardEvent) {
  if (bird.flying) return;
  const k = e.key;
  if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') {
    e.preventDefault();
    keyboardAim = true;
    if (k === 'ArrowLeft') aim.angle = Math.min(1.4, aim.angle + 0.05);
    if (k === 'ArrowRight') aim.angle = Math.max(0.05, aim.angle - 0.05);
    if (k === 'ArrowUp') aim.power = Math.min(1, aim.power + 0.05);
    if (k === 'ArrowDown') aim.power = Math.max(0.2, aim.power - 0.05);
  } else if (k === ' ' || k === 'Enter') {
    e.preventDefault();
    const v = keyboardVelocity();
    keyboardAim = false;
    launch(v.vx, v.vy);
  }
}

export function openSlingshot(from: HTMLElement): void {
  if (isOpen) return;
  isOpen = true;
  opener = from;
  root.hidden = false;
  scroll.lock();
  setPageInert(true);
  document.documentElement.classList.add('sling-open');
  layout();
  resetLevel();
  release = trapFocus([root]);
  gsap.ticker.add(tick);
  const r = from.getBoundingClientRect();
  if (reduceMotion) gsap.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'none' });
  else
    gsap.fromTo(
      root,
      { autoAlpha: 1, clipPath: `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px)` },
      { clipPath: 'inset(0px 0px 0px 0px)', duration: 1, ease: 'wipe' },
    );
  canvas.focus({ preventScroll: true });
}

function close() {
  if (!isOpen) return;
  isOpen = false;
  release?.();
  release = null;
  const done = () => {
    gsap.ticker.remove(tick);
    root.hidden = true;
    document.documentElement.classList.remove('sling-open');
    setPageInert(false);
    scroll.unlock();
    opener?.focus({ preventScroll: true });
  };
  if (reduceMotion || !opener) {
    gsap.to(root, { autoAlpha: 0, duration: 0.25, ease: 'none', onComplete: done });
    return;
  }
  const r = opener.getBoundingClientRect();
  gsap.to(root, {
    clipPath: `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px)`,
    duration: 0.8,
    ease: 'wipe',
    onComplete: done,
  });
}

export function initSlingshot(): void {
  root = document.getElementById('sling')!;
  canvas = root.querySelector('canvas')!;
  ctx = canvas.getContext('2d')!;
  scoreEl = root.querySelector('.sling__score')!;
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('keydown', onKey);
  root.querySelector('[data-sling-close]')!.addEventListener('click', close);
  root.querySelector('[data-sling-reset]')!.addEventListener('click', () => {
    resetLevel();
    canvas.focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });
  window.addEventListener('resize', () => {
    if (!isOpen) return;
    layout();
    resetLevel();
  });
}

export function setSlingshotMotion(reduce: boolean): void {
  reduceMotion = reduce;
}
