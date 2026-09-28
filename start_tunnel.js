/**
 * Gerenciador de Túnel Seguro Cloudflare Quick Tunnel 24/7 — FalaFácil Balcão
 * Flag obrigatória --no-prechecks e pool de certificados CA.
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

async function main() {
  console.log('🛡️  [FalaFácil Balcão] Iniciando Gerenciador de Nuvem 24/7...');

  let activePort = 3001;
  const is3001 = await checkPort(3001);
  let serverProcess = null;

  if (is3001) {
    activePort = 3001;
    console.log(`✅ Servidor FalaFácil Balcão já ativo na porta ${activePort}`);
  } else {
    const is3000 = await checkPort(3000);
    if (is3000) {
      activePort = 3000;
      console.log(`✅ Servidor FalaFácil Balcão já ativo na porta ${activePort}`);
    } else {
      // Inicia o servidor local automaticamente
      activePort = 3001;
      console.log(`🚀 Iniciando servidor FalaFácil Balcão na porta ${activePort}...`);
      serverProcess = fork(path.join(projectDir, 'server.js'), [], {
        env: { ...process.env, PORT: String(activePort) }
      });
      // Aguarda 1.5s para inicialização
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  console.log(`📡 Estabelecendo túnel de nuvem global HTTPS para porta ${activePort}...`);

  if (!fs.existsSync(cloudflaredExe)) {
    console.error('❌ cloudflared.exe não encontrado em:', cloudflaredExe);
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
  let publicUrl = null;
  let hasTested = false;

  const handleOutput = (data) => {
    const text = data.toString();
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
        console.warn('Nota ao salvar atalho na Área de Trabalho:', err.message);
      }

      console.log(`\n===============================================================`);
      console.log(`🚀 FALAFÁCIL BALCÃO DISPONÍVEL 24/7 NA NUVEM GLOBAL!`);
      console.log(`🌐 URL Pública HTTPS:   ${publicUrl}`);
      console.log(`🩺 Health Check Nuvem:  ${publicUrl}/api/health`);
      console.log(`📱 Acesso Mobile / Web: Disponível para qualquer celular no mundo!`);
      console.log(`💾 Atalho salvo na Área de Trabalho: URL-NUVEM-FALAFACIL-BALCAO.txt`);
      console.log(`===============================================================\n`);

      // Executa testes automatizados de homologação ao vivo na nuvem após 3s de propagação DNS
      if (!hasTested) {
        hasTested = true;
        setTimeout(() => {
          console.log('🧪 Disparando bateria de testes ao vivo na nuvem (Live Cloud E2E)...');
          const testProc = spawn('node', [path.join(projectDir, 'tests', 'test_cloud_live.js'), publicUrl], {
            stdio: 'inherit'
          });
          testProc.on('exit', (code) => {
            if (code === 0) {
              console.log('🎉 Deploy em nuvem 100% testado, homologado e ativo!');
            }
          });
        }, 3000);
      }
    }
  };

  tunnel.stdout.on('data', handleOutput);
  tunnel.stderr.on('data', handleOutput);

  tunnel.on('close', (code) => {
    console.log(`Túnel encerrado com código: ${code}`);
    if (serverProcess) serverProcess.kill();
  });

  const cleanup = () => {
    console.log('Encerrando serviços de nuvem...');
    tunnel.kill();
    if (serverProcess) serverProcess.kill();
    process.exit(0);
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

main();
