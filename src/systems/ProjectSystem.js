import { state } from '../engine/GameState.js';
import { EventBus } from '../engine/EventBus.js';
import { PROJECT_TEMPLATES } from '../data/projects.js';
import { addRevenue } from './FinancialSystem.js';

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

let _pid = 1;

function buildProject() {
  const eligible = PROJECT_TEMPLATES.filter(t => {
    if (t.difficulty === 'extreme' && state.company.level < 5) return false;
    if (t.difficulty === 'hard'    && state.company.level < 3) return false;
    return true;
  });
  const tmpl = pick(eligible);
  const trend = state.marketTrends[tmpl.category] ?? 1;
  const days = rnd(...tmpl.deadline);

  return {
    id: _pid++,
    templateId: tmpl.id,
    name: tmpl.name,
    category: tmpl.category,
    client: pick(tmpl.clients),
    difficulty: tmpl.difficulty,
    budget: Math.floor(rnd(...tmpl.budget) * trend),
    deadlineDays: days,
    daysLeft: days,
    complexity: tmpl.complexity,
    requiredSkills: tmpl.requiredSkills,
    requiredEmployees: tmpl.requiredEmployees,
    xpReward: tmpl.xpReward,
    description: tmpl.description,
    progress: 0,
    quality: 0,
    assignedEmployees: [],
    status: 'available',
  };
}

export function refreshAvailableProjects() {
  while (state.availableProjects.length < 5) {
    state.availableProjects.push(buildProject());
  }
  EventBus.emit('ui-refresh', {});
}

export function acceptProject(projectId) {
  const idx = state.availableProjects.findIndex(p => p.id === projectId);
  if (idx === -1) return;
  const project = state.availableProjects.splice(idx, 1)[0];
  project.status = 'active';
  state.activeProjects.push(project);
  EventBus.emit('notification', { type: 'info', message: `Project accepted: ${project.name}` });
  EventBus.emit('ui-refresh', {});
}

export function declineProject(projectId) {
  state.availableProjects = state.availableProjects.filter(p => p.id !== projectId);
  state.availableProjects.push(buildProject());
  EventBus.emit('ui-refresh', {});
}

export function assignEmployee(projectId, employeeId) {
  const project = state.activeProjects.find(p => p.id === projectId);
  const emp = state.employees.find(e => e.id === employeeId);
  if (!project || !emp || emp.assignedProject !== null) return;
  if (project.assignedEmployees.includes(employeeId)) return;
  project.assignedEmployees.push(employeeId);
  emp.assignedProject = projectId;
  EventBus.emit('ui-refresh', {});
}

export function unassignEmployee(projectId, employeeId) {
  const project = state.activeProjects.find(p => p.id === projectId);
  const emp = state.employees.find(e => e.id === employeeId);
  if (!project || !emp) return;
  project.assignedEmployees = project.assignedEmployees.filter(id => id !== employeeId);
  emp.assignedProject = null;
  EventBus.emit('ui-refresh', {});
}

export function tickProjects() {
  for (const p of [...state.activeProjects]) {
    p.daysLeft = Math.max(0, p.daysLeft - 1);

    if (p.assignedEmployees.length > 0) {
      let dailyProgress = 0;
      for (const eid of p.assignedEmployees) {
        const emp = state.employees.find(e => e.id === eid);
        if (!emp) continue;
        const eff = ((emp.skill + emp.speed + emp.focus) / 3) / 100;
        const stressPenalty = Math.max(0, emp.stress - 50) / 200;
        const traitSpeed = emp.traits.includes('workaholic') ? 1.2
          : emp.traits.includes('lazy') ? 0.75
          : emp.traits.includes('perfectionist') ? 0.85 : 1;
        // Base progress so required employees at avg eff finish at deadline
        const base = 100 / (p.deadlineDays * p.requiredEmployees);
        dailyProgress += eff * 2 * base * traitSpeed * (1 - stressPenalty);
      }

      // Global mods
      dailyProgress *= (1 + state.mods.speedBonus + state.mods.aiAutomation);
      p.progress = Math.min(100, p.progress + dailyProgress);
    }

    if (p.progress >= 100) {
      _completeProject(p);
    } else if (p.daysLeft <= 0) {
      _failProject(p);
    }
  }
}

function _completeProject(p) {
  const emps = p.assignedEmployees.map(id => state.employees.find(e => e.id === id)).filter(Boolean);
  const avgCreativity = emps.length ? emps.reduce((s, e) => s + e.creativity, 0) / emps.length : 50;
  const avgStress     = emps.length ? emps.reduce((s, e) => s + e.stress, 0)     / emps.length : 0;

  const traitQuality = emps.some(e => e.traits.includes('perfectionist') || e.traits.includes('creative')) ? 1.2 : 1;
  p.quality = Math.min(100, Math.floor((avgCreativity * 0.65 + (100 - avgStress) * 0.35) * traitQuality * (1 + state.mods.qualityBonus)));
  p.status = 'completed';

  _unassignAll(p);
  state.activeProjects = state.activeProjects.filter(x => x.id !== p.id);
  state.completedProjects.unshift(p);

  const qualMod = 0.5 + (p.quality / 100) * 0.5;
  const repMod = 1 + state.mods.reputationBonus;
  const payout = Math.floor(p.budget * qualMod);
  addRevenue(payout);

  const repGain = Math.floor(Math.min(15, (p.quality / 100) * 12 * repMod));
  state.reputation = Math.min(100, state.reputation + repGain);

  _giveXP(p.xpReward);

  EventBus.emit('notification', { type: 'success', message: `✅ ${p.name} done! +$${payout.toLocaleString()} | Quality ${p.quality}%` });
  EventBus.emit('ui-refresh', {});
}

function _failProject(p) {
  p.status = 'failed';
  _unassignAll(p);
  state.activeProjects = state.activeProjects.filter(x => x.id !== p.id);
  state.completedProjects.unshift(p);

  const repLoss = Math.floor(p.complexity * 2.5);
  state.reputation = Math.max(0, state.reputation - repLoss);

  EventBus.emit('notification', { type: 'error', message: `❌ ${p.name} failed! -${repLoss} reputation` });
  EventBus.emit('ui-refresh', {});
}

function _unassignAll(p) {
  for (const eid of p.assignedEmployees) {
    const emp = state.employees.find(e => e.id === eid);
    if (emp) emp.assignedProject = null;
  }
  p.assignedEmployees = [];
}

function _giveXP(amount) {
  state.company.xp += amount;
  while (state.company.xp >= state.company.xpToNext) {
    state.company.xp -= state.company.xpToNext;
    state.company.level++;
    state.company.xpToNext = Math.floor(state.company.xpToNext * 1.8);
    EventBus.emit('notification', { type: 'success', message: `🎉 Company reached Level ${state.company.level}!` });
  }
}
