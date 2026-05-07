import { state } from './GameState.js';
import { EventBus } from './EventBus.js';

const BASE_MS = 3000; // 1 game day = 3s at 1× speed

let _timerId = null;

export function startLoop() {
  if (_timerId) return;
  _schedule();
}

export function stopLoop() {
  clearTimeout(_timerId);
  _timerId = null;
}

export function setSpeed(s) {
  state.speed = s;
  if (_timerId !== null) { stopLoop(); startLoop(); }
}

export function togglePause() {
  state.isPaused = !state.isPaused;
  EventBus.emit('pause-changed', { isPaused: state.isPaused });
}

function _schedule() {
  _timerId = setTimeout(() => {
    _tick();
    _schedule();
  }, BASE_MS / state.speed);
}

function _tick() {
  if (state.isPaused) return;
  state.day++;
  EventBus.emit('day-tick', { day: state.day });

  if (state.day % 7 === 0) {
    EventBus.emit('week-tick', { week: Math.floor(state.day / 7) });
  }

  if (state.day % 30 === 0) {
    state.month++;
    if (state.month > 12) { state.month = 1; state.year++; }
    EventBus.emit('month-end', { month: state.month, year: state.year });
  }
}
