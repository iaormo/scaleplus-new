const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

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

const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = filePath.split('?')[0]; // strip query params
    const fullPath = path.join(__dirname, filePath);
    const ext = path.extname(fullPath).toLowerCase();

    fs.readFile(fullPath, (err, data) => {
        if (err) {
            // SPA fallback — serve index.html for any missing route
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
