import { state } from '../engine/GameState.js';
import { canResearch, research } from '../systems/ResearchSystem.js';
import { TECH_TREE } from '../data/research.js';
import { fmt } from '../systems/FinancialSystem.js';

export function renderResearch(el) {
  const totalInvested = TECH_TREE
    .filter(t => state.researchedTech.includes(t.id))
    .reduce((s, t) => s + t.cost, 0);

  el.innerHTML = `
    <div class="max-w-5xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs text-slate-400 uppercase tracking-widest">R&D Lab</div>
          <h1 class="text-2xl font-semibold mt-0.5">Technology Tree</h1>
        </div>
        <div class="text-right text-xs text-slate-400">
          <div>${state.researchedTech.length} / ${TECH_TREE.length} unlocked</div>
          <div class="mt-0.5">$${fmt(totalInvested)} invested</div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex gap-4 text-xs text-slate-400">
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>Researched</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-orange-400 inline-block"></span>Available</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-slate-600 inline-block"></span>Locked</span>
      </div>

      <!-- Tech nodes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${TECH_TREE.map(tech => _techCard(tech)).join('')}
      </div>

      <!-- Active Research Bonuses -->
      <div class="glass rounded-3xl p-6">
        <h2 class="font-semibold mb-3">Research Bonuses Active</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          ${_bonus('Speed', state.mods.speedBonus)}
          ${_bonus('Quality', state.mods.qualityBonus)}
          ${_bonus('Stress Reduction', state.mods.stressReduction)}
          ${_bonus('AI Automation', state.mods.aiAutomation)}
          ${_bonus('Reputation', state.mods.reputationBonus)}
          ${_bonus('Attack Protection', state.mods.attackProtection)}
        </div>
      </div>
    </div>
  `;

  el.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="research"]');
    if (!btn) return;
    research(btn.dataset.techid);
  });
}

function _techCard(tech) {
  const done = state.researchedTech.includes(tech.id);
  const avail = canResearch(tech.id);
  const locked = !done && !avail;

  const border = done  ? 'border-blue-500/40 glow-blue'
               : avail ? 'border-orange-500/40 glow-orange'
               :         'border-white/5 opacity-60';

  const dot = done  ? 'bg-blue-500'
            : avail ? 'bg-orange-400'
            :         'bg-slate-600';

  const effectStr = Object.entries(tech.effect)
    .filter(([k]) => !k.startsWith('unlock'))
    .map(([k, v]) => {
      const labels = {
        speedBonus: 'Speed', qualityBonus: 'Quality',
        stressReduction: 'Stress -', aiAutomation: 'AI Auto',
        reputationBonus: 'Rep', attackProtection: 'Defense',
      };
      return `${labels[k] ?? k} +${Math.round(v * 100)}%`;
    }).join(' · ');

  return `
    <div class="glass border ${border} rounded-3xl p-5 transition">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 glass rounded-2xl flex items-center justify-center text-xl shrink-0">${tech.icon}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full ${dot} shrink-0"></span>
            <span class="font-medium truncate">${tech.name}</span>
          </div>
          <div class="text-xs text-slate-400 mt-1 leading-relaxed">${tech.desc}</div>
          ${effectStr ? `<div class="text-xs text-blue-300 mt-1">${effectStr}</div>` : ''}
          ${tech.requires.length ? `
            <div class="text-xs text-slate-500 mt-1">Requires: ${tech.requires.map(r => {
              const t = TECH_TREE.find(x => x.id === r);
              return `<span class="${state.researchedTech.includes(r) ? 'text-emerald-400' : 'text-slate-400'}">${t?.name ?? r}</span>`;
            }).join(', ')}</div>
          ` : ''}
        </div>
        <div class="shrink-0 ml-2 text-right">
          <div class="text-xs text-emerald-300 font-medium mb-2">$${fmt(tech.cost)}</div>
          ${done ? `<span class="text-xs text-blue-300">✓ Done</span>`
          : avail ? `<button data-action="research" data-techid="${tech.id}"
              class="glass glow-orange rounded-xl px-3 py-1.5 text-xs hover:scale-[1.02] transition">
              Research
            </button>`
          : `<span class="text-xs text-slate-500">Locked</span>`}
        </div>
      </div>
    </div>
  `;
}

function _bonus(label, val) {
  if (val <= 0) return '';
  return `
    <div class="glass rounded-xl px-3 py-2 flex justify-between">
      <span class="text-slate-400">${label}</span>
      <span class="text-blue-300">+${Math.round(val * 100)}%</span>
    </div>
  `;
}
