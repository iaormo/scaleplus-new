/* ============================================
   SCALEPLUS CRM SIGNUP — Form & Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- CRM Signup Form → GoHighLevel ---
    const signupForm = document.getElementById('crmSignupForm');
    const successOverlay = document.getElementById('signupSuccessOverlay');
    const successClose = document.getElementById('signupSuccessClose');

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

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = signupForm.querySelector('button[type="submit"]');
            const original = btn.innerHTML;
            btn.innerHTML = '<span>Creating Account...</span>';
            btn.disabled = true;

            const fd = new FormData(signupForm);
            const payload = {
                firstName: fd.get('firstName') || '',
                lastName: fd.get('lastName') || '',
                email: fd.get('email'),
                phone: fd.get('phone') || '',
                business: fd.get('business') || '',
                website: fd.get('website') || '',
                industry: fd.get('industry') || ''
            };

            try {
                const res = await fetch('/api/crm-signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json().catch(() => ({}));
                if (res.ok) {
                    signupForm.reset();
                    btn.innerHTML = original;
                    btn.style.background = '';
                    btn.disabled = false;
                    showSuccessOverlay();
                } else {
                    console.error('CRM signup error:', res.status, data);
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

    // --- Liquid card effect ---
    document.querySelectorAll('.liquid-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
            card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
        });
    });

    // --- Scroll Reveal ---
    function checkReveal() {
        document.querySelectorAll('.reveal').forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
                el.classList.add('visible');
            }
        });
    }
    window.addEventListener('scroll', checkReveal, { passive: true });
    checkReveal();
});
