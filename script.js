/* ============================================
   SCALEPLUS — Interactions, Particles & FX
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    const useFinePointerEffects = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // --- Flying Particle System ---
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let w, h;
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 25 : 60;

        function resizeCanvas() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.3 + 0.05;
                this.pulse = Math.random() * Math.PI * 2;
                this.pulseSpeed = Math.random() * 0.02 + 0.005;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.pulse += this.pulseSpeed;
                if (this.x < -10 || this.x > w + 10 || this.y < -10 || this.y > h + 10) {
                    this.reset();
                    this.x = Math.random() < 0.5 ? -5 : w + 5;
                }
            }
            draw() {
                const alpha = this.opacity * (0.5 + 0.5 * Math.sin(this.pulse));
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
                ctx.fill();
                // Glow
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(168, 85, 247, ${alpha * 0.15})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Draw connection lines between nearby particles
        function drawLines() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        const alpha = (1 - dist / 150) * 0.06;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => { p.update(); p.draw(); });
            if (!isMobile) drawLines();
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // --- Cursor Glow Follow ---
    const cursorGlow = document.getElementById('cursorGlow');
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    if (useFinePointerEffects) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
    }

    function animateGlow() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        if (cursorGlow) {
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
        }
        requestAnimationFrame(animateGlow);
    }
    if (cursorGlow && useFinePointerEffects) {
        animateGlow();
    }

    // --- Liquid Card Effect (mouse / trackpad only; touch uses CSS fallback) ---
    if (useFinePointerEffects) {
        document.querySelectorAll('.liquid-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
                card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
            });
        });
    }

    // --- Navbar Scroll ---
    const navbar = document.getElementById('navbar');
    function handleNavScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // --- Mobile Nav Toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        const isActive = navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // --- Counter Animation (animate once, then stop) ---
    const statNumbers = document.querySelectorAll('.stat-number');
    let counterStarted = false;

    function animateNumber(el, target, duration) {
        let start = null;
        function tick(ts) {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3); // ease-out cubic
            el.textContent = Math.round(target * ease);
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        }
        requestAnimationFrame(tick);
    }

    function startCounters() {
        if (counterStarted) return;
        const heroStats = document.querySelector('.hero-stats');
        if (!heroStats) return;
        if (heroStats.getBoundingClientRect().top < window.innerHeight * 0.95) {
            counterStarted = true;
            statNumbers.forEach(num => {
                const target = parseInt(num.getAttribute('data-count'));
                animateNumber(num, target, 2000);
            });
            window.removeEventListener('scroll', startCounters);
        }
    }
    window.addEventListener('scroll', startCounters, { passive: true });
    startCounters();

    // --- FAQ Accordion ---
    document.querySelectorAll('.faq-item').forEach(item => {
        const btn = item.querySelector('.faq-question');
        btn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            if (!isActive) {
                item.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // --- Scroll Reveal ---
    const revealSelectors = [
        '.service-card', '.process-step', '.result-card',
        '.testimonial-card', '.faq-item', '.about-content',
        '.about-visual', '.contact-info', '.contact-form',
        '.section-header', '.cta-box', '.portfolio-card',
        '.roi-inputs', '.roi-result-card', '.roi-payback'
    ];

    revealSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach((el, i) => {
            el.classList.add('reveal');
            if (i < 6) el.classList.add(`reveal-delay-${i + 1}`);
        });
    });

    // Use IntersectionObserver for reliable reveal (fires once per element)
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px 80px 0px', threshold: 0.01 });

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    } else {
        // Fallback: show everything immediately
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }

    // --- Card Tilt Effect (desktop / fine pointer only) ---
    if (useFinePointerEffects) {
        document.querySelectorAll('.service-card, .result-card, .pricing-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${y * -6}deg) translateY(-4px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // --- Parallax Sections (subtle background shift on scroll) ---
    const parallaxEls = document.querySelectorAll('.hero-orb, .about-orb, .cta-orb');
    if (parallaxEls.length) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const sy = window.scrollY;
                    parallaxEls.forEach(el => {
                        const speed = 0.03;
                        el.style.transform = `translateY(${sy * speed}px)`;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // --- Contact Form → GoHighLevel ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Pre-select "Suggest a Tool" + prime the notes box when coming from /scaletools
        (function applySuggestToolIntent() {
            try {
                const params = new URLSearchParams(window.location.search);
                if (params.get('suggest') !== 'tool') return;
                const serviceSelect = contactForm.querySelector('[name="service"]');
                if (serviceSelect) {
                    const opt = Array.from(serviceSelect.options).find(o => o.value === 'Suggest a Tool');
                    if (opt) serviceSelect.value = 'Suggest a Tool';
                }
                const notes = contactForm.querySelector('[name="notes"]');
                if (notes && !notes.value) {
                    notes.placeholder = "Tell us about the tool you'd love us to build...";
                }
                contactForm.dataset.intent = 'suggest-a-tool';
                // Smooth-scroll to contact after paint
                setTimeout(() => {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } catch (_) { /* noop */ }
        })();

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const original = btn.innerHTML;
            btn.innerHTML = '<span>Sending...</span>';
            btn.disabled = true;

            const formData = new FormData(contactForm);
            const service = formData.get('service') || '';

            // Build tags based on intent + service
            const tags = [];
            if (contactForm.dataset.intent === 'suggest-a-tool' || service === 'Suggest a Tool') {
                tags.push('suggest-a-tool');
                tags.push('scaletools');
            }

            const payload = {
                firstName: formData.get('firstName') || '',
                lastName: formData.get('lastName') || '',
                email: formData.get('email'),
                phone: formData.get('phone') || '',
                service: service,
                notes: (formData.get('notes') || '').trim(),
                tags: tags,
                source: tags.includes('suggest-a-tool') ? 'ScaleTools — Suggest a Tool' : undefined
            };

            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    btn.innerHTML = '<span>Message Sent!</span>';
                    btn.style.background = '#22c55e';
                    contactForm.reset();
                } else {
                    btn.innerHTML = '<span>Something went wrong</span>';
                    btn.style.background = '#ef4444';
                }
            } catch (err) {
                btn.innerHTML = '<span>Network error — try again</span>';
                btn.style.background = '#ef4444';
            }

            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
        });
    }

    // --- Active Nav Highlight ---
    const sections = document.querySelectorAll('section[id]');
    function highlightNav() {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollY >= top && scrollY < top + height) {
                document.querySelectorAll('.nav-links a').forEach(a => {
                    a.style.color = '';
                    if (a.getAttribute('href') === '#' + id) a.style.color = 'var(--purple-light)';
                });
            }
        });
    }
    window.addEventListener('scroll', highlightNav, { passive: true });

    // --- Magnetic Button Effect (fine pointer only) ---
    if (useFinePointerEffects) {
        document.querySelectorAll('.liquid-btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    }

    // --- 3D Tilt on portfolio (fine pointer only; service/result handled above) ---
    if (useFinePointerEffects) {
        document.querySelectorAll('.portfolio-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                card.style.transform = `perspective(800px) rotateX(${(y - 0.5) * 6}deg) rotateY(${(x - 0.5) * -6}deg) translateY(-4px)`;
            });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; });
        });
    }

    // --- Parallax Orbs ---
    const orbs = document.querySelectorAll('.hero-orb');
    window.addEventListener('scroll', () => {
        const sy = window.scrollY;
        orbs.forEach((orb, i) => {
            orb.style.transform = `translateY(${sy * (i + 1) * 0.15}px)`;
        });
    }, { passive: true });

    // --- Hero Staggered Entrance ---
    const staggerEls = [
        { sel: '.hero-badge', delay: 100 },
        { sel: '.hero-title', delay: 300 },
        { sel: '.hero-subtitle', delay: 600 },
        { sel: '.hero-ctas', delay: 800 },
        { sel: '.hero-stats', delay: 1000 }
    ];

    staggerEls.forEach(({ sel, delay }) => {
        const el = document.querySelector(sel);
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(25px)';
            setTimeout(() => {
                el.style.transition = 'opacity 1s ease, transform 1s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, delay);
        }
    });

    // --- Typewriter Effect for Hero Badge ---
    const badge = document.querySelector('.hero-badge');
    if (badge) {
        const textNode = Array.from(badge.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
        if (textNode) {
            const fullText = textNode.textContent.trim();
            textNode.textContent = '';
            let charIdx = 0;
            setTimeout(() => {
                const typeInterval = setInterval(() => {
                    textNode.textContent = fullText.slice(0, ++charIdx);
                    if (charIdx >= fullText.length) clearInterval(typeInterval);
                }, 50);
            }, 500);
        }
    }

    // --- Flowchart Stagger Entrance ---
    const flowcharts = document.querySelectorAll('.flowchart');
    const flowchartAnimated = new Set();

    function animateFlowcharts() {
        flowcharts.forEach(fc => {
            if (flowchartAnimated.has(fc)) return;
            if (fc.getBoundingClientRect().top < window.innerHeight * 0.9) {
                flowchartAnimated.add(fc);
                const children = fc.children;
                Array.from(children).forEach((child, i) => {
                    child.style.opacity = '0';
                    child.style.transform = 'translateY(12px)';
                    setTimeout(() => {
                        child.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                    }, i * 120);
                });
            }
        });
    }
    window.addEventListener('scroll', animateFlowcharts, { passive: true });
    animateFlowcharts();

    // --- Testimonials Stack (pointer capture + window listeners so touch / pen swipes work) ---
    (function initTestimonialStack() {
        const stack = document.getElementById('testimonialsStack');
        if (!stack) return;
        const cards = Array.from(stack.querySelectorAll('.testimonial-card'));
        const dots = document.querySelectorAll('.tst-dot');
        const prevBtn = document.getElementById('tstPrev');
        const nextBtn = document.getElementById('tstNext');
        const total = cards.length;
        let current = 0;
        let startX = 0;
        let startY = 0;
        let deltaX = 0;
        let dragging = false;
        let activePointerId = null;
        let autoTimer;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function front() {
            return cards.find(c => c.getAttribute('data-pos') === '0');
        }

        function arrange() {
            stack.classList.remove('is-dragging');
            cards.forEach((card, i) => {
                const pos = (i - current + total) % total;
                card.setAttribute('data-pos', pos);
                card.classList.remove('swiping');
                card.style.transform = '';
            });
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
            const h = cards[current].offsetHeight + 50;
            stack.style.height = h + 'px';
        }

        function goTo(idx) {
            current = ((idx % total) + total) % total;
            arrange();
        }
        function next() { goTo(current + 1); }
        function prev() { goTo(current - 1); }

        function resetAuto() {
            clearInterval(autoTimer);
            if (!reduceMotion) {
                autoTimer = setInterval(next, 6000);
            }
        }

        function swipeThreshold(e) {
            return e.pointerType === 'touch' ? 48 : 60;
        }

        function rotationFactor(e) {
            return e.pointerType === 'touch' ? 0.025 : 0.04;
        }

        function onPointerMove(e) {
            if (!dragging || e.pointerId !== activePointerId) return;
            deltaX = e.clientX - startX;
            const dy = e.clientY - startY;
            if (e.cancelable && Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(dy) * 0.85) {
                e.preventDefault();
            }
            const card = front();
            if (card) {
                const rot = deltaX * rotationFactor(e);
                card.style.transform = `translateX(${deltaX}px) rotate(${rot}deg)`;
            }
        }

        function onPointerEnd(e) {
            if (!dragging || e.pointerId !== activePointerId) return;
            dragging = false;
            activePointerId = null;
            stack.classList.remove('is-dragging');
            window.removeEventListener('pointermove', onPointerMove, true);
            window.removeEventListener('pointerup', onPointerEnd, true);
            window.removeEventListener('pointercancel', onPointerEnd, true);

            const card = front();
            if (card) card.classList.remove('swiping');

            const th = swipeThreshold(e);
            if (Math.abs(deltaX) > th) {
                deltaX > 0 ? prev() : next();
                resetAuto();
            } else {
                arrange();
            }
        }

        prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
        nextBtn.addEventListener('click', () => { next(); resetAuto(); });
        dots.forEach(d => d.addEventListener('click', () => {
            goTo(parseInt(d.dataset.slide, 10));
            resetAuto();
        }));

        stack.addEventListener('pointerdown', e => {
            const card = front();
            if (!card || !card.contains(e.target)) return;
            if (e.target.closest('a')) return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;

            dragging = true;
            activePointerId = e.pointerId;
            startX = e.clientX;
            startY = e.clientY;
            deltaX = 0;
            card.classList.add('swiping');
            stack.classList.add('is-dragging');

            window.addEventListener('pointermove', onPointerMove, { capture: true, passive: false });
            window.addEventListener('pointerup', onPointerEnd, { capture: true });
            window.addEventListener('pointercancel', onPointerEnd, { capture: true });
        });

        arrange();
        resetAuto();
    })();

    // --- ROI Calculator ---
    (function initROICalc() {
        const sliders = {
            employees:  document.getElementById('roiEmployees'),
            rate:       document.getElementById('roiHourlyRate'),
            hours:      document.getElementById('roiHoursWasted'),
            investment: document.getElementById('roiInvestment')
        };
        if (!sliders.employees) return;

        const vals = {
            employees:  document.getElementById('roiEmployeesVal'),
            rate:       document.getElementById('roiHourlyRateVal'),
            hours:      document.getElementById('roiHoursWastedVal'),
            investment: document.getElementById('roiInvestmentVal')
        };
        const out = {
            hoursSaved:      document.getElementById('roiHoursSaved'),
            monthlySavings:  document.getElementById('roiMonthlySavings'),
            annualSavings:   document.getElementById('roiAnnualSavings'),
            roi:             document.getElementById('roiROI'),
            payback:         document.getElementById('roiPayback')
        };
        const currencySelect = document.getElementById('roiCurrency');

        // Approximate USD conversion rates — good enough for a directional ROI estimate.
        const CURRENCIES = {
            USD: { symbol: '$',   rate: 1,    locale: 'en-US' },
            PHP: { symbol: '₱',   rate: 56,   locale: 'en-PH' },
            EUR: { symbol: '€',   rate: 0.92, locale: 'de-DE' },
            GBP: { symbol: '£',   rate: 0.79, locale: 'en-GB' },
            AUD: { symbol: 'A$',  rate: 1.52, locale: 'en-AU' },
            CAD: { symbol: 'C$',  rate: 1.36, locale: 'en-CA' },
            SGD: { symbol: 'S$',  rate: 1.35, locale: 'en-SG' },
            MYR: { symbol: 'RM',  rate: 4.5,  locale: 'ms-MY' },
            AED: { symbol: 'AED ', rate: 3.67, locale: 'en-AE' },
            INR: { symbol: '₹',   rate: 83,   locale: 'en-IN' }
        };

        // USD-native slider bounds; all currencies scale from this.
        const BASE = {
            rate:       { min: 10,  max: 150,   step: 5,   default: 25 },
            investment: { min: 499, max: 15000, step: 100, default: 999 }
        };

        let currency = CURRENCIES.USD;

        function niceRound(n, step) {
            return Math.max(step, Math.round(n / step) * step);
        }

        function fmt(n) { return Math.round(n).toLocaleString(currency.locale); }
        function fmtMoney(n) { return currency.symbol + fmt(n); }

        function applyCurrencyToSliders(prevRate) {
            // Capture current USD-equivalent values BEFORE mutating min/max
            // (browsers auto-clamp slider.value when min/max change).
            const currentRateUSD = prevRate ? parseFloat(sliders.rate.value) / prevRate : BASE.rate.default;
            const currentInvUSD = prevRate ? parseFloat(sliders.investment.value) / prevRate : BASE.investment.default;

            // Rate slider
            const rateStep = niceRound(BASE.rate.step * currency.rate, 1) || 1;
            const rateMin = niceRound(BASE.rate.min * currency.rate, rateStep);
            const rateMax = niceRound(BASE.rate.max * currency.rate, rateStep);
            const rateTarget = niceRound(currentRateUSD * currency.rate, rateStep);
            // Set value OUT OF BOUNDS first so it can land inside the new range without clamping glitches.
            sliders.rate.min = rateMin;
            sliders.rate.max = rateMax;
            sliders.rate.step = rateStep;
            sliders.rate.value = Math.max(rateMin, Math.min(rateMax, rateTarget));

            // Investment slider
            const invStep = niceRound(BASE.investment.step * currency.rate, 1) || 1;
            const invMin = niceRound(BASE.investment.min * currency.rate, invStep);
            const invMax = niceRound(BASE.investment.max * currency.rate, invStep);
            const invTarget = niceRound(currentInvUSD * currency.rate, invStep);
            sliders.investment.min = invMin;
            sliders.investment.max = invMax;
            sliders.investment.step = invStep;
            sliders.investment.value = Math.max(invMin, Math.min(invMax, invTarget));
        }

        function paintSlider(slider) {
            const pct = (slider.value - slider.min) / (slider.max - slider.min) * 100;
            slider.style.background = `linear-gradient(90deg, var(--purple-dark) ${pct}%, var(--border-subtle) ${pct}%)`;
        }

        function animateNumber(el, target, prefix, suffix) {
            const current = parseFloat(el.textContent.replace(/[^0-9.-]/g, '')) || 0;
            if (current === target) return;
            const diff = target - current;
            const steps = 12;
            let step = 0;
            const tick = () => {
                step++;
                const progress = step / steps;
                const eased = 1 - Math.pow(1 - progress, 3);
                const val = Math.round(current + diff * eased);
                el.textContent = (prefix || '') + fmt(val) + (suffix || '');
                if (step < steps) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }

        function calc() {
            const e = parseInt(sliders.employees.value);
            const r = parseFloat(sliders.rate.value);
            const h = parseInt(sliders.hours.value);
            const inv = parseFloat(sliders.investment.value);

            vals.employees.textContent = e;
            vals.rate.textContent = fmtMoney(r);
            vals.hours.textContent = h;
            vals.investment.textContent = fmtMoney(inv);

            Object.values(sliders).forEach(paintSlider);

            const automationRate = 0.7;
            const hoursSavedWeekly = e * h * automationRate;
            const hoursSavedMonthly = Math.round(hoursSavedWeekly * 4.33);
            const monthlySavings = Math.round(hoursSavedWeekly * r * 4.33);
            const annualSavings = monthlySavings * 12;
            const roi = Math.round((annualSavings - inv) / inv * 100);
            const paybackMonths = inv / Math.max(1, monthlySavings);

            animateNumber(out.hoursSaved, hoursSavedMonthly, '', '');
            animateNumber(out.monthlySavings, monthlySavings, currency.symbol, '');
            animateNumber(out.annualSavings, annualSavings, currency.symbol, '');

            const roiEl = out.roi;
            const roiTarget = roi;
            const roiCurrent = parseInt(roiEl.textContent.replace(/[^0-9.-]/g, '')) || 0;
            const roiDiff = roiTarget - roiCurrent;
            let rs = 0;
            const roiTick = () => {
                rs++;
                const p = 1 - Math.pow(1 - rs / 12, 3);
                roiEl.textContent = fmt(Math.round(roiCurrent + roiDiff * p)) + '%';
                if (rs < 12) requestAnimationFrame(roiTick);
            };
            requestAnimationFrame(roiTick);

            if (paybackMonths < 1) {
                out.payback.textContent = '~' + Math.round(paybackMonths * 30) + ' days';
            } else {
                out.payback.textContent = '~' + paybackMonths.toFixed(1) + ' months';
            }
        }

        function setCurrency(code) {
            const next = CURRENCIES[code];
            if (!next) return;
            const prevRate = currency.rate;
            currency = next;
            applyCurrencyToSliders(prevRate);
            calc();
        }

        currencySelect?.addEventListener('change', (e) => setCurrency(e.target.value));

        // Initial state: match USD defaults, paint sliders
        applyCurrencyToSliders(null);
        Object.values(sliders).forEach(s => {
            s.addEventListener('input', calc);
            paintSlider(s);
        });
        calc();
    })();
});
