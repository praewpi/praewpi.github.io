(function(){
    const canvas = document.getElementById('mouse-spot-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let dpr = Math.max(1, window.devicePixelRatio || 1);
    let w = 0, h = 0;

    function resize(){
        const cssW = window.innerWidth;
        const cssH = window.innerHeight;
        w = Math.floor(cssW * dpr);
        h = Math.floor(cssH * dpr);
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = cssW + 'px';
        canvas.style.height = cssH + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const lerp = (a,b,t) => a + (b - a) * t;

    const target = { x: window.innerWidth/2, y: window.innerHeight/2, r: 220, a: 0 };
    const pos = { x: target.x, y: target.y, r: target.r, a: 0 };

    // Ginger color
    const color = { r: 210, g: 120, b: 40 };

    function onMove(e){
        target.x = e.clientX;
        target.y = e.clientY;
        // radius scales with viewport but clamped
        const diag = Math.hypot(window.innerWidth, window.innerHeight);
        target.r = Math.min(Math.max(diag * 0.18, 120), 420);
        target.a = 1;
    }

    function onLeave(){
        target.a = 0;
    }

    document.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseout', (ev)=>{ if(!ev.relatedTarget) onLeave(); });
    document.addEventListener('mouseleave', onLeave);

    function draw(){
        pos.x = lerp(pos.x, target.x, 0.03);
        pos.y = lerp(pos.y, target.y, 0.03);
        pos.r = lerp(pos.r, target.r, 0.02);
        pos.a = lerp(pos.a, target.a, 0.03);

        // clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if(pos.a > 0.005){
            const outerR = pos.r * 1.25;
            const g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, outerR);
            g.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${0.9 * pos.a})`);
            g.addColorStop(0.45, `rgba(${color.r},${color.g},${color.b},${0.42 * pos.a})`);
            g.addColorStop(0.75, `rgba(${color.r},${color.g},${color.b},${0.18 * pos.a})`);
            g.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);

            ctx.fillStyle = g;
            // fill as CSS pixels
            ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        }

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
})();
