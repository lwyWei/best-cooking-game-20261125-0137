// World: the whole game state and its rules. No drawing here, no DOM —
// render.js paints whatever this state holds, so screenshots can pose it.
import { INGREDIENTS, RECIPES, ROUND_SECONDS, MAX_ORDERS, SPAWN_EVERY_MS, ORDER_PATIENCE_MS } from './config.js';
import { mulberry32, pick } from './random.js';

export function newGame(seed = 1) {
  return {
    seed,
    rand: mulberry32(seed),
    screen: 'title', // 'title' | 'playing' | 'over'
    paused: false,
    timeLeftMs: ROUND_SECONDS * 1000,
    score: 0,
    money: 0,
    served: 0,
    missed: 0,
    bestCombo: 0,
    combo: 0,
    orders: [],
    plate: [],
    spawnInMs: 2500,
    nextOrderId: 1,
    message: '',
    messageUntilMs: 0,
    nowMs: 0,
    hoverStation: -1,
    flashServe: 0,
    flashTrash: 0,
  };
}

export function startGame(state) {
  const fresh = newGame(state.seed);
  Object.assign(state, fresh, { screen: 'playing' });
  spawnOrder(state);
  spawnOrder(state);
}

function spawnOrder(state) {
  if (state.orders.length >= MAX_ORDERS) return;
  const recipe = pick(state.rand, RECIPES);
  state.orders.push({
    id: state.nextOrderId++,
    name: recipe.name,
    recipe: [...recipe.recipe],
    reward: recipe.reward,
    patienceMs: ORDER_PATIENCE_MS,
    maxPatienceMs: ORDER_PATIENCE_MS,
  });
}

export function addIngredient(state, id) {
  if (state.screen !== 'playing' || state.paused) return;
  if (state.plate.length >= 8) {
    setMessage(state, 'Plate is full — serve it or trash it!');
    return;
  }
  state.plate.push(id);
}

export function trashPlate(state) {
  if (state.screen !== 'playing' || state.paused) return;
  if (state.plate.length === 0) return;
  state.plate = [];
  state.combo = 0;
  state.flashTrash = 180;
  setMessage(state, 'Plate trashed.');
}

export function servePlate(state) {
  if (state.screen !== 'playing' || state.paused) return;
  if (state.plate.length === 0) {
    setMessage(state, 'Nothing on the plate yet!');
    return;
  }
  const match = state.orders.find((o) => sameRecipe(o.recipe, state.plate));
  state.flashServe = 180;
  if (!match) {
    state.plate = [];
    state.combo = 0;
    state.score = Math.max(0, state.score - 10);
    setMessage(state, 'No order matches — the dish went in the bin. -10');
    return;
  }
  const tip = Math.max(0, Math.floor(match.patienceMs / 1000));
  const earned = match.reward + Math.min(6, Math.floor(tip / 8));
  state.money += earned;
  state.score += 100 + earned * 5 + state.combo * 10;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.served += 1;
  state.orders = state.orders.filter((o) => o.id !== match.id);
  state.plate = [];
  setMessage(state, `Served ${match.name}! +$${earned}`);
}

function sameRecipe(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function setMessage(state, text) {
  state.message = text;
  state.messageUntilMs = state.nowMs + 2200;
}

// Advance the clock. Called with real elapsed milliseconds from the loop.
export function tick(state, dtMs) {
  if (state.screen !== 'playing' || state.paused) return;
  state.nowMs += dtMs;
  state.timeLeftMs -= dtMs;
  state.flashServe = Math.max(0, state.flashServe - dtMs);
  state.flashTrash = Math.max(0, state.flashTrash - dtMs);
  for (const o of state.orders) o.patienceMs -= dtMs;
  const expired = state.orders.filter((o) => o.patienceMs <= 0);
  if (expired.length > 0) {
    state.orders = state.orders.filter((o) => o.patienceMs > 0);
    state.missed += expired.length;
    state.combo = 0;
    setMessage(state, `${expired[0].name} walked out — too slow!`);
  }
  state.spawnInMs -= dtMs;
  if (state.spawnInMs <= 0) {
    spawnOrder(state);
    // Pressure grows: orders arrive a little faster as the rush goes on.
    const served = state.served;
    state.spawnInMs = Math.max(7000, SPAWN_EVERY_MS - served * 600);
  }
  if (state.timeLeftMs <= 0) {
    state.timeLeftMs = 0;
    state.screen = 'over';
    setMessage(state, '');
  }
}

export function stationAt(x, y) {
  // Counter stations: 8 boxes across the bottom counter.
  if (y < 648 || y > 772) return -1;
  const w = 1280 / 8;
  const i = Math.floor(x / w);
  return i >= 0 && i < INGREDIENTS.length ? i : -1;
}
