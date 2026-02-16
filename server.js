const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_TOKEN = 'pit-ae349e92-1fa6-4656-ae9d-b015d2ba2de3';
const GHL_LOCATION_ID = 'GfDBeSbJmjBtcqGK6vXN';

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

function ghlRequest(method, apiPath, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : '';
        const options = {
            hostname: 'services.leadconnectorhq.com',
            path: apiPath,
            method,
            headers: {
                'Authorization': 'Bearer ' + GHL_TOKEN,
                'Content-Type': 'application/json',
                'Version': '2021-07-28'
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
                const contactRes = await ghlRequest('POST', '/contacts/', contactPayload);
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

    // --- Static files ---
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = filePath.split('?')[0];
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
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(fallback);
            });
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(data);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
