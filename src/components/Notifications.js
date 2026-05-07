import { EventBus } from '../engine/EventBus.js';

const TYPE_STYLE = {
  success: 'border-emerald-500/40 text-emerald-200',
  error:   'border-red-500/40    text-red-200',
  warning: 'border-amber-500/40  text-amber-200',
  info:    'border-blue-500/40   text-blue-200',
};

export function initNotifications() {
  const wrap = document.createElement('div');
  wrap.id = 'toast-wrap';
  wrap.className = 'fixed bottom-6 right-6 z-40 flex flex-col-reverse gap-2 w-80 pointer-events-none';
  document.body.appendChild(wrap);

  EventBus.on('notification', ({ type = 'info', message }) => {
    const el = document.createElement('div');
    el.className = `glass border ${TYPE_STYLE[type] ?? TYPE_STYLE.info} rounded-2xl px-4 py-3 text-sm pointer-events-auto
      transition-all duration-300 translate-x-4 opacity-0`;
    el.textContent = message;
    wrap.prepend(el);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.classList.remove('translate-x-4', 'opacity-0');
    }));

    setTimeout(() => {
      el.classList.add('translate-x-4', 'opacity-0');
      setTimeout(() => el.remove(), 320);
    }, 4500);
  });
}
