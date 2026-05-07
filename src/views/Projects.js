import { state } from '../engine/GameState.js';
import { acceptProject, declineProject, assignEmployee, unassignEmployee } from '../systems/ProjectSystem.js';
import { CATEGORY_META, DIFFICULTY_META } from '../data/projects.js';
import { ROLES } from '../data/employees.js';
import { fmt } from '../systems/FinancialSystem.js';

export function renderProjects(el) {
  el.innerHTML = `
    <div class="max-w-6xl mx-auto space-y-8">
      <!-- Available -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-lg">Project Marketplace</h2>
          <span class="text-xs text-slate-400">${state.availableProjects.length} available</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          ${state.availableProjects.map(p => _availableCard(p)).join('')}
        </div>
      </div>

      <!-- Active -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-lg">Active Projects</h2>
          <span class="text-xs text-slate-400">${state.activeProjects.length} in progress</span>
        </div>
        ${state.activeProjects.length === 0
          ? `<div class="glass rounded-3xl p-8 text-center text-slate-500 text-sm">No active projects.</div>`
          : `<div class="space-y-4">${state.activeProjects.map(p => _activeCard(p)).join('')}</div>`}
      </div>

      <!-- History -->
      ${state.completedProjects.length > 0 ? `
      <div>
        <h2 class="font-semibold text-lg mb-4">History</h2>
        <div class="glass rounded-3xl overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-slate-400 uppercase tracking-widest border-b border-white/5">
                <th class="px-5 py-3 text-left">Project</th>
                <th class="px-5 py-3 text-left">Client</th>
                <th class="px-5 py-3 text-right">Quality</th>
                <th class="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              ${state.completedProjects.slice(0, 10).map(p => `
                <tr class="border-b border-white/5 last:border-0">
                  <td class="px-5 py-3">${p.name}</td>
                  <td class="px-5 py-3 text-slate-400">${p.client}</td>
                  <td class="px-5 py-3 text-right">${p.quality ? p.quality + '%' : '—'}</td>
                  <td class="px-5 py-3 text-right">
                    <span class="${p.status === 'completed' ? 'text-emerald-300' : 'text-red-300'}">
                      ${p.status === 'completed' ? '✓ Done' : '✕ Failed'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ` : ''}
    </div>
  `;

  // Event delegation
  el.addEventListener('click', _handleClick);
}

function _handleClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id, empid } = btn.dataset;
  const pid = Number(id);
  const eid = Number(empid);

  if (action === 'accept')    acceptProject(pid);
  if (action === 'decline')   declineProject(pid);
  if (action === 'assign')    assignEmployee(pid, eid);
  if (action === 'unassign')  unassignEmployee(pid, eid);
}

function _availableCard(p) {
  const meta = CATEGORY_META[p.category] ?? { icon: '•', label: p.category };
  const diff = DIFFICULTY_META[p.difficulty];
  const canAfford = true; // projects are free to accept
  const urgency = p.deadlineDays <= 14 ? 'text-red-300' : p.deadlineDays <= 30 ? 'text-amber-200' : 'text-slate-300';

  return `
    <div class="glass rounded-3xl p-5 flex flex-col gap-3">
      <div class="flex items-start justify-between">
        <div>
          <div class="text-xs text-slate-400">${meta.icon} ${meta.label}</div>
          <div class="font-medium mt-0.5">${p.name}</div>
          <div class="text-xs text-slate-400 mt-0.5">${p.client}</div>
        </div>
        <span class="glass ${diff.bg} ${diff.color} text-xs rounded-xl px-2 py-1 shrink-0">${diff.label}</span>
      </div>
      <p class="text-xs text-slate-400 leading-relaxed">${p.description}</p>
      <div class="grid grid-cols-3 gap-2 text-xs">
        <div class="glass rounded-xl p-2 text-center">
          <div class="text-slate-400">Budget</div>
          <div class="font-medium text-emerald-300">$${fmt(p.budget)}</div>
        </div>
        <div class="glass rounded-xl p-2 text-center">
          <div class="text-slate-400">Deadline</div>
          <div class="font-medium ${urgency}">${p.deadlineDays}d</div>
        </div>
        <div class="glass rounded-xl p-2 text-center">
          <div class="text-slate-400">Team</div>
          <div class="font-medium">${p.requiredEmployees}+</div>
        </div>
      </div>
      <div class="text-xs text-slate-500">Skills: ${p.requiredSkills.join(', ')}</div>
      <div class="flex gap-2 mt-1">
        <button data-action="accept" data-id="${p.id}"
          class="glass glow-orange rounded-2xl px-4 py-2 text-sm flex-1 hover:scale-[1.02] transition">
          Accept
        </button>
        <button data-action="decline" data-id="${p.id}"
          class="glass rounded-2xl px-4 py-2 text-sm hover:scale-[1.02] transition">
          Skip
        </button>
      </div>
    </div>
  `;
}

