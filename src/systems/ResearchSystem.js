import { state } from '../engine/GameState.js';
import { EventBus } from '../engine/EventBus.js';
import { TECH_TREE } from '../data/research.js';

export function canResearch(techId) {
  const tech = TECH_TREE.find(t => t.id === techId);
  if (!tech) return false;
  if (state.researchedTech.includes(techId)) return false;
  if (state.balance < tech.cost) return false;
  return tech.requires.every(r => state.researchedTech.includes(r));
}

export function research(techId) {
  if (!canResearch(techId)) return false;
  const tech = TECH_TREE.find(t => t.id === techId);

  state.balance -= tech.cost;
  state.researchedTech.push(techId);
  _applyEffect(tech.effect);

  EventBus.emit('notification', { type: 'success', message: `🔬 Researched: ${tech.name}` });
  EventBus.emit('ui-refresh', {});
  return true;
}

function _applyEffect(e) {
  if (e.speedBonus)        state.mods.speedBonus        += e.speedBonus;
  if (e.qualityBonus)      state.mods.qualityBonus      += e.qualityBonus;
  if (e.stressReduction)   state.mods.stressReduction   += e.stressReduction;
  if (e.aiAutomation)      state.mods.aiAutomation      += e.aiAutomation;
  if (e.reputationBonus)   state.mods.reputationBonus   += e.reputationBonus;
  if (e.attackProtection)  state.mods.attackProtection  += e.attackProtection;
}
