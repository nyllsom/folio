(() => {
  const pages = [...document.querySelectorAll('.page')];
  const dialog = document.querySelector('dialog');
  const title = document.title;
  const scrollPositions = new Map();
  let current = -1;
  const fromHash = () => /^#page-\d+$/.test(location.hash) ? Number(location.hash.slice(6)) - 1 : 0;
  function show(index, updateHash = true) {
    if (current >= 0) scrollPositions.set(current, window.scrollY);
    current = Math.max(0, Math.min(pages.length - 1, Number.isFinite(index) ? index : 0));
    pages.forEach((p, i) => { p.hidden = i !== current; });
    document.title = `${pages[current].querySelector('h2').textContent} · ${title}`;
    if (updateHash) history.replaceState(null, '', `#page-${current + 1}`);
    pages[current].focus({ preventScroll: true });
    window.scrollTo({ top: scrollPositions.get(current) ?? 0, behavior: 'instant' });
  }
  show(fromHash());
  addEventListener('hashchange', () => show(fromHash(), false));
  addEventListener('keydown', e => {
    if (dialog.open || e.ctrlKey || e.metaKey || e.altKey || e.target.closest('input, textarea, select, button, a, [contenteditable]')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
    if (e.key === 'Home') { e.preventDefault(); show(0); }
    if (e.key === 'End') { e.preventDefault(); show(pages.length - 1); }
    if (e.key.toLowerCase() === 'f') {
      const action = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
      action?.catch(() => {});
    }
  });
  document.querySelectorAll('figure img').forEach(img => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `${img.alt}，放大查看`);
    const open = () => {
      const target = dialog.querySelector('img');
      target.src = img.src;
      target.alt = img.alt;
      dialog.querySelector('p').textContent = img.closest('figure').querySelector('figcaption')?.textContent ?? img.alt;
      dialog.showModal();
    };
    img.addEventListener('click', open);
    img.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
  dialog.querySelector('button').onclick = () => dialog.close();
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  let touch;
  document.addEventListener('touchstart', e => {
    touch = null;
    if (e.target.closest('.table-scroll, .math-display')) return;
    if (!dialog.open && e.touches.length === 1) touch = [e.touches[0].clientX, e.touches[0].clientY];
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (!touch || dialog.open) return;
    const dx = e.changedTouches[0].clientX - touch[0];
    const dy = e.changedTouches[0].clientY - touch[1];
    if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 2) show(current + (dx < 0 ? 1 : -1));
    touch = null;
  }, { passive: true });
})();
