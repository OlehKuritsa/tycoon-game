export const state = {
  company: { name: 'My Startup', level: 1, xp: 0, xpToNext: 500 },

  balance: 5000,
  reputation: 10,
  day: 1,
  month: 1,
  year: 2045,

  employees: [],
  maxEmployees: 2,
  hirePool: [],

  availableProjects: [],
  activeProjects: [],
  completedProjects: [],

  officeLevel: 1,
  purchasedUpgrades: [], // array of upgrade ids, repeatable

  researchedTech: [],
  aiLevel: 0,

  // accumulated modifiers from upgrades + research
  mods: {
    speedBonus: 0,
    qualityBonus: 0,
    stressReduction: 0,
    aiAutomation: 0,
    reputationBonus: 0,
    energyRecovery: 2,
    attackProtection: 0,
  },

  currentMonthRevenue: 0,
  currentMonthExpenses: 0,
  financialHistory: [],

  marketTrends: {
    web: 1.0,
    mobile: 1.0,
    saas: 1.15,
    enterprise: 1.0,
    cybersecurity: 1.1,
    ai: 1.2,
    marketing: 0.95,
    blockchain: 0.7,
  },

  pendingEvent: null,

  speed: 1,
  isPaused: false,
  gameStarted: false,
  currentView: 'dashboard',
};
