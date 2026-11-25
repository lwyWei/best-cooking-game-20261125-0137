// Render: every pixel of the kitchen, drawn on one canvas. The game is
// readable at a glance: orders on the board, ingredients on the counter,
// the dish mid-assembly on the plate, a timer you can feel.
import { CANVAS_W, CANVAS_H, INGREDIENTS, INGREDIENT_BY_ID, LAYOUT } from './config.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

export function render(ctx, state) {
  drawKitchen(ctx);
  drawHud(ctx, state);
  if (state.screen === 'title') { drawTitle(ctx, state); return; }
  if (state.screen === 'over') { drawEnd(ctx, state); return; }
  drawOrderBoard(ctx, state);
  drawPlate(ctx, state);
  drawCounter(ctx, state);
  drawButtons(ctx, state);
  drawMessage(ctx, state);
}

function drawKitchen(ctx) {
  // Warm wall, tile floor, window and shelves — the kitchen itself.
  ctx.fillStyle = '#f7e8d0';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#e9d3ae';
  for (let x = 0; x < CANVAS_W; x += 80) ctx.fillRect(x, 196, 2, 600);
  ctx.fillStyle = '#fdf6e7';
  ctx.fillRect(0, 0, CANVAS_W, 196);
  // Window with a sunny street.
  ctx.fillStyle = '#7ec8e3';
  rr(ctx, 60, 18, 220, 130, 10); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(160, 18, 10, 130); ctx.fillRect(60, 76, 220, 10);
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath(); ctx.arc(240, 48, 18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8bc34a';
  ctx.fillRect(60, 128, 220, 20);
  // Shelf with pots.
  ctx.fillStyle = '#a9805a';
  ctx.fillRect(1020, 60, 220, 12);
  ctx.fillStyle = '#5d6d7e';
  ctx.beginPath(); ctx.arc(1060, 52, 22, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#7d6608';
  ctx.beginPath(); ctx.arc(1140, 52, 22, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#6e2c00';
  ctx.beginPath(); ctx.arc(1210, 52, 20, Math.PI, 0); ctx.fill();
  // Stove glow at the back.
  ctx.fillStyle = '#3a2a18';
  rr(ctx, 330, 120, 300, 66, 8); ctx.fill();
  ctx.fillStyle = '#e4572e';
  ctx.beginPath(); ctx.arc(390, 152, 16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(570, 152, 16, 0, Math.PI * 2); ctx.fill();
  text(ctx, 'SIZZLE & SERVE', 640, 30, 26, '#3a2a18', '800', 'center');
}

function drawHud(ctx, state) {
  ctx.fillStyle = '#3a2a18';
  ctx.fillRect(0, 0, CANVAS_W, 0);
  // Timer bar across the top, green to red as time runs out.
  const frac = state.timeLeftMs / 120000;
  const w = CANVAS_W * Math.max(0, frac);
  ctx.fillStyle = frac > 0.5 ? '#4e9b2d' : frac > 0.25 ? '#e0a800' : '#c0392b';
  ctx.fillRect(0, 0, w, 10);
  const secs = Math.ceil(state.timeLeftMs / 1000);
  const mm = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, '0');
  text(ctx, `⏱ ${mm}:${ss}`, 24, 34, 26, '#3a2a18', '800');
  text(ctx, `Score ${state.score}`, 330, 34, 22, '#3a2a18');
  text(ctx, `💰 $${state.money}`, 560, 34, 22, '#3a2a18');
  text(ctx, `Served ${state.served}  ·  Missed ${state.missed}`, 800, 34, 22, '#3a2a18');
  if (state.combo >= 2) text(ctx, `🔥 Combo x${state.combo}`, 1120, 34, 22, '#c0392b', '800');
}

function drawOrderBoard(ctx, state) {
  text(ctx, 'ORDER BOARD', 24, 66, 15, '#8a6d4b', '800');
  const bw = 300;
  const bh = LAYOUT.boardH;
  for (let i = 0; i < 3; i++) {
    const x = 24 + i * (bw + 16);
    const y = LAYOUT.boardY;
    const o = state.orders[i];
    ctx.fillStyle = o ? '#fffdf6' : '#efe3cb';
    rr(ctx, x, y, bw, bh, 12); ctx.fill();
    ctx.strokeStyle = '#d8c49a';
    ctx.lineWidth = 2;
    rr(ctx, x, y, bw, bh, 12); ctx.stroke();
    if (!o) {
      text(ctx, '— waiting for orders —', x + bw / 2, y + bh / 2, 16, '#b39b72', '600', 'center');
      continue;
    }
    const pfrac = o.patienceMs / o.maxPatienceMs;
    ctx.fillStyle = pfrac > 0.5 ? '#4e9b2d' : pfrac > 0.25 ? '#e0a800' : '#c0392b';
    ctx.fillRect(x, y, bw * Math.max(0, pfrac), 8);
    text(ctx, `#${o.id}  ${o.name}`, x + 14, y + 30, 20, '#3a2a18', '800');
    text(ctx, `Reward $${o.reward}`, x + bw - 14, y + 30, 16, '#2e7d32', '800', 'right');
    // Recipe strip: little ingredient chips in order.
    let cx = x + 14;
    for (const id of o.recipe) {
      drawIngredientChip(ctx, cx, y + 56, 44, id);
      cx += 52;
    }
    text(ctx, `${Math.ceil(o.patienceMs / 1000)}s left`, x + 14, y + bh - 18, 14, '#8a6d4b', '600');
  }
}

function drawIngredientChip(ctx, x, y, size, id) {
  const ing = INGREDIENT_BY_ID[id];
  ctx.fillStyle = ing.color;
  rr(ctx, x, y, size, size * 0.72, 8); ctx.fill();
  ctx.strokeStyle = ing.dark;
  ctx.lineWidth = 2;
  rr(ctx, x, y, size, size * 0.72, 8); ctx.stroke();
  if (id === 'bunTop') {
    ctx.fillStyle = '#fff';
    for (const [dx, dy] of [[10, 8], [24, 6], [34, 10]]) { ctx.beginPath(); ctx.arc(x + dx, y + dy, 2.5, 0, Math.PI * 2); ctx.fill(); }
  }
  if (id === 'egg') {
    ctx.fillStyle = '#ffb703';
    ctx.beginPath(); ctx.arc(x + size / 2, y + size * 0.36, 8, 0, Math.PI * 2); ctx.fill();
  }
  if (id === 'cheese') {
    ctx.fillStyle = ing.dark;
    ctx.beginPath(); ctx.arc(x + 12, y + 10, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 30, y + 20, 2.5, 0, Math.PI * 2); ctx.fill();
  }
}

function drawPlate(ctx, state) {
  const { x, y, rx, ry } = LAYOUT.plate;
  text(ctx, 'YOUR PLATE', x, 240, 15, '#8a6d4b', '800', 'center');
  // Stack the dish bottom-up above the plate.
  let sy = y - 6;
  const layerH = 20;
  for (let i = 0; i < state.plate.length; i++) {
    const id = state.plate[i];
    const ing = INGREDIENT_BY_ID[id];
    const lw = 210 - i * 4;
    ctx.fillStyle = ing.color;
    if (id === 'bunTop') {
      ctx.beginPath();
      ctx.ellipse(x, sy, lw / 2, 26, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#fff';
      for (const dx of [-60, -20, 25, 60]) { ctx.beginPath(); ctx.arc(x + dx, sy - 14, 3, 0, Math.PI * 2); ctx.fill(); }
    } else if (id === 'bunBottom') {
      rr(ctx, x - lw / 2, sy - 16, lw, 18, 8); ctx.fill();
    } else if (id === 'egg') {
      ctx.beginPath(); ctx.ellipse(x, sy - 6, lw / 2, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffb703';
      ctx.beginPath(); ctx.arc(x, sy - 8, 13, 0, Math.PI * 2); ctx.fill();
    } else {
      rr(ctx, x - lw / 2, sy - layerH, lw, layerH, 7); ctx.fill();
    }
    sy -= id === 'bunTop' ? 26 : 20;
  }
  if (state.plate.length === 0) {
    text(ctx, 'empty — tap the counter below', x, y - 40, 17, '#b39b72', '600', 'center');
  }
  // The plate itself.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d8c49a';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#e8dcc2';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x, y, rx - 26, ry - 12, 0, 0, Math.PI * 2); ctx.stroke();
}

function drawCounter(ctx, state) {
  ctx.fillStyle = '#a9805a';
  ctx.fillRect(0, LAYOUT.counterY, CANVAS_W, LAYOUT.counterH);
  ctx.fillStyle = '#8a6a45';
  ctx.fillRect(0, LAYOUT.counterY, CANVAS_W, 8);
  text(ctx, 'COUNTER — click or press 1–8', 24, LAYOUT.counterY + 26, 14, '#f7e8d0', '800');
  const w = CANVAS_W / INGREDIENTS.length;
  INGREDIENTS.forEach((ing, i) => {
    const x = i * w + 10;
    const y = LAYOUT.counterY + 36;
    const bw = w - 20;
    const bh = 92;
    const hover = state.hoverStation === i;
    ctx.fillStyle = hover ? '#fff3d6' : '#fffdf6';
    rr(ctx, x, y, bw, bh, 12); ctx.fill();
    ctx.strokeStyle = hover ? '#e0a800' : '#d8c49a';
    ctx.lineWidth = hover ? 3 : 2;
    rr(ctx, x, y, bw, bh, 12); ctx.stroke();
    drawIngredientChip(ctx, x + bw / 2 - 22, y + 10, 44, ing.id);
    text(ctx, ing.name, x + bw / 2, y + 66, 15, '#3a2a18', '700', 'center');
    text(ctx, `[${ing.key}]`, x + bw / 2, y + 84, 12, '#8a6d4b', '600', 'center');
  });
}

function drawButtons(ctx, state) {
  const s = LAYOUT.serveBtn;
  ctx.fillStyle = state.flashServe > 0 ? '#2e7d32' : '#4e9b2d';
  rr(ctx, s.x, s.y, s.w, s.h, 12); ctx.fill();
  text(ctx, '🍽  SERVE', s.x + s.w / 2, s.y + s.h / 2, 24, '#fff', '800', 'center');
  text(ctx, 'Space', s.x + s.w / 2, s.y + s.h - 12, 12, '#dcedc8', '600', 'center');
  const t = LAYOUT.trashBtn;
  ctx.fillStyle = state.flashTrash > 0 ? '#c0392b' : '#8a6d4b';
  rr(ctx, t.x, t.y, t.w, t.h, 10); ctx.fill();
  text(ctx, '🗑  Trash  (Bksp)', t.x + t.w / 2, t.y + t.h / 2, 16, '#fff', '700', 'center');
}

function drawMessage(ctx, state) {
  if (!state.message || state.nowMs > state.messageUntilMs) return;
  const s = state.message;
  ctx.font = '700 20px system-ui, sans-serif';
  const w = ctx.measureText(s).width + 36;
  ctx.fillStyle = 'rgba(58,42,24,0.92)';
  rr(ctx, 640 - w / 2, 596, w, 40, 20); ctx.fill();
  text(ctx, s, 640, 617, 20, '#fff', '700', 'center');
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(36,26,18,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fffdf6';
  rr(ctx, 290, 180, 700, 400, 20); ctx.fill();
  text(ctx, '🍔 SIZZLE & SERVE', 640, 250, 44, '#3a2a18', '800', 'center');
  text(ctx, 'A tiny kitchen rush game', 640, 300, 22, '#8a6d4b', '600', 'center');
  text(ctx, 'Orders pile up on the board. Stack the right', 640, 350, 19, '#3a2a18', '600', 'center');
  text(ctx, 'ingredients on your plate, then serve before', 640, 378, 19, '#3a2a18', '600', 'center');
  text(ctx, 'the customer walks out. 120 seconds on the clock.', 640, 406, 19, '#3a2a18', '600', 'center');
  text(ctx, 'Click the counter or press 1–8 · Space serves', 640, 448, 18, '#8a6d4b', '600', 'center');
  ctx.fillStyle = '#4e9b2d';
  rr(ctx, 490, 500, 300, 56, 12); ctx.fill();
  text(ctx, '▶  START COOKING', 640, 529, 22, '#fff', '800', 'center');
}

function drawEnd(ctx, state) {
  ctx.fillStyle = 'rgba(36,26,18,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fffdf6';
  rr(ctx, 290, 170, 700, 420, 20); ctx.fill();
  text(ctx, "TIME'S UP!", 640, 240, 44, '#3a2a18', '800', 'center');
  text(ctx, `You served ${state.served} dishes and earned $${state.money}`, 640, 300, 22, '#3a2a18', '600', 'center');
  text(ctx, `Score ${state.score}   ·   Best combo x${state.bestCombo}   ·   Missed ${state.missed}`, 640, 340, 19, '#8a6d4b', '600', 'center');
  const verdict = state.served >= 9 ? '🏆 Head Chef! The kitchen is yours.'
    : state.served >= 5 ? '👨‍🍳 Solid shift — the regulars are happy.'
    : '🍳 Warm-up done — the rush will come back for you.';
  text(ctx, verdict, 640, 392, 20, '#c0392b', '800', 'center');
  ctx.fillStyle = '#4e9b2d';
  rr(ctx, 490, 440, 300, 56, 12); ctx.fill();
  text(ctx, '↻  PLAY AGAIN', 640, 469, 22, '#fff', '800', 'center');
  text(ctx, 'Press Enter or click the button', 640, 530, 16, '#8a6d4b', '600', 'center');
}
