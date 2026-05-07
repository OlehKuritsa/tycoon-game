import { state } from '../engine/GameState.js';
import { fmt, getMonthlyExpenses, getRunwayMonths } from '../systems/FinancialSystem.js';
import { CATEGORY_META, DIFFICULTY_META } from '../data/projects.js';
import { ROLES, RARITIES } from '../data/employees.js';

export function renderDashboard(el) {
  const avgStress = state.employees.length
    ? Math.round(state.employees.reduce((s, e) => s + e.stress, 0) / state.employees.length)
    : 0;
  const stressLabel = avgStress < 30 ? 'Low' : avgStress < 60 ? 'Medium' : 'High';
  const stressColor = avgStress < 30 ? 'text-emerald-300' : avgStress < 60 ? 'text-amber-200' : 'text-red-300';

  const xpPct = Math.floor((state.company.xp / state.company.xpToNext) * 100);
  const monthExp = getMonthlyExpenses();

  el.innerHTML = `
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Company XP bar -->
      <div class="glass rounded-3xl px-6 py-4 flex items-center gap-5">
        <div class="flex-1">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-slate-400 uppercase tracking-widest">Company Level ${state.company.level}</span>
            <span class="text-xs text-slate-400">${state.company.xp} / ${state.company.xpToNext} XP</span>
          </div>
          <div class="h-2 rounded-full bg-white/10 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-500 to-orange-400 transition-all duration-500" style="width:${xpPct}%"></div>
          </div>
        </div>
        <div class="text-right shrink-0">
          <div class="text-xs text-slate-400">Day ${state.day} · ${_monthName(state.month)} ${state.year}</div>
          <div class="text-xs text-slate-400 mt-0.5">Expenses $${fmt(monthExp)}/mo</div>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        ${_kpi('Balance', `$${fmt(state.balance)}`, state.balance > 0 ? 'text-white' : 'text-red-300', 'glow-orange')}
        ${_kpi('Reputation', state.reputation, 'text-white', 'glow-blue')}
        ${_kpi('Team Stress', stressLabel, stressColor, '')}
        ${_kpi('Runway', `${getRunwayMonths()} mo`, 'text-white', '')}
      </div>

      <!-- Active projects + employees -->
      <div class="grid grid-cols-12 gap-5">
        <div class="col-span-12 lg:col-span-8 glass rounded-3xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold">Active Projects</h2>
            <span class="text-xs text-slate-400">${state.activeProjects.length} running</span>
          </div>
          ${state.activeProjects.length === 0 ? `
            <div class="text-slate-500 text-sm text-center py-8">No active projects. Go to Projects to accept one.</div>
          ` : state.activeProjects.map(_projectCard).join('')}
        </div>

        <div class="col-span-12 lg:col-span-4 glass rounded-3xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold">Team</h2>
            <span class="text-xs text-slate-400">${state.employees.length}/${state.maxEmployees}</span>
          </div>
          ${state.employees.length === 0 ? `
            <div class="text-slate-500 text-sm text-center py-8">No employees yet. Visit Employees to hire.</div>
          ` : state.employees.map(_empCard).join('')}
        </div>
      </div>

      <!-- Market trends -->
      <div class="glass rounded-3xl p-6">
        <h2 class="font-semibold mb-4">Market Trends</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          ${Object.entries(state.marketTrends).map(([cat, val]) => `
            <div class="glass rounded-2xl p-3">
              <div class="text-xs text-slate-400 mb-1">${CATEGORY_META[cat]?.icon ?? '•'} ${CATEGORY_META[cat]?.label ?? cat}</div>
              <div class="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div class="h-full rounded-full ${val >= 1.1 ? 'bg-emerald-400' : val >= 0.9 ? 'bg-blue-400' : 'bg-red-400'}"
                  style="width:${Math.min(100, val * 70)}%"></div>
              </div>
              <div class="text-xs mt-1 ${val >= 1.1 ? 'text-emerald-300' : val >= 0.9 ? 'text-slate-300' : 'text-red-300'}">
                ${val >= 1.1 ? '▲' : val >= 0.9 ? '─' : '▼'} ${Math.round((val - 1) * 100)}%
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function _kpi(label, value, valueClass, glow) {
  return `
    <div class="glass ${glow} rounded-3xl p-5">
      <div class="text-xs text-slate-400 uppercase tracking-widest">${label}</div>
      <div class="mt-2 text-3xl font-semibold tabular-nums ${valueClass}">${value}</div>
    </div>
  `;
}

function _projectCard(p) {
  const meta = CATEGORY_META[p.category] ?? { icon: '•', label: p.category };
  const diff = DIFFICULTY_META[p.difficulty];
  const pct = Math.floor(p.progress);
  const barColor = p.daysLeft < 5 ? 'from-red-500 to-orange-400' : 'from-blue-500 to-orange-400';
  return `
    <div class="glass rounded-2xl p-4 mb-3 last:mb-0">
      <div class="flex items-start justify-between">
        <div>
          <div class="text-xs text-slate-400">${meta.icon} ${meta.label}</div>
          <div class="font-medium mt-0.5">${p.name}</div>
          <div class="text-xs text-slate-400 mt-0.5">Client: ${p.client}</div>
        </div>
        <div class="text-right shrink-0 ml-3">
          <div class="text-xs ${diff.color}">${diff.label}</div>
          <div class="text-xs text-slate-300 mt-0.5">${p.daysLeft}d left</div>
        </div>
      </div>
      <div class="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div class="h-full bg-gradient-to-r ${barColor} transition-all duration-700" style="width:${pct}%"></div>
      </div>
      <div class="mt-1.5 flex items-center justify-between text-xs text-slate-400">
        <span>${p.assignedEmployees.length} assigned</span>
        <span>${pct}%</span>
      </div>
    </div>
  `;
}

function _empCard(emp) {
  const role = ROLES[emp.role];
  const rar = RARITIES[emp.rarity];
  const stressColor = emp.stress < 50 ? 'bg-emerald-400' : emp.stress < 80 ? 'bg-amber-400' : 'bg-red-400';
  const statusText = emp.assignedProject ? 'Working' : 'Idle';
  const statusColor = emp.assignedProject ? 'text-blue-300' : 'text-slate-400';
  return `
    <div class="glass rounded-2xl p-3 mb-2 last:mb-0">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-medium ${rar.color}">${emp.name}</div>
          <div class="text-xs text-slate-400">${role?.icon} ${role?.label}</div>
        </div>
        <div class="text-xs ${statusColor}">${statusText}</div>
      </div>
      <div class="mt-2 flex items-center gap-2">
        <span class="text-xs text-slate-500">Stress</span>
        <div class="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
          <div class="h-full ${stressColor} transition-all" style="width:${emp.stress}%"></div>
        </div>
        <span class="text-xs text-slate-400">${Math.round(emp.stress)}%</span>
      </div>
    </div>
  `;
}

function _monthName(m) {
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][(m - 1) % 12];
}
