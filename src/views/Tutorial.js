// Tutorial state persisted in-memory (survives view switches)
const _read = new Set();

const CHAPTERS = [
  {
    id: 'welcome',
    icon: '🚀',
    title: 'Welcome to Startup Tycoon',
    tag: 'Start here',
    tagColor: 'text-orange-300 bg-orange-500/15',
    content: `
      <p>You're the founder of a tiny tech startup in a futuristic cyberpunk city. You start with <b>$5,000</b>, no employees, no reputation — just ambition.</p>
      <p>Your goal: grow from a one-person operation into a global tech empire.</p>
      <div class="tip">The game runs in real time. One in-game day passes every 3 seconds at 1× speed. Use the <b>speed controls</b> in the top-right (⏸ 1× 2× 4×) to manage pacing.</div>
      <h4>The Core Loop</h4>
      <ol>
        <li>Accept projects from the marketplace</li>
        <li>Hire employees and assign them to projects</li>
        <li>Deliver quality work → earn money + reputation</li>
        <li>Reinvest in upgrades, research, and more staff</li>
        <li>Scale up and repeat at greater complexity</li>
      </ol>
    `,
  },
  {
    id: 'projects',
    icon: '⟡',
    title: 'Project System',
    tag: 'Core mechanic',
    tagColor: 'text-blue-300 bg-blue-500/15',
    content: `
      <p>Projects are your <b>main source of income</b>. Head to the <b>Projects</b> tab to browse the marketplace.</p>
      <h4>Project Difficulty</h4>
      <div class="grid-2">
        <div class="diff-card emerald">Easy — low risk, small reward. Perfect for early game.</div>
        <div class="diff-card blue">Medium — balanced. Good for a team of 2–3.</div>
        <div class="diff-card orange">Hard — requires specialists. High payout.</div>
        <div class="diff-card red">Extreme — needs a full team + research. Massive rewards.</div>
      </div>
      <h4>How Progress Works</h4>
      <p>Each day, assigned employees contribute progress based on their <b>Skill + Speed + Focus</b>. A stressed employee works slower. More employees = faster completion.</p>
      <div class="tip">If a project runs out of time before reaching 100% — it <b>fails</b>. You lose reputation and earn nothing. Always assign enough people!</div>
      <h4>Payout Formula</h4>
      <p>You receive <b>50–100%</b> of the project budget depending on final quality. Quality is driven by employee Creativity and low stress levels.</p>
    `,
  },
  {
    id: 'employees',
    icon: '◈',
    title: 'Employee System',
    tag: 'Deep mechanic',
    tagColor: 'text-purple-300 bg-purple-500/15',
    content: `
      <p>Employees are the heart of your company. Go to the <b>Employees</b> tab to browse candidates and hire your team.</p>
      <h4>Roles</h4>
      <div class="role-list">
        <div class="role-item"><span>💻</span><div><b>Frontend Dev</b> — builds interfaces, required for web/mobile projects</div></div>
        <div class="role-item"><span>⚙️</span><div><b>Backend Dev</b> — handles servers and logic</div></div>
        <div class="role-item"><span>🤖</span><div><b>AI Engineer</b> — needed for AI & SaaS projects, expensive but powerful</div></div>
        <div class="role-item"><span>🎨</span><div><b>UI/UX Designer</b> — boosts quality on creative tasks</div></div>
        <div class="role-item"><span>📋</span><div><b>Project Manager</b> — improves workflow efficiency</div></div>
        <div class="role-item"><span>🔒</span><div><b>Cybersecurity Specialist</b> — unlocks security projects</div></div>
      </div>
      <h4>Rarity</h4>
      <div class="grid-2">
        <div class="rarity-card slate">Common — basic stats, 1 trait</div>
        <div class="rarity-card blue">Rare — better stats, 2 traits</div>
        <div class="rarity-card purple">Epic — strong stats, 2 powerful traits</div>
        <div class="rarity-card amber">Legendary — elite stats, 3 traits</div>
      </div>
      <h4>Key Stats</h4>
      <p><b>Skill</b> — how effective their work is. <b>Speed</b> — how fast they progress. <b>Creativity</b> — determines output quality. <b>Focus</b> — consistency under pressure.</p>
      <div class="tip">Refresh the hire pool anytime. Research <b>Talent Pipeline</b> to get Epic+ candidates more frequently.</div>
    `,
  },
  {
    id: 'stress',
    icon: '😤',
    title: 'Stress & Burnout',
    tag: 'Critical',
    tagColor: 'text-red-300 bg-red-500/15',
    content: `
      <p>Stress is one of the most dangerous mechanics to ignore. Every working employee accumulates stress each day.</p>
      <h4>Stress Sources</h4>
      <ul>
        <li>Working on any project: <b>+2.5 stress/day</b></li>
        <li>Project deadline under 7 days: <b>+3 extra/day</b></li>
        <li><b>Toxic</b> trait employee spreads stress to teammates</li>
        <li><b>Workaholic</b> trait multiplies stress gain by 1.3×</li>
      </ul>
      <h4>Stress Effects</h4>
      <ul>
        <li>Above 50% stress → work penalty kicks in</li>
        <li>Above 80% stress → employee underperforms significantly</li>
        <li>Above 95% stress → employee may <b>quit without warning</b></li>
      </ul>
      <div class="tip danger">If an employee quits, they leave their project unfinished and your reputation drops by 5.</div>
      <h4>How to Reduce Stress</h4>
      <ul>
        <li>Unassign employees from projects — idle employees recover stress</li>
        <li>Buy <b>Coffee Machines</b> in the Office tab (-12% stress gain each)</li>
        <li>Buy <b>Relaxation Zones</b> — boost idle energy recovery</li>
        <li>Research <b>Global Network</b> tech (-20% team stress)</li>
        <li>Hire employees with the <b>Burnout Resistant</b> trait</li>
      </ul>
    `,
  },
  {
    id: 'office',
    icon: '▣',
    title: 'Office & Upgrades',
    tag: 'Progression',
    tagColor: 'text-emerald-300 bg-emerald-500/15',
    content: `
      <p>Your office defines how many employees you can have and what bonuses your team gets. Upgrade it in the <b>Office</b> tab.</p>
      <h4>Office Levels</h4>
      <div class="office-list">
        <div class="office-item"><span class="lv">Lv 1</span> Tiny Startup Room — 2 employees</div>
        <div class="office-item"><span class="lv">Lv 2</span> Small Office — 6 employees · costs $1,000</div>
        <div class="office-item"><span class="lv">Lv 3</span> Modern Tech Office — 15 employees · costs $12,000</div>
        <div class="office-item"><span class="lv">Lv 4</span> Corporate HQ — 40 employees · costs $80,000</div>
        <div class="office-item"><span class="lv">Lv 5</span> Futuristic Mega-Campus — 100 employees · costs $350,000</div>
      </div>
      <h4>Key Upgrades</h4>
      <ul>
        <li><b>🪑 Extra Desk</b> — +1 employee slot before a full office upgrade</li>
        <li><b>💻 Fast Laptops</b> — +12% speed for all employees</li>
        <li><b>☕ Coffee Machine</b> — -12% stress accumulation per machine</li>
        <li><b>🖥️ Dual Monitors</b> — +15% quality on all work</li>
        <li><b>🤖 AI Assistant</b> — requires Lv 3 office, strong automation bonus</li>
        <li><b>🔮 Holo Workstation</b> — requires Lv 5, massive quality + speed boost</li>
      </ul>
      <div class="tip">Buy Extra Desks early — you need employees before you can grow. Upgrade office levels when you can afford the salaries that follow.</div>
    `,
  },
  {
    id: 'finance',
    icon: '◎',
    title: 'Finances & Runway',
    tag: 'Survival',
    tagColor: 'text-amber-300 bg-amber-500/15',
    content: `
      <p>Money is the lifeblood of your company. Watch your <b>runway</b> (how many months until you run out of cash) in the status bar.</p>
      <h4>Monthly Expenses</h4>
      <ul>
        <li><b>Salaries</b> — paid every 30 in-game days. Your biggest cost.</li>
        <li><b>Office rent</b> — scales with office level (Lv 1: $500/mo → Lv 5: $70k/mo)</li>
        <li><b>Server costs</b> — $300/mo per server rack purchased</li>
      </ul>
      <h4>Revenue Sources</h4>
      <ul>
        <li><b>Project payouts</b> — main income, quality-based (50–100% of budget)</li>
        <li><b>Random events</b> — angel investors, tax breaks, viral boosts</li>
      </ul>
      <div class="tip danger">If your balance goes negative, you're in danger. Prioritize completing projects fast and avoid hiring more than you can pay.</div>
      <h4>Healthy Metrics</h4>
      <ul>
        <li>Runway &gt; 3 months → safe</li>
        <li>Runway 1–3 months → caution, complete projects quickly</li>
        <li>Runway &lt; 1 month → critical, pause hiring, grind projects</li>
      </ul>
      <p>Track everything in the <b>Analytics</b> tab — monthly P&amp;L, balance chart, and expense breakdown.</p>
    `,
  },
  {
    id: 'reputation',
    icon: '⭐',
    title: 'Reputation System',
    tag: 'Progression',
    tagColor: 'text-blue-300 bg-blue-500/15',
    content: `
      <p>Reputation gates your progression. Higher reputation unlocks harder projects with bigger budgets and attracts better clients.</p>
      <h4>Gaining Reputation</h4>
      <ul>
        <li>Completing projects with high quality → up to <b>+12 rep</b> per project</li>
        <li>Positive random events (viral success, endorsements)</li>
        <li>Research bonuses (Advanced Analytics: +25% rep from projects)</li>
      </ul>
      <h4>Losing Reputation</h4>
      <ul>
        <li>Failed project (missed deadline) → <b>-5 to -25 rep</b> based on complexity</li>
        <li>Employee burnout and quit → <b>-5 rep</b></li>
        <li>Negative events (cyber attack, scandal)</li>
      </ul>
      <div class="tip">Reputation maxes at 100. Focus on consistent high-quality delivery over rushing — a failed hard project hurts more than a slow easy one.</div>
    `,
  },
  {
    id: 'research',
    icon: '⚛',
    title: 'Research & Tech Tree',
    tag: 'Late game',
    tagColor: 'text-purple-300 bg-purple-500/15',
    content: `
      <p>The <b>Research</b> tab contains your technology tree. Unlocking nodes gives permanent bonuses to your entire company.</p>
      <h4>Research Path (recommended order)</h4>
      <ol>
        <li><b>Basic Automation</b> — immediate speed boost, gates everything else</li>
        <li><b>Agile Workflow</b> — -15% project duration, huge efficiency gain</li>
        <li><b>Cybersecurity Suite</b> — protects from cyber attacks, unlocks security projects</li>
        <li><b>Cloud Infrastructure</b> — unlocks SaaS projects (high value)</li>
        <li><b>Talent Pipeline</b> — better candidates in hire pool</li>
        <li><b>Advanced Analytics</b> — +25% reputation per project</li>
        <li><b>AI Systems v1</b> → <b>v2</b> — massive automation bonuses</li>
        <li><b>Quantum Computing</b> — endgame, extreme speed &amp; quality</li>
      </ol>
      <div class="tip">Research is permanent and stacks with office upgrades. Prioritize the path that matches your current bottleneck — slow projects or low quality.</div>
    `,
  },
  {
    id: 'events',
    icon: '⚡',
    title: 'Random Events',
    tag: 'Unpredictable',
    tagColor: 'text-amber-300 bg-amber-500/15',
    content: `
      <p>Every 7 in-game days the game checks for random events. They can be positive windfalls or nasty surprises — always choose wisely.</p>
      <h4>Positive Events</h4>
      <ul>
        <li>💰 <b>Angel Investor</b> — free cash injection ($15k)</li>
        <li>🚀 <b>Viral Project</b> — big reputation boost</li>
        <li>⭐ <b>Celebrity Endorsement</b> — reputation + money</li>
        <li>📜 <b>Tax Break</b> — $4k saved this month</li>
      </ul>
      <h4>Negative Events</h4>
      <ul>
        <li>⚠️ <b>Cyber Attack</b> — pay ransom or lose reputation. Research Cybersecurity Suite for protection.</li>
        <li>😤 <b>Employee Scandal</b> — happens when team stress is high. Keep stress low!</li>
        <li>🔌 <b>Server Outage</b> — delays projects. Emergency fix costs $4k.</li>
        <li>🏃 <b>Poaching Attempt</b> — competitor tries to steal your best employee</li>
      </ul>
      <div class="tip">Events with choices require immediate decisions — the game doesn't pause. Be ready to react quickly at higher speeds.</div>
    `,
  },
  {
    id: 'strategy',
    icon: '🏆',
    title: 'Strategy & Tips',
    tag: 'Pro tips',
    tagColor: 'text-emerald-300 bg-emerald-500/15',
    content: `
      <h4>Early Game (Days 1–60)</h4>
      <ul>
        <li>Accept only Easy/Medium projects that match your team's skills</li>
        <li>Hire a Frontend + Backend dev first — covers most early projects</li>
        <li>Keep runway above 2 months at all times</li>
        <li>Buy Coffee Machine immediately — pays for itself in prevented burnouts</li>
        <li>Research Basic Automation as soon as you have $800</li>
      </ul>
      <h4>Mid Game (Days 60–200)</h4>
      <ul>
        <li>Upgrade to Level 2 or 3 office to unlock more desks</li>
        <li>Start pursuing Hard projects — 3× the pay</li>
        <li>Add a Designer and AI Engineer to your team</li>
        <li>Research Cloud Infra to unlock high-value SaaS projects</li>
        <li>Build 3 months of cash runway as a buffer before scaling</li>
      </ul>
      <h4>Late Game (Days 200+)</h4>
      <ul>
        <li>Run 3–4 projects simultaneously with specialized teams</li>
        <li>Full research path for near-autonomous operation</li>
        <li>Aim for Extreme projects — $60k–$350k payouts</li>
        <li>Holo Workstation + AI Systems v2 = unstoppable quality</li>
      </ul>
      <div class="tip">The biggest mistake is hiring too fast. Each employee is a monthly commitment. Only hire when you have confirmed incoming revenue to cover their salary.</div>
    `,
  },
];

