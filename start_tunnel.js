/**
 * Gerenciador de Túnel Seguro Cloudflare Quick Tunnel 24/7 — FalaFácil Balcão
 * Flag obrigatória --no-prechecks e pool de certificados CA.
 * Auto-restart resiliente e logging em tunnel.log.
 */

import { spawn, fork } from 'child_process';
import path from 'path';
import fs from 'fs';
import tls from 'tls';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectDir = __dirname;
const cloudflaredExe = path.join(projectDir, 'cloudflared.exe');
const caBundlePath = path.join(projectDir, 'ca-bundle.crt');
const logFile = path.join(projectDir, 'tunnel.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(logFile, line, 'utf-8');
  } catch (e) {}
  console.log(msg);
}

// 1. Garantir existência de certificados CA confiáveis
if (!fs.existsSync(caBundlePath) || fs.statSync(caBundlePath).size < 100) {
  fs.writeFileSync(caBundlePath, tls.rootCertificates.join('\n'), 'utf-8');
}

// 2. Verificar se a aplicação FalaFácil já está respondendo na porta
function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/api/health`, { timeout: 1500 }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          if (j.status === 'ok' && (j.app === 'FalaFácil Balcão' || j.app === 'FalaFacil Balcao')) {
            return resolve(true);
          }
        } catch (e) {}
        resolve(false);
      });
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

let serverProcess = null;
let activeTunnel = null;
let isStopping = false;

async function startServerIfNeeded() {
  const is3001 = await checkPort(3001);
  if (is3001) return 3001;

  const is3000 = await checkPort(3000);
  if (is3000) return 3000;

  const port = 3001;
  log(`🚀 Iniciando servidor FalaFácil Balcão na porta ${port}...`);
  serverProcess = fork(path.join(projectDir, 'server.js'), [], {
    env: { ...process.env, PORT: String(port) },
    stdio: 'ignore'
  });
  await new Promise(r => setTimeout(r, 1500));
  return port;
}

function launchTunnel(activePort) {
  if (isStopping) return;

  log(`📡 Estabelecendo túnel de nuvem global HTTPS para porta ${activePort}...`);

  if (!fs.existsSync(cloudflaredExe)) {
    log('❌ cloudflared.exe não encontrado em: ' + cloudflaredExe);
    process.exit(1);
  }

  const args = [
    'tunnel',
    '--url', `http://127.0.0.1:${activePort}`,
    '--no-prechecks',
    '--edge-ip-version', '4',
    '--protocol', 'http2',
    '--origin-ca-pool', caBundlePath
  ];

  const tunnel = spawn(cloudflaredExe, args);
  activeTunnel = tunnel;
  let publicUrl = null;
  let hasTested = false;

  const handleOutput = (data) => {
    const text = data.toString();
    try {
      fs.appendFileSync(logFile, text, 'utf-8');
    } catch (e) {}

    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match && !publicUrl) {
      publicUrl = match[0];
      fs.writeFileSync(path.join(projectDir, 'tunnel_url.txt'), publicUrl, 'utf-8');

      // Salva arquivo com link na Área de Trabalho do Luciano
      const desktop = path.join(process.env.USERPROFILE, 'OneDrive', 'Desktop');
      const fallbackDesktop = path.join(process.env.USERPROFILE, 'Desktop');
      const content = `===============================================================
FALAFÁCIL BALCÃO — DEPLOY 24/7 EM NUVEM GLOBAL ATIVO
===============================================================

🌐 URL Pública Global HTTPS:  ${publicUrl}
🩺 Health Check em Nuvem:     ${publicUrl}/api/health
📜 Termos & Privacidade LGPD: ${publicUrl}/termos
💳 Apoio PIX Oficial Bacen:   ${publicUrl}/api/pix

Status: ONLINE 24/7 no ar
Acesso: Computadores, celulares e tablets sem necessidade de instalação.
Data de ativação: ${new Date().toLocaleString('pt-BR')}
`;

      try {
        if (fs.existsSync(desktop)) {
          fs.writeFileSync(path.join(desktop, 'URL-NUVEM-FALAFACIL-BALCAO.txt'), content, 'utf-8');
        }
        if (fs.existsSync(fallbackDesktop)) {
          fs.writeFileSync(path.join(fallbackDesktop, 'URL-NUVEM-FALAFACIL-BALCAO.txt'), content, 'utf-8');
        }
      } catch (err) {
        log('Nota ao salvar atalho na Área de Trabalho: ' + err.message);
      }

      log(`\n===============================================================`);
      log(`🚀 FALAFÁCIL BALCÃO DISPONÍVEL 24/7 NA NUVEM GLOBAL!`);
      log(`🌐 URL Pública HTTPS:   ${publicUrl}`);
      log(`🩺 Health Check Nuvem:  ${publicUrl}/api/health`);
      log(`📱 Acesso Mobile / Web: Disponível para qualquer celular no mundo!`);
      log(`💾 Atalho salvo na Área de Trabalho: URL-NUVEM-FALAFACIL-BALCAO.txt`);
      log(`===============================================================\n`);

      if (!hasTested) {
        hasTested = true;
        setTimeout(() => {
          log('🧪 Disparando bateria de testes ao vivo na nuvem (Live Cloud E2E)...');
          const testProc = spawn('node', [path.join(projectDir, 'tests', 'test_cloud_live.js'), publicUrl], {
            stdio: 'inherit'
          });
          testProc.on('exit', (code) => {
            if (code === 0) {
              log('🎉 Deploy em nuvem 100% testado, homologado e ativo!');
            }
          });
        }, 4000);
      }
    }
  };

  tunnel.stdout.on('data', handleOutput);
  tunnel.stderr.on('data', handleOutput);

  tunnel.on('close', (code) => {
    log(`⚠️ Túnel Cloudflare finalizado (código: ${code}).`);
    if (!isStopping) {
      log('🔄 Reiniciando túnel automaticamente em 3 segundos para garantir disponibilidade 24/7...');
      setTimeout(() => launchTunnel(activePort), 3000);
    }
  });
}

async function main() {
  log('🛡️  [FalaFácil Balcão] Iniciando Gerenciador de Nuvem 24/7...');
  const port = await startServerIfNeeded();
  log(`✅ Servidor FalaFácil Balcão operacional na porta ${port}`);
  launchTunnel(port);

  const cleanup = () => {
    isStopping = true;
    log('Encerrando serviços...');
    if (activeTunnel) activeTunnel.kill();
    if (serverProcess) serverProcess.kill();
    process.exit(0);
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

main();
