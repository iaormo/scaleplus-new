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

                // Step 1: Create sub-account (location) via Agency API
                const businessName = form.business || ((form.firstName || '') + ' ' + (form.lastName || '')).trim() + ' Business';
                const locationPayload = {
                    companyId: GHL_COMPANY_ID,
                    name: businessName,
                    email: form.email || '',
                    phone: form.phone || '',
                    website: form.website || '',
                    settings: {
                        allowDuplicateContact: false,
                        allowDuplicateOpportunity: false,
                        allowFacebookNameMerge: false
                    }
                };

                console.log('Creating GHL sub-account:', JSON.stringify(locationPayload));
                const locRes = await ghlRequest('POST', '/locations', locationPayload, GHL_AGENCY_TOKEN);
                console.log('GHL sub-account response:', locRes.status, locRes.body);

                if (locRes.status !== 200 && locRes.status !== 201) {
                    res.writeHead(locRes.status, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to create sub-account', details: locRes.json }));
                    return;
                }

                const newLocationId = locRes.json && (locRes.json.id || (locRes.json.location && locRes.json.location.id));

                // Step 2: Create user in the new sub-account (triggers GHL welcome/invite email)
                if (newLocationId) {
                    const userPayload = {
                        firstName: form.firstName || '',
                        lastName: form.lastName || '',
                        email: form.email || '',
                        phone: form.phone || '',
                        type: 'account',
                        role: 'admin',
                        locationIds: [newLocationId],
                        permissions: {
                            campaignsEnabled: true,
                            campaignsReadOnly: false,
                            contactsEnabled: true,
                            workflowsEnabled: true,
                            triggersEnabled: true,
                            funnelsEnabled: true,
                            websitesEnabled: true,
                            opportunitiesEnabled: true,
                            dashboardStatsEnabled: true,
                            bulkRequestsEnabled: true,
                            appointmentsEnabled: true,
                            reviewsEnabled: true,
                            onlineListingsEnabled: true,
                            phoneCallEnabled: true,
                            conversationsEnabled: true,
                            assignedDataOnly: false,
                            adwordsReportingEnabled: false,
                            membershipEnabled: false,
                            facebookAdsReportingEnabled: false,
                            attributionsReportingEnabled: false,
                            settingsEnabled: true,
                            tagsEnabled: true,
                            leadValueEnabled: true,
                            marketingEnabled: true,
                            agentReportingEnabled: true,
                            botService: false,
                            socialPlanner: false,
                            bloggingEnabled: false,
                            invoiceEnabled: true,
                            affiliateManagerEnabled: false,
                            contentAiEnabled: false,
                            refundsEnabled: false,
                            recordPaymentEnabled: true,
                            cancelSubscriptionEnabled: false,
                            paymentsEnabled: true,
                            communitiesEnabled: false,
                            exportPaymentsEnabled: false
                        }
                    };

                    const userRes = await ghlRequest('POST', '/users/', userPayload, GHL_AGENCY_TOKEN);
                    console.log('GHL user creation response:', userRes.status, userRes.body);
                }

                // Step 3: Create contact in the agency's main location (for lead tracking)
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

                const contactRes = await ghlRequest('POST', '/contacts/upsert', contactPayload);
                console.log('GHL contact response:', contactRes.status, contactRes.body);

                const contactId = contactRes.json && contactRes.json.contact && contactRes.json.contact.id;

                // Step 4: Add note with trial info and sub-account reference
                if (contactId) {
                    const noteBody = 'CRM Signup — FREE TRIAL (14 days)\n' +
                        'Sub-Account ID: ' + (newLocationId || 'N/A') + '\n' +
                        'Trial Expiry: ' + trialExpiryStr + '\n' +
                        'Business: ' + businessName + '\n' +
                        'Industry: ' + (form.industry || 'N/A') + '\n' +
                        'Website: ' + (form.website || 'N/A') + '\n\n' +
                        'ACTION REQUIRED: If tag is still "free-trial" (not changed to "subscriber") after ' + trialExpiryStr + ', remove sub-account access.';
                    const noteRes = await ghlRequest('POST', '/contacts/' + contactId + '/notes', {
                        body: noteBody
                    });
                    console.log('GHL note response:', noteRes.status, noteRes.body);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, locationId: newLocationId }));
            } catch (err) {
                console.error('GHL CRM signup error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Server error' }));
            }
        });
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
