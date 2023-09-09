const http = require('http');
const url = require('url');
const fs = require('fs');
const etag = require('etag');


http.createServer((req, res) => {
    const { pathname } = url.parse(req.url);
    console.log(req.method, req.url);
    if (pathname === '/') {
        // index 首页
        const data = fs.readFileSync('./index.html');
        res.end(data);
    }else if (pathname === '/img1.jpg') {
        const data = fs.readFileSync('./images/img1.jpg');
        res.writeHead(200, {
            Expires: new Date(2023, 9, 25).toUTCString()
        })
        res.end(data);
    }else if (pathname === '/img2.jpg') {
        const data = fs.readFileSync('./images/img2.jpg');
        // 当 Cache-Control 和 Expires 都有时，前者优先级更高
        res.writeHead(200, {
            'Cache-Control': 'max-age=10',
            Expires: new Date(2023, 8, 25).toUTCString()
        })
        res.end(data);
    }else if (pathname === '/img3.jpg') {
        // 判断协商缓存是否生效
        // 协商缓存-LastModified
        const ifModifiedSince = req.headers['if-modified-since'];
        const { mtime } = fs.statSync('./images/img3.jpg');
        if (mtime.toUTCString() === ifModifiedSince) {
            res.statusCode = 304;
            res.end();
            return;
        }

        const data = fs.readFileSync('./images/img3.jpg');
        res.writeHead(200, {
            'Cache-Control': 'no-cache', // 协商缓存需要开启这个字段
            'Last-Modified': mtime.toUTCString(),
        })
        res.end(data);
    }else if (pathname === '/img4.jpg') {
        // 协商缓存-Etag
        const data = fs.readFileSync('./images/img4.jpg');
        const etagContent = etag(data);
        // console.log('content', etagContent);
        const ifNoneMatch = req.headers['if-none-match'];
        if (ifNoneMatch === etagContent) {
            res.statusCode = 304;
            res.end();
            return;
        }
        
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Etag', etagContent);
        res.end(data);
    }else {
        res.statusCode = 404;
        res.end();
    }
}).listen('3000', () => {
    console.log('localhost:3000 listen...');
})