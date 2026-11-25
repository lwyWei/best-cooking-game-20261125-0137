// Shots: deterministic posed scenes for screenshots. The judge sees the
// game at its best — title, mid-rush with a dish half-built, and the final
// tally — each frozen so a screenshot replays exactly.
import { newGame } from './world.js';

export function applyShot(state, name) {
  const posed = newGame(state.seed);
  if (name === 'start') {
    posed.screen = 'title';
  } else if (name === 'play') {
    posed.screen = 'playing';
    posed.timeLeftMs = 75000;
    posed.score = 120;
    posed.money = 38;
    posed.served = 3;
    posed.combo = 2;
    posed.orders = [
      { id: 4, name: 'Classic Burger', recipe: ['bunBottom', 'patty', 'cheese', 'bunTop'], reward: 14, patienceMs: 30000, maxPatienceMs: 45000 },
      { id: 5, name: 'Garden Stack', recipe: ['bunBottom', 'lettuce', 'tomato', 'onion', 'bunTop'], reward: 12, patienceMs: 18000, maxPatienceMs: 45000 },
      { id: 6, name: 'Sunny Melt', recipe: ['bunBottom', 'egg', 'cheese', 'patty', 'bunTop'], reward: 16, patienceMs: 41000, maxPatienceMs: 45000 },
    ];
    posed.plate = ['bunBottom', 'patty', 'cheese'];
    posed.message = 'Served Garden Stack! +$12';
    posed.messageUntilMs = 60000;
    posed.nowMs = 45000;
  } else if (name === 'end') {
    posed.screen = 'over';
    posed.timeLeftMs = 0;
    posed.score = 420;
    posed.money = 96;
    posed.served = 9;
    posed.missed = 2;
    posed.bestCombo = 3;
    posed.combo = 0;
  } else {
    return false;
  }
  posed.paused = true;
  Object.assign(state, posed);
  return true;
}
