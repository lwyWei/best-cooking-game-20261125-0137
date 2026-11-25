// Input: mouse clicks and keyboard, mapped onto the world. Buttons and
// stations are hit-tested here so the game logic never touches the DOM.
import { INGREDIENTS, LAYOUT } from './config.js';
import { addIngredient, servePlate, trashPlate, startGame, stationAt } from './world.js';

function inside(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function bindInput(canvas, state) {
  canvas.addEventListener('mousemove', (e) => {
    const p = toCanvas(canvas, e);
    state.hoverStation = stationAt(p.x, p.y);
  });
  canvas.addEventListener('mouseleave', () => {
    state.hoverStation = -1;
  });
  canvas.addEventListener('click', (e) => {
    const p = toCanvas(canvas, e);
    if (state.screen === 'title' || state.screen === 'over') {
      if (inside(p.x, p.y, { x: 490, y: 560, w: 300, h: 72 })) startGame(state);
      return;
    }
    if (inside(p.x, p.y, LAYOUT.serveBtn)) { servePlate(state); return; }
    if (inside(p.x, p.y, LAYOUT.trashBtn)) { trashPlate(state); return; }
    const i = stationAt(p.x, p.y);
    if (i >= 0) addIngredient(state, INGREDIENTS[i].id);
  });
  window.addEventListener('keydown', (e) => {
    if (state.screen === 'title' || state.screen === 'over') {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startGame(state); }
      return;
    }
    const idx = INGREDIENTS.findIndex((ing) => ing.key === e.key);
    if (idx >= 0) { addIngredient(state, INGREDIENTS[idx].id); return; }
    if (e.key === ' ') { e.preventDefault(); servePlate(state); }
    if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); trashPlate(state); }
  });
}

function toCanvas(canvas, e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * canvas.width,
    y: ((e.clientY - r.top) / r.height) * canvas.height,
  };
}
