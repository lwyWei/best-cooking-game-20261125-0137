// Main: boot the game, run the loop, wire input to the world and the
// world to the renderer. A ?shot=start|play|end&seed=N URL poses one
// frozen scene for screenshots instead of starting the clock.
import { newGame, tick } from './world.js';
import { render } from './render.js';
import { bindInput } from './input.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') || '1');
const state = newGame(seed);

if (params.get('shot')) {
  applyShot(state, params.get('shot'));
} else {
  bindInput(canvas, state);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(100, now - last);
  last = now;
  tick(state, dt);
  render(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
