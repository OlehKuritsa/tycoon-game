export function showModal({ title, body, actions = [] }) {
  closeModal();

  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
  overlay.style.cssText = 'background:rgba(0,0,0,.75);backdrop-filter:blur(6px)';

  overlay.innerHTML = `
    <div class="glass glow-blue rounded-3xl p-7 max-w-lg w-full animate-fade-in">
      <div class="flex items-start justify-between mb-4">
        <h3 class="font-semibold text-lg leading-tight">${title}</h3>
        <button id="modal-x" class="glass rounded-xl px-3 py-1 text-slate-400 hover:text-white text-sm ml-4 shrink-0">✕</button>
      </div>
      <div class="text-slate-300 text-sm leading-relaxed mb-6">${body}</div>
      <div class="flex flex-wrap gap-3">
        ${actions.map((a, i) => `
          <button data-idx="${i}" class="glass ${a.primary ? 'glow-orange' : ''} rounded-2xl px-5 py-2.5 text-sm hover:scale-[1.02] transition flex-1 min-w-[120px]">
            ${a.label}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  overlay.querySelector('#modal-x').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  actions.forEach((a, i) => {
    overlay.querySelector(`[data-idx="${i}"]`).addEventListener('click', () => {
      if (a.onClick) a.onClick();
      closeModal();
    });
  });

  document.body.appendChild(overlay);
}

export function closeModal() {
  document.getElementById('modal-overlay')?.remove();
}
