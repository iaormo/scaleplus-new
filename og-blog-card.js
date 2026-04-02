/**
 * Renders blog-style Open Graph images (1200×630 PNG) from blog-og.json.
 * Uses bundled Inter + JetBrains Mono so resvg renders reliably on Linux (not system-ui stacks).
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
    const words = String(text).trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = '';
    for (const w of words) {
        const word = w.length > maxChars ? w.slice(0, Math.max(1, maxChars - 1)) + '…' : w;
        const trial = cur ? cur + ' ' + word : word;
        if (trial.length <= maxChars) {
            cur = trial;
        } else {
            if (cur) {
                lines.push(cur);
                if (lines.length >= maxLines) return lines;
            }
            cur = word.length > maxChars ? word.slice(0, Math.max(1, maxChars - 1)) + '…' : word;
        }
    }
    if (cur && lines.length < maxLines) lines.push(cur);
    return lines.slice(0, maxLines);
}

function getOgFontFiles() {
    try {
        const interRoot = path.dirname(require.resolve('@fontsource/inter/package.json'));
        const jbRoot = path.dirname(require.resolve('@fontsource/jetbrains-mono/package.json'));
        return [
            path.join(interRoot, 'files/inter-latin-400-normal.woff2'),
            path.join(interRoot, 'files/inter-latin-600-normal.woff2'),
            path.join(interRoot, 'files/inter-latin-700-normal.woff2'),
            path.join(jbRoot, 'files/jetbrains-mono-latin-400-normal.woff2'),
            path.join(jbRoot, 'files/jetbrains-mono-latin-500-normal.woff2')
        ].filter((p) => fs.existsSync(p));
    } catch (e) {
        return [];
    }
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
    const padX = 72;
    const accent = post.accent;

    const tLen = post.title.length;
    let titleFont = 40;
    let titleMaxChars = 36;
    if (tLen > 85) {
        titleFont = 34;
        titleMaxChars = 42;
    }
    if (tLen > 120) {
        titleFont = 30;
        titleMaxChars = 48;
    }
    if (tLen > 160) {
        titleFont = 26;
        titleMaxChars = 54;
    }

    const titleLines = wrapLines(post.title, titleMaxChars, 4);
    const descLines = wrapLines(post.description, 76, 3);

    const cat = escapeXml(post.category);
    const dateStr = escapeXml(post.dateDisplay);
    const pillPadX = 16;
    const pillH = 40;
    const pillY = 96;
    const pillX = padX;
    const catCharW = 8.2;
    const pillW = Math.ceil(post.category.length * catCharW + pillPadX * 2);
    const pillR = pillH / 2;
    const metaMidY = pillY + pillH / 2;
    const dateX = pillX + pillW + 20;

    const titleLineGap = Math.round(titleFont * 1.2);
    let titleTop = pillY + pillH + 36;
    const titleBlocks = titleLines.map((line, i) => {
        const y = titleTop + i * titleLineGap;
        return `<text x="${padX}" y="${y}" fill="#f5f5f5" font-family="Inter" font-size="${titleFont}" font-weight="700" dominant-baseline="hanging">${escapeXml(line)}</text>`;
    }).join('\n  ');

    const descTop = titleTop + titleLines.length * titleLineGap + 28;
    const descFont = 21;
    const descLineGap = Math.round(descFont * 1.35);
    const descBlocks = descLines.map((line, i) => {
        const y = descTop + i * descLineGap;
        return `<text x="${padX}" y="${y}" fill="#a1a1aa" font-family="Inter" font-size="${descFont}" font-weight="400" dominant-baseline="hanging">${escapeXml(line)}</text>`;
    }).join('\n  ');

    const footerY = Math.min(H - 40, descTop + descLines.length * descLineGap + 36);

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#050505"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${accent}"/>
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="20" ry="20" fill="#0a0a0a" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>
  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillR}" ry="${pillR}" fill="rgba(168,85,247,0.16)" stroke="rgba(168,85,247,0.5)" stroke-width="1"/>
  <text x="${pillX + pillPadX}" y="${metaMidY}" fill="#e9d5ff" font-family="JetBrains Mono" font-size="12" font-weight="500" letter-spacing="0.14em" dominant-baseline="middle">${cat}</text>
  <text x="${dateX}" y="${metaMidY}" fill="#737373" font-family="JetBrains Mono" font-size="13" font-weight="400" dominant-baseline="middle">${dateStr}</text>
  ${titleBlocks}
  ${descBlocks}
  <text x="${padX}" y="${footerY}" fill="#c084fc" font-family="Inter" font-size="18" font-weight="600" dominant-baseline="middle">Read article &#8594;</text>
</svg>`;
}

function renderBlogOgPng(slug) {
    const post = getPost(slug);
    if (!post || !Resvg) return null;
    const svg = buildSvg(post);
    const fontFiles = getOgFontFiles();
    const font = {
        loadSystemFonts: true,
        defaultFontFamily: 'Inter',
        sansSerifFamily: 'Inter',
        monospaceFamily: 'JetBrains Mono'
    };
    if (fontFiles.length) {
        font.fontFiles = fontFiles;
    }
    try {
        const resvg = new Resvg(svg, {
            font,
            textRendering: 2,
            shapeRendering: 2,
            dpi: 144,
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
