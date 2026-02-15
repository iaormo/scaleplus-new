const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const GHL_API = 'https://services.leadconnectorhq.com/contacts/';
const GHL_TOKEN = 'pit-ae349e92-1fa6-4656-ae9d-b015d2ba2de3';

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

function proxyToGHL(body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const url = new URL(GHL_API);
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + GHL_TOKEN,
                'Content-Type': 'application/json',
                'Version': '2021-07-28',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: responseBody }));
        });
        req.on('error', reject);
        req.write(data);
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
                const payload = JSON.parse(body);
                const ghlRes = await proxyToGHL(payload);
                res.writeHead(ghlRes.status, { 'Content-Type': 'application/json' });
                res.end(ghlRes.body);
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
