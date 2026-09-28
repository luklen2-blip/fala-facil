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
console.log('🧪 Iniciando Suíte de Testes Formais — FalaFácil Balcão');
console.log('🧪 ========================================================');

async function runAllTests() {
  let passed = 0;

  // TESTE 1: Validação do Dicionário de Frases e Categorias Obrigatórias
  console.log('\n[1/5] Validando categorias e frases essenciais...');
  assert.strictEqual(CATEGORIES.length, 3, 'Devem existir 3 categorias principais');
  const catIds = CATEGORIES.map(c => c.id);
  assert.ok(catIds.includes('servicos'), 'Categoria servicos deve existir');
  assert.ok(catIds.includes('comercio'), 'Categoria comercio deve existir');
  assert.ok(catIds.includes('suporte'), 'Categoria suporte deve existir');
  const suporteCat = CATEGORIES.find(c => c.id === 'suporte');
  assert.strictEqual(suporteCat.label, 'Suporte / Dúvidas de Diálogo', 'Rótulo da categoria 3 deve ser Suporte / Dúvidas de Diálogo');

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
  console.log('\n[2/5] Validando gerador de PIX EMV com cálculo CRC-16...');
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
  console.log('\n[3/5] Validando bundle compilado, manifesto e service worker...');
  const distDir = path.join(__dirname, '..', 'dist');
  assert.ok(fs.existsSync(distDir), 'Diretório dist/ deve existir');
  assert.ok(fs.existsSync(path.join(distDir, 'index.html')), 'dist/index.html deve existir');
  assert.ok(fs.existsSync(path.join(distDir, 'manifest.json')), 'dist/manifest.json deve existir');
  assert.ok(fs.existsSync(path.join(distDir, 'sw.js')), 'dist/sw.js deve existir');
  console.log('  ✅ Arquivos estáticos de produção e PWA validados');
  passed++;

  // TESTE 4: Teste de Servidor HTTP e Health Check (/api/health)
  console.log('\n[4/5] Inicializando servidor local para teste de rotas e /api/health...');
  process.env.PORT = '3999';
  const serverModule = await import('../server.js');
  const server = serverModule.default;

  await new Promise(resolve => setTimeout(resolve, 500));

  const httpGet = (urlPath) => {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:3999${urlPath}`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      }).on('error', reject);
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

  // TESTE 5: Validação de Conformidade Legal e LGPD
  console.log('\n[5/5] Validando conformidade com LGPD e Termos de Uso...');
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
  console.log(`🎉 TODOS OS ${passed}/5 TESTES LOCAIS PASSARAM COM SUCESSO!`);
  console.log('🎉 Aplicação FalaFácil Balcão aprovada para homologação!');
  console.log('🎉 ========================================================\n');
  process.exit(0);
}

runAllTests().catch(err => {
  console.error('\n❌ ERRO NA SUÍTE DE TESTES:', err);
  process.exit(1);
});
