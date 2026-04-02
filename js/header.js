/**
 * Shared header behaviors (connect dropdown + mobile nav toggle)
 */
(function(){
    function attachConnect(){
        const connectBtn = document.getElementById('connect-btn');
        const connectMenu = document.getElementById('connect-menu');
        if(!connectBtn || !connectMenu) return;

        // Avoid attaching duplicate listeners
        connectBtn.onclick = null;

        connectBtn.addEventListener('click', function(e){
            e.stopPropagation();
            connectMenu.classList.toggle('active');
        });

        document.addEventListener('click', function(){
            connectMenu.classList.remove('active');
        });

        connectMenu.addEventListener('click', function(e){ e.stopPropagation(); });
    }

    function attachNavToggle(){
        const toggle = document.getElementById('nav-toggle');
        const navPill = document.querySelector('.nav-pill');
        if(!toggle || !navPill) return;

        toggle.addEventListener('click', function(){
            navPill.classList.toggle('nav-open');
            const isOpen = navPill.classList.contains('nav-open');
            toggle.setAttribute('aria-expanded', isOpen);
        });

        // Close mobile nav when a nav link is clicked
        navPill.querySelectorAll('.nav-item:not(.home-link)').forEach(function(item){
            item.addEventListener('click', function(){
                if(window.innerWidth <= 768){
                    navPill.classList.remove('nav-open');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // Run immediately
    attachConnect();
    attachNavToggle();

    // Expose for manual re-attach if needed
    window.attachConnect = attachConnect;
    window.attachNavToggle = attachNavToggle;
})();
