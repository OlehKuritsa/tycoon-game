import { state } from '../engine/GameState.js';
import { hireEmployee, fireEmployee, refreshHirePool } from '../systems/EmployeeSystem.js';
import { ROLES, RARITIES, TRAITS } from '../data/employees.js';
import { showModal } from '../components/Modal.js';
import { fmt } from '../systems/FinancialSystem.js';

export function renderEmployees(el) {
  el.innerHTML = `
    <div class="max-w-6xl mx-auto space-y-8">
      <!-- Your Team -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-lg">Your Team <span class="text-slate-400 font-normal text-base">${state.employees.length}/${state.maxEmployees}</span></h2>
        </div>
        ${state.employees.length === 0
          ? `<div class="glass rounded-3xl p-8 text-center text-slate-500 text-sm">Hire your first employee below!</div>`
          : `<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              ${state.employees.map(emp => _hiredCard(emp)).join('')}
             </div>`}
      </div>

      <!-- Hire Pool -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-lg">Available Candidates</h2>
          <button data-action="refresh-pool" class="glass glow-blue rounded-2xl px-4 py-2 text-sm hover:scale-[1.02] transition">
            🔄 Refresh Pool
          </button>
        </div>
        ${state.hirePool.length === 0
          ? `<div class="glass rounded-3xl p-8 text-center text-slate-500 text-sm">No candidates. Refresh the pool.</div>`
          : `<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              ${state.hirePool.map(emp => _hireCard(emp)).join('')}
             </div>`}
      </div>
    </div>
  `;

  el.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, empid } = btn.dataset;
    const id = Number(empid);

    if (action === 'refresh-pool') refreshHirePool();
    if (action === 'hire') {
      const candidate = state.hirePool.find(e => e.id === id);
      if (candidate) hireEmployee(candidate);
    }
    if (action === 'fire') {
      const emp = state.employees.find(e => e.id === id);
      if (emp) {
        showModal({
          title: `Fire ${emp.name}?`,
          body: `This will remove ${emp.name} from your team. ${emp.assignedProject ? 'They will be unassigned from their current project.' : ''}`,
          actions: [
            { label: 'Yes, fire them', primary: true, onClick: () => fireEmployee(id) },
            { label: 'Cancel' },
          ],
        });
      }
    }
    if (action === 'details') {
      const emp = state.employees.find(e => e.id === id) ?? state.hirePool.find(e => e.id === id);
      if (emp) _showDetails(emp);
    }
  });
}

function _statBar(val, color = 'bg-blue-400') {
  return `
    <div class="flex items-center gap-2 text-xs">
      <div class="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div class="h-full ${color} rounded-full" style="width:${val}%"></div>
      </div>
      <span class="text-slate-400 w-6 text-right">${val}</span>
    </div>
  `;
}

function _hiredCard(emp) {
  const role = ROLES[emp.role];
  const rar = RARITIES[emp.rarity];
  const stressColor = emp.stress < 50 ? 'bg-emerald-400' : emp.stress < 80 ? 'bg-amber-400' : 'bg-red-400';
  const statusText = emp.assignedProject
    ? `On project`
    : 'Idle';

  return `
    <div class="glass rounded-3xl p-5 flex flex-col gap-3">
      <div class="flex items-start justify-between">
        <div>
          <div class="font-medium ${rar.color}">${emp.name}</div>
          <div class="text-xs text-slate-400 mt-0.5">${role?.icon} ${role?.label}</div>
          <div class="text-xs text-slate-500 mt-0.5">${rar.label} · $${fmt(emp.salary)}/mo</div>
        </div>
        <div class="text-xs ${emp.assignedProject ? 'text-blue-300' : 'text-slate-500'}">${statusText}</div>
      </div>

      <div class="space-y-1.5">
        <div class="text-xs text-slate-500 flex justify-between"><span>Skill</span></div>
        ${_statBar(emp.skill, 'bg-blue-400')}
        <div class="text-xs text-slate-500">Speed</div>
        ${_statBar(emp.speed, 'bg-orange-400')}
        <div class="text-xs text-slate-500">Creativity</div>
        ${_statBar(emp.creativity, 'bg-purple-400')}
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-500">Stress</span>
        <div class="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div class="h-full ${stressColor} transition-all" style="width:${emp.stress}%"></div>
        </div>
        <span class="text-xs text-slate-400">${Math.round(emp.stress)}%</span>
      </div>

      <div class="flex flex-wrap gap-1">
        ${emp.traits.map(t => `<span class="glass text-xs rounded-lg px-2 py-0.5 text-slate-300">${TRAITS[t]?.label ?? t}</span>`).join('')}
      </div>

      <div class="flex gap-2">
        <button data-action="details" data-empid="${emp.id}"
          class="glass rounded-2xl px-3 py-2 text-xs flex-1 hover:scale-[1.02] transition">Details</button>
        <button data-action="fire" data-empid="${emp.id}"
          class="glass rounded-2xl px-3 py-2 text-xs text-red-300 hover:scale-[1.02] transition">Fire</button>
      </div>
    </div>
  `;
}

