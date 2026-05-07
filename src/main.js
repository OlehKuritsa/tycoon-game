import { state } from './engine/GameState.js';
import { EventBus } from './engine/EventBus.js';
import { startLoop, setSpeed, togglePause } from './engine/GameLoop.js';
import { initNotifications } from './components/Notifications.js';
import { showModal } from './components/Modal.js';
import { refreshAvailableProjects, tickProjects } from './systems/ProjectSystem.js';
import { tickEmployees, refreshHirePool } from './systems/EmployeeSystem.js';
import { processMonthEnd, getRunwayMonths, fmt } from './systems/FinancialSystem.js';
import { checkRandomEvents, resolveEvent } from './systems/EventSystem.js';
import { renderDashboard } from './views/Dashboard.js';
import { renderProjects } from './views/Projects.js';
import { renderEmployees } from './views/Employees.js';
import { renderOffice } from './views/Office.js';
import { renderAnalytics } from './views/Analytics.js';
import { renderResearch } from './views/Research.js';
import { renderTutorial } from './views/Tutorial.js';

const VIEWS = {
  dashboard: renderDashboard,
  projects:  renderProjects,
  employees: renderEmployees,
  office:    renderOffice,
  analytics: renderAnalytics,
  research:  renderResearch,
  tutorial:  renderTutorial,
};

// ─── Navigation ──────────────────────────────────────────────────────────────

function navigate(view) {
  if (!VIEWS[view]) return;
  state.currentView = view;

  document.querySelectorAll('[data-nav]').forEach(el => {
    const active = el.dataset.nav === view;
    el.classList.toggle('glow-blue', active);
    el.classList.toggle('border-blue-500/30', active);
  });

  const content = document.getElementById('main-content');
  // Remove stale listeners by replacing with a clone
  const fresh = content.cloneNode(false);
  content.parentNode.replaceChild(fresh, content);

  VIEWS[view](fresh);
}

// ─── Status Bar ──────────────────────────────────────────────────────────────

function updateStatusBar() {
  _setText('sb-balance',    `$${fmt(state.balance)}`);
  _setText('sb-reputation', state.reputation);
  _setText('sb-day',        `Day ${state.day}`);
  _setText('sb-runway',     `${getRunwayMonths()} mo`);
  _setText('sb-level',      `Lv ${state.company.level}`);

  // Speed buttons
  document.querySelectorAll('[data-speed]').forEach(btn => {
    const s = Number(btn.dataset.speed);
    const active = !state.isPaused && state.speed === s;
    btn.classList.toggle('glow-blue', active);
    btn.classList.toggle('text-white', active);
    btn.classList.toggle('text-slate-400', !active);
  });
  const pauseBtn = document.getElementById('btn-pause');
  if (pauseBtn) {
    pauseBtn.textContent = state.isPaused ? '▶' : '⏸';
    pauseBtn.classList.toggle('glow-orange', state.isPaused);
  }
}

function _setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ─── Event Handlers ──────────────────────────────────────────────────────────

function registerEvents() {
  EventBus.on('day-tick', () => {
    tickProjects();
    tickEmployees();

    if (state.day % 3 === 0) refreshAvailableProjects();
    if (state.day % 7 === 0) checkRandomEvents();

    updateStatusBar();
    navigate(state.currentView);
  });

  EventBus.on('month-end', () => {
    processMonthEnd();
    updateStatusBar();
  });

  EventBus.on('ui-refresh', () => {
    updateStatusBar();
    navigate(state.currentView);
  });

  EventBus.on('game-event', ({ event }) => {
    showModal({
      title: event.title,
      body: event.desc,
      actions: event.choices.map((c, i) => ({
        label: c.label,
        primary: i === 0,
        onClick: () => resolveEvent(event.id, i),
      })),
    });
  });
}

// ─── Sidebar & Controls ──────────────────────────────────────────────────────

function bindSidebar() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigate(el.dataset.nav);
    });
  });
}

function bindControls() {
  document.querySelectorAll('[data-speed]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.isPaused) { state.isPaused = false; }
      setSpeed(Number(btn.dataset.speed));
      updateStatusBar();
    });
  });

  document.getElementById('btn-pause')?.addEventListener('click', () => {
    togglePause();
    updateStatusBar();
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  initNotifications();
  registerEvents();
  bindSidebar();
  bindControls();

  refreshAvailableProjects();
  refreshHirePool();

  navigate('dashboard');
  updateStatusBar();
  startLoop();

  EventBus.emit('notification', {
    type: 'info',
    message: '🚀 New here? Check the Guide tab (?) in the sidebar.',
  });
}

document.addEventListener('DOMContentLoaded', init);