export function renderTutorial(el) {
  el.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="glass glow-blue rounded-3xl p-6 flex items-center justify-between">
        <div>
          <div class="text-xs text-slate-400 uppercase tracking-widest">Getting Started</div>
          <h1 class="text-2xl font-semibold mt-0.5">Game Guide</h1>
          <div class="text-xs text-slate-400 mt-1">${CHAPTERS.length} chapters · Read at your own pace</div>
        </div>
        <div class="text-right">
          <div class="text-3xl font-semibold tabular-nums text-blue-300" id="tut-progress-num">
            ${_read.size}/${CHAPTERS.length}
          </div>
          <div class="text-xs text-slate-400 mt-0.5">chapters read</div>
          <div class="mt-2 w-32 h-1.5 rounded-full bg-white/10 overflow-hidden ml-auto">
            <div class="h-full bg-gradient-to-r from-blue-500 to-orange-400 transition-all duration-500"
              id="tut-progress-bar"
              style="width:${Math.round((_read.size / CHAPTERS.length) * 100)}%">
            </div>
          </div>
        </div>
      </div>

      <!-- Quick-start callout -->
      <div class="glass rounded-3xl px-6 py-4 border border-orange-500/25 flex gap-4 items-start">
        <span class="text-2xl shrink-0 mt-0.5">⚡</span>
        <div class="text-sm text-slate-300 leading-relaxed">
          <b class="text-white">Quick start:</b>
          Go to <b>Employees → hire 1–2 people</b>, then <b>Projects → accept an Easy project</b>, then <b>Projects → assign your employees</b> to it. Watch the progress bar fill up and collect your first payout.
        </div>
      </div>

      <!-- Chapter list -->
      <div class="space-y-3" id="tut-chapters">
        ${CHAPTERS.map((ch, i) => _chapterCard(ch, i)).join('')}
      </div>
    </div>

    <style>
      .tut-body h4        { font-weight:600; margin: 1rem 0 .4rem; font-size:.85rem; color:#e2e8f0; }
      .tut-body p         { margin: .5rem 0; font-size:.85rem; line-height:1.7; color:#94a3b8; }
      .tut-body ul,
      .tut-body ol        { margin: .5rem 0; padding-left:1.2rem; font-size:.85rem; color:#94a3b8; }
      .tut-body li        { margin: .3rem 0; line-height:1.6; }
      .tut-body b         { color:#e2e8f0; font-weight:600; }
      .tut-body .tip      { background:rgba(59,130,246,.1); border:1px solid rgba(59,130,246,.2);
                            border-radius:1rem; padding:.75rem 1rem; font-size:.8rem; color:#93c5fd;
                            margin-top:.75rem; line-height:1.6; }
      .tut-body .tip.danger { background:rgba(239,68,68,.08); border-color:rgba(239,68,68,.2); color:#fca5a5; }
      .tut-body .grid-2   { display:grid; grid-template-columns:1fr 1fr; gap:.5rem; margin:.5rem 0; }
      .tut-body .diff-card,
      .tut-body .rarity-card { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
                            border-radius:.75rem; padding:.5rem .75rem; font-size:.78rem; }
      .tut-body .diff-card.emerald { border-color:rgba(52,211,153,.2); color:#6ee7b7; }
      .tut-body .diff-card.blue    { border-color:rgba(96,165,250,.2); color:#93c5fd; }
      .tut-body .diff-card.orange  { border-color:rgba(251,146,60,.2); color:#fdba74; }
      .tut-body .diff-card.red     { border-color:rgba(248,113,113,.2); color:#fca5a5; }
      .tut-body .rarity-card.slate  { color:#cbd5e1; }
      .tut-body .rarity-card.blue   { color:#93c5fd; border-color:rgba(96,165,250,.3); }
      .tut-body .rarity-card.purple { color:#c4b5fd; border-color:rgba(167,139,250,.3); }
      .tut-body .rarity-card.amber  { color:#fcd34d; border-color:rgba(251,191,36,.3); }
      .tut-body .role-list,
      .tut-body .office-list { display:flex; flex-direction:column; gap:.4rem; margin:.5rem 0; }
      .tut-body .role-item  { display:flex; gap:.6rem; align-items:flex-start; font-size:.82rem; color:#94a3b8; }
      .tut-body .role-item span { font-size:1rem; shrink:0; }
      .tut-body .office-item { font-size:.82rem; color:#94a3b8; padding:.35rem .6rem;
                               background:rgba(255,255,255,.03); border-radius:.5rem; }
      .tut-body .office-item .lv { color:#93c5fd; font-weight:600; margin-right:.5rem; }
    </style>
  `;

  el.addEventListener('click', e => {
    const btn = e.target.closest('[data-chapter]');
    if (!btn) return;
    const id = btn.dataset.chapter;
    _toggleChapter(id, el);
  });
}

function _chapterCard(ch, i) {
  const done = _read.has(ch.id);
  return `
    <div class="glass rounded-3xl overflow-hidden transition-all duration-300">
      <button data-chapter="${ch.id}"
        class="w-full px-5 py-4 flex items-center gap-4 hover:bg-white/3 transition text-left">
        <div class="w-10 h-10 glass rounded-2xl flex items-center justify-center text-xl shrink-0 ${done ? 'glow-blue' : ''}">
          ${done ? '✓' : ch.icon}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-medium">${ch.title}</span>
            <span class="text-xs px-2 py-0.5 rounded-lg ${ch.tagColor}">${ch.tag}</span>
            ${done ? '<span class="text-xs text-blue-400">Read</span>' : ''}
          </div>
        </div>
        <span class="text-slate-500 text-sm shrink-0" id="tut-arrow-${ch.id}">▼</span>
      </button>
      <div id="tut-body-${ch.id}" class="tut-body hidden px-6 pb-5 border-t border-white/5 pt-4">
        ${ch.content}
      </div>
    </div>
  `;
}

function _toggleChapter(id, el) {
  const body = el.querySelector(`#tut-body-${id}`);
  const arrow = el.querySelector(`#tut-arrow-${id}`);
  if (!body) return;

  const isOpen = !body.classList.contains('hidden');
  body.classList.toggle('hidden', isOpen);
  if (arrow) arrow.textContent = isOpen ? '▼' : '▲';

  if (!isOpen) {
    _read.add(id);
    _updateProgress(el);
    // Update the chapter card icon
    const btn = el.querySelector(`[data-chapter="${id}"]`);
    const iconBox = btn?.querySelector('.w-10');
    if (iconBox && !iconBox.classList.contains('glow-blue')) {
      iconBox.classList.add('glow-blue');
      iconBox.textContent = '✓';
    }
    const readLabel = btn?.querySelector('.flex.items-center.gap-2');
    if (readLabel && !readLabel.querySelector('.text-blue-400')) {
      readLabel.insertAdjacentHTML('beforeend', '<span class="text-xs text-blue-400">Read</span>');
    }
  }
}

function _updateProgress(el) {
  const num = el.querySelector('#tut-progress-num');
  const bar = el.querySelector('#tut-progress-bar');
  if (num) num.textContent = `${_read.size}/${CHAPTERS.length}`;
  if (bar) bar.style.width = `${Math.round((_read.size / CHAPTERS.length) * 100)}%`;
}