function _hireCard(emp) {
  const role = ROLES[emp.role];
  const rar = RARITIES[emp.rarity];
  const canHire = state.employees.length < state.maxEmployees;

  return `
    <div class="glass rounded-3xl p-5 flex flex-col gap-3">
      <div>
        <div class="font-medium ${rar.color}">${emp.name}</div>
        <div class="text-xs text-slate-400 mt-0.5">${role?.icon} ${role?.label}</div>
        <div class="text-xs text-slate-500 mt-0.5">${rar.label}</div>
      </div>

      <div class="space-y-1.5">
        ${_statBar(emp.skill, 'bg-blue-400')}
        ${_statBar(emp.speed, 'bg-orange-400')}
        ${_statBar(emp.creativity, 'bg-purple-400')}
      </div>

      <div class="flex flex-wrap gap-1">
        ${emp.traits.map(t => `<span class="glass text-xs rounded-lg px-2 py-0.5 ${t === 'toxic' ? 'text-red-300' : t === 'genius' || t === 'fastLearner' ? 'text-amber-200' : 'text-slate-300'}">${TRAITS[t]?.label ?? t}</span>`).join('')}
      </div>

      <div class="glass rounded-xl px-3 py-2 text-center">
        <div class="text-xs text-slate-400">Monthly Salary</div>
        <div class="text-emerald-300 font-medium">$${fmt(emp.salary)}</div>
      </div>

      <button data-action="hire" data-empid="${emp.id}"
        class="glass ${canHire ? 'glow-orange' : 'opacity-40 cursor-not-allowed'} rounded-2xl px-4 py-2 text-sm hover:scale-[1.02] transition">
        ${canHire ? 'Hire' : 'No space'}
      </button>
    </div>
  `;
}

function _showDetails(emp) {
  const role = ROLES[emp.role];
  const rar = RARITIES[emp.rarity];
  showModal({
    title: `${emp.name} — ${role?.label}`,
    body: `
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="glass rounded-xl p-2"><div class="text-slate-400">Rarity</div><div class="${rar.color}">${rar.label}</div></div>
          <div class="glass rounded-xl p-2"><div class="text-slate-400">Salary</div><div class="text-emerald-300">$${fmt(emp.salary)}/mo</div></div>
          <div class="glass rounded-xl p-2"><div class="text-slate-400">Experience</div><div>${emp.experience} days</div></div>
          <div class="glass rounded-xl p-2"><div class="text-slate-400">Loyalty</div><div>${emp.loyalty}%</div></div>
        </div>
        <div class="text-xs text-slate-400 font-medium mt-2">Stats</div>
        <div class="grid grid-cols-2 gap-1 text-xs text-slate-300">
          <div>Skill: <b>${emp.skill}</b></div>
          <div>Speed: <b>${emp.speed}</b></div>
          <div>Creativity: <b>${emp.creativity}</b></div>
          <div>Intelligence: <b>${emp.intelligence}</b></div>
          <div>Focus: <b>${emp.focus}</b></div>
          <div>Energy: <b>${Math.round(emp.energy)}</b></div>
        </div>
        <div class="text-xs text-slate-400 font-medium">Traits</div>
        <div class="flex flex-wrap gap-1">
          ${emp.traits.map(t => `
            <span class="glass rounded-xl px-2 py-1 text-xs" title="${TRAITS[t]?.desc ?? ''}">${TRAITS[t]?.label ?? t}</span>
          `).join('')}
        </div>
        ${emp.traits.map(t => TRAITS[t] ? `<div class="text-xs text-slate-500">${TRAITS[t].label}: ${TRAITS[t].desc}</div>` : '').join('')}
      </div>
    `,
    actions: [{ label: 'Close' }],
  });
}