function _activeCard(p) {
  const meta = CATEGORY_META[p.category] ?? { icon: '•', label: p.category };
  const pct = Math.floor(p.progress);
  const urgency = p.daysLeft <= 5 ? 'text-red-300' : p.daysLeft <= 10 ? 'text-amber-200' : 'text-slate-300';
  const barColor = p.daysLeft <= 5 ? 'from-red-500 to-orange-400' : 'from-blue-500 to-orange-400';

  const assignedEmps = p.assignedEmployees
    .map(id => state.employees.find(e => e.id === id))
    .filter(Boolean);

  const freeEmps = state.employees.filter(e => e.assignedProject === null);

  return `
    <div class="glass rounded-3xl p-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <div class="text-xs text-slate-400">${meta.icon} ${meta.label} · ${p.client}</div>
          <div class="font-medium text-lg mt-0.5">${p.name}</div>
        </div>
        <div class="text-right">
          <div class="text-xs text-slate-400">Budget</div>
          <div class="text-emerald-300 font-medium">$${fmt(p.budget)}</div>
        </div>
      </div>

      <div class="mb-3">
        <div class="flex justify-between text-xs text-slate-400 mb-1">
          <span>Progress</span>
          <span class="${urgency}">${p.daysLeft}d left · ${pct}%</span>
        </div>
        <div class="h-2 rounded-full bg-white/10 overflow-hidden">
          <div class="h-full bg-gradient-to-r ${barColor} transition-all duration-700" style="width:${pct}%"></div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <!-- Assigned -->
        <div>
          <div class="text-xs text-slate-400 mb-2">Assigned (${assignedEmps.length}/${p.requiredEmployees})</div>
          ${assignedEmps.length === 0
            ? `<div class="text-xs text-slate-500 italic">Nobody assigned</div>`
            : assignedEmps.map(emp => `
              <div class="glass rounded-xl px-3 py-2 mb-1 flex items-center justify-between text-xs">
                <span>${emp.name} <span class="text-slate-500">(${ROLES[emp.role]?.label})</span></span>
                <button data-action="unassign" data-id="${p.id}" data-empid="${emp.id}"
                  class="text-slate-500 hover:text-red-300 transition ml-2">✕</button>
              </div>
            `).join('')}
        </div>
        <!-- Available to assign -->
        <div>
          <div class="text-xs text-slate-400 mb-2">Assign from team</div>
          ${freeEmps.length === 0
            ? `<div class="text-xs text-slate-500 italic">All busy</div>`
            : freeEmps.map(emp => `
              <div class="glass rounded-xl px-3 py-2 mb-1 flex items-center justify-between text-xs">
                <span>${emp.name}</span>
                <button data-action="assign" data-id="${p.id}" data-empid="${emp.id}"
                  class="text-blue-300 hover:text-blue-100 transition ml-2">+ Add</button>
              </div>
            `).join('')}
        </div>
      </div>
    </div>
  `;
}
