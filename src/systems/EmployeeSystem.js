import { state } from '../engine/GameState.js';
import { EventBus } from '../engine/EventBus.js';
import { generateEmployee, ROLES, TRAITS } from '../data/employees.js';

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function refreshHirePool() {
  const roles = Object.keys(ROLES);
  const boost = state.researchedTech.includes('talent-pipeline');
  state.hirePool = Array.from({ length: 4 }, () => {
    const role = pick(roles);
    const rarity = boost ? _boostedRarity() : undefined;
    return generateEmployee(role, rarity);
  });
  EventBus.emit('ui-refresh', {});
}

function _boostedRarity() {
  const r = Math.random();
  if (r < 0.30) return 'common';
  if (r < 0.60) return 'rare';
  if (r < 0.88) return 'epic';
  return 'legendary';
}

export function hireEmployee(candidate) {
  if (state.employees.length >= state.maxEmployees) {
    EventBus.emit('notification', { type: 'error', message: 'No desk space! Buy more desks in Office.' });
    return false;
  }
  state.hirePool = state.hirePool.filter(e => e.id !== candidate.id);
  state.employees.push(candidate);
  EventBus.emit('notification', { type: 'success', message: `${candidate.name} joined the team!` });
  EventBus.emit('ui-refresh', {});
  return true;
}

export function fireEmployee(employeeId) {
  const emp = state.employees.find(e => e.id === employeeId);
  if (!emp) return;

  if (emp.assignedProject !== null) {
    const p = state.activeProjects.find(p => p.id === emp.assignedProject);
    if (p) p.assignedEmployees = p.assignedEmployees.filter(id => id !== employeeId);
  }

  state.employees = state.employees.filter(e => e.id !== employeeId);
  EventBus.emit('notification', { type: 'warning', message: `${emp.name} left the company.` });
  EventBus.emit('ui-refresh', {});
}

export function tickEmployees() {
  for (const emp of [...state.employees]) {
    const isWorking = emp.assignedProject !== null;

    // Stress calculation
    let stressDelta = isWorking ? 2.5 : -1.5;

    // Deadline pressure
    if (isWorking) {
      const p = state.activeProjects.find(p => p.id === emp.assignedProject);
      if (p && p.daysLeft < 7) stressDelta += 3;
    }

    // Trait modifiers
    if (emp.traits.includes('workaholic'))    stressDelta *= 1.3;
    if (emp.traits.includes('burnoutResist')) stressDelta *= 0.6;
    if (emp.traits.includes('lazy'))          stressDelta = Math.min(stressDelta, 0.5);

    // Toxic employee stresses teammates
    if (emp.traits.includes('toxic') && isWorking) {
      for (const other of state.employees) {
        if (other.id !== emp.id && other.assignedProject === emp.assignedProject) {
          other.stress = Math.min(100, other.stress + 0.5);
        }
      }
    }

    // Office stress reduction
    stressDelta *= (1 - state.mods.stressReduction);

    emp.stress = Math.min(100, Math.max(0, emp.stress + stressDelta));

    // Energy
    const recovery = state.mods.energyRecovery;
    emp.energy = Math.min(100, Math.max(0, emp.energy + (isWorking ? -1 : recovery * 0.5)));

    // Experience
    if (isWorking) emp.experience += 1;

    // Burnout check
    if (emp.stress >= 95) {
      const isLoyal = emp.traits.includes('loyal');
      if (!isLoyal && Math.random() < 0.15) {
        fireEmployee(emp.id);
        state.reputation = Math.max(0, state.reputation - 5);
        EventBus.emit('notification', { type: 'error', message: `${emp.name} quit from burnout!` });
      } else if (!isLoyal) {
        EventBus.emit('notification', { type: 'warning', message: `⚠️ ${emp.name} is burning out!` });
      }
    }
  }
}
