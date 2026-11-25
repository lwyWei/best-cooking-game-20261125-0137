// Config: everything a cook needs to know — ingredients, recipes, timings.
// No network, no assets: every ingredient is drawn from these shapes and colours.
export const CANVAS_W = 1280;
export const CANVAS_H = 800;
export const ROUND_SECONDS = 120;
export const MAX_ORDERS = 3;
export const SPAWN_EVERY_MS = 12000;
export const ORDER_PATIENCE_MS = 45000;

// The eight counter stations, in the order the player sees them (keys 1-8).
export const INGREDIENTS = [
  { id: 'bunBottom', name: 'Bun base', key: '1', color: '#e8a85c', dark: '#c98a3e', price: 1 },
  { id: 'patty', name: 'Patty', key: '2', color: '#7a4a21', dark: '#5d3413', price: 3 },
  { id: 'cheese', name: 'Cheese', key: '3', color: '#ffc93c', dark: '#e0a800', price: 2 },
  { id: 'tomato', name: 'Tomato', key: '4', color: '#e4572e', dark: '#b23a18', price: 2 },
  { id: 'lettuce', name: 'Lettuce', key: '5', color: '#7bc950', dark: '#4e9b2d', price: 1 },
  { id: 'onion', name: 'Onion', key: '6', color: '#f4eefb', dark: '#c9b8e0', price: 1 },
  { id: 'egg', name: 'Fried egg', key: '7', color: '#fff3b0', dark: '#ffb703', price: 2 },
  { id: 'bunTop', name: 'Bun top', key: '8', color: '#e8a85c', dark: '#c98a3e', price: 1 },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

// Recipes on the order board. A dish matches an order only when the plate holds
// exactly this sequence, bottom to top.
export const RECIPES = [
  { name: 'Classic Burger', recipe: ['bunBottom', 'patty', 'cheese', 'bunTop'], reward: 14 },
  { name: 'Garden Stack', recipe: ['bunBottom', 'lettuce', 'tomato', 'onion', 'bunTop'], reward: 12 },
  { name: 'Sunny Melt', recipe: ['bunBottom', 'egg', 'cheese', 'patty', 'bunTop'], reward: 16 },
  { name: 'Double Trouble', recipe: ['bunBottom', 'patty', 'cheese', 'patty', 'bunTop'], reward: 20 },
  { name: 'Fresh Crunch', recipe: ['bunBottom', 'lettuce', 'tomato', 'cheese', 'bunTop'], reward: 13 },
  { name: 'Breakfast Bun', recipe: ['bunBottom', 'egg', 'patty', 'onion', 'bunTop'], reward: 15 },
];

// Layout (canvas pixels). Stations sit along the counter at the bottom.
export const LAYOUT = {
  hudH: 64,
  boardY: 76,
  boardH: 118,
  plate: { x: 640, y: 470, rx: 250, ry: 46 },
  counterY: 640,
  counterH: 140,
  serveBtn: { x: 1055, y: 420, w: 180, h: 64 },
  trashBtn: { x: 1055, y: 500, w: 180, h: 48 },
};
