/**
 * Like-heart button – connects to Supabase
 */
(function () {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.__ENV__ || {};
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn('[likes] Supabase env vars missing');
        return;
    }

    const API = `${SUPABASE_URL}/rest/v1`;
    const HEADERS = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
    };

    const ROW_ID = 'site'; // fixed ID since we only have one page to track

    /* ── DOM refs ─────────────────────────────────── */
    const btn       = document.getElementById('like-btn');
    const countEl   = document.getElementById('like-count');
    const particles = document.getElementById('heart-particles');
    if (!btn || !countEl) return;

    let liked   = false;   // has the visitor clicked in this session?
    let current = 0;       // current count shown

    /* ── Fetch current count via RPC ────────────── */
    async function fetchCount() {
        try {
            const res = await fetch(
                `${API}/rpc/get_like_count`,
                {
                    method: 'POST',
                    headers: HEADERS,
                    body: JSON.stringify({ p_id: ROW_ID })
                }
            );
            const data = await res.json();
            current = typeof data === 'number' ? data : 0;
            countEl.textContent = current;
        } catch (e) {
            console.error('[likes] fetch failed', e);
        }
    }

    /* ── Increment count via RPC ──────────────────── */
    async function incrementCount() {
        try {
            const res = await fetch(
                `${API}/rpc/increment_like`,
                {
                    method: 'POST',
                    headers: HEADERS,
                    body: JSON.stringify({ p_id: ROW_ID })
                }
            );
            const data = await res.json();
            // RPC returns the new count directly
            if (typeof data === 'number') {
                current = data;
                countEl.textContent = current;
            }
        } catch (e) {
            console.error('[likes] increment failed', e);
        }
    }

    /* ── Floating heart particles on click ────────── */
    function spawnHearts() {
        const count = 6 + Math.floor(Math.random() * 4); // 6-9 hearts
        for (let i = 0; i < count; i++) {
            const el = document.createElement('span');
            el.className = 'heart-particle';
            el.textContent = '♥';
            // random spread
            const x  = (Math.random() - 0.5) * 60;   // px horizontal
            const y  = -(40 + Math.random() * 50);     // px upward
            const s  = 0.6 + Math.random() * 0.7;      // scale
            const d  = 400 + Math.random() * 400;       // duration ms
            const dl = Math.random() * 150;              // delay ms

            el.style.setProperty('--x', `${x}px`);
            el.style.setProperty('--y', `${y}px`);
            el.style.setProperty('--s', s);
            el.style.setProperty('--d', `${d}ms`);
            el.style.animationDelay = `${dl}ms`;
            el.style.animationDuration = `${d}ms`;

            particles.appendChild(el);
            // remove after animation
            setTimeout(() => el.remove(), d + dl + 50);
        }
    }

    /* ── Click handler ───────────────────────────── */
    btn.addEventListener('click', async function () {
        if (liked) return; // one like per session
        liked = true;
        btn.classList.add('liked');

        // optimistic UI update
        current += 1;
        countEl.textContent = current;

        // pop animation
        btn.classList.add('pop');
        setTimeout(() => btn.classList.remove('pop'), 400);

        // floating hearts
        spawnHearts();

        // persist
        await incrementCount();
    });

    /* ── Init ────────────────────────────────────── */
    // Check localStorage so returning visitors see filled heart
    if (localStorage.getItem('site_liked') === '1') {
        liked = true;
        btn.classList.add('liked');
    }

    // Persist liked state
    btn.addEventListener('click', function () {
        localStorage.setItem('site_liked', '1');
    });

    fetchCount();
})();
