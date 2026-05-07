import { state } from '../engine/GameState.js';
import { EventBus } from '../engine/EventBus.js';

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

export function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.floor(n));
}
