/* ============================================
   SCALEPLUS — Shared Newsletter Popup
   Injects modal + styles, fires after 60s or on exit intent.
   Replaces the legacy "Free Automation Audit" popup site-wide.
   ============================================ */

(function () {
  'use strict';

  if (window.__scaleplusNewsletterInit) return;
  window.__scaleplusNewsletterInit = true;

  const SUBSCRIBED_KEY = 'scaleplus_newsletter_subscribed';
  const DISMISSED_KEY = 'scaleplus_newsletter_dismissed_at';
  const COOLDOWN_DAYS = 7;
  const DELAY_MS = 60 * 1000;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function alreadyHandled() {
    try {
      if (localStorage.getItem(SUBSCRIBED_KEY) === '1') return true;
      const dismissedAt = parseInt(localStorage.getItem(DISMISSED_KEY) || '0', 10);
      if (dismissedAt && Date.now() - dismissedAt < COOLDOWN_DAYS * 86400 * 1000) return true;
    } catch (_) { /* storage blocked — proceed */ }
    return false;
  }

  function injectStyles() {
    if (document.getElementById('nl-popup-styles')) return;
    const css = `
      .nl-modal{position:fixed;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;pointer-events:none;transition:opacity .25s cubic-bezier(.16,1,.3,1);font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;}
      .nl-modal[hidden]{display:none;}
      .nl-modal.is-open{opacity:1;pointer-events:auto;}
      .nl-backdrop{position:absolute;inset:0;background:rgba(5,5,5,.72);backdrop-filter:blur(12px) saturate(140%);-webkit-backdrop-filter:blur(12px) saturate(140%);}
      .nl-dialog{position:relative;width:100%;max-width:520px;padding:44px 40px 36px;border-radius:24px;background:linear-gradient(135deg,rgba(168,85,247,.14),rgba(168,85,247,.04)),rgba(13,13,13,.85);border:1px solid rgba(168,85,247,.25);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 24px 80px rgba(0,0,0,.6),0 0 60px rgba(168,85,247,.12);transform:translateY(14px) scale(.98);opacity:0;transition:transform .35s cubic-bezier(.34,1.56,.64,1),opacity .25s cubic-bezier(.16,1,.3,1);overflow:hidden;color:#f5f5f5;}
      .nl-modal.is-open .nl-dialog{transform:translateY(0) scale(1);opacity:1;}
      @supports not (backdrop-filter: blur(10px)){.nl-dialog{background:rgba(13,13,13,.98);}.nl-backdrop{background:rgba(5,5,5,.92);}}
      .nl-orb{position:absolute;top:-60px;right:-60px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(168,85,247,.35),transparent 70%);filter:blur(40px);pointer-events:none;}
      .nl-close{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.06);color:#888;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .25s;z-index:2;}
      .nl-close:hover{color:#f5f5f5;background:rgba(255,255,255,.08);border-color:rgba(168,85,247,.4);}
      .nl-eyebrow{font-family:'JetBrains Mono',monospace;font-size:.8125rem;color:#c084fc;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;display:inline-block;position:relative;z-index:1;}
      .nl-title{position:relative;z-index:1;font-size:clamp(1.625rem,3vw,2rem);font-weight:900;line-height:1.15;letter-spacing:-.8px;margin:0 0 14px;color:#f5f5f5;}
      .nl-title-grad{background:linear-gradient(90deg,#c084fc,#a855f7,#e879f9,#7c3aed,#c084fc);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:nlGrad 4s ease-in-out infinite;filter:drop-shadow(0 0 30px rgba(168,85,247,.3));}
      @keyframes nlGrad{0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
      .nl-sub{position:relative;z-index:1;font-size:.9375rem;color:#888;line-height:1.65;margin:0 0 24px;}
      .nl-form{position:relative;z-index:1;display:flex;flex-direction:column;gap:10px;margin:0;}
      .nl-field input{width:100%;background:rgba(5,5,5,.55);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:14px 16px;font:500 .9375rem/1.3 'Inter',sans-serif;color:#f5f5f5;min-height:48px;transition:all .2s;box-sizing:border-box;}
      .nl-field input::placeholder{color:#555;}
      .nl-field input:hover{border-color:rgba(255,255,255,.14);}
      .nl-field input:focus{outline:none;border-color:rgba(168,85,247,.5);box-shadow:0 0 0 3px rgba(168,85,247,.15);background:rgba(5,5,5,.75);}
      .nl-submit{margin-top:4px;width:100%;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:50px;padding:14px 28px;border-radius:12px;font:600 .9375rem/1 'Inter',sans-serif;background:#a855f7;color:#fff;border:none;cursor:pointer;transition:all .3s cubic-bezier(.16,1,.3,1);box-shadow:0 0 15px rgba(168,85,247,.4),0 0 30px rgba(168,85,247,.15);}
      .nl-submit:hover:not(:disabled){background:#7c3aed;transform:translateY(-1px);box-shadow:0 0 20px rgba(168,85,247,.6),0 0 50px rgba(168,85,247,.3),0 0 80px rgba(168,85,247,.1);}
      .nl-submit:disabled{opacity:.7;cursor:wait;}
      .nl-feedback{font-size:.8125rem;line-height:1.5;min-height:1em;margin:4px 0 0;color:#555;}
      .nl-feedback.is-error{color:#f87171;}
      .nl-feedback.is-success{color:#4ade80;}
      .nl-fineprint{position:relative;z-index:1;font-size:.75rem;color:#555;line-height:1.6;margin:18px 0 0;text-align:center;}
      .nl-fineprint a{color:#888;text-decoration:underline;text-decoration-color:rgba(255,255,255,.2);}
      .nl-fineprint a:hover{color:#c084fc;}
      @media (max-width:560px){.nl-dialog{padding:36px 24px 28px;border-radius:20px;}.nl-title{font-size:1.5rem;}}
      @media (prefers-reduced-motion: reduce){.nl-modal,.nl-dialog{transition:none;}.nl-title-grad{animation:none;}}
    `;
    const style = document.createElement('style');
    style.id = 'nl-popup-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function injectMarkup() {
    if (document.getElementById('nlModal')) return document.getElementById('nlModal');
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="nl-modal" id="nlModal" role="dialog" aria-modal="true" aria-labelledby="nlTitle" aria-describedby="nlSub" hidden>
        <div class="nl-backdrop" data-nl-close></div>
        <div class="nl-dialog" role="document">
          <button class="nl-close" type="button" data-nl-close aria-label="Close newsletter signup">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
          <div class="nl-orb" aria-hidden="true"></div>
          <span class="nl-eyebrow">Free &middot; No spam</span>
          <h2 class="nl-title" id="nlTitle">Join the <span class="nl-title-grad">ScalePlus newsletter</span>.</h2>
          <p class="nl-sub" id="nlSub">One email a week: free tools we build, practical AI and automation strategy, and business news worth your time. Unsubscribe any time.</p>
          <form class="nl-form" id="nlForm" novalidate>
            <div class="nl-field">
              <input type="text" name="firstName" id="nlFirstName" placeholder="First name (optional)" autocomplete="given-name" maxlength="80">
            </div>
            <div class="nl-field">
              <input type="email" name="email" id="nlEmail" placeholder="you@yourbusiness.com" autocomplete="email" required inputmode="email">
            </div>
            <button type="submit" class="nl-submit" id="nlSubmit">
              <span class="nl-submit-label">Subscribe</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
            <p class="nl-feedback" id="nlFeedback" role="status" aria-live="polite"></p>
          </form>
          <p class="nl-fineprint">We use <a href="/privacy.html">your email</a> only to send the newsletter. No selling, no sharing, no dark patterns.</p>
        </div>
      </div>
    `;
    const modal = wrap.firstElementChild;
    document.body.appendChild(modal);
    return modal;
  }

  function init() {
    if (alreadyHandled()) return;
    injectStyles();
    const modal = injectMarkup();
    const form = modal.querySelector('#nlForm');
    const submitBtn = modal.querySelector('#nlSubmit');
    const submitLabel = submitBtn.querySelector('.nl-submit-label');
    const feedback = modal.querySelector('#nlFeedback');
    const emailInput = modal.querySelector('#nlEmail');

    let shown = false;
    let lastFocused = null;

    function open() {
      if (shown) return;
      shown = true;
      lastFocused = document.activeElement;
      modal.hidden = false;
      void modal.offsetWidth;
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => emailInput.focus({ preventScroll: true }), 250);
    }

    function close(dismissed) {
      if (!shown) return;
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { modal.hidden = true; }, 250);
      if (dismissed) {
        try { localStorage.setItem(DISMISSED_KEY, String(Date.now())); } catch (_) {}
      }
      lastFocused?.focus?.();
    }

    const timer = setTimeout(open, DELAY_MS);
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !shown) { clearTimeout(timer); open(); }
    });

    modal.querySelectorAll('[data-nl-close]').forEach((el) => {
      el.addEventListener('click', () => close(true));
    });
    modal.querySelector('.nl-close').addEventListener('click', () => close(true));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && shown) close(true); });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const firstName = modal.querySelector('#nlFirstName').value.trim();
      feedback.textContent = '';
      feedback.className = 'nl-feedback';

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        feedback.textContent = 'Please enter a valid email address.';
        feedback.classList.add('is-error');
        emailInput.focus();
        return;
      }

      submitBtn.disabled = true;
      submitLabel.textContent = 'Sending…';

      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, firstName })
        });
        if (!res.ok) throw new Error('Subscribe failed');
        try { localStorage.setItem(SUBSCRIBED_KEY, '1'); } catch (_) {}
        submitLabel.textContent = "You're in ✓";
        feedback.textContent = 'Thanks! Check your inbox — the first email lands this week.';
        feedback.classList.add('is-success');
        setTimeout(() => close(false), 2200);
      } catch (err) {
        submitBtn.disabled = false;
        submitLabel.textContent = 'Subscribe';
        feedback.textContent = 'Hmm, something broke. Try again in a second.';
        feedback.classList.add('is-error');
      }
    });
  }

  ready(init);
})();
