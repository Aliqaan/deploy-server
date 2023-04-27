const http = require('http');
const httpProxy = require('http-proxy');
const port = 3131;

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');

  // Get target server from request headers
  const target = req.headers['x-target-server'];
  if (target) {
    // Proxy request to target server
    console.log(target)
    proxy.web(req, res, { target });
  } else {
    // If no target server is specified, return a 404 response
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('No matching target server found');
  }
});

server.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
