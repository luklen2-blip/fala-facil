import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { generatePixPayload, getPixQrCodeUrl } from './src/services/pixService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let currentPort = Number(process.env.PORT) || 3000;
const APP_NAME = process.env.APP_NAME || 'FalaFácil Balcão';

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

function serveStatic(res, filePath) {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return false;
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
    });
    fs.createReadStream(filePath).pipe(res);
    return true;
  } catch (err) {
    return false;
  }
}

function resolveFile(targetPath) {
  const cleanPath = targetPath.replace(/^\/+/, '');
  const candidatePaths = [
    path.join(__dirname, 'dist', cleanPath),
    path.join(__dirname, 'public', cleanPath),
    path.join(__dirname, cleanPath),
    path.join(process.cwd(), 'dist', cleanPath),
    path.join(process.cwd(), 'public', cleanPath),
    path.join(process.cwd(), cleanPath)
  ];
  return candidatePaths.find(p => {
    try {
      return fs.existsSync(p) && fs.statSync(p).isFile();
    } catch {
      return false;
    }
  });
}

function resolveIndexHtml() {
  const candidates = [
    path.join(__dirname, 'dist', 'index.html'),
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(__dirname, 'index.html'),
    path.join(process.cwd(), 'index.html')
  ];
  return candidates.find(p => fs.existsSync(p) && fs.statSync(p).isFile());
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // 1. Endpoint Obrigatório de Monitoramento 24/7
  if (pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      status: 'ok',
      app: APP_NAME,
      version: '2.0.0',
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // 2. Endpoint de Geração de PIX Bacen EMV
  if (pathname === '/api/pix' && req.method === 'GET') {
    const amount = parsedUrl.searchParams.get('amount') || '';
    const payload = generatePixPayload({
      pixKey: 'contato@falafacil.com.br',
      name: 'FalaFacil Balcao',
      city: 'BRASILIA',
      amount: amount || undefined,
      txId: 'FALAFACIL'
    });
    const qrCode = getPixQrCodeUrl(payload);

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      status: 'ok',
      payload,
      qr_code_url: qrCode,
      amount: amount || 'livre',
      chave: 'contato@falafacil.com.br'
    }));
    return;
  }

  // 3. Rotas Regulatórias /termos e /privacidade
  if (pathname === '/termos' || pathname === '/privacidade') {
    const index = resolveIndexHtml();
    if (index && serveStatic(res, index)) return;
  }

  // 4. Arquivos estáticos
  if (pathname !== '/' && pathname !== '') {
    const foundPath = resolveFile(pathname);
    if (foundPath && serveStatic(res, foundPath)) {
      return;
    }
  }

  // 5. Fallback SPA para index.html
  const indexPath = resolveIndexHtml();
  if (indexPath && serveStatic(res, indexPath)) {
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
  res.end('404 - Arquivo não encontrado');
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`🚀 [FalaFácil Balcão] Servidor ativo em http://localhost:${port}`);
    console.log(`🩺 Health check disponível em http://localhost:${port}/api/health`);
    if (process.env.AUTO_OPEN === 'true') {
      exec(`start http://localhost:${port}`);
    }
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && !process.env.PORT) {
    console.warn(`⚠️ Porta ${currentPort} ocupada. Tentando porta ${currentPort + 1}...`);
    currentPort += 1;
    setTimeout(() => startServer(currentPort), 200);
  } else {
    console.error('Erro no servidor:', err);
    process.exit(1);
  }
});

startServer(currentPort);

export default server;
