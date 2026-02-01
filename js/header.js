// Shared header behaviors (connect dropdown)
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

    // Run immediately (works whether header was injected before or after script runs)
    attachConnect();

    // Expose for manual re-attach if needed
    window.attachConnect = attachConnect;
})();
