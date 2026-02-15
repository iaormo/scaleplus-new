/* ============================================
   SCALEPLUS — Interactions, Particles & FX
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

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

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateGlow() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        if (cursorGlow) {
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
        }
        requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // --- Liquid Card Effect ---
    document.querySelectorAll('.liquid-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
            card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
        });
    });

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

    // --- Counter Animation ---
    const statNumbers = document.querySelectorAll('.stat-number');
    let counterAnimated = false;

    function animateCounters() {
        if (counterAnimated) return;
        const heroStats = document.querySelector('.hero-stats');
        if (!heroStats) return;
        if (heroStats.getBoundingClientRect().top < window.innerHeight * 0.9) {
            counterAnimated = true;
            statNumbers.forEach(num => {
                const target = parseInt(num.getAttribute('data-count'));
                const duration = 2000;
                const start = performance.now();
                function tick(now) {
                    const progress = Math.min((now - start) / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3);
                    num.textContent = Math.floor(target * ease);
                    if (progress < 1) requestAnimationFrame(tick);
                    else num.textContent = target;
                }
                requestAnimationFrame(tick);
            });
        }
    }
    window.addEventListener('scroll', animateCounters, { passive: true });
    animateCounters();

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
        '.section-header', '.cta-box', '.portfolio-card'
    ];

    revealSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach((el, i) => {
            el.classList.add('reveal');
            if (i < 6) el.classList.add(`reveal-delay-${i + 1}`);
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

    // --- Contact Form → GoHighLevel ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const original = btn.innerHTML;
            btn.innerHTML = '<span>Sending...</span>';
            btn.disabled = true;

            const formData = new FormData(contactForm);

            const service = formData.get('service') || '';
            const notes = (formData.get('notes') || '').trim();

            const payload = {
                firstName: formData.get('firstName') || '',
                lastName: formData.get('lastName') || '',
                email: formData.get('email'),
                phone: formData.get('phone') || '',
                tags: ['website-lead'],
                source: 'ScalePlus Website',
                customFields: []
            };

            if (service) {
                payload.customFields.push({ key: 'service_needed', field_value: service });
            }
            if (notes) {
                payload.customFields.push({ key: 'notes', field_value: notes });
            }

            try {
                const res = await fetch('https://services.leadconnectorhq.com/contacts/', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer pit-ae349e92-1fa6-4656-ae9d-b015d2ba2de3',
                        'Content-Type': 'application/json',
                        'Version': '2021-07-28'
                    },
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

    // --- Magnetic Button Effect ---
    document.querySelectorAll('.liquid-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });

    // --- 3D Tilt on Cards ---
    document.querySelectorAll('.service-card, .result-card, .portfolio-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            card.style.transform = `perspective(800px) rotateX(${(y - 0.5) * 6}deg) rotateY(${(x - 0.5) * -6}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

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
});
