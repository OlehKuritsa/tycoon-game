export const ROLES = {
  frontend:  { label: 'Frontend Dev',           icon: '💻', salary: [2800, 5000],  skills: ['frontend', 'design'] },
  backend:   { label: 'Backend Dev',             icon: '⚙️', salary: [3200, 6000],  skills: ['backend'] },
  ai:        { label: 'AI Engineer',             icon: '🤖', salary: [6000, 12000], skills: ['ai', 'backend'] },
  designer:  { label: 'UI/UX Designer',          icon: '🎨', salary: [2400, 4500],  skills: ['design'] },
  manager:   { label: 'Project Manager',         icon: '📋', salary: [3800, 7000],  skills: ['management'] },
  marketing: { label: 'Marketing Specialist',    icon: '📣', salary: [2600, 5000],  skills: ['marketing'] },
  sales:     { label: 'Sales Manager',           icon: '💼', salary: [3000, 6000],  skills: ['sales'] },
  hr:        { label: 'HR Manager',              icon: '🤝', salary: [2800, 5000],  skills: ['hr'] },
  security:  { label: 'Cybersecurity Specialist',icon: '🔒', salary: [5000, 10000], skills: ['cybersecurity'] },
};

export const TRAITS = {
  workaholic:    { label: 'Workaholic',       desc: '+20% speed, +30% stress',   speedMod: 1.2, stressMod: 1.3 },
  genius:        { label: 'Genius',           desc: '+40% skill effectiveness',  skillMod: 1.4 },
  lazy:          { label: 'Lazy',             desc: '-25% speed',                speedMod: 0.75 },
  creative:      { label: 'Creative',         desc: '+30% quality on tasks',     qualityMod: 1.3 },
  toxic:         { label: 'Toxic',            desc: '+15% stress to team',       teamStressMod: 1.15 },
  perfectionist: { label: 'Perfectionist',    desc: '+30% quality, -15% speed', qualityMod: 1.3, speedMod: 0.85 },
  fastLearner:   { label: 'Fast Learner',     desc: '+60% XP gain',             xpMod: 1.6 },
  burnoutResist: { label: 'Burnout Resistant',desc: '-40% stress accumulation', stressMod: 0.6 },
  loyal:         { label: 'Loyal',            desc: "Won't quit under stress",  loyaltyBonus: true },
  nightOwl:      { label: 'Night Owl',        desc: '+10% speed, off-hours',    speedMod: 1.1 },
};

export const RARITIES = {
  common:    { label: 'Common',    color: 'text-slate-300',  statBonus: 0,  traitCount: 1 },
  rare:      { label: 'Rare',      color: 'text-blue-300',   statBonus: 10, traitCount: 2 },
  epic:      { label: 'Epic',      color: 'text-purple-300', statBonus: 22, traitCount: 2 },
  legendary: { label: 'Legendary', color: 'text-amber-300',  statBonus: 38, traitCount: 3 },
};

const FIRST = ['Nova', 'Zed', 'Aria', 'Kai', 'Lyra', 'Orion', 'Echo', 'Vex', 'Sol', 'Nyx', 'Axel', 'Zara', 'Rex', 'Iris', 'Flux', 'Dex', 'Mira', 'Sable'];
const LAST  = ['Kim', 'Park', 'Chen', 'Voss', 'Nair', 'Reyes', 'Okafor', 'Tanaka', 'Walsh', 'Petrov', 'Santos', 'Diaz', 'Berg', 'Osei', 'Malik'];

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function pickRarity() {
  const r = Math.random();
  if (r < 0.55) return 'common';
  if (r < 0.82) return 'rare';
  if (r < 0.96) return 'epic';
  return 'legendary';
}

let _uid = 100;

export function generateEmployee(roleKey, rarityOverride) {
  const role = ROLES[roleKey];
  const rarity = rarityOverride ?? pickRarity();
  const { statBonus, traitCount } = RARITIES[rarity];

  const traitPool = Object.keys(TRAITS);
  const traits = [];
  for (let i = 0; i < traitCount; i++) {
    const t = pick(traitPool.filter(k => !traits.includes(k)));
    traits.push(t);
  }

  const b = statBonus;
  return {
    id: _uid++,
    name: `${pick(FIRST)} ${pick(LAST)}`,
    role: roleKey,
    rarity,
    traits,
    salary: rnd(...role.salary),
    skill:        Math.min(100, rnd(40 + b, 65 + b)),
    speed:        Math.min(100, rnd(38 + b, 65 + b)),
    creativity:   Math.min(100, rnd(30 + b, 65 + b)),
    intelligence: Math.min(100, rnd(40 + b, 68 + b)),
    focus:        Math.min(100, rnd(35 + b, 65 + b)),
    stress: 0,
    energy: 100,
    loyalty: Math.min(100, rnd(50, 85 + b)),
    experience: 0,
    assignedProject: null,
  };
}
