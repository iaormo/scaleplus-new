# ScalePlus.io — Full Website Audit Report
**Date:** March 22, 2026 | **Auditor:** Ian James | **Standard:** International UX/UI Best Practices

---

## CRITICAL ISSUES (Fix Immediately)

### 1. Invisible Content — Scroll Reveal Animation Bug
**Severity: CRITICAL** — This is the #1 issue killing your conversions right now.

When scrolling down the site, most sections appear as completely blank black screens. The services cards, process steps, results, portfolio, testimonials, FAQ, and contact sections are all invisible until the browser viewport happens to cross the exact trigger threshold.

**Root Cause:** The `script.js` adds a `.reveal` class to elements (setting them to `opacity: 0; transform: translateY(40px)`), and a scroll listener is supposed to add `.visible` when they enter the viewport. However, the trigger threshold (`window.innerHeight * 0.88`) combined with large section padding (`120px` top and bottom) means users scroll through massive black voids before content appears — if it appears at all.

**What customers experience:** They see the hero section, scroll down, and hit a wall of nothing. Most will assume the site is broken and leave within 3-5 seconds.

**Fix:** Either remove the reveal animation entirely or add a fallback that shows content after a timeout. At minimum, change the trigger to `0.95` or use IntersectionObserver with `rootMargin: "100px"` so content is visible before it enters the viewport.

---

### 2. Counter Animation is Misleading and Broken
**Severity: HIGH**

The hero stats (249+ Businesses Automated, 30+ Hours Saved Weekly, 98% Client Satisfaction) use a rolling counter animation that continuously cycles from 0 → target → 0 → target in an infinite loop. When I loaded the page, I saw numbers like "19", "2", and "7%" which look underwhelming and dishonest.

A customer arriving on the site sees "2+ Hours Saved Weekly" and thinks — that's it? The counter is mid-animation, rolling between values. This completely undermines your credibility.

**Fix:** Remove the cycling animation. Animate the counter once from 0 to the target number when first visible, then stop. Use `IntersectionObserver` to trigger only once.

---

### 3. "6 12mo" Text in About Section
**Severity: HIGH**

The floating card in the About section shows "6 12mo" with the label "Average ROI". This looks like a broken display. It should probably read "6-12mo" (with a hyphen/dash). As-is, it erodes trust — customers will think the site was built carelessly.

---

### 4. API Token Exposed in Server Code
**Severity: CRITICAL (Security)**

Your `server.js` has a hardcoded GoHighLevel API token (`pit-ae349e92-...`) and location ID directly in the source. If this repo is ever public or the server source is exposed, someone could access your GHL account, read all contacts, and modify your CRM data.

**Fix:** Move tokens to environment variables immediately: `process.env.GHL_TOKEN` and `process.env.GHL_LOCATION_ID`.

---

## DESIGN & VISUAL HIERARCHY

### 5. No Real Images or Photography Anywhere
**Severity: HIGH**

The entire site is text, icons, and CSS effects. There are zero photos of: your team, your office, real client results, dashboards, actual project screenshots, or anything tangible. From a customer's perspective, this feels like a template — not a real business.

International standards (Apple, Stripe, HubSpot, etc.) all mix high-quality photography with clean design. You need at least: a team photo in the About section, actual screenshots/mockups in the Portfolio section, and real client photos in testimonials.

### 6. Testimonials Use Fake-Looking Initials Instead of Real People
**Severity: HIGH**

All testimonial author avatars are just colored circles with initials like "MD", "OM", "BO". The names are generic titles like "Marketing Director" and "Business Owner" with no company names. Some have locations ("Sydney, Australia"), some don't. One says "Business Owner" as both the title AND the location.

Customers immediately recognize templated testimonials. Either use real names with permission, link to Google/Clutch reviews, or add video testimonials.

### 7. Dark Theme Lacks Visual Contrast
**Severity: MEDIUM**

The `--text-secondary: #888888` on `--bg-primary: #050505` only achieves about a 5.5:1 contrast ratio, which barely passes WCAG AA. But `--text-muted: #555555` on that same black background is only about 3:1, which fails accessibility standards. All section subtitles, stat labels, and secondary descriptions are hard to read.

### 8. Too Many Decorative Elements Competing for Attention
**Severity: MEDIUM**

The site simultaneously runs: particle canvas, cursor glow, flying icons, aurora gradient, floating orbs, spinning rings, scanline overlay, glitch text effect, liquid card mouse-follow, magnetic buttons, and 3D tilt on cards. This is excessive even by creative agency standards.

From a customer POV, these effects don't add clarity — they add visual noise and slow down the page. Leading SaaS/agency sites (Linear, Vercel, Webflow) use 1-2 signature effects, not 10+.

---

## ANIMATIONS & INTERACTIONS

### 9. Popup Fires Too Aggressively
**Severity: MEDIUM**

The promo popup ("Get Your Free Automation Audit") fires after just 10 seconds. The user hasn't even had time to read the hero section or understand what you do. International best practice is either exit-intent popups or time-delayed popups after 30-60 seconds when the user has shown engagement (scrolled past 50%, etc.).

### 10. No Loading State or Skeleton Screens
**Severity: MEDIUM**

When the page first loads, everything animates in with staggered delays (100ms to 1000ms for the hero alone). Combined with the font loading from Google Fonts, there's visible FOUC (Flash of Unstyled Content). Best practice is to either preload critical fonts or show skeleton placeholders.

