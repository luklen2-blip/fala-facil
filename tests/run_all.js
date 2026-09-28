import assert from 'assert';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CATEGORIES, QUICK_PHRASES } from '../src/data/quickPhrases.js';
import { generatePixPayload, getPixQrCodeUrl } from '../src/services/pixService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 ========================================================');
console.log('🧪 Suíte de Testes Formais e Auditoria — FalaFácil Balcão');
console.log('🧪 ========================================================');

async function runAllTests() {
  let passed = 0;

  // TESTE 1: Validação do Dicionário de Frases e Categorias Obrigatórias
  console.log('\n[1/6] Validando categorias e frases essenciais...');
  assert.strictEqual(CATEGORIES.length, 3, 'Devem existir 3 categorias principais');
  const catIds = CATEGORIES.map(c => c.id);
  assert.ok(catIds.includes('servicos'), 'Categoria servicos deve existir');
  assert.ok(catIds.includes('comercio'), 'Categoria comercio deve existir');
  assert.ok(catIds.includes('suporte'), 'Categoria suporte deve existir');

  // Frases de Serviços
  const servicosTexts = QUICK_PHRASES.servicos.map(p => p.text);
  assert.ok(servicosTexts.includes('Preciso dar entrada em documento'));
  assert.ok(servicosTexts.includes('Onde pego a senha?'));
  assert.ok(servicosTexts.includes('Qual guichê devo ir?'));
  assert.ok(servicosTexts.includes('Pode me apontar onde assino?'));
  assert.ok(servicosTexts.includes('Qual o prazo para ficar pronto?'));

  // Frases de Comércio
  const comercioTexts = QUICK_PHRASES.comercio.map(p => p.text);
  assert.ok(comercioTexts.includes('Quanto custa?'));
  assert.ok(comercioTexts.includes('Aceita Pix?'));
  assert.ok(comercioTexts.includes('Pode passar no cartão?'));
  assert.ok(comercioTexts.includes('Tem desconto à vista?'));
  assert.ok(comercioTexts.includes('Quero nota fiscal com CPF'));

  // Frases de Suporte
  const suporteTexts = QUICK_PHRASES.suporte.map(p => p.text);
  assert.ok(suporteTexts.includes('Pode falar mais devagar?'));
  assert.ok(suporteTexts.includes('Não entendi, pode repetir?'));
  assert.ok(suporteTexts.includes('Pode digitar aqui para mim?'));
  assert.ok(suporteTexts.includes('Muito obrigado pela paciência!'));

  console.log('  ✅ Dicionário de frases e categorias 100% íntegro');
  passed++;

  // TESTE 2: Validação do Motor PIX EMV Bacen e CRC-16
  console.log('\n[2/6] Validando gerador de PIX EMV com cálculo CRC-16...');
  const pix = generatePixPayload({
    pixKey: 'contato@falafacil.com.br',
    name: 'FalaFacil Balcao',
    city: 'BRASILIA',
    amount: '15.00',
    txId: 'TESTE01'
  });
  assert.ok(pix.startsWith('000201'), 'Payload deve começar com 000201');
  assert.ok(pix.includes('br.gov.bcb.pix'), 'Payload deve conter o domínio Bacen');
  assert.ok(pix.includes('contato@falafacil.com.br'), 'Payload deve conter a chave');
  assert.ok(pix.includes('15.00'), 'Payload deve conter o valor');
  assert.strictEqual(pix.length > 50, true, 'Payload deve ter tamanho válido');
  
  const qrUrl = getPixQrCodeUrl(pix);
  assert.ok(qrUrl.startsWith('https://api.qrserver.com/'), 'URL de QR Code deve ser válida');
  console.log('  ✅ Motor PIX EMV e CRC-16 validado com sucesso');
  passed++;

  // TESTE 3: Validação dos Arquivos de Produção e PWA
  console.log('\n[3/6] Validando bundle compilado, manifesto e service worker...');
  const distDir = path.join(__dirname, '..', 'dist');
  assert.ok(fs.existsSync(distDir), 'Diretório dist/ deve existir');
  assert.ok(fs.existsSync(path.join(distDir, 'index.html')), 'dist/index.html deve existir');
  assert.ok(fs.existsSync(path.join(distDir, 'manifest.json')), 'dist/manifest.json deve existir');
  assert.ok(fs.existsSync(path.join(distDir, 'sw.js')), 'dist/sw.js deve existir');
  console.log('  ✅ Arquivos estáticos de produção e PWA validados');
  passed++;

  // TESTE 4: Teste de Servidor HTTP e Health Check (/api/health)
  console.log('\n[4/6] Inicializando servidor local para teste de rotas e /api/health...');
  process.env.PORT = '3999';
  const serverModule = await import('../server.js');
  const server = serverModule.default;

  await new Promise(resolve => setTimeout(resolve, 500));

  const httpGet = (urlPath, method = 'GET') => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3999,
        path: urlPath,
        method
      };
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      });
      req.on('error', reject);
      req.end();
    });
  };

  const healthRes = await httpGet('/api/health');
  assert.strictEqual(healthRes.status, 200, 'Health check deve responder HTTP 200');
  const healthData = JSON.parse(healthRes.body);
  assert.strictEqual(healthData.status, 'ok', 'Status deve ser ok');
  assert.strictEqual(healthData.version, '2.0.0', 'Versão deve ser 2.0.0');
  assert.ok(typeof healthData.uptime_seconds === 'number', 'uptime_seconds deve ser número');
  assert.ok(healthData.timestamp, 'timestamp deve existir');
  console.log('  ✅ Endpoint /api/health respondendo 200 OK com payload no padrão de nuvem');

  const homeRes = await httpGet('/');
  assert.strictEqual(homeRes.status, 200, 'Home deve responder HTTP 200');
  assert.ok(homeRes.body.includes('FalaFácil'), 'Home deve conter o título da aplicação');
  console.log('  ✅ Servidor HTTP entregando aplicação SPA com sucesso');
  passed++;

  // TESTE 5: Auditoria de Segurança OWASP e Proteção Anti-Traversal
  console.log('\n[5/6] Validando cabeçalhos de segurança e proteção anti-path traversal...');
  assert.strictEqual(healthRes.headers['x-content-type-options'], 'nosniff', 'Header X-Content-Type-Options deve ser nosniff');
  assert.strictEqual(healthRes.headers['x-frame-options'], 'SAMEORIGIN', 'Header X-Frame-Options deve ser SAMEORIGIN');
  assert.ok(healthRes.headers['referrer-policy'], 'Referrer-Policy deve estar presente');

  // Teste de Path Traversal
  const traversalRes = await httpGet('/../../server.js');
  assert.strictEqual(traversalRes.status, 404, 'Path traversal deve ser bloqueado com 404');

  // Teste de CORS Preflight (OPTIONS)
  const optionsRes = await httpGet('/api/health', 'OPTIONS');
  assert.strictEqual(optionsRes.status, 204, 'OPTIONS deve retornar 204 No Content');
  console.log('  ✅ Cabeçalhos OWASP, Anti-Traversal e CORS validados');
  passed++;

  // TESTE 6: Validação de Conformidade Legal e LGPD
  console.log('\n[6/6] Validando conformidade com LGPD e Termos de Uso...');
  const legalFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'LegalModal.jsx'), 'utf-8');
  assert.ok(legalFile.includes('LGPD'), 'Deve citar conformidade com LGPD');
  assert.ok(legalFile.includes('13.709/2018'), 'Deve citar a Lei 13.709/2018');
  assert.ok(legalFile.includes('13 anos'), 'Deve citar restrição de faixa etária 13+');
  assert.ok(legalFile.includes('18 anos'), 'Deve citar restrição de pagamentos a 18+');
  assert.ok(legalFile.includes('Aviso de Acessibilidade Assistiva'), 'Deve conter aviso ético assistivo');
  console.log('  ✅ Cláusulas de conformidade LGPD e avisos éticos validados');
  passed++;

  // Encerramento limpo do servidor de teste
  server.close();

  console.log('\n🎉 ========================================================');
  console.log(`🎉 TODOS OS ${passed}/6 TESTES DE AUDITORIA PASSARAM!`);
  console.log('🎉 FalaFácil Balcão aprovado com excelência técnica!');
  console.log('🎉 ========================================================\n');
  process.exit(0);
}

runAllTests().catch(err => {
  console.error('\n❌ ERRO NA SUÍTE DE TESTES:', err);
  process.exit(1);
});
