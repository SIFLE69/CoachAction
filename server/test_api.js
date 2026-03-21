const http = require('http');

const endpoints = [
    '/api/health',
    '/api/auth/login',
    '/api/students',
    '/api/batches',
    '/api/attendance',
    '/api/payments'
];

endpoints.forEach(path => {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: 'GET'
    };

    const req = http.request(options, res => {
        console.log(`${path}: ${res.statusCode}`);
    });

    req.on('error', e => {
        console.error(`Problem with ${path}: ${e.message}`);
    });

    req.end();
});
