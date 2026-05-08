export function renderStartMenu(overlay, { onStart, onTutorial }) {
  overlay.innerHTML = `
    <div class="start-color-wash">
      <div class="clayer clayer-1"></div>
      <div class="clayer clayer-2"></div>
      <div class="clayer clayer-3"></div>
      <div class="clayer clayer-4"></div>
      <div class="clayer clayer-5"></div>
    </div>

    <div class="relative z-10 flex flex-col items-center gap-10 px-6">

      <!-- Logo -->
      <div class="menu-logo" aria-label="IT Tycoon logo">
        <div class="menu-logo__mark">
          <div class="menu-logo__chip">
            <span class="menu-logo__mono">ITco</span>
            <i class="pin p1"></i><i class="pin p2"></i><i class="pin p3"></i><i class="pin p4"></i>
            <i class="pin p5"></i><i class="pin p6"></i><i class="pin p7"></i><i class="pin p8"></i>
          </div>
          <div class="menu-logo__glow"></div>
        </div>
        <div class="menu-logo__type">
          <div class="menu-logo__title">TYCOON<span class="menu-logo__dot">.</span>IT</div>
          <div class="menu-logo__subtitle">Build &bull; Scale &bull; Dominate</div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex flex-col items-center gap-3 w-full max-w-xs">
        <button id="sm-start"
          class="glass glow-orange rounded-3xl w-full py-4 text-base font-semibold tracking-wide
                 hover:scale-[1.03] transition-all duration-200 start-btn-glow">
          ▶&nbsp;&nbsp;Start Game
        </button>
        <button id="sm-tutorial"
          class="glass rounded-3xl w-full py-3 text-sm text-slate-300
                 hover:scale-[1.02] hover:glow-blue transition-all duration-200">
          ?&nbsp;&nbsp;Read the Tutorial first
        </button>
      </div>

      <!-- Footer info -->
      <div class="text-xs text-slate-600 tracking-widest">
        2045 &nbsp;·&nbsp; Level 1 Startup &nbsp;·&nbsp; $5,000
      </div>
    </div>
  `;

  overlay.querySelector('#sm-start').addEventListener('click', onStart);
  overlay.querySelector('#sm-tutorial').addEventListener('click', onTutorial);
}

export function dismissStartMenu() {
  const el = document.getElementById('start-menu-overlay');
  if (!el) return;
  el.style.transition = 'opacity .45s ease';
  el.style.opacity = '0';
  el.style.pointerEvents = 'none';
  setTimeout(() => el.remove(), 480);
}
