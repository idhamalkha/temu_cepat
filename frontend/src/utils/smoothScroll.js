// Smooth scroll helper with custom easing and duration
export function initSmoothScroll(options = {}) {
  const { duration = 600, overshoot = 0.02, settleDelay = 120, settleDuration = 180 } = options;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function scrollToY(targetY, cb) {
    const startY = window.scrollY || window.pageYOffset;
    const diff = targetY - startY;
    const start = performance.now();
    const overshootAmt = diff * overshoot;

    function step(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(t);
      // add a small sinusoidal overshoot that settles at the end (sin(pi*t) -> 0 at t=0 and t=1)
      const extra = Math.sin(t * Math.PI) * overshootAmt;
      window.scrollTo(0, Math.round(startY + diff * eased + extra));
      if (elapsed < duration) requestAnimationFrame(step);
        else {
          // Primary animation finished. Schedule a short settle after a small delay
          if (settleDelay > 0) {
            setTimeout(() => {
              // gentle final animation from current position to the exact target
              const startSettle = performance.now();
              const startY2 = window.scrollY || window.pageYOffset;
              const diff2 = targetY - startY2;
              function settleStep(now2) {
                const elapsed2 = now2 - startSettle;
                const t2 = Math.min(1, elapsed2 / settleDuration);
                const eased2 = easeInOutCubic(t2);
                window.scrollTo(0, Math.round(startY2 + diff2 * eased2));
                if (elapsed2 < settleDuration) requestAnimationFrame(settleStep);
                else if (typeof cb === 'function') cb();
              }
              requestAnimationFrame(settleStep);
            }, settleDelay);
          } else if (typeof cb === 'function') cb();
        }
    }

    requestAnimationFrame(step);
  }

  function getNavbarOffset() {
    try {
      const val = getComputedStyle(document.documentElement).getPropertyValue('--navbar-height');
      if (!val) return 0;
      // val might be like "70px"
      return parseInt(val, 10) || 0;
    } catch (e) {
      return 0;
    }
  }

  function handleClick(e) {
    // only intercept anchor links that point to ids on this page
    const el = e.target.closest('a[href^="#"]');
    if (!el) return;
    const href = el.getAttribute('href');
    if (!href || href === '#') return; // allow default or empty hash

    const id = href.slice(1);
    const targetEl = document.getElementById(id);
    if (!targetEl) return;

    e.preventDefault();
    const navbarOffset = getNavbarOffset();
    const rect = targetEl.getBoundingClientRect();
    const targetY = window.scrollY + rect.top - navbarOffset - 18; // small extra gap
    scrollToY(targetY);

    // update history without jumping
    if (history.pushState) {
      history.pushState(null, '', href);
    } else {
      location.hash = href;
    }
  }

  // Attach delegated click handler
  document.addEventListener('click', handleClick, { passive: false });

  // Optional: smooth-scroll on page load if url has a hash
  window.addEventListener('load', () => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const target = document.getElementById(id);
      if (target) {
        const navbarOffset = getNavbarOffset();
        const rect = target.getBoundingClientRect();
        const targetY = window.scrollY + rect.top - navbarOffset - 18;
        // delay a tick so layout stabilizes
        setTimeout(() => scrollToY(targetY), 80);
      }
    }
  });
}
