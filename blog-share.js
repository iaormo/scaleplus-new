(function () {
    'use strict';

    /* Brand marks use official-style 24×24 paths (currentColor = monochrome on theme) */
    var ICONS = {
        x: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
        linkedin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
        facebook: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
        link: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>'
    };

    function absolutize(href) {
        try {
            return new URL(href, window.location.href).href;
        } catch (e) {
            return href;
        }
    }

    function buildBar(title, url) {
        var encUrl = encodeURIComponent(url);
        var encTitle = encodeURIComponent(title);
        var tw = 'https://twitter.com/intent/tweet?text=' + encTitle + '&url=' + encUrl;
        var li = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encUrl;
        var fb = 'https://www.facebook.com/sharer/sharer.php?u=' + encUrl;
        var wrap = document.createElement('div');
        wrap.className = 'blog-share';
        wrap.setAttribute('role', 'group');
        wrap.setAttribute('aria-label', 'Share this article');
        wrap.innerHTML =
            '<span class="blog-share-label">Share</span>' +
            '<div class="blog-share-actions">' +
            '<a class="blog-share-btn" href="' + tw + '" target="_blank" rel="noopener noreferrer" aria-label="Share on X">' + ICONS.x + '</a>' +
            '<a class="blog-share-btn" href="' + li + '" target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">' + ICONS.linkedin + '</a>' +
            '<a class="blog-share-btn" href="' + fb + '" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">' + ICONS.facebook + '</a>' +
            '<button type="button" class="blog-share-btn" data-blog-copy aria-label="Copy link">' + ICONS.link + '</button>' +
            '</div>';
        wrap.querySelector('[data-blog-copy]').addEventListener('click', function () {
            copyUrl(url, wrap);
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
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            done(true);
        } catch (e) {
            done(false);
        }
        document.body.removeChild(ta);
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
