 (function(){
    // Connect dropdown menu
    const connectBtn = document.getElementById('connect-btn');
    const connectMenu = document.getElementById('connect-menu');

    if (connectBtn && connectMenu) {
        connectBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            connectMenu.classList.toggle('active');
        });

        document.addEventListener('click', function() {
            connectMenu.classList.remove('active');
        });

        connectMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Ginger drawing functionality
    const icon = document.getElementById('ginger-icon');
    const clickMeText = document.getElementById('click-me-text');
    const canvas = document.getElementById('draw-canvas');
    const clearBtn = document.getElementById('clear-btn');
    if (!icon || !canvas) return;

    const ctx = canvas.getContext('2d');
    let isGlobal = false; // follow & draw toggled
    let originalParent = null;
    let originalNext = null;

    function resize(){
        const dpr = window.devicePixelRatio || 1;
        // Collapse canvas before measuring so it doesn't inflate scrollHeight
        canvas.style.display = 'none';
        const w = Math.max(document.documentElement.scrollWidth, window.innerWidth);
        const h = Math.max(document.documentElement.scrollHeight, window.innerHeight);
        canvas.style.display = '';
        canvas.width = Math.max(1, w * dpr);
        canvas.height = Math.max(1, h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#2b2b2b';
    }

    window.addEventListener('resize', resize);
    resize();

    function moveIconTo(x, y){
        icon.style.left = (x + window.scrollX + 12) + 'px';
        icon.style.top = (y + window.scrollY + 12) + 'px';
    }

    function startGlobal(startX, startY){
        // detach icon to body to allow fixed positioning
        if (!originalParent){
            originalParent = icon.parentNode;
            originalNext = icon.nextSibling;
        }
        // set absolute positioning so the icon stays in place when scrolling
        icon.style.position = 'absolute';
        icon.style.zIndex = 9997;
        if (typeof startX === 'number' && typeof startY === 'number'){
            moveIconTo(startX, startY);
        }
        document.body.appendChild(icon);
        icon.classList.add('active');
        if (clickMeText) clickMeText.style.display = 'none';
        document.addEventListener('mousemove', onPointerMove);
        document.addEventListener('touchmove', onTouchMove, {passive:true});
    }

    function stopGlobal(){
        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('touchmove', onTouchMove);
        icon.classList.remove('active');
        // ginger stays in place (fixed position)
    }

    function resetGingerToOriginal(){
        stopGlobal();
        // restore icon to original place
        if (originalParent){
            if (originalNext) originalParent.insertBefore(icon, originalNext);
            else originalParent.appendChild(icon);
            icon.style.position = '';
            icon.style.left = '';
            icon.style.top = '';
            icon.style.zIndex = '';
            if (clickMeText) clickMeText.style.display = 'block';
        }
    }

    let last = null;
    function drawLine(x, y){
        // Use page coordinates (client + scroll) since canvas is absolute-positioned
        const px = x + window.scrollX;
        const py = y + window.scrollY;
        if (!last) { last = {x: px, y: py}; return; }
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(px, py);
        ctx.stroke();
        last = {x: px, y: py};
    }

    function onPointerMove(e){
        const x = e.clientX;
        const y = e.clientY;
        moveIconTo(x, y);
        drawLine(x, y);
    }

    function onTouchMove(e){
        const t = e.touches[0];
        if (!t) return;
        const x = t.clientX;
        const y = t.clientY;
        moveIconTo(x, y);
        drawLine(x, y);
    }

    // toggle on click: start/stop global follow + drawing
    icon.addEventListener('click', function(e){
        e.stopPropagation();
        isGlobal = !isGlobal;
        last = null; // reset last point so stroke starts at current pointer
        if (isGlobal) {
            // initialize global mode at the click position to avoid jump
            const x = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || window.innerWidth/2;
            const y = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || window.innerHeight/2;
            startGlobal(x, y);
        }
    });

    // click anywhere on page to stop drawing
    document.addEventListener('click', function(e){
        if (isGlobal && e.target !== icon) {
            isGlobal = false;
            stopGlobal();
        }
    });

    // clear canvas on clear button click
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            last = null;
            // reset ginger to original location
            if (isGlobal) {
                isGlobal = false;
                resetGingerToOriginal();
            } else if (icon.style.position === 'absolute') {
                resetGingerToOriginal();
            }
        });
    }

    // when leaving page while global, stop moving but keep drawing
    document.addEventListener('mouseleave', function(){ if (isGlobal) last = null; });

})();