### 11. Magnetic Button Effect Can Cause Misclicks
**Severity: LOW**

The `.liquid-btn` magnetic effect moves buttons 15% of cursor distance. On mobile-adjacent devices (small laptops, tablets), this can make the CTA button literally move away from the user's cursor, causing frustration.

---

## CONTENT & MESSAGING (Customer POV)

### 12. Hero Headline is Generic
**Severity: MEDIUM**

"Automate Your Business. Scale Without Limits." could be any automation company on Earth. It doesn't communicate what makes ScalePlus different. Compare this to competitors who lead with specific outcomes like "Cut your customer response time from hours to seconds" or "Replace 12 tools with one dashboard."

### 13. No Pricing Transparency
**Severity: HIGH**

There is zero pricing information anywhere on the site. The FAQ question "How much does automation cost?" gives a vague non-answer about "range" and "free audit." International best practice (especially for SMB-targeted services in the Philippines market) is to show at least starting-at pricing or pricing tiers. Visitors who can't find pricing leave.

### 14. No Case Studies with Measurable Results
**Severity: HIGH**

The Portfolio section shows industry categories (Beauty Lounge, Construction, Real Estate, Massage Chain) with flowcharts and generic stats like "45% More bookings" and "3x Productivity." But there are no actual case studies — no company names, no before/after data, no timelines, no screenshots of the actual work.

### 15. Social Proof Links Are All Dead
**Severity: HIGH**

Footer social links (Facebook, LinkedIn, Instagram, Twitter/X) all point to `#` — meaning they go nowhere. This is a red flag for any customer checking legitimacy. Either add real social links or remove them entirely.

### 16. Missing Trust Signals
**Severity: HIGH**

The site is missing standard trust signals that international customers expect: client logos, partner badges (Google Partner, Meta Partner, etc.), industry certifications, number of years in business, physical address, privacy policy, and terms of service.

### 17. CRM Page Has No Demo or Video
**Severity: MEDIUM**

The CRM product page lists features and a comparison table but has no interactive demo, product screenshots, or video walkthrough. Customers evaluating CRM tools expect to see the actual interface before signing up for a trial.

---

## TECHNICAL / SEO / PERFORMANCE

### 18. No Caching Headers for Production
**Severity: MEDIUM**

The server.js sets `Cache-Control: no-cache, no-store, must-revalidate` for ALL files including CSS, JS, images, and fonts. This means every page visit re-downloads everything. For production, static assets should have long cache headers with cache-busting filenames.

### 19. No CSS/JS Minification or Bundling
**Severity: MEDIUM**

All CSS and JS are served as unminified source files. The main `style.css` alone is 1700+ lines. For international performance standards (Core Web Vitals), these should be minified and combined.

### 20. Single-Thread Node.js Server with No Error Handling
**Severity: HIGH**

The server is a raw `http.createServer` with no rate limiting, no CORS headers, no request body size limits, no helmet-style security headers, and no process crash recovery. Any malformed request could crash the server.

### 21. Schema.org Markup is Minimal
**Severity: LOW**

Only basic Organization schema is implemented. Missing: LocalBusiness schema (since you target Philippines), Service schema for each offering, FAQ schema (which would give you rich snippets in Google), and Review schema for testimonials.

### 22. Meta Keywords Tag is Outdated
**Severity: LOW**

The `<meta name="keywords">` tag has been ignored by Google since 2009. It takes up space and adds nothing to SEO. Remove it.

### 23. No Sitemap.xml or Robots.txt
**Severity: MEDIUM**

Standard SEO requirements that are missing. These help search engines discover and index your pages properly.

---

## MOBILE RESPONSIVENESS

### 24. Services Grid Doesn't Center Odd Items
**Severity: LOW**

With 3 service cards on desktop, the CSS comment mentions centering the last row for 5 cards, but the actual implementation doesn't handle 3 cards going to 2 columns on tablet — the third card sits alone left-aligned instead of centered.

### 25. Contact Form Could Be Tighter on Mobile
**Severity: LOW**

The form fields and overall padding could be more compact on mobile. The 120px section padding is excessive on small screens (reduced to 80px but still generous).

---

## QUICK-WIN RECOMMENDATIONS (Do This Week)

1. **Fix the reveal animation** — make content visible by default with a CSS-only fallback
2. **Fix the counter** — animate once, don't cycle
3. **Fix "6 12mo"** → "6-12mo"
4. **Move API tokens** to environment variables
5. **Add real social media links** or remove them from the footer
6. **Add a privacy policy page** — required by law in most countries
7. **Add caching headers** for static assets

## MEDIUM-TERM IMPROVEMENTS (This Month)

1. Add real photography (team, projects, clients)
2. Replace template testimonials with real ones (names, companies, photos)
3. Add at least one detailed case study with screenshots
4. Add starting-at pricing or pricing tiers
5. Add client logos / trust badges
6. Reduce decorative effects to 2-3 max
7. Implement FAQ schema for SEO
8. Add sitemap.xml and robots.txt

## LONG-TERM (Next Quarter)

1. Add a blog for content marketing and SEO
2. Build interactive CRM demo or video walkthrough
3. Add live chat widget
4. Implement A/B testing on hero copy and CTA
5. Add multi-language support (English + Filipino)
6. Consider a complete performance rewrite (Astro, Next.js, or similar)

---

*Report generated March 22, 2026*
