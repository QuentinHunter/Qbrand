(function() {
    // Check if popup was already shown this session or dismissed recently
    const dismissedTime = localStorage.getItem('exitPopupDismissed');
    if (sessionStorage.getItem('exitPopupShown') || (dismissedTime && Date.now() < parseInt(dismissedTime))) {
        return;
    }

    // Don't show on quiz pages
    if (window.location.pathname.includes('growthquiz')) {
        return;
    }

    // Inject popup HTML
    const popupHTML = `
    <div id="exitPopup" class="exit-popup-overlay" style="display: none;">
        <div class="exit-popup">
            <button class="exit-popup-close" onclick="closeExitPopup()">&times;</button>
            <div class="exit-popup-content">
                <div class="exit-popup-badge">FREE ASSESSMENT</div>
                <h2 class="exit-popup-headline">Wait — Before You Go...</h2>
                <p class="exit-popup-subhead">There's a reason your business isn't growing as fast as it should.</p>
                <div class="exit-popup-hook">
                    <span class="exit-popup-icon">🎯</span>
                    <p><strong>In just 5 minutes</strong>, discover the #1 bottleneck holding your business back — and exactly how to fix it.</p>
                </div>
                <ul class="exit-popup-benefits">
                    <li><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>Get your personalised Growth Score</li>
                    <li><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>Identify your biggest constraint</li>
                    <li><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>Receive actionable recommendations</li>
                </ul>
                <a href="https://quentinhunter.com/growthquiz" target="_blank" rel="noopener" class="exit-popup-cta">Take the Free Assessment →</a>
                <p class="exit-popup-note">Takes just 5 minutes. 100% free.</p>
            </div>
        </div>
    </div>
    <style>
        .exit-popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(4px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: exitFadeIn 0.3s ease;
        }
        @keyframes exitFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes exitSlideUp {
            from { opacity: 0; transform: translateY(30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .exit-popup {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 24px;
            max-width: 480px;
            width: 100%;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
            animation: exitSlideUp 0.4s ease;
            overflow: hidden;
        }
        .exit-popup::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #0d9488, #14b8a6, #0d9488);
        }
        .exit-popup-close {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 36px;
            height: 36px;
            border: none;
            background: #f1f5f9;
            border-radius: 50%;
            font-size: 24px;
            color: #64748b;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            line-height: 1;
        }
        .exit-popup-close:hover {
            background: #e2e8f0;
            color: #334155;
        }
        .exit-popup-content {
            padding: 40px 36px;
        }
        .exit-popup-badge {
            display: inline-block;
            background: linear-gradient(135deg, #0d9488, #0f766e);
            color: white;
            font-size: 11px;
            font-weight: 700;
            padding: 6px 14px;
            border-radius: 50px;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
        }
        .exit-popup-headline {
            font-family: 'Merriweather', Georgia, serif;
            font-size: 28px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 8px 0;
            line-height: 1.3;
        }
        .exit-popup-subhead {
            font-size: 17px;
            color: #475569;
            margin: 0 0 24px 0;
            line-height: 1.5;
        }
        .exit-popup-hook {
            display: flex;
            gap: 14px;
            background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
            border: 1px solid #99f6e4;
            border-radius: 14px;
            padding: 18px;
            margin-bottom: 24px;
        }
        .exit-popup-icon {
            font-size: 28px;
            flex-shrink: 0;
        }
        .exit-popup-hook p {
            margin: 0;
            font-size: 15px;
            color: #134e4a;
            line-height: 1.5;
        }
        .exit-popup-benefits {
            list-style: none;
            padding: 0;
            margin: 0 0 28px 0;
        }
        .exit-popup-benefits li {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 15px;
            color: #334155;
            margin-bottom: 10px;
        }
        .exit-popup-benefits svg {
            width: 20px;
            height: 20px;
            color: #0d9488;
            flex-shrink: 0;
        }
        .exit-popup-cta {
            display: block;
            width: 100%;
            background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
            color: white !important;
            text-align: center;
            font-size: 18px;
            font-weight: 700;
            padding: 18px 24px;
            border-radius: 14px;
            text-decoration: none;
            box-shadow: 0 8px 20px -4px rgba(13, 148, 136, 0.4);
            transition: all 0.3s;
        }
        .exit-popup-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 28px -4px rgba(13, 148, 136, 0.5);
            color: white !important;
        }
        .exit-popup-note {
            text-align: center;
            font-size: 13px;
            color: #94a3b8;
            margin: 16px 0 0 0;
        }
        @media (max-width: 520px) {
            .exit-popup-content { padding: 32px 24px; }
            .exit-popup-headline { font-size: 24px; }
            .exit-popup-subhead { font-size: 15px; }
            .exit-popup-hook { flex-direction: column; gap: 10px; }
        }
    </style>`;

    document.body.insertAdjacentHTML('beforeend', popupHTML);

    let popupShown = false;

    window.showExitPopup = function() {
        if (popupShown) return;
        popupShown = true;
        sessionStorage.setItem('exitPopupShown', 'true');
        document.getElementById('exitPopup').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closeExitPopup = function() {
        document.getElementById('exitPopup').style.display = 'none';
        document.body.style.overflow = '';
        // Don't show again for 3 days
        const expiry = Date.now() + (3 * 24 * 60 * 60 * 1000);
        localStorage.setItem('exitPopupDismissed', expiry.toString());
    };

    // Exit intent detection (desktop) - triggers when mouse leaves top of window
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY < 0) {
            showExitPopup();
        }
    });

    // Backup: also detect mouseout near top
    document.addEventListener('mouseout', function(e) {
        if (!e.relatedTarget && !e.toElement && e.clientY < 10) {
            showExitPopup();
        }
    });

    // Scroll-based trigger for mobile - when user scrolls back up significantly
    let maxScroll = 0;
    let scrollTriggerEnabled = false;

    window.addEventListener('scroll', function() {
        const currentScroll = window.scrollY;

        // Enable after scrolling down 30% of viewport
        if (currentScroll > window.innerHeight * 0.3) {
            scrollTriggerEnabled = true;
            maxScroll = Math.max(maxScroll, currentScroll);
        }

        // Trigger if scrolling back up more than 50% of max scroll distance
        if (scrollTriggerEnabled && maxScroll > 300 && currentScroll < maxScroll * 0.5) {
            showExitPopup();
        }
    });

    // Also show after 20 seconds if still on page
    setTimeout(function() {
        showExitPopup();
    }, 20000);

    // Close on overlay click
    document.getElementById('exitPopup').addEventListener('click', function(e) {
        if (e.target === this) {
            closeExitPopup();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('exitPopup').style.display === 'flex') {
            closeExitPopup();
        }
    });
})();
