import { state } from '../engine/GameState.js';
import { EventBus } from '../engine/EventBus.js';
import { CATEGORY_META } from '../data/projects.js';

const RENT = [0, 500, 1800, 6000, 20000, 70000];

export function getMonthlyExpenses() {
  const salaries = state.employees.reduce((s, e) => s + e.salary, 0);
  const rent = RENT[state.officeLevel] ?? 0;
  const serverCost = state.purchasedUpgrades.filter(u => u === 'server-rack').length * 300;
  return salaries + rent + serverCost;
}

export function getRunwayMonths() {
  const exp = getMonthlyExpenses();
  if (exp <= 0) return '∞';
  return (state.balance / exp).toFixed(1);
}

export function addRevenue(amount) {
  state.balance += amount;
  state.currentMonthRevenue += amount;
}

export function processMonthEnd() {
  const expenses = getMonthlyExpenses();
  state.balance -= expenses;
  state.currentMonthExpenses = expenses;

  state.financialHistory.push({
    month: state.month,
    year: state.year,
    revenue: state.currentMonthRevenue,
    expenses,
    profit: state.currentMonthRevenue - expenses,
    balance: state.balance,
  });

  const rev = state.currentMonthRevenue;
  state.currentMonthRevenue = 0;
  state.currentMonthExpenses = 0;

  EventBus.emit('month-report', { expenses, revenue: rev, balance: state.balance });
  EventBus.emit('notification', {
    type: expenses > rev ? 'warning' : 'info',
    message: `Month ${state.month}: Revenue $${fmt(rev)} | Expenses $${fmt(expenses)}`,
  });

  if (state.balance < 0) {
    EventBus.emit('notification', { type: 'error', message: '⚠️ Negative balance! Pay your bills!' });
  }
}

const TREND_MIN = 0.5;
const TREND_MAX = 1.6;

export function shiftMarketTrends() {
  const categories = Object.keys(state.marketTrends);
  const count = 2 + Math.floor(Math.random() * 3); // 2–4 categories shift
  const shuffled = [...categories].sort(() => Math.random() - 0.5);
  const toShift = shuffled.slice(0, count);

  const ups = [], downs = [];

  toShift.forEach(cat => {
    const cur = state.marketTrends[cat];
    // Mean-reversion bias: hot markets cool, cold markets recover
    const bias = cur > 1.15 ? -0.12 : cur < 0.85 ? 0.12 : 0;
    const delta = +((Math.random() - 0.5) * 0.32 + bias).toFixed(2);
    const next = +Math.max(TREND_MIN, Math.min(TREND_MAX, cur + delta)).toFixed(2);
    if (next > cur) ups.push(CATEGORY_META[cat]?.label ?? cat);
    else if (next < cur) downs.push(CATEGORY_META[cat]?.label ?? cat);
    state.marketTrends[cat] = next;
  });

  const parts = [];
  if (ups.length)   parts.push(`▲ ${ups.join(', ')}`);
  if (downs.length) parts.push(`▼ ${downs.join(', ')}`);
  if (parts.length) {
    EventBus.emit('notification', { type: 'info', message: `📊 Market shift: ${parts.join('  ')}` });
  }
}

export function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.floor(n));
}
