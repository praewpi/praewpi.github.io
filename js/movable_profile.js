// movable_profile.js
(function () {
    function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

    function init() {
        const card = document.getElementById('movable-profile-card');
        const tempProfile = document.querySelector('.profile-container .profile-face');
        const wrapper = document.querySelector('.aboutme-wrapper');
        if (!card) return;

        // rely on CSS for position/z-index; ensure card uses left/top coordinates

        // compute initial position relative to the temp profile so it's half-hidden nearby
        const placeholder = document.getElementById('movable-placeholder');

        function setInitialPosition() {
            if (tempProfile) {
                const r = tempProfile.getBoundingClientRect();
                const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
                const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
                const cardWidth = 240; // match CSS
                // offset the dock slightly upwards so the card sits higher
                const offsetY = -20; // pixels to move up when docked
                // position so the card tucks partly behind the temp profile on the right
                const overlapFactor = 0.6; // proportion of card overlapping the profile (more hidden)
                // use viewport coordinates for fixed positioning
                const left = clamp(r.right - cardWidth * overlapFactor, 8, vw - cardWidth - 8);
                // vertically center relative to the temp profile, then apply upward offset
                const topCandidate = r.top + (r.height - cardWidth) / 2 + offsetY;
                const top = clamp(topCandidate, 8, vh - cardWidth - 8);
                card.style.left = Math.round(left) + 'px';
                card.style.top = Math.round(top) + 'px';
                if (placeholder) {
                    // make placeholder slightly larger than the card so it frames it
                    const phW = (cardWidth + 28);
                    const phH = (cardWidth + 48);
                    placeholder.style.width = phW + 'px';
                    placeholder.style.height = phH + 'px';
                    // compute placeholder top-left so the card sits centered inside it
                    const padX = (phW - cardWidth) / 2;
                    const padY = (phH - cardWidth) / 2;
                    const phLeft = Math.round(left - padX);
                    const phTop = Math.round(top - padY);
                    placeholder.style.left = phLeft + 'px';
                    placeholder.style.top = phTop + 'px';
                    // tilt the placeholder to match the docked card
                    placeholder.style.transform = 'rotate(8deg)';
                    placeholder.style.opacity = '1';
                }
                // tilt card slightly to the right when docked
                card.style.transform = 'rotate(8deg)';
            } else {
                // default fallback
                card.style.right = '6rem';
                card.style.top = '30%';
                if (placeholder) {
                    placeholder.style.right = '6rem';
                    placeholder.style.top = card.style.top;
                }
            }
        }

        // ensure image loaded before measuring
        window.requestAnimationFrame(setInitialPosition);
        window.addEventListener('resize', setInitialPosition);

        // pointer drag handling
        let dragging = false;
        let startX = 0, startY = 0;
        let origLeft = 0, origTop = 0;

        function pxToNum(value) {
            return value ? parseFloat(value.replace('px', '')) : 0;
        }

        card.addEventListener('pointerdown', function (ev) {
            ev.preventDefault();
            dragging = true;
            card.setPointerCapture(ev.pointerId);
            startX = ev.clientX;
            startY = ev.clientY;
            // prefer left/top numeric values; fall back to getBoundingClientRect
            origLeft = pxToNum(card.style.left) || card.getBoundingClientRect().left;
            origTop = pxToNum(card.style.top) || card.getBoundingClientRect().top;
            card.style.transition = 'none';
            card.style.cursor = 'grabbing';
            // remove dock tilt while dragging
            card.style.transform = 'rotate(0deg)';
            // while dragging, slightly reduce placeholder opacity
            if (placeholder) placeholder.style.opacity = '0.35';
        });

        document.addEventListener('pointermove', function (ev) {
            if (!dragging) return;
            ev.preventDefault();
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const cardRect = card.getBoundingClientRect();
            let newLeft = origLeft + dx;
            let newTop = origTop + dy;
            // clamp to viewport with small margin
            newLeft = clamp(newLeft, 8, vw - cardRect.width - 8);
            newTop = clamp(newTop, 8, vh - cardRect.height - 8);
            card.style.left = Math.round(newLeft) + 'px';
            card.style.top = Math.round(newTop) + 'px';
        });

        document.addEventListener('pointerup', function (ev) {
            if (!dragging) return;
            dragging = false;
            try { card.releasePointerCapture && card.releasePointerCapture(ev.pointerId); } catch (e) { }
            card.style.transition = '';
            card.style.cursor = 'grab';
            if (placeholder) placeholder.style.opacity = '1';
        });

        // double click to reset back to initial spot (animate)
        function animateToHome() {
            if (!placeholder) return setInitialPosition();
            const phRect = placeholder.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            // use viewport coordinates directly for fixed positioning
            const targetLeft = Math.round(phRect.left + (phRect.width - cardRect.width) / 2);
            const targetTop = Math.round(phRect.top + (phRect.height - cardRect.height) / 2);
            card.style.transition = 'left 360ms cubic-bezier(.2,.9,.2,1), top 360ms cubic-bezier(.2,.9,.2,1)';
            card.style.left = targetLeft + 'px';
            card.style.top = targetTop + 'px';
            // after moving back to dock, reapply tilt
            setTimeout(() => {
                card.style.transition = '';
                card.style.transform = 'rotate(8deg)';
            }, 420);
        }

        card.addEventListener('dblclick', function (e) {
            animateToHome();
        });

        // clicking the placeholder returns the card to home
        if (placeholder) {
            placeholder.addEventListener('pointerdown', function (ev) {
                ev.preventDefault();
                animateToHome();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
