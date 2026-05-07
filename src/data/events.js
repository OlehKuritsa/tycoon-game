export const EVENTS = [
  {
    id: 'angel-investor',
    type: 'positive',
    title: '💰 Angel Investor',
    desc: 'A wealthy investor noticed your recent work and wants to inject capital.',
    probability: 0.018,
    minReputation: 20,
    choices: [
      { label: 'Accept $15,000', action: 'balance', value: 15000 },
      { label: 'Decline', action: 'none' },
    ],
  },
  {
    id: 'viral-success',
    type: 'positive',
    title: '🚀 Viral Project',
    desc: 'One of your completed projects went viral. The whole industry is talking.',
    probability: 0.012,
    minReputation: 15,
    choices: [
      { label: 'Ride the wave (+20 rep)', action: 'reputation', value: 20 },
    ],
  },
  {
    id: 'celebrity-endorsement',
    type: 'positive',
    title: '⭐ Celebrity Endorsement',
    desc: 'A tech influencer publicly praised your company.',
    probability: 0.008,
    minReputation: 30,
    choices: [
      { label: 'Accept (+15 rep, +$5k)', action: 'both', repValue: 15, balValue: 5000 },
    ],
  },
  {
    id: 'tax-break',
    type: 'positive',
    title: '📜 Government Tax Break',
    desc: 'The city offers a startup tax incentive. You save $4,000 this month.',
    probability: 0.01,
    minLevel: 2,
    choices: [
      { label: 'Accept', action: 'balance', value: 4000 },
    ],
  },
  {
    id: 'cyber-attack',
    type: 'negative',
    title: '⚠️ Cyber Attack',
    desc: 'Your servers are under attack. Systems are compromised.',
    probability: 0.012,
    choices: [
      { label: 'Pay ransom ($6,000)', action: 'balance', value: -6000 },
      { label: 'Fight back (-15 rep)', action: 'reputation', value: -15 },
    ],
  },
  {
    id: 'employee-scandal',
    type: 'negative',
    title: '😤 Employee Scandal',
    desc: 'A disgruntled employee went public with complaints about your company.',
    probability: 0.009,
    minStress: 60,
    choices: [
      { label: 'Issue PR statement (-$3k)', action: 'balance', value: -3000 },
      { label: 'Ignore it (-10 rep)', action: 'reputation', value: -10 },
    ],
  },
  {
    id: 'server-outage',
    type: 'negative',
    title: '🔌 Server Outage',
    desc: 'Critical infrastructure failure. Active projects will be delayed.',
    probability: 0.01,
    choices: [
      { label: 'Emergency fix (-$4k)', action: 'balance', value: -4000 },
      { label: 'Wait it out (delay 5 days)', action: 'delayProjects', value: 5 },
    ],
  },
  {
    id: 'market-boom-ai',
    type: 'neutral',
    title: '📈 AI Market Boom',
    desc: 'The AI sector is exploding. Demand for AI projects surged 60%.',
    probability: 0.008,
    choices: [
      { label: 'Capitalize', action: 'marketBoost', category: 'ai', value: 0.6 },
    ],
  },
  {
    id: 'key-employee-offer',
    type: 'negative',
    title: '🏃 Poaching Attempt',
    desc: 'A competitor is offering one of your best employees double their salary.',
    probability: 0.01,
    minLevel: 2,
    choices: [
      { label: 'Match salary (+$2k/mo)', action: 'balance', value: -2000 },
      { label: 'Let them go', action: 'fireRandom' },
    ],
  },
];
