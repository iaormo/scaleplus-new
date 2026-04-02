/**
 * Renders blog listing-style Open Graph images (1200×630 PNG) from blog-og.json.
 * Matches on-site card: top accent bar, category pill, date, title, excerpt, Read Article →
 */
const fs = require('fs');
const path = require('path');

let Resvg;
try {
    Resvg = require('@resvg/resvg-js').Resvg;
} catch (e) {
    Resvg = null;
}

let ogDataCache = null;

function loadOgData() {
    if (!ogDataCache) {
        const p = path.join(__dirname, 'blog-og.json');
        ogDataCache = JSON.parse(fs.readFileSync(p, 'utf8'));
    }
    return ogDataCache;
}

function escapeXml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function wrapLines(text, maxChars, maxLines) {
    const words = String(text).split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = '';
    for (const w of words) {
        const piece = w.length > maxChars ? w.slice(0, maxChars - 1) + '…' : w;
        const next = cur ? cur + ' ' + piece : piece;
        if (next.length <= maxChars) {
            cur = next;
        } else {
            if (cur) lines.push(cur);
            if (lines.length >= maxLines) break;
            cur = piece;
        }
    }
    if (cur && lines.length < maxLines) lines.push(cur);
    if (lines.length > maxLines) lines.length = maxLines;
    if (words.length && lines.length === maxLines) {
        const joined = lines.join(' ');
        if (joined.length < text.replace(/\s+/g, ' ').trim().length - 2) {
            let last = lines[maxLines - 1];
            if (last.length > maxChars - 1) last = last.slice(0, maxChars - 3);
            if (!last.endsWith('…')) last += '…';
            lines[maxLines - 1] = last;
        }
    }
    return lines;
}

function getPost(slug) {
    const data = loadOgData();
    const post = data.posts && data.posts[slug];
    if (!post) return null;
    return {
        title: post.title,
        description: post.description,
        category: (post.category || 'Blog').toUpperCase(),
        dateDisplay: post.dateDisplay || '',
        accent: post.accent || '#06b6d4'
    };
}

function buildSvg(post) {
    const W = 1200;
    const H = 630;
    const accent = post.accent;
    const cat = escapeXml(post.category);
    const dateStr = escapeXml(post.dateDisplay);
    const titleLines = wrapLines(post.title, 36, 4);
    const descLines = wrapLines(post.description, 82, 3);

    const pillPadX = 14;
    const catTextW = Math.max(post.category.length * 7.8 + pillPadX * 2, 88);
    const pillX = 52;
    const pillY = 54;
    const pillH = 34;
    const pillR = 17;
    const dateX = pillX + catTextW + 20;

    let titleY = 138;
    const titleLineH = 46;
    const titleBlocks = titleLines.map((line, i) => {
        const y = titleY + i * titleLineH;
        return `<text x="52" y="${y}" fill="#f5f5f5" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="38" font-weight="700" letter-spacing="-0.02em">${escapeXml(line)}</text>`;
    }).join('\n');

    const descStartY = titleY + titleLines.length * titleLineH + 28;
    const descLineH = 32;
    const descBlocks = descLines.map((line, i) => {
        const y = descStartY + i * descLineH;
        return `<text x="52" y="${y}" fill="#a3a3a3" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="22" font-weight="400">${escapeXml(line)}</text>`;
    }).join('\n');

    const readMoreY = Math.min(H - 48, descStartY + descLines.length * descLineH + 44);

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0d0d0d"/>
      <stop offset="100%" stop-color="#050505"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#000000"/>
  <rect x="36" y="28" width="${W - 72}" height="${H - 56}" rx="22" ry="22" fill="url(#cardBg)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <rect x="36" y="28" width="${W - 72}" height="4" rx="2" fill="${accent}"/>
  <rect x="${pillX}" y="${pillY}" width="${catTextW}" height="${pillH}" rx="${pillR}" fill="rgba(168,85,247,0.14)" stroke="rgba(168,85,247,0.45)" stroke-width="1"/>
  <text x="${pillX + pillPadX}" y="${pillY + 23}" fill="#c084fc" font-family="ui-monospace, 'Cascadia Code', 'Consolas', monospace" font-size="12" font-weight="600" letter-spacing="0.12em">${cat}</text>
  <text x="${dateX}" y="${pillY + 23}" fill="#737373" font-family="ui-monospace, 'Cascadia Code', 'Consolas', monospace" font-size="13" font-weight="400">${dateStr}</text>
  ${titleBlocks}
  ${descBlocks}
  <text x="52" y="${readMoreY}" fill="#a855f7" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="18" font-weight="600">Read Article →</text>
</svg>`;
}

function renderBlogOgPng(slug) {
    const post = getPost(slug);
    if (!post || !Resvg) return null;
    const svg = buildSvg(post);
    try {
        const resvg = new Resvg(svg, {
            fitTo: { mode: 'width', value: 1200 }
        });
        return resvg.render().asPng();
    } catch (e) {
        console.error('og-blog-card render error:', e.message);
        return null;
    }
}

function getFallbackPngPath() {
    const candidates = [
        path.join(__dirname, 'og-image.png'),
        path.join(__dirname, 'assets', 'blog-og-fallback.png')
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

function escapeHtmlAttr(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;');
}

const DEFAULT_DESC = 'Expert insights on business automation, AI chatbots, workflow optimization, CRM integration, and scaling strategies from ScalePlus.';

function injectBlogPostHtml(html, slug, siteOrigin) {
    const data = slug && getPost(slug);
    const title = data ? data.title : 'ScalePlus Blog';
    const desc = data && data.description ? data.description : DEFAULT_DESC;
    const canon = slug
        ? `${siteOrigin}/blog-post?slug=${encodeURIComponent(slug)}`
        : `${siteOrigin}/blog-post`;
    const img = data
        ? `${siteOrigin}/og/blog-card.png?slug=${encodeURIComponent(slug)}`
        : `${siteOrigin}/og-image.png`;

    html = html.replace('<title>Blog | ScalePlus</title>', `<title>${escapeHtmlAttr(title)} | ScalePlus Blog</title>`);
    html = html.replace(
        /<meta name="description" content="[^"]*">/,
        `<meta name="description" content="${escapeHtmlAttr(desc)}">`
    );

    const ogType = data ? 'article' : 'website';
    const block = `
    <link rel="canonical" href="${escapeHtmlAttr(canon)}">
    <meta property="og:type" content="${ogType}">
    <meta property="og:site_name" content="ScalePlus">
    <meta property="og:title" content="${escapeHtmlAttr(title)}">
    <meta property="og:description" content="${escapeHtmlAttr(desc)}">
    <meta property="og:url" content="${escapeHtmlAttr(canon)}">
    <meta property="og:image" content="${escapeHtmlAttr(img)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeHtmlAttr(title)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtmlAttr(title)}">
    <meta name="twitter:description" content="${escapeHtmlAttr(desc)}">
    <meta name="twitter:image" content="${escapeHtmlAttr(img)}">`;

    if (html.includes('<!--scaleplus-og-->')) {
        html = html.replace('<!--scaleplus-og-->', block);
    } else {
        html = html.replace(
            /<meta name="theme-color" content="[^"]*">/,
            (m) => m + block
        );
    }
    return html;
}

module.exports = {
    loadOgData,
    getPost,
    renderBlogOgPng,
    getFallbackPngPath,
    escapeXml,
    injectBlogPostHtml
};
