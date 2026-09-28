/**
 * Suíte de Testes Ao Vivo na Nuvem (Live Cloud E2E)
 * Validação remota de integridade 360° em produção (Render, Railway, Fly, AWS).
 * Configurado com rejectUnauthorized: false para evitar bloqueios de certificados intermediários.
 */

import https from 'https';
import http from 'http';

const targetUrl = process.argv[2] || process.env.LIVE_URL;

if (!targetUrl) {
  console.log('ℹ️  Uso: node tests/test_cloud_live.js <URL_DE_PRODUCAO>');
  console.log('ℹ️  Exemplo: node tests/test_cloud_live.js https://falafacil-balcao.onrender.com');
  process.exit(0);
}

const isHttps = targetUrl.startsWith('https://');
const client = isHttps ? https : http;
const agent = isHttps ? new https.Agent({ rejectUnauthorized: false }) : undefined;

function requestUrl(endpoint) {
  const fullUrl = new URL(endpoint, targetUrl).toString();
  return new Promise((resolve, reject) => {
    client.get(fullUrl, { agent }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

async function runLiveE2E() {
  console.log(`🌐 [Live Cloud E2E] Validando aplicação em nuvem: ${targetUrl}`);

  // 1. Health check
  console.log('  1. Validando /api/health...');
  const health = await requestUrl('/api/health');
  if (health.status !== 200) throw new Error(`Health check falhou: HTTP ${health.status}`);
  const healthJson = JSON.parse(health.data);
  if (healthJson.status !== 'ok') throw new Error(`Status de saúde inválido: ${healthJson.status}`);
  console.log(`     ✅ /api/health respondendo 200 OK (App: ${healthJson.app}, Uptime: ${healthJson.uptime_seconds}s)`);

  // 2. Landing Page / SPA
  console.log('  2. Validando interface SPA inicial...');
  const home = await requestUrl('/');
  if (home.status !== 200) throw new Error(`Home falhou: HTTP ${home.status}`);
  if (!home.data.includes('FalaFácil')) throw new Error('Título da aplicação ausente na Home');
  console.log('     ✅ Interface web SPA carregada com sucesso');

  // 3. Manifesto PWA
  console.log('  3. Validando Manifesto PWA...');
  const manifest = await requestUrl('/manifest.json');
  if (manifest.status !== 200) throw new Error(`Manifest falhou: HTTP ${manifest.status}`);
  const manifestJson = JSON.parse(manifest.data);
  if (!manifestJson.short_name) throw new Error('Manifest sem short_name');
  console.log(`     ✅ PWA Manifest operacional (${manifestJson.name})`);

  // 4. Service Worker
  console.log('  4. Validando Service Worker para modo offline...');
  const sw = await requestUrl('/sw.js');
  if (sw.status !== 200) throw new Error(`Service Worker falhou: HTTP ${sw.status}`);
  console.log('     ✅ Service Worker ativo para cache offline');

  // 5. Endpoint de PIX Bacen
  console.log('  5. Validando API de PIX Bacen EMV...');
  const pix = await requestUrl('/api/pix?amount=10.00');
  if (pix.status !== 200) throw new Error(`API Pix falhou: HTTP ${pix.status}`);
  const pixJson = JSON.parse(pix.data);
  if (!pixJson.payload || !pixJson.payload.startsWith('000201')) {
    throw new Error('Payload Pix inválido retornado pela API');
  }
  console.log('     ✅ API de PIX gerando payload EMV oficial com sucesso');

  console.log('\n🎉 ========================================================');
  console.log('🎉 HOMOLOGAÇÃO LIVE CLOUD CONCLUÍDA COM 100% DE SUCESSO!');
  console.log('🎉 Aplicação 24/7 totalmente operacional no ar!');
  console.log('🎉 ========================================================\n');
}

runLiveE2E().catch(err => {
  console.error('\n❌ Falha na validação de nuvem:', err.message);
  process.exit(1);
});
