(function(){
  // Smooth Follower 
  const DOT_SMOOTHNESS = 0.5; // how fast the inner dot follows (increased for snappier response)
  const BORDER_DOT_SMOOTHNESS = 0.09; // how fast the border follows
  // increased sizes for clearer visibility
  const HOVER_SIZE = 75; // increased hover size
  const NORMAL_SIZE = 40;

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
    // removed '.section-title' so plain section headers won't trigger hover
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

  window.addEventListener('pointermove', onMouseMove, { passive: true });

  // Invert follower colors when hovering over the dark footer
  window.addEventListener('pointermove', function(e){
    const overFooter = !!(e.target && e.target.closest && e.target.closest('footer'));
    container.classList.toggle('sf-inverted', overFooter);
  }, { passive: true });

  // hide on first touch
  function onFirstTouch(){ container.style.display = 'none'; window.removeEventListener('touchstart', onFirstTouch); }
  window.addEventListener('touchstart', onFirstTouch, {passive:true});

  // Public hide/show helpers for the follower
  function hideFollower(){ container.style.display = 'none'; }
  function showFollower(){
    container.style.display = '';
    if(_initialized) container.style.opacity = '1';
  }

  // Listen for clicks on `#ginger-icon` and `#clear-btn` to toggle visibility.
  // If `#ginger-icon` is active (placed), hide the follower; otherwise show it.
  document.addEventListener('click', function(e){
    const ginger = e.target && e.target.closest ? e.target.closest('#ginger-icon') : null;
    const clearBtn = e.target && e.target.closest ? e.target.closest('#clear-btn') : null;

    if(ginger){
      // allow other click handlers to toggle classes first
      setTimeout(function(){
        const g = document.getElementById('ginger-icon');
        if(g && g.classList.contains('active')) hideFollower(); else showFollower();
      }, 0);
      return;
    }

    if(clearBtn){
      // clear should bring the follower back
      showFollower();
    }
  }, { passive: true });

  // Also observe `#ginger-icon`'s `class` attribute changes to reliably hide/show follower.
  function attachGingerObserver(){
    const g = document.getElementById('ginger-icon');
    if(!g) return setTimeout(attachGingerObserver, 250);
    const mo = new MutationObserver((mutations)=>{
      for(const m of mutations){
        if(m.type === 'attributes' && m.attributeName === 'class'){
          if(g.classList.contains('active')) hideFollower(); else showFollower();
        }
      }
    });
    mo.observe(g, { attributes: true, attributeFilter: ['class'] });
    // set initial state based on current class
    if(g.classList.contains('active')) hideFollower();
  }
  attachGingerObserver();

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
