const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env file if present (no dependency required)
try {
    const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val.length) process.env[key.trim()] = val.join('=').trim();
    });
} catch (e) { /* .env not found, use system env vars */ }

const PORT = process.env.PORT || 3000;
const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_TOKEN = process.env.GHL_TOKEN || '';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || '';
const GHL_AGENCY_TOKEN = process.env.GHL_AGENCY_TOKEN || '';
const GHL_COMPANY_ID = process.env.GHL_COMPANY_ID || '';

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.webp': 'image/webp'
};

function ghlRequest(method, apiPath, body, token) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : '';
        const options = {
            hostname: 'services.leadconnectorhq.com',
            path: apiPath,
            method,
            headers: {
                'Authorization': 'Bearer ' + (token || GHL_TOKEN),
                'Content-Type': 'application/json',
                'Version': '2021-07-28',
                'Accept': 'application/json'
            }
        };
        if (data) options.headers['Content-Length'] = Buffer.byteLength(data);
        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(responseBody); } catch (e) {}
                resolve({ status: res.statusCode, body: responseBody, json: parsed });
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

const server = http.createServer((req, res) => {
    // --- API proxy for contact form ---
    if (req.method === 'POST' && req.url === '/api/contact') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const form = JSON.parse(body);

                // Build clean GHL contact payload (no customFields)
                const contactPayload = {
                    locationId: GHL_LOCATION_ID,
                    firstName: form.firstName || '',
                    lastName: form.lastName || '',
                    email: form.email || '',
                    phone: form.phone || '',
                    tags: ['website-lead'],
                    source: 'ScalePlus Website'
                };

                // Add service as a tag if provided
                if (form.service) {
                    contactPayload.tags.push(form.service);
                }

                // Step 1: Create or update contact
                const contactRes = await ghlRequest('POST', '/contacts/upsert', contactPayload);
                console.log('GHL contact response:', contactRes.status, contactRes.body);

                if (contactRes.status !== 200 && contactRes.status !== 201) {
                    res.writeHead(contactRes.status, { 'Content-Type': 'application/json' });
                    res.end(contactRes.body);
                    return;
                }

                const contactId = contactRes.json && contactRes.json.contact && contactRes.json.contact.id;

                // Step 2: Add notes if provided and we got a contact ID
                if (contactId && form.notes) {
                    const noteBody = form.service
                        ? 'Service Needed: ' + form.service + '\n\n' + form.notes
                        : form.notes;
                    const noteRes = await ghlRequest('POST', '/contacts/' + contactId + '/notes', {
                        body: noteBody
                    });
                    console.log('GHL note response:', noteRes.status, noteRes.body);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                console.error('GHL proxy error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Server error' }));
            }
        });
        return;
    }

    // --- API proxy for CRM lead form ---
    if (req.method === 'POST' && req.url === '/api/crm-lead') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const form = JSON.parse(body);

                const contactPayload = {
                    locationId: GHL_LOCATION_ID,
                    firstName: form.firstName || '',
                    lastName: form.lastName || '',
                    email: form.email || '',
                    phone: form.phone || '',
                    companyName: form.business || '',
                    tags: ['crm-buyers'],
                    source: 'ScalePlus CRM Page'
                };

                const contactRes = await ghlRequest('POST', '/contacts/upsert', contactPayload);
                console.log('GHL CRM lead response:', contactRes.status, contactRes.body);

                if (contactRes.status !== 200 && contactRes.status !== 201) {
                    res.writeHead(contactRes.status, { 'Content-Type': 'application/json' });
                    res.end(contactRes.body);
                    return;
                }

                const contactId = contactRes.json && contactRes.json.contact && contactRes.json.contact.id;

                if (contactId && form.business) {
                    const noteBody = 'CRM Lead - Business: ' + form.business + '\nInterested in ScalePlus CRM platform.';
                    const noteRes = await ghlRequest('POST', '/contacts/' + contactId + '/notes', {
                        body: noteBody
                    });
                    console.log('GHL CRM note response:', noteRes.status, noteRes.body);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                console.error('GHL CRM proxy error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Server error' }));
            }
        });
        return;
    }

    // --- API proxy for CRM signup form ---
    if (req.method === 'POST' && req.url === '/api/crm-signup') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const form = JSON.parse(body);

                // Calculate trial expiry: 14 days from now
                const trialExpiry = new Date();
                trialExpiry.setDate(trialExpiry.getDate() + 14);
                const trialExpiryStr = trialExpiry.toISOString().split('T')[0];

                const businessName = form.business || ((form.firstName || '') + ' ' + (form.lastName || '')).trim() + ' Business';

                // Step 1: Create contact in main location with trial tags
                console.log('=== CRM SIGNUP START ===');
                console.log('GHL_TOKEN set:', GHL_TOKEN ? 'YES (' + GHL_TOKEN.substring(0, 15) + '...)' : 'MISSING');
                console.log('GHL_LOCATION_ID:', GHL_LOCATION_ID || 'MISSING');

                const contactPayload = {
                    locationId: GHL_LOCATION_ID,
                    firstName: form.firstName || '',
                    lastName: form.lastName || '',
                    email: form.email || '',
                    phone: form.phone || '',
                    companyName: businessName,
                    website: form.website || '',
                    tags: ['crm-signup', 'free-trial', form.industry || 'unknown-industry'],
                    source: 'ScalePlus CRM Signup Page'
                };
                console.log('Contact payload:', JSON.stringify(contactPayload));

                const contactRes = await ghlRequest('POST', '/contacts/upsert', contactPayload);
                console.log('GHL CRM signup contact response:', contactRes.status, contactRes.body);

                if (contactRes.status !== 200 && contactRes.status !== 201) {
                    console.error('GHL contact creation FAILED:', contactRes.status, contactRes.body);
                    res.writeHead(contactRes.status || 500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to create contact', details: contactRes.json }));
                    return;
                }

                const contactId = contactRes.json && contactRes.json.contact && contactRes.json.contact.id;

                // Step 2: Add note with trial info
                if (contactId) {
                    const noteBody = 'CRM Signup — FREE TRIAL (14 days)\n' +
                        'Trial Expiry: ' + trialExpiryStr + '\n' +
                        'Business: ' + businessName + '\n' +
                        'Industry: ' + (form.industry || 'N/A') + '\n' +
                        'Website: ' + (form.website || 'N/A');
                    const noteRes = await ghlRequest('POST', '/contacts/' + contactId + '/notes', {
                        body: noteBody
                    });
                    console.log('GHL note response:', noteRes.status, noteRes.body);
                }

                // Step 3: Send email notification to admin
                try {
                    const emailBody = JSON.stringify({
                        locationId: GHL_LOCATION_ID,
                        contactId: contactId,
                        type: 'Email',
                        emailTo: 'ian@scaleplus.io',
                        subject: 'New CRM Trial Signup — ' + businessName,
                        body: '<h2>New CRM Signup</h2>' +
                            '<p><strong>Business:</strong> ' + businessName + '</p>' +
                            '<p><strong>Name:</strong> ' + (form.firstName || '') + ' ' + (form.lastName || '') + '</p>' +
                            '<p><strong>Email:</strong> ' + (form.email || '') + '</p>' +
                            '<p><strong>Phone:</strong> ' + (form.phone || '') + '</p>' +
                            '<p><strong>Industry:</strong> ' + (form.industry || 'N/A') + '</p>' +
                            '<p><strong>Website:</strong> ' + (form.website || 'N/A') + '</p>' +
                            '<p><strong>Trial Expiry:</strong> ' + trialExpiryStr + '</p>' +
                            '<hr><p><strong>ACTION:</strong> Create a sub-account in GHL for this customer and send them their login credentials.</p>',
                        html: '<h2>New CRM Signup</h2>' +
                            '<p><strong>Business:</strong> ' + businessName + '</p>' +
                            '<p><strong>Name:</strong> ' + (form.firstName || '') + ' ' + (form.lastName || '') + '</p>' +
                            '<p><strong>Email:</strong> ' + (form.email || '') + '</p>' +
                            '<p><strong>Phone:</strong> ' + (form.phone || '') + '</p>' +
                            '<p><strong>Industry:</strong> ' + (form.industry || 'N/A') + '</p>' +
                            '<p><strong>Website:</strong> ' + (form.website || 'N/A') + '</p>' +
                            '<p><strong>Trial Expiry:</strong> ' + trialExpiryStr + '</p>' +
                            '<hr><p><strong>ACTION:</strong> Create a sub-account in GHL for this customer and send them their login credentials.</p>'
                    });
                    const emailReq = https.request({
                        hostname: 'services.leadconnectorhq.com',
                        path: '/conversations/messages',
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + GHL_TOKEN,
                            'Content-Type': 'application/json',
                            'Version': '2021-07-28',
                            'Accept': 'application/json',
                            'Content-Length': Buffer.byteLength(emailBody)
                        }
                    }, (emailRes) => {
                        let eBody = '';
                        emailRes.on('data', chunk => eBody += chunk);
                        emailRes.on('end', () => console.log('Email notification response:', emailRes.statusCode, eBody));
                    });
                    emailReq.on('error', (e) => console.error('Email notification error:', e.message));
                    emailReq.write(emailBody);
                    emailReq.end();
                    console.log('Email notification triggered for ian@scaleplus.io');
                } catch (emailErr) {
                    console.error('Email notification error (non-blocking):', emailErr.message);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, contactId: contactId }));
            } catch (err) {
                console.error('GHL CRM signup error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Server error' }));
            }
        });
        return;
    }

    // --- Dynamic OG card PNG (blog share previews) ---
    const siteOrigin = process.env.PUBLIC_SITE_URL || 'https://scaleplus.io';
    const host = req.headers.host || 'localhost';
    const forwardedProto = req.headers['x-forwarded-proto'];
    const proto = forwardedProto === 'https' || forwardedProto === 'http' ? forwardedProto : 'http';

    let parsedUrl;
    try {
        parsedUrl = new URL(req.url, `${proto}://${host}`);
    } catch (e) {
        parsedUrl = null;
    }

    if (parsedUrl && req.method === 'GET' && parsedUrl.pathname === '/og/blog-card.png') {
        const ogBlog = require('./og-blog-card');
        const slug = parsedUrl.searchParams.get('slug') || '';
        let buf = slug ? ogBlog.renderBlogOgPng(slug) : null;
        if (!buf) {
            const fp = ogBlog.getFallbackPngPath();
            if (fp) buf = fs.readFileSync(fp);
        }
        if (buf) {
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=86400'
            });
            res.end(buf);
            return;
        }
        res.writeHead(404);
        res.end('Not found');
        return;
    }

    // --- Static files ---
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = filePath.split('?')[0];
    // Route /crm to crm.html
    if (filePath === '/crm') filePath = '/crm.html';
    if (filePath === '/crm-signup') filePath = '/crm-signup.html';
    if (filePath === '/case-study') filePath = '/case-study.html';
    if (filePath === '/blog') filePath = '/blog.html';
    if (filePath === '/blog-post') filePath = '/blog-post.html';
    if (filePath === '/privacy') filePath = '/privacy.html';
    if (filePath === '/terms') filePath = '/terms.html';
    const fullPath = path.join(__dirname, filePath);
    const ext = path.extname(fullPath).toLowerCase();

    if (parsedUrl && req.method === 'GET' && filePath === '/blog-post.html') {
        const slug = parsedUrl.searchParams.get('slug');
        fs.readFile(fullPath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Server Error');
                return;
            }
            const ogBlog = require('./og-blog-card');
            const html = ogBlog.injectBlogPostHtml(data.toString('utf8'), slug, siteOrigin);
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            res.end(html);
        });
        return;
    }

    fs.readFile(fullPath, (err, data) => {
        if (err) {
            fs.readFile(path.join(__dirname, 'index.html'), (err2, fallback) => {
                if (err2) {
                    res.writeHead(500);
                    res.end('Server Error');
                    return;
                }
                res.writeHead(200, {
                    'Content-Type': 'text/html',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                });
                res.end(fallback);
            });
            return;
        }
        // No cache in development; for production, set longer cache headers
        const cacheHeader = 'no-cache, no-store, must-revalidate';

        res.writeHead(200, {
            'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
            'Cache-Control': cacheHeader
        });
        res.end(data);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
