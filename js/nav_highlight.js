/**
 * Nav Highlight – slides & resizes a pill-shaped highlight
 * inside .nav-pill to track the hovered nav-item.
 *
 * Default state: highlight spans the full bar.
 * Hover state:   highlight shrinks to the hovered item.
 * Leave state:   highlight smoothly expands back to full bar.
 */
(function () {
  const pill = document.querySelector('.nav-pill');
  if (!pill) return;

  // Create the highlight element
  const hl = document.createElement('div');
  hl.className = 'nav-highlight';
  pill.prepend(hl); // insert as first child so z-index 1 sits behind items

  // Collect interactive nav items (links, logo, connect dropdown)
  const items = pill.querySelectorAll('.nav-item');

  /** Position highlight to cover the full pill (default / resting state) */
  function resetToFull() {
    hl.style.left = '0px';
    hl.style.top = '0px';
    hl.style.width = '100%';
    hl.style.height = '100%';
  }

  /** Position highlight to wrap around a specific item (same height as bar) */
  function moveTo(el) {
    const pillRect = pill.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const left = elRect.left - pillRect.left;

    hl.style.left = left + 'px';
    hl.style.top = '0px';
    hl.style.width = elRect.width + 'px';
    hl.style.height = '100%';
  }

  // Start in full-bar state
  resetToFull();

  // Attach listeners to each nav item
  items.forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      moveTo(item);
    });
  });

  // When leaving the entire pill, expand back to full
  pill.addEventListener('mouseleave', function () {
    resetToFull();
  });

  // Recalculate on resize (items might shift)
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      // If nothing is hovered, just ensure full state
      resetToFull();
    }, 100);
  });
})();
