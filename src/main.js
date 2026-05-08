import { state } from './engine/GameState.js';
import { EventBus } from './engine/EventBus.js';
import { startLoop, stopLoop, setSpeed, togglePause } from './engine/GameLoop.js';
import { initNotifications } from './components/Notifications.js';
import { showModal } from './components/Modal.js';
import { refreshAvailableProjects, tickProjects } from './systems/ProjectSystem.js';
import { tickEmployees, refreshHirePool } from './systems/EmployeeSystem.js';
import { processMonthEnd, getRunwayMonths, fmt, shiftMarketTrends } from './systems/FinancialSystem.js';
import { checkRandomEvents, resolveEvent } from './systems/EventSystem.js';
import { renderDashboard } from './views/Dashboard.js';
import { renderProjects } from './views/Projects.js';
import { renderEmployees } from './views/Employees.js';
import { renderOffice } from './views/Office.js';
import { renderAnalytics } from './views/Analytics.js';
import { renderResearch } from './views/Research.js';
import { renderTutorial } from './views/Tutorial.js';
import { renderStartMenu, dismissStartMenu } from './views/StartMenu.js';

const VIEWS = {
  dashboard: renderDashboard,
  projects:  renderProjects,
  employees: renderEmployees,
  office:    renderOffice,
  analytics: renderAnalytics,
  research:  renderResearch,
  tutorial:  renderTutorial,
};

// Whether tutorial auto-paused the loop (vs. user manually paused)
let _tutorialAutoPaused = false;

// ─── Navigation ──────────────────────────────────────────────────────────────

function navigate(view) {
  if (!VIEWS[view]) return;

  const prev = state.currentView;

  // ── Tutorial auto-pause logic ──
  if (view === 'tutorial' && state.gameStarted && !state.isPaused) {
    _tutorialAutoPaused = true;
    stopLoop();
    _setPauseBadge(true);
  }
  if (prev === 'tutorial' && view !== 'tutorial') {
    if (_tutorialAutoPaused) {
      _tutorialAutoPaused = false;
      if (state.gameStarted && !state.isPaused) startLoop();
    }
    _setPauseBadge(false);
  }

  state.currentView = view;

  document.querySelectorAll('[data-nav]').forEach(el => {
    const active = el.dataset.nav === view;
    el.classList.toggle('glow-blue', active);
    el.classList.toggle('border-blue-500/30', active);
  });

  const content = document.getElementById('main-content');
  const savedScroll = view === prev ? content.scrollTop : 0;
  const fresh = content.cloneNode(false);
  content.parentNode.replaceChild(fresh, content);
  VIEWS[view](fresh);
  if (savedScroll > 0) fresh.scrollTop = savedScroll;
}

// ─── Start Game ──────────────────────────────────────────────────────────────

function startGame() {
  if (state.gameStarted) return;
  state.gameStarted = true;
  _tutorialAutoPaused = false;
  _setPauseBadge(false);
  navigate('dashboard');
  updateStatusBar();
  startLoop();
}

// ─── Status Bar ──────────────────────────────────────────────────────────────

function updateStatusBar() {
  _setText('sb-balance',    `$${fmt(state.balance)}`);
  _setText('sb-reputation', state.reputation);
  _setText('sb-day',        `Day ${state.day}`);
  _setText('sb-runway',     `${getRunwayMonths()} mo`);
  _setText('sb-level',      `Lv ${state.company.level}`);

  document.querySelectorAll('[data-speed]').forEach(btn => {
    const s = Number(btn.dataset.speed);
    const active = !state.isPaused && !_tutorialAutoPaused && state.speed === s;
    btn.classList.toggle('glow-blue', active);
    btn.classList.toggle('text-white', active);
    btn.classList.toggle('text-slate-400', !active);
  });

  const pauseBtn = document.getElementById('btn-pause');
  if (pauseBtn) {
    pauseBtn.textContent = (state.isPaused || _tutorialAutoPaused) ? '▶' : '⏸';
    pauseBtn.classList.toggle('glow-orange', state.isPaused || _tutorialAutoPaused);
  }
}

function _setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function _setPauseBadge(show) {
  const badge = document.getElementById('tutorial-pause-badge');
  if (badge) badge.classList.toggle('hidden', !show);
  updateStatusBar();
}

// ─── Game Events ─────────────────────────────────────────────────────────────

function registerEvents() {
  EventBus.on('day-tick', () => {
    tickProjects();
    tickEmployees();
    if (state.day % 3  === 0) refreshAvailableProjects();
    if (state.day % 7  === 0) checkRandomEvents();
    if (state.day % 20 === 0) shiftMarketTrends();
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
      onClose: () => { state.pendingEvent = null; },
      actions: event.choices.map((c, i) => ({
        label: c.label,
        primary: i === 0,
        onClick: () => resolveEvent(event.id, i),
      })),
    });
  });

  // Triggered by Tutorial "Start Game" button
  EventBus.on('request-start-game', () => startGame());
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
      if (!state.gameStarted || _tutorialAutoPaused) return;
      state.isPaused = false;
      setSpeed(Number(btn.dataset.speed));
      updateStatusBar();
    });
  });

  document.getElementById('btn-pause')?.addEventListener('click', () => {
    if (!state.gameStarted || _tutorialAutoPaused) return;
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

  // Build and inject the start menu overlay (sits above everything)
  const overlay = document.createElement('div');
  overlay.id = 'start-menu-overlay';
  overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center py-8';
  document.body.appendChild(overlay);

  renderStartMenu(overlay, {
    onStart: () => {
      dismissStartMenu();
      startGame();
    },
    onTutorial: () => {
      dismissStartMenu();
      navigate('tutorial');
      updateStatusBar();
      // Loop intentionally NOT started yet
    },
  });

  // Pre-render dashboard underneath overlay so it's ready
  state.currentView = 'dashboard';
  const content = document.getElementById('main-content');
  renderDashboard(content);
  updateStatusBar();
}

document.addEventListener('DOMContentLoaded', init);
