// movable_profile.js
(function () {
    function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

    function init() {
        const card = document.getElementById('movable-profile-card');
        const container = document.querySelector('.profile-container');
        const tempProfile = document.querySelector('.profile-container .profile-face');
        if (!card || !container) return;

        const placeholder = document.getElementById('movable-placeholder');

        // Positions are now relative to .profile-container (the offset parent)
        function isMobile() {
            return window.innerWidth <= 768;
        }

        function setInitialPosition() {
            // On mobile, let CSS handle static flow layout
            if (isMobile()) {
                card.style.left = '';
                card.style.top = '';
                card.style.transform = '';
                if (placeholder) {
                    placeholder.style.left = '';
                    placeholder.style.top = '';
                    placeholder.style.width = '';
                    placeholder.style.height = '';
                    placeholder.style.transform = '';
                    placeholder.style.opacity = '1';
                }
                return;
            }

            if (tempProfile) {
                const containerRect = container.getBoundingClientRect();
                const profileRect = tempProfile.getBoundingClientRect();
                const cardWidth = 240; // match CSS
                const cardRect = card.getBoundingClientRect();
                const cardHeight = cardRect.height || cardWidth;

                // position so the card tucks partly behind the temp profile on the right
                const overlapFactor = 0.6;

                // compute position relative to the container
                const profileLeft = profileRect.left - containerRect.left;
                const profileTop = profileRect.top - containerRect.top;
                const profileRight = profileLeft + profileRect.width;

                const left = profileRight - cardWidth * overlapFactor;
                // vertically center relative to the temp profile
                const topCandidate = profileTop + (profileRect.height - cardHeight) / 2;

                card.style.left = Math.round(left) + 'px';
                card.style.top = Math.round(topCandidate) + 'px';

                if (placeholder) {
                    const phW = (cardWidth + 16);
                    const phH = (cardHeight + 16);
                    placeholder.style.width = phW + 'px';
                    placeholder.style.height = phH + 'px';
                    // center the placeholder around the card
                    const padX = (phW - cardWidth) / 2;
                    const padY = (phH - cardHeight) / 2;
                    placeholder.style.left = Math.round(left - padX) + 'px';
                    placeholder.style.top = Math.round(topCandidate - padY) + 'px';
                    placeholder.style.transform = 'rotate(8deg)';
                    placeholder.style.opacity = '1';
                }
                card.style.transform = 'rotate(8deg)';
            } else {
                card.style.left = '0px';
                card.style.top = '0px';
            }
        }

        window.requestAnimationFrame(setInitialPosition);
        window.addEventListener('resize', function () {
            if (!dragging) setInitialPosition();
        });

        // pointer drag handling — uses absolute positioning relative to container
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
            origLeft = pxToNum(card.style.left);
            origTop = pxToNum(card.style.top);
            card.style.transition = 'none';
            card.style.cursor = 'grabbing';
            card.style.transform = 'rotate(0deg)';
            if (placeholder) placeholder.style.opacity = '0.35';
        });

        document.addEventListener('pointermove', function (ev) {
            if (!dragging) return;
            ev.preventDefault();
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            let newLeft = origLeft + dx;
            let newTop = origTop + dy;
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
            const phLeft = pxToNum(placeholder.style.left);
            const phTop = pxToNum(placeholder.style.top);
            const phW = pxToNum(placeholder.style.width);
            const phH = pxToNum(placeholder.style.height);
            const cardWidth = 240;
            const cardH = card.getBoundingClientRect().height || cardWidth;
            const targetLeft = Math.round(phLeft + (phW - cardWidth) / 2);
            const targetTop = Math.round(phTop + (phH - cardH) / 2);
            card.style.transition = 'left 360ms cubic-bezier(.2,.9,.2,1), top 360ms cubic-bezier(.2,.9,.2,1)';
            card.style.left = targetLeft + 'px';
            card.style.top = targetTop + 'px';
            setTimeout(() => {
                card.style.transition = '';
                card.style.transform = 'rotate(8deg)';
            }, 420);
        }

        card.addEventListener('dblclick', function (e) {
            animateToHome();
        });

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
