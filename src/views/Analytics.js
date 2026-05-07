import { state } from '../engine/GameState.js';
import { fmt, getMonthlyExpenses } from '../systems/FinancialSystem.js';
import { CATEGORY_META } from '../data/projects.js';

function monthName(m) {
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][(m - 1) % 12];
}

export function renderAnalytics(el) {
  const history = state.financialHistory;
  const completedProjects = state.completedProjects;
  const totalRevenue = history.reduce((s, h) => s + h.revenue, 0);
  const totalExpenses = history.reduce((s, h) => s + h.expenses, 0);
  const successRate = completedProjects.length === 0 ? 0
    : Math.round((completedProjects.filter(p => p.status === 'completed').length / completedProjects.length) * 100);

  const monthExp = getMonthlyExpenses();

  el.innerHTML = `
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Summary KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        ${_kpi('Total Revenue', `$${fmt(totalRevenue)}`, 'text-emerald-300')}
        ${_kpi('Total Expenses', `$${fmt(totalExpenses)}`, 'text-red-300')}
        ${_kpi('Net Profit', `$${fmt(totalRevenue - totalExpenses)}`, totalRevenue >= totalExpenses ? 'text-emerald-300' : 'text-red-300')}
        ${_kpi('Project Success', `${successRate}%`, successRate >= 70 ? 'text-emerald-300' : 'text-amber-200')}
      </div>

      <!-- Cashflow chart (simple SVG sparkline) -->
      ${history.length >= 2 ? _cashflowChart(history) : `
        <div class="glass rounded-3xl p-8 text-center text-slate-500 text-sm">
          Financial history will appear after the first month ends.
        </div>
      `}

      <!-- Monthly Reports Table -->
      ${history.length > 0 ? `
      <div class="glass rounded-3xl overflow-hidden">
        <div class="px-6 py-4 border-b border-white/5">
          <h2 class="font-semibold">Monthly Reports</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-slate-400 uppercase tracking-widest border-b border-white/5">
                <th class="px-5 py-3 text-left">Month</th>
                <th class="px-5 py-3 text-right">Revenue</th>
                <th class="px-5 py-3 text-right">Expenses</th>
                <th class="px-5 py-3 text-right">Profit</th>
                <th class="px-5 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              ${[...history].reverse().map(h => `
                <tr class="border-b border-white/5 last:border-0 hover:bg-white/2 transition">
                  <td class="px-5 py-3 text-slate-300">${monthName(h.month)} ${h.year}</td>
                  <td class="px-5 py-3 text-right text-emerald-300">$${fmt(h.revenue)}</td>
                  <td class="px-5 py-3 text-right text-red-300">$${fmt(h.expenses)}</td>
                  <td class="px-5 py-3 text-right ${h.profit >= 0 ? 'text-emerald-300' : 'text-red-300'}">
                    ${h.profit >= 0 ? '+' : ''}$${fmt(h.profit)}
                  </td>
                  <td class="px-5 py-3 text-right text-slate-300">$${fmt(h.balance)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ` : ''}

      <!-- Expenses Breakdown -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="glass rounded-3xl p-6">
          <h2 class="font-semibold mb-4">Monthly Expenses Breakdown</h2>
          <div class="space-y-3 text-sm">
            ${_expRow('👥 Salaries', state.employees.reduce((s, e) => s + e.salary, 0))}
            ${_expRow('🏢 Office Rent', [0,500,1800,6000,20000,70000][state.officeLevel] ?? 0)}
            ${_expRow('🖧 Servers', state.purchasedUpgrades.filter(u => u === 'server-rack').length * 300)}
            <div class="border-t border-white/10 pt-3 flex justify-between font-medium">
              <span>Total / month</span>
              <span class="text-red-300">$${fmt(monthExp)}</span>
            </div>
          </div>
        </div>

        <!-- Market Trends -->
        <div class="glass rounded-3xl p-6">
          <h2 class="font-semibold mb-4">Market Trends</h2>
          <div class="space-y-3">
            ${Object.entries(state.marketTrends).map(([cat, val]) => `
              <div>
                <div class="flex justify-between text-xs text-slate-400 mb-1">
                  <span>${CATEGORY_META[cat]?.icon ?? '•'} ${CATEGORY_META[cat]?.label ?? cat}</span>
                  <span class="${val >= 1.1 ? 'text-emerald-300' : val >= 0.9 ? 'text-slate-300' : 'text-red-300'}">
                    ${val >= 1 ? '+' : ''}${Math.round((val - 1) * 100)}%
                  </span>
                </div>
                <div class="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div class="h-full rounded-full ${val >= 1.1 ? 'bg-emerald-400' : val >= 0.9 ? 'bg-blue-400' : 'bg-red-400'}"
                    style="width:${Math.min(100, val * 65)}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function _kpi(label, value, valueClass) {
  return `
    <div class="glass rounded-3xl p-5">
      <div class="text-xs text-slate-400 uppercase tracking-widest">${label}</div>
      <div class="mt-2 text-2xl font-semibold tabular-nums ${valueClass}">${value}</div>
    </div>
  `;
}

function _expRow(label, amount) {
  return `
    <div class="flex justify-between text-slate-300">
      <span>${label}</span>
      <span class="${amount > 0 ? 'text-red-300' : 'text-slate-500'}">$${fmt(amount)}</span>
    </div>
  `;
}

function _cashflowChart(history) {
  const last12 = history.slice(-12);
  const vals = last12.map(h => h.balance);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;

  const W = 600, H = 100, PAD = 8;
  const pts = vals.map((v, i) => {
    const x = PAD + (i / (vals.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return `${x},${y}`;
  }).join(' ');

  return `
    <div class="glass rounded-3xl p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-semibold">Balance History</h2>
        <span class="text-xs text-slate-400">Last ${last12.length} months</span>
      </div>
      <svg viewBox="0 0 ${W} ${H}" class="w-full h-24" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bal-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#3B82F6" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <polyline points="${pts}" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linejoin="round"/>
      </svg>
      <div class="flex justify-between text-xs text-slate-500 mt-1">
        <span>${monthName(last12[0].month)} ${last12[0].year}</span>
        <span>$${fmt(min)} — $${fmt(max)}</span>
        <span>${monthName(last12[last12.length - 1].month)} ${last12[last12.length - 1].year}</span>
      </div>
    </div>
  `;
}
