import { state } from '../engine/GameState.js';
import { EventBus } from '../engine/EventBus.js';
import { UPGRADES, OFFICE_LEVELS } from '../data/upgrades.js';
import { fmt } from '../systems/FinancialSystem.js';
import { showModal } from '../components/Modal.js';

function countUpgrade(id) {
  return state.purchasedUpgrades.filter(u => u === id).length;
}

function applyUpgrade(upgrade) {
  upgrade.apply(state.mods, state);
}

export function renderOffice(el) {
  const officeData = OFFICE_LEVELS[state.officeLevel - 1];
  const nextOffice = OFFICE_LEVELS[state.officeLevel] ?? null;

  el.innerHTML = `
    <div class="max-w-5xl mx-auto space-y-8">
      <!-- Office Status -->
      <div class="glass glow-blue rounded-3xl p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div class="text-xs text-slate-400 uppercase tracking-widest">Current Office</div>
            <h2 class="text-2xl font-semibold mt-1">Level ${state.officeLevel} — ${officeData.name}</h2>
            <div class="text-xs text-slate-400 mt-2">Max employees: <b class="text-white">${state.maxEmployees}</b></div>
          </div>
          ${nextOffice ? `
            <div class="text-right">
              <div class="text-xs text-slate-400 mb-2">Upgrade to Level ${state.officeLevel + 1}</div>
              <div class="text-xs text-slate-300 mb-3">${nextOffice.name}</div>
              <button data-action="upgrade-office"
                class="glass glow-orange rounded-2xl px-5 py-2.5 text-sm hover:scale-[1.02] transition ${state.balance < nextOffice.upgradeCost ? 'opacity-40' : ''}">
                $${fmt(nextOffice.upgradeCost)} — Upgrade
              </button>
            </div>
          ` : `<div class="text-emerald-300 text-sm">Maximum level reached!</div>`}
        </div>
      </div>

      <!-- Upgrades Grid -->
      <div>
        <h2 class="font-semibold text-lg mb-4">Equipment & Upgrades</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          ${UPGRADES.map(u => _upgradeCard(u)).join('')}
        </div>
      </div>

      <!-- Active Modifiers Summary -->
      <div class="glass rounded-3xl p-6">
        <h2 class="font-semibold mb-4">Active Modifiers</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          ${_modRow('⚡ Speed Bonus', `+${Math.round(state.mods.speedBonus * 100)}%`)}
          ${_modRow('🎯 Quality Bonus', `+${Math.round(state.mods.qualityBonus * 100)}%`)}
          ${_modRow('😌 Stress Reduction', `${Math.round(state.mods.stressReduction * 100)}%`)}
          ${_modRow('🤖 AI Automation', `${Math.round(state.mods.aiAutomation * 100)}%`)}
          ${_modRow('⭐ Rep Bonus', `+${Math.round(state.mods.reputationBonus * 100)}%`)}
          ${_modRow('💚 Energy Recovery', `${state.mods.energyRecovery}/day`)}
        </div>
      </div>
    </div>
  `;

  el.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, upgid } = btn.dataset;

    if (action === 'upgrade-office') _upgradeOffice();
    if (action === 'buy-upgrade') _buyUpgrade(upgid);
  });
}

function _upgradeCard(u) {
  const count = countUpgrade(u.id);
  const maxed = count >= u.maxCount;
  const locked = u.requiresLevel && state.officeLevel < u.requiresLevel;
  const canBuy = !maxed && !locked && state.balance >= u.cost;

  let statusText = '';
  if (maxed)  statusText = 'Maxed';
  else if (locked) statusText = `Req. Office Lv${u.requiresLevel}`;
  else statusText = `${count}/${u.maxCount} owned`;

  return `
    <div class="glass rounded-3xl p-5 flex flex-col gap-3 ${maxed ? 'opacity-60' : ''}">
      <div class="flex items-start justify-between">
        <div>
          <div class="text-2xl mb-1">${u.icon}</div>
          <div class="font-medium">${u.name}</div>
          <div class="text-xs text-slate-400 mt-0.5">${u.description}</div>
        </div>
        <span class="text-xs text-slate-500 shrink-0 ml-2">${statusText}</span>
      </div>
      <div class="flex items-center justify-between mt-auto">
        <span class="text-emerald-300 text-sm font-medium">$${fmt(u.cost)}</span>
        <button data-action="buy-upgrade" data-upgid="${u.id}"
          class="glass ${canBuy ? 'glow-blue' : 'opacity-40 cursor-not-allowed'} rounded-2xl px-4 py-2 text-sm hover:scale-[1.02] transition"
          ${!canBuy ? 'disabled' : ''}>
          ${maxed ? 'Maxed' : locked ? 'Locked' : 'Buy'}
        </button>
      </div>
    </div>
  `;
}

function _modRow(label, value) {
  return `
    <div class="glass rounded-2xl px-4 py-3 flex items-center justify-between text-sm">
      <span class="text-slate-400">${label}</span>
      <span class="font-medium">${value}</span>
    </div>
  `;
}

function _upgradeOffice() {
  const next = OFFICE_LEVELS[state.officeLevel];
  if (!next) return;
  if (state.balance < next.upgradeCost) {
    EventBus.emit('notification', { type: 'error', message: 'Not enough balance for office upgrade!' });
    return;
  }
  showModal({
    title: `Upgrade to ${next.name}?`,
    body: `Cost: <b class="text-emerald-300">$${fmt(next.upgradeCost)}</b><br>New employee capacity: <b>${next.maxEmployees}</b>`,
    actions: [
      {
        label: `Upgrade for $${fmt(next.upgradeCost)}`, primary: true,
        onClick: () => {
          state.balance -= next.upgradeCost;
          state.officeLevel++;
          state.maxEmployees = next.maxEmployees;
          EventBus.emit('notification', { type: 'success', message: `Office upgraded to ${next.name}!` });
          EventBus.emit('ui-refresh', {});
        },
      },
      { label: 'Cancel' },
    ],
  });
}

function _buyUpgrade(id) {
  const u = UPGRADES.find(x => x.id === id);
  if (!u) return;
  const count = countUpgrade(id);
  if (count >= u.maxCount || state.balance < u.cost) return;
  state.balance -= u.cost;
  state.purchasedUpgrades.push(id);
  applyUpgrade(u);
  EventBus.emit('notification', { type: 'success', message: `Purchased: ${u.name}` });
  EventBus.emit('ui-refresh', {});
}
