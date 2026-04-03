(function () {
    'use strict';

    /* Brand marks use official-style 24×24 paths (currentColor = monochrome on theme) */
    var ICONS = {
        x: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
        linkedin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
        facebook: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
        link: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
        native: '<svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M176,200a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,200Zm40-80v48a16,16,0,0,1-16,16H176v16a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16V184H56a16,16,0,0,1-16-16V120A56.06,56.06,0,0,1,80,64.72V48a24,24,0,0,1,48,0V64.72A56.06,56.06,0,0,1,216,120ZM104,48a8,8,0,0,0,16,0V40a8,8,0,0,0-16,0Zm72,120H80v32h96Zm8-48a40,40,0,0,0-80-4.69A8,8,0,0,1,93.07,114,24,24,0,1,1,120,88.81V48a8,8,0,0,0,8-8,8,8,0,0,0-8,8V88.81A24,24,0,1,1,162.93,114a8,8,0,0,1-1.86,5.35A40,40,0,0,0,184,120Z"/></svg>'
    };

    var CANON_ORIGIN = 'https://scaleplus.io';

    function absolutize(href) {
        try {
            return new URL(href, window.location.href).href;
        } catch (e) {
            return href;
        }
    }

    /** Canonical HTTPS blog-post URL so previews and mobile shares match production. */
    function normalizeShareUrl(raw) {
        var base = typeof window !== 'undefined' && window.location && window.location.href
            ? window.location.href
            : CANON_ORIGIN + '/';
        var u;
        try {
            u = new URL(raw, base);
        } catch (e) {
            return raw;
        }
        var slug = u.searchParams.get('slug');
        if (slug && /blog-post/i.test(u.pathname)) {
            return CANON_ORIGIN + '/blog-post?slug=' + encodeURIComponent(slug);
        }
        if (u.protocol === 'http:' || u.protocol === 'https:') {
            return u.href;
        }
        if (slug) {
            return CANON_ORIGIN + '/blog-post?slug=' + encodeURIComponent(slug);
        }
        return u.href;
    }

    function canUseNativeShare(url) {
        if (typeof navigator.share !== 'function') return false;
        if (typeof navigator.canShare === 'function') {
            try {
                return navigator.canShare({ url: url });
            } catch (e) {
                return true;
            }
        }
        return true;
    }

    /**
     * Many mobile and in-app browsers block target="_blank" / window.open.
     * Always handle explicitly: try a new tab, then same-tab navigation.
     */
    function openShareDestination(href) {
        if (!href) return;
        var w = null;
        try {
            /* Do not pass noopener in the features string — it makes window.open return null
               in some browsers even when a tab opened, which would wrongly trigger same-tab fallback. */
            w = window.open(href, '_blank');
        } catch (e) {
            w = null;
        }
        if (!w) {
            window.location.assign(href);
        }
    }

    function buildBar(title, url) {
        url = normalizeShareUrl(absolutize(url));
        var encUrl = encodeURIComponent(url);
        var encTitle = encodeURIComponent(title);
        var tw = 'https://twitter.com/intent/tweet?text=' + encTitle + '&url=' + encUrl;
        var li = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encUrl;
        var fb = 'https://www.facebook.com/sharer/sharer.php?u=' + encUrl;
        var nativeFirst = canUseNativeShare(url);
        var actionsHtml = '';
        if (nativeFirst) {
            actionsHtml += '<button type="button" class="blog-share-btn blog-share-native" data-blog-native aria-label="Share via apps">' + ICONS.native + '</button>';
        }
        actionsHtml +=
            '<a class="blog-share-btn" href="' + tw + '" target="_blank" rel="noopener noreferrer" aria-label="Share on X">' + ICONS.x + '</a>' +
            '<a class="blog-share-btn" href="' + li + '" target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">' + ICONS.linkedin + '</a>' +
            '<a class="blog-share-btn" href="' + fb + '" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">' + ICONS.facebook + '</a>' +
            '<button type="button" class="blog-share-btn" data-blog-copy aria-label="Copy link">' + ICONS.link + '</button>';
        var wrap = document.createElement('div');
        wrap.className = 'blog-share';
        wrap.setAttribute('role', 'group');
        wrap.setAttribute('aria-label', 'Share this article');
        wrap.innerHTML =
            '<span class="blog-share-label">Share</span>' +
            '<div class="blog-share-actions">' + actionsHtml + '</div>';
        var copyBtn = wrap.querySelector('[data-blog-copy]');
        if (copyBtn) {
            copyBtn.addEventListener('click', function () {
                copyUrl(url, wrap);
            });
        }
        var nativeBtn = wrap.querySelector('[data-blog-native]');
        if (nativeBtn) {
            nativeBtn.addEventListener('click', function () {
                var payload = { title: title, text: title, url: url };
                navigator.share(payload).catch(function () {});
            });
        }
        wrap.querySelectorAll('a.blog-share-btn').forEach(function (a) {
            a.addEventListener('click', function (e) {
                var href = a.getAttribute('href');
                if (!href) return;
                e.preventDefault();
                openShareDestination(href);
            });
        });
        return wrap;
    }

    function copyUrl(url, hostEl) {
        function done(ok) {
            var btn = hostEl.querySelector('[data-blog-copy]');
            if (!btn) return;
            btn.classList.toggle('blog-share-btn--ok', ok);
            clearTimeout(btn._t);
            btn._t = setTimeout(function () { btn.classList.remove('blog-share-btn--ok'); }, 2000);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function () { done(true); }).catch(function () { fallbackCopy(url, done); });
        } else {
            fallbackCopy(url, done);
        }
    }

    function fallbackCopy(url, done) {
        var ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.top = '0';
        ta.style.left = '0';
        ta.style.width = '1px';
        ta.style.height = '1px';
        ta.style.padding = '0';
        ta.style.border = 'none';
        ta.style.opacity = '0';
        ta.style.fontSize = '16px';
        document.body.appendChild(ta);
        var isIOS = /ipad|iphone/i.test(navigator.userAgent);
        if (isIOS) {
            ta.readOnly = false;
        } else {
            ta.setAttribute('readonly', '');
        }
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, url.length);
        var ok = false;
        try {
            ok = document.execCommand('copy');
        } catch (e) {
            ok = false;
        }
        document.body.removeChild(ta);
        done(ok);
    }

    function mountCardShares() {
        document.querySelectorAll('.blog-card').forEach(function (card) {
            var link = card.querySelector('a.blog-card-link');
            var slot = card.querySelector('[data-blog-share]');
            if (!link || !slot) return;
            var url = absolutize(link.getAttribute('href'));
            var titleEl = link.querySelector('.blog-card-title');
            var title = titleEl ? titleEl.textContent.trim() : document.title;
            var bar = buildBar(title, url);
            slot.replaceWith(bar);
        });
    }

    function mountPostShare(title, url) {
        var slot = document.getElementById('postShare');
        if (!slot || !title || !url) return;
        slot.innerHTML = '';
        slot.appendChild(buildBar(title, url));
        slot.hidden = false;
    }

    window.BlogShare = {
        mountCardShares: mountCardShares,
        mountPostShare: mountPostShare,
        absolutize: absolutize
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountCardShares);
    } else {
        mountCardShares();
    }
})();
