/* ============================================
   SCALEPLUS CRM PAGE — Form & Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- CRM Form → GoHighLevel ---
    const crmForm = document.getElementById('crmForm');
    const successOverlay = document.getElementById('crmSuccessOverlay');
    const successClose = document.getElementById('crmSuccessClose');

    function showSuccessOverlay() {
        if (!successOverlay) return;
        successOverlay.style.display = 'flex';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                successOverlay.classList.add('active');
            });
        });
    }

    function hideSuccessOverlay() {
        if (!successOverlay) return;
        successOverlay.classList.remove('active');
        setTimeout(() => { successOverlay.style.display = 'none'; }, 500);
    }

    if (successClose) {
        successClose.addEventListener('click', hideSuccessOverlay);
    }

    if (crmForm) {
        crmForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = crmForm.querySelector('button[type="submit"]');
            const original = btn.innerHTML;
            btn.innerHTML = '<span>Sending...</span>';
            btn.disabled = true;

            const fd = new FormData(crmForm);
            const payload = {
                firstName: fd.get('firstName') || '',
                lastName: fd.get('lastName') || '',
                email: fd.get('email'),
                phone: fd.get('phone') || '',
                business: fd.get('business') || ''
            };

            try {
                const res = await fetch('/api/crm-lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    crmForm.reset();
                    btn.innerHTML = original;
                    btn.style.background = '';
                    btn.disabled = false;
                    showSuccessOverlay();
                } else {
                    btn.innerHTML = '<span>Something went wrong</span>';
                    btn.style.background = '#ef4444';
                    setTimeout(() => {
                        btn.innerHTML = original;
                        btn.style.background = '';
                        btn.disabled = false;
                    }, 3000);
                }
            } catch (err) {
                btn.innerHTML = '<span>Network error — try again</span>';
                btn.style.background = '#ef4444';
                setTimeout(() => {
                    btn.innerHTML = original;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }
        });
    }

    // --- Re-init liquid cards for CRM page dynamically added cards ---
    document.querySelectorAll('.liquid-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
            card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
        });
    });

    // --- Scroll Reveal for CRM page elements ---
    const crmRevealSelectors = [
        '.crm-features .service-card',
        '.crm-replaces .result-card',
        '.compare-table-wrap',
        '.crm-contact-section .contact-info',
        '.crm-contact-section .contact-form',
        '.crm-powered-by .powered-by-content',
        '.crm-comparison .section-header',
        '.crm-features .section-header',
        '.crm-replaces .section-header',
        '.crm-contact-section .section-header',
        '.cta-box'
    ];

    crmRevealSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach((el, i) => {
            if (!el.classList.contains('reveal')) {
                el.classList.add('reveal');
                if (i < 6) el.classList.add(`reveal-delay-${i + 1}`);
            }
        });
    });

    function checkReveal() {
        document.querySelectorAll('.reveal').forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
                el.classList.add('visible');
            }
        });
    }
    window.addEventListener('scroll', checkReveal, { passive: true });
    checkReveal();

    // --- 3D Tilt on CRM cards ---
    document.querySelectorAll('.crm-features .service-card, .crm-replaces .result-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            card.style.transform = `perspective(800px) rotateX(${(y - 0.5) * 6}deg) rotateY(${(x - 0.5) * -6}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    // --- Magnetic Button Effect for CRM page ---
    document.querySelectorAll('.crm-contact-section .liquid-btn, .cta-section .liquid-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
});
