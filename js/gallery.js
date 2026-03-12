/**
 * gallery.js — Draggable horizontal photo gallery with lightbox + coverflow.
 * Smooth infinite loop via front/back clone cards.
 *
 * DOM layout after render():
 *   [CLONE_COUNT front clones] [N real cards] [CLONE_COUNT back clones]
 *   indices: 0 .. CC-1          CC .. CC+N-1   CC+N .. CC+N+CC-1
 *
 * Real leftmost range: CC ≤ currentIndex ≤ N
 *   (at N the rightmost visible card is the last real photo)
 *
 * Seamless wrap: front-clone position 0 is visually identical to real position N,
 * and back-clone position N+CC is visually identical to real position CC.
 * After animating into clone territory, transitionend silently teleports back:
 *   currentIndex < CC  →  jump to currentIndex + N  (same visual, real zone)
 *   currentIndex > N   →  jump to currentIndex - N  (same visual, real zone)
 */
(function () {
    'use strict';

    const VISIBLE = 5;
    const CLONE_COUNT = VISIBLE; // clones on each side

    const track = document.getElementById('gallery-track');
    const progressBar = document.getElementById('gallery-progress-bar');
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');

    if (!track) return;

    /* ── Move lightbox to <body> so it escapes all stacking contexts ── */
    const tpl = document.getElementById('gallery-lightbox-tpl');
    let lightbox, lightboxImg, lightboxLoc, lightboxClose;
    if (tpl) {
        const clone = tpl.content.cloneNode(true);
        document.body.appendChild(clone);
        lightbox = document.getElementById('gallery-lightbox');
        lightboxImg = document.getElementById('lightbox-img');
        lightboxLoc = document.getElementById('lightbox-location');
        lightboxClose = document.getElementById('lightbox-close');
    }

    let photos = [];
    let cardWidth = 0;
    let gapWidth = 0;
    let stepSize = 0;
    let currentIndex = CLONE_COUNT; // DOM index of leftmost visible card

    const wrapper = track.parentElement;

    /* ── Load data ── */
    fetch('data/gallery.json')
        .then(r => r.json())
        .then(data => {
            photos = data;
            render();
            sizeCards();
            goTo(CLONE_COUNT, false);
        })
        .catch(() => { });

    /* ── Build a single card element ── */
    function makeCard(p, photoIndex) {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.dataset.photoIndex = photoIndex;
        card.innerHTML = `
                <img class="gallery-card-img" src="${p.thumb || p.src}" alt="${p.location || 'Photo'}" loading="lazy" />
                <div class="gallery-card-info">
                    <span class="gallery-card-location">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        ${p.location || ''}
                    </span>
                </div>`;
        card.addEventListener('click', () => openLightbox(photoIndex));
        return card;
    }

    /* ── Render: real cards + front/back clones ── */
    function render() {
        track.innerHTML = '';
        const N = photos.length;
        if (N === 0) return;

        // Front clones: last CLONE_COUNT real photos (mirrors end of list)
        for (let i = N - CLONE_COUNT; i < N; i++) {
            const safeI = ((i % N) + N) % N;
            track.appendChild(makeCard(photos[safeI], safeI));
        }
        // Real photos
        photos.forEach((p, i) => track.appendChild(makeCard(p, i)));
        // Back clones: first CLONE_COUNT real photos (mirrors start of list)
        for (let i = 0; i < CLONE_COUNT; i++) {
            track.appendChild(makeCard(photos[i], i));
        }
    }

    /* ── Size cards so exactly VISIBLE fit in the wrapper ── */
    function sizeCards() {
        const wrapperW = wrapper.clientWidth;
        const style = getComputedStyle(track);
        gapWidth = parseFloat(style.gap) || 40;
        cardWidth = (wrapperW - gapWidth * (VISIBLE - 1)) / VISIBLE;
        track.querySelectorAll('.gallery-card').forEach(c => {
            c.style.flex = `0 0 ${cardWidth}px`;
        });
        stepSize = cardWidth + gapWidth;
    }

    /* ── Move track to a given DOM index ── */
    function goTo(index, animate, skipCoverflow) {
        currentIndex = index;
        const tx = -(currentIndex * stepSize);

        if (animate === false) {
            // Freeze track AND every card so neither the position jump
            // nor the coverflow re-application causes a visible animation
            track.classList.add('is-dragging');
            track.querySelectorAll('.gallery-card').forEach(c => c.classList.add('no-transition'));
        }

        track.style.transform = `translateX(${tx}px)`;

        if (!skipCoverflow) {
            applyCoverflow(); // runs instantly while no-transition is active
        }

        if (animate === false) {
            track.offsetHeight; // force reflow — flushes all frozen styles
            track.classList.remove('is-dragging');
            track.querySelectorAll('.gallery-card').forEach(c => c.classList.remove('no-transition'));
        }

        if (!skipCoverflow) {
            updateProgress();
        }
    }

    /* ── Seamless loop ──
     * After a button-press animation lands in clone territory, silently teleport
     * to the matching real position. We listen for ONE transitionend on 'transform'
     * only, then remove the listener immediately to prevent double-firing.
     */
    function scheduleLoopCheck() {
        function onTransitionEnd(e) {
            if (e.target !== track || e.propertyName !== 'transform') return;
            track.removeEventListener('transitionend', onTransitionEnd);

            const N = photos.length;
            if (currentIndex > N) {
                goTo(currentIndex - N, false, false);
            } else if (currentIndex < CLONE_COUNT) {
                goTo(currentIndex + N, false, false);
            }
        }
        track.addEventListener('transitionend', onTransitionEnd);
    }

    /* ── Coverflow effect ── */
    function applyCoverflow(centerOverride) {
        const cards = track.querySelectorAll('.gallery-card');
        if (!cards.length) return;

        const centerIdx = (centerOverride !== undefined) ? centerOverride : currentIndex + Math.floor(VISIBLE / 2);
        const halfVisible = Math.floor(VISIBLE / 2);

        cards.forEach((card, i) => {
            const dist = Math.abs(i - centerIdx);
            const ratio = Math.min(dist / halfVisible, 1);

            const scale = 1.08 - ratio * 0.23;
            const opacity = dist <= 1 ? 1 : 1 - Math.min(dist - 1, 1) * 0.55;

            card.style.transform = `scale(${scale})`;
            card.style.opacity = opacity;
            card.style.zIndex = Math.round((1 - ratio) * 10);

            const img = card.querySelector('.gallery-card-img');
            if (img) {
                const shadowBlur = 24 - ratio * 16;
                const shadowAlpha = 0.22 - ratio * 0.14;
                img.style.boxShadow = `0 ${8 - ratio * 4}px ${shadowBlur}px rgba(0,0,0,${shadowAlpha})`;
            }
        });
    }

    /* ── Drag / swipe logic (snap on release) ── */
    let isDragging = false;
    let startX = 0;
    let dragStartTranslate = 0;
    let dragMoved = false;
    let currentRawTranslate = 0;

    function startDrag(x) {
        isDragging = true;
        dragMoved = false;
        startX = x;
        dragStartTranslate = -(currentIndex * stepSize);
        currentRawTranslate = dragStartTranslate;
        track.classList.add('is-dragging');
    }

    function moveDrag(x) {
        if (!isDragging) return;
        const dx = x - startX;
        if (Math.abs(dx) > 5) dragMoved = true;
        currentRawTranslate = dragStartTranslate + dx;
        track.style.transform = `translateX(${currentRawTranslate}px)`;
        const rawLeftIndex = -currentRawTranslate / stepSize;
        const dragCenter = rawLeftIndex + Math.floor(VISIBLE / 2);
        applyCoverflow(dragCenter);
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('is-dragging');

        const rawIndex = -currentRawTranslate / stepSize;
        const snappedIndex = Math.round(rawIndex);
        // Clamp drag to real range (clones handled by transitionend for button presses)
        const N = photos.length;
        const clamped = Math.max(CLONE_COUNT, Math.min(snappedIndex, N));
        goTo(clamped, true, false);
    }

    // Mouse events
    wrapper.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startDrag(e.pageX);
    });
    window.addEventListener('mousemove', (e) => moveDrag(e.pageX));
    window.addEventListener('mouseup', endDrag);

    // Touch events
    wrapper.addEventListener('touchstart', (e) => startDrag(e.touches[0].pageX), { passive: true });
    wrapper.addEventListener('touchmove', (e) => moveDrag(e.touches[0].pageX), { passive: true });
    wrapper.addEventListener('touchend', endDrag);

    /* ── Prev / Next buttons — step freely; scheduleLoopCheck handles the seamless loop ── */
    prevBtn.addEventListener('click', () => {
        goTo(currentIndex - 1, true);
        scheduleLoopCheck();
    });
    nextBtn.addEventListener('click', () => {
        goTo(currentIndex + 1, true);
        scheduleLoopCheck();
    });

    /* ── Progress bar ── */
    function updateProgress() {
        const N = photos.length;
        if (!N) return;
        const maxIdx = Math.max(1, N - VISIBLE);
        // Map DOM currentIndex to a 0-based logical position, wrapping correctly
        let logicalIdx = currentIndex - CLONE_COUNT;
        logicalIdx = ((logicalIdx % N) + N) % N;
        logicalIdx = Math.min(logicalIdx, maxIdx);
        const ratio = logicalIdx / maxIdx;
        const barWidth = Math.max(20, (VISIBLE / N) * 100);
        const barLeft = ratio * (100 - barWidth);
        progressBar.style.width = barWidth + '%';
        progressBar.style.marginLeft = barLeft + '%';
    }

    window.addEventListener('resize', () => {
        sizeCards();
        goTo(currentIndex, false, false);
    });

    /* ── Lightbox ── */
    const sfContainer = document.querySelector('.sf-container');

    function openLightbox(photoIndex) {
        if (dragMoved || !lightbox) return;
        const p = photos[photoIndex];
        if (!p) return;
        lightboxImg.src = p.src;
        lightboxLoc.textContent = p.location || '';
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        if (sfContainer) sfContainer.style.display = 'none';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
        lightboxImg.src = '';
        if (sfContainer) sfContainer.style.display = '';
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
})();
