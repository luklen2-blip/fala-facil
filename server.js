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
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=UTF-8',
  '.webmanifest': 'application/manifest+json; charset=UTF-8'
};

// 1. Middleware de Cabeçalhos de Segurança (Hardening OWASP)
function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'microphone=(self), geolocation=(), camera=()');
}

// 2. Limitador de Taxa em Memória (Mitigação DoS/Abuso)
const rateLimitMap = new Map();
function isRateLimited(ip, limit = 180, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }
  rateLimitMap.set(ip, record);
  return record.count > limit;
}

// 2.1 Helpers de Persistência e Leitura de QR Codes
const QR_FILE = path.join(__dirname, 'data', 'qrcodes.json');

function loadQRCodes() {
  try {
    if (!fs.existsSync(QR_FILE)) return [];
    return JSON.parse(fs.readFileSync(QR_FILE, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function saveQRCodesAtomic(items) {
  try {
    const dir = path.dirname(QR_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tempFile = `${QR_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(items, null, 2), 'utf-8');
    fs.renameSync(tempFile, QR_FILE);
    return true;
  } catch (e) {
    console.warn('Erro ao salvar qrcodes.json:', e);
    return false;
  }
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 50000) {
        req.destroy();
        resolve(null);
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

// 3. Resolução Segura de Arquivos Estáticos com Proteção Anti-Path Traversal
function resolveFile(targetPath) {
  try {
    const decoded = decodeURIComponent(targetPath);
    const normalized = path.normalize(decoded).replace(/^(\.\.[\/\\])+/, '');
    if (normalized.includes('..')) {
      return null; // Bloqueio estrito de traversal
    }
    const cleanPath = normalized.replace(/^[\/\\]+/, '');
    const candidatePaths = [
      path.join(__dirname, 'dist', cleanPath),
      path.join(__dirname, 'public', cleanPath),
      path.join(process.cwd(), 'dist', cleanPath),
      path.join(process.cwd(), 'public', cleanPath)
    ];

    const rootDir = path.resolve(__dirname);
    const cwdDir = path.resolve(process.cwd());

    return candidatePaths.find(p => {
      try {
        const resolved = path.resolve(p);
        if (!resolved.startsWith(rootDir) && !resolved.startsWith(cwdDir)) {
          return false;
        }
        return fs.existsSync(p) && fs.statSync(p).isFile();
      } catch {
        return false;
      }
    });
  } catch {
    return null;
  }
}

function resolveIndexHtml() {
  const candidates = [
    path.join(__dirname, 'dist', 'index.html'),
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(__dirname, 'index.html'),
    path.join(process.cwd(), 'index.html')
  ];
  return candidates.find(p => {
    try {
      return fs.existsSync(p) && fs.statSync(p).isFile();
    } catch {
      return false;
    }
  });
}

function serveStatic(res, filePath) {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return false;
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    applySecurityHeaders(res);

    // Cache otimizado: imutável para assets compilados e no-cache para index.html
    const isImmutable = filePath.includes('dist/assets') || filePath.includes('dist\\assets');
    const cacheControl = ext === '.html'
      ? 'no-cache, no-store, must-revalidate'
      : isImmutable
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=86400';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': cacheControl
    });
    fs.createReadStream(filePath).pipe(res);
    return true;
  } catch (err) {
    return false;
  }
}

const server = http.createServer((req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Rate Limiting para APIs e requisições excessivas
  if (pathname.startsWith('/api') && isRateLimited(clientIp, 120, 60000)) {
    applySecurityHeaders(res);
    res.writeHead(429, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify({ status: 'error', message: 'Muitas requisições. Aguarde um momento.' }));
    return;
  }

  // Preflight CORS
  if (req.method === 'OPTIONS') {
    applySecurityHeaders(res);
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // 1. Endpoint Obrigatório de Monitoramento 24/7
  if (pathname === '/api/health' && req.method === 'GET') {
    applySecurityHeaders(res);
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
    applySecurityHeaders(res);
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

  // 2.1 Endpoints de QR Code Personalizado FalaFácil
  if (pathname === '/api/qrcodes' && req.method === 'GET') {
    applySecurityHeaders(res);
    const qrcodes = loadQRCodes();
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ status: 'ok', qrcodes }));
    return;
  }

  if (pathname.startsWith('/api/qrcodes/') && req.method === 'GET') {
    applySecurityHeaders(res);
    const rawSlug = pathname.replace('/api/qrcodes/', '').trim();

    // Validação de segurança: apenas alfanuméricos, hífens e underscores (bloqueia traversal ..)
    if (!rawSlug || rawSlug.includes('..') || !/^[a-zA-Z0-9_-]+$/.test(rawSlug)) {
      res.writeHead(400, {
        'Content-Type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ status: 'error', message: 'Identificador de QR Code inválido' }));
      return;
    }

    const slug = rawSlug.toLowerCase();
    const qrcodes = loadQRCodes();
    const item = qrcodes.find(q => q.slug === slug || q.id === slug);

    if (!item) {
      res.writeHead(404, {
        'Content-Type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ status: 'error', message: 'QR Code não encontrado' }));
      return;
    }

    // Incrementa contador de acessos anônimo
    item.acessosCount = (item.acessosCount || 0) + 1;
    saveQRCodesAtomic(qrcodes);

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ status: 'ok', qrcode: item }));
    return;
  }

  if (pathname === '/api/qrcodes' && req.method === 'POST') {
    applySecurityHeaders(res);
    readJsonBody(req).then(data => {
      if (!data || !data.nome || typeof data.nome !== 'string') {
        res.writeHead(400, {
          'Content-Type': 'application/json; charset=UTF-8',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ status: 'error', message: 'Nome do estabelecimento é obrigatório' }));
        return;
      }

      const qrcodes = loadQRCodes();
      const cleanSlug = (data.slug || data.nome)
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50) || `qr-${Date.now()}`;

      const existingIndex = qrcodes.findIndex(q => (data.id && q.id === data.id) || q.slug === cleanSlug);

      const record = {
        id: (existingIndex >= 0 ? qrcodes[existingIndex].id : data.id) || `qr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        slug: cleanSlug,
        nome: data.nome.trim().slice(0, 80),
        segmento: (data.segmento || 'Comércio').trim().slice(0, 50),
        setor: (data.setor || '').trim().slice(0, 50),
        fraseBoasVindas: (data.fraseBoasVindas || 'Como podemos ajudar você hoje?').trim().slice(0, 150),
        frases: Array.isArray(data.frases)
          ? data.frases.map(f => String(f).trim().slice(0, 120)).filter(Boolean).slice(0, 30)
          : [],
        ativo: data.ativo !== false,
        criadoEm: existingIndex >= 0 ? qrcodes[existingIndex].criadoEm : (data.criadoEm || new Date().toISOString()),
        atualizadoEm: new Date().toISOString(),
        acessosCount: existingIndex >= 0 ? (qrcodes[existingIndex].acessosCount || 0) : 0
      };

      if (existingIndex >= 0) {
        qrcodes[existingIndex] = record;
      } else {
        qrcodes.unshift(record);
      }

      saveQRCodesAtomic(qrcodes);

      res.writeHead(200, {
        'Content-Type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ status: 'ok', qrcode: record }));
    });
    return;
  }

  if (pathname.startsWith('/api/qrcodes/') && pathname.endsWith('/toggle') && req.method === 'PATCH') {
    applySecurityHeaders(res);
    const id = pathname.replace('/api/qrcodes/', '').replace('/toggle', '').trim();
    const qrcodes = loadQRCodes();
    const item = qrcodes.find(q => q.id === id || q.slug === id);

    if (!item) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=UTF-8', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ status: 'error', message: 'QR Code não encontrado' }));
      return;
    }

    item.ativo = !item.ativo;
    item.atualizadoEm = new Date().toISOString();
    saveQRCodesAtomic(qrcodes);

    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ status: 'ok', qrcode: item }));
    return;
  }

  if (pathname.startsWith('/api/qrcodes/') && req.method === 'DELETE') {
    applySecurityHeaders(res);
    const id = pathname.replace('/api/qrcodes/', '').trim();
    let qrcodes = loadQRCodes();
    const initialLen = qrcodes.length;
    qrcodes = qrcodes.filter(q => q.id !== id && q.slug !== id);

    if (qrcodes.length === initialLen) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=UTF-8', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ status: 'error', message: 'QR Code não encontrado' }));
      return;
    }

    saveQRCodesAtomic(qrcodes);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ status: 'ok', message: 'QR Code excluído' }));
    return;
  }

  // 3. Rotas Regulatórias /termos, /privacidade e /qr/*
  if (pathname === '/termos' || pathname === '/privacidade' || pathname === '/qr' || pathname.startsWith('/qr/')) {
    const index = resolveIndexHtml();
    if (index && serveStatic(res, index)) return;
  }

  // 4. Arquivos estáticos e bloqueio estrito de traversal
  if (pathname !== '/' && pathname !== '') {
    if (pathname.includes('..')) {
      applySecurityHeaders(res);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('404 - Arquivo não encontrado');
      return;
    }

    const foundPath = resolveFile(pathname);
    if (foundPath && serveStatic(res, foundPath)) {
      return;
    }

    // Arquivos com extensão que não foram encontrados devem retornar 404 estrito
    if (path.extname(pathname)) {
      applySecurityHeaders(res);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('404 - Arquivo não encontrado');
      return;
    }
  }

  // 5. Fallback SPA para index.html (exclusivo para rotas autorizadas da aplicação)
  const isAllowedSpaRoute = pathname === '/' ||
                            pathname === '/termos' ||
                            pathname === '/privacidade' ||
                            pathname === '/qr' ||
                            pathname.startsWith('/qr/');

  if (isAllowedSpaRoute) {
    const indexPath = resolveIndexHtml();
    if (indexPath && serveStatic(res, indexPath)) {
      return;
    }
  }

  applySecurityHeaders(res);
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
  res.end('404 - Arquivo não encontrado');
});

function startServer(port) {
  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 [FalaFácil Balcão] Servidor ativo em http://0.0.0.0:${port}`);
    console.log(`🩺 Health check disponível em http://0.0.0.0:${port}/api/health`);
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
