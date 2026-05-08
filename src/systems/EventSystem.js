import { state } from '../engine/GameState.js';
import { EventBus } from '../engine/EventBus.js';
import { EVENTS } from '../data/events.js';

export function checkRandomEvents() {
  if (state.pendingEvent) return; // one at a time

  const avgStress = state.employees.length
    ? state.employees.reduce((s, e) => s + e.stress, 0) / state.employees.length
    : 0;

  for (const ev of EVENTS) {
    if (Math.random() > ev.probability) continue;
    if (ev.minReputation && state.reputation < ev.minReputation) continue;
    if (ev.minLevel && state.company.level < ev.minLevel) continue;
    if (ev.minStress && avgStress < ev.minStress) continue;

    // Cybersecurity Suite blocks cyber attacks proportionally to attackProtection
    if (ev.id === 'cyber-attack' && state.mods.attackProtection > 0
        && Math.random() < state.mods.attackProtection) {
      EventBus.emit('notification', { type: 'success', message: '🛡️ Cyber attack blocked by Cybersecurity Suite!' });
      continue;
    }

    state.pendingEvent = ev;
    EventBus.emit('game-event', { event: ev });
    break;
  }
}

export function resolveEvent(eventId, choiceIndex) {
  const ev = EVENTS.find(e => e.id === eventId);
  if (!ev) return;
  const choice = ev.choices[choiceIndex];
  if (!choice) return;

  switch (choice.action) {
    case 'balance':
      state.balance += choice.value;
      break;
    case 'reputation':
      state.reputation = Math.max(0, Math.min(100, state.reputation + choice.value));
      break;
    case 'both':
      state.reputation = Math.max(0, Math.min(100, state.reputation + (choice.repValue ?? 0)));
      state.balance += choice.balValue ?? 0;
      break;
    case 'delayProjects':
      for (const p of state.activeProjects) {
        p.daysLeft = Math.max(0, p.daysLeft - choice.value);
      }
      break;
    case 'marketBoost':
      if (choice.category) {
        state.marketTrends[choice.category] = Math.min(2.5, (state.marketTrends[choice.category] ?? 1) + choice.value);
      }
      break;
    case 'fireRandom':
      if (state.employees.length > 0) {
        const victim = state.employees[Math.floor(Math.random() * state.employees.length)];
        import('../systems/EmployeeSystem.js').then(({ fireEmployee }) => fireEmployee(victim.id));
      }
      break;
  }

  state.pendingEvent = null;
  EventBus.emit('ui-refresh', {});
}
