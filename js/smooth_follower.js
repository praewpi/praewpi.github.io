(function(){
  // Pure JS SmoothFollower replicating the React example behavior
  const DOT_SMOOTHNESS = 0.18; // how fast the inner dot follows
  const BORDER_DOT_SMOOTHNESS = 0.09; // how fast the border follows
  const HOVER_SIZE = 64; // increased hover size
  const NORMAL_SIZE = 28;

  // create container + elements dynamically to avoid editing HTML
  const container = document.createElement('div');
  container.className = 'sf-container';
  const dot = document.createElement('div');
  dot.className = 'sf-dot';
  const border = document.createElement('div');
  border.className = 'sf-border';
  container.appendChild(border);
  container.appendChild(dot);
  document.body.appendChild(container);
  // hide initially to avoid centered flash before first mousemove
  container.style.opacity = '0';
  container.style.transition = 'opacity 160ms ease';

  let mousePosition = { x: window.innerWidth/2, y: window.innerHeight/2 };
  let dotPos = { x: mousePosition.x, y: mousePosition.y };
  let borderPos = { x: mousePosition.x, y: mousePosition.y };
  let isHovering = false;
  let _initialized = false; // set true after first mousemove to avoid startup lag

  function lerp(start, end, t){ return start + (end - start) * t; }

  function onMouseMove(e){
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
    if(!_initialized){
      // snap follower to mouse on first move to avoid waiting through lerp
      dotPos.x = mousePosition.x;
      dotPos.y = mousePosition.y;
      borderPos.x = mousePosition.x;
      borderPos.y = mousePosition.y;
      _initialized = true;
      // reveal container now we've got a real mouse position
      container.style.opacity = '1';
    }
  }

  // Use event delegation so dynamically-inserted elements (like header) trigger hover
  const hoverSelectors = [
    '#connect-btn',
    '#clear-btn',
    '.section-title',
    'a[href*="index.html"]',
    'a[href*="about"]',
    'a[href*="About"]',
    'a[href*="experience"]'
  ];

  // also consider experience list entries as clickable targets
  hoverSelectors.push('.exp-item');

  const matchesHover = (el) => {
    if(!el) return false;
    // If the target or its ancestor matches a selector, treat as hoverable.
    // Special-case `.exp-item`: only hover if the item has an expandable arrow that is not disabled.
    if (el.closest) {
      // check exp-item ancestor first
      const exp = el.closest('.exp-item');
      if (exp) {
        const arrow = exp.querySelector('.exp-arrow');
        if (arrow && !arrow.classList.contains('disabled')) return true;
        return false;
      }
    }
    return hoverSelectors.some(sel => el.closest && el.closest(sel));
  };

  document.addEventListener('mouseover', (e) => {
    if (matchesHover(e.target)) {
      isHovering = true;
      document.body.classList.add('sf-hover');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    // if moving to an element that is not a hover target, and leaving a hover target
    const to = e.relatedTarget;
    if (!matchesHover(to) && matchesHover(e.target)) {
      isHovering = false;
      document.body.classList.remove('sf-hover');
    }
  }, { passive: true });

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // hide on first touch
  function onFirstTouch(){ container.style.display = 'none'; window.removeEventListener('touchstart', onFirstTouch); }
  window.addEventListener('touchstart', onFirstTouch, {passive:true});

  // animation loop
  function animate(){
    dotPos.x = lerp(dotPos.x, mousePosition.x, DOT_SMOOTHNESS);
    dotPos.y = lerp(dotPos.y, mousePosition.y, DOT_SMOOTHNESS);
    borderPos.x = lerp(borderPos.x, mousePosition.x, BORDER_DOT_SMOOTHNESS);
    borderPos.y = lerp(borderPos.y, mousePosition.y, BORDER_DOT_SMOOTHNESS);

    dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%)`;
    border.style.transform = `translate3d(${borderPos.x}px, ${borderPos.y}px, 0) translate(-50%, -50%)`;

    // size transition on hover
    const size = isHovering ? HOVER_SIZE : NORMAL_SIZE;
    border.style.width = size + 'px';
    border.style.height = size + 'px';

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
