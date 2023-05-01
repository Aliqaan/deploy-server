const http = require('http');
const { exec } = require('child_process');
const port = 3132;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, x-target-server');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/deploy-script') {   

    var jsonString = '';

    req.on('data', chunk => {
        jsonString += chunk.toString();
    });

    req.on('end', () => {
        const params = JSON.parse(jsonString);
        console.log(params);
        const scriptPath = 'deploy.sh';
        const functionCodeArg = `"${params.function_code.replace(/"/g, '\\"')}"`;
        exec(`sh ${scriptPath} ${params.gateway} ${params.password} ${params.function_name} ${functionCodeArg} ${params.architecture}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(`Error: ${error}`);
          } else {
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`Deploy script executed successfully`);
          }
        });
      });
  } else {
    // If no target server is specified, return a 404 response
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('No matching target server found');
  }
});

server.listen(port, () => {
  console.log(`deploy server listening on port ${port}`);
});
