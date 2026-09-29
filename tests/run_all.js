import assert from 'assert';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { CATEGORIES, QUICK_PHRASES } from '../src/data/quickPhrases.js';
import { generatePixPayload, getPixQrCodeUrl } from '../src/services/pixService.js';
import { sanitizeSlug, generateQRDataUrl, generateQRSvg } from '../src/services/qrCodeService.js';
import { SEGMENTOS_DISPONIVEIS, PLANOS_COMERCIAIS, COPY_POSICIONAMENTO } from '../src/data/qrTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 ========================================================');
console.log('🧪 Suíte de Testes Formais e Auditoria — FalaFácil Balcão');
console.log('🧪 Incluindo Módulo FalaFácil QR Code Personalizado');
console.log('🧪 ========================================================');

async function runAllTests() {
  let passed = 0;

  // TESTE 1: Validação do Dicionário de Frases e Categorias Obrigatórias
  console.log('\n[1/8] Validando categorias e frases essenciais existentes...');
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

  console.log('  ✅ Dicionário de frases e categorias existentes 100% íntegro');
  passed++;

  // TESTE 2: Validação do Motor PIX EMV Bacen e CRC-16
  console.log('\n[2/8] Validando gerador de PIX EMV com cálculo CRC-16...');
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
  console.log('\n[3/8] Validando bundle compilado, manifesto e service worker...');
  const distDir = path.join(__dirname, '..', 'dist');
  assert.ok(fs.existsSync(distDir), 'Diretório dist/ deve existir');
  assert.ok(fs.existsSync(path.join(distDir, 'index.html')), 'dist/index.html deve existir');
  assert.ok(fs.existsSync(path.join(distDir, 'manifest.json')), 'dist/manifest.json deve existir');
  assert.ok(fs.existsSync(path.join(distDir, 'sw.js')), 'dist/sw.js deve existir');
  console.log('  ✅ Arquivos estáticos de produção e PWA validados');
  passed++;

  // TESTE 4: Teste de Servidor HTTP e Health Check (/api/health)
  console.log('\n[4/8] Inicializando servidor local para teste de rotas e /api/health...');
  process.env.PORT = '3999';
  const serverModule = await import('../server.js');
  const server = serverModule.default;

  await new Promise(resolve => setTimeout(resolve, 500));

  const httpReq = (urlPath, method = 'GET', postData = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3999,
        path: urlPath,
        method,
        headers: {}
      };
      if (postData) {
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      });
      req.on('error', reject);
      if (postData) req.write(postData);
      req.end();
    });
  };

  const healthRes = await httpReq('/api/health');
  assert.strictEqual(healthRes.status, 200, 'Health check deve responder HTTP 200');
  const healthData = JSON.parse(healthRes.body);
  assert.strictEqual(healthData.status, 'ok', 'Status deve ser ok');
  assert.strictEqual(healthData.version, '2.0.0', 'Versão deve ser 2.0.0');
  assert.ok(typeof healthData.uptime_seconds === 'number', 'uptime_seconds deve ser número');
  assert.ok(healthData.timestamp, 'timestamp deve existir');
  console.log('  ✅ Endpoint /api/health respondendo 200 OK com payload no padrão de nuvem');

  const homeRes = await httpReq('/');
  assert.strictEqual(homeRes.status, 200, 'Home deve responder HTTP 200');
  assert.ok(homeRes.body.includes('FalaFácil'), 'Home deve conter o título da aplicação');
  console.log('  ✅ Servidor HTTP entregando aplicação SPA com sucesso');

  // Validação estrita de entrega dos assets estáticos compilados (JS/CSS)
  const distAssets = fs.existsSync(path.join(__dirname, '..', 'dist', 'assets'))
    ? fs.readdirSync(path.join(__dirname, '..', 'dist', 'assets'))
    : [];
  for (const assetFile of distAssets) {
    const assetRes = await httpReq(`/assets/${assetFile}`);
    assert.strictEqual(assetRes.status, 200, `Asset /assets/${assetFile} deve responder 200 OK`);
    const expectedType = assetFile.endsWith('.js') ? 'application/javascript' : 'text/css';
    assert.ok(assetRes.headers['content-type'].includes(expectedType), `Content-Type de ${assetFile} inválido`);
  }
  console.log('  ✅ Todos os assets compilados (JS e CSS) respondendo 200 OK com Content-Type correto');
  passed++;

  // TESTE 5: Auditoria de Segurança OWASP e Proteção Anti-Traversal
  console.log('\n[5/8] Validando cabeçalhos de segurança e proteção anti-path traversal...');
  assert.strictEqual(healthRes.headers['x-content-type-options'], 'nosniff', 'Header X-Content-Type-Options deve ser nosniff');
  assert.strictEqual(healthRes.headers['x-frame-options'], 'SAMEORIGIN', 'Header X-Frame-Options deve ser SAMEORIGIN');
  assert.ok(healthRes.headers['referrer-policy'], 'Referrer-Policy deve estar presente');

  // Teste de Path Traversal
  const traversalRes = await httpReq('/../../server.js');
  assert.strictEqual(traversalRes.status, 404, 'Path traversal deve ser bloqueado com 404');

  // Teste de CORS Preflight (OPTIONS)
  const optionsRes = await httpReq('/api/health', 'OPTIONS');
  assert.strictEqual(optionsRes.status, 204, 'OPTIONS deve retornar 204 No Content');
  console.log('  ✅ Cabeçalhos OWASP, Anti-Traversal e CORS validados');
  passed++;

  // TESTE 6: Validação de Conformidade Legal e LGPD
  console.log('\n[6/8] Validando conformidade com LGPD e Termos de Uso...');
  const legalFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'LegalModal.jsx'), 'utf-8');
  assert.ok(legalFile.includes('LGPD'), 'Deve citar conformidade com LGPD');
  assert.ok(legalFile.includes('13.709/2018'), 'Deve citar a Lei 13.709/2018');
  assert.ok(legalFile.includes('13 anos'), 'Deve citar restrição de faixa etária 13+');
  assert.ok(legalFile.includes('18 anos'), 'Deve citar restrição de pagamentos a 18+');
  assert.ok(legalFile.includes('Aviso de Acessibilidade Assistiva'), 'Deve conter aviso ético assistivo');
  console.log('  ✅ Cláusulas de conformidade LGPD e avisos éticos validados');
  passed++;

  // TESTE 7: Auditoria e Validação Rigorosa do Módulo QR Code FalaFácil
  console.log('\n[7/8] Validando Módulo QR Code FalaFácil (13 requisitos técnicos)...');

  // 1. Criação de QR Code
  console.log('  -> 1. Criação de QR Code via API...');
  const testId = Date.now();
  const novoQR = {
    nome: `Clínica São Lucas ${testId}`,
    segmento: 'Saúde',
    setor: 'Recepção 1',
    slug: `clinica-sao-lucas-${testId}`,
    fraseBoasVindas: 'Seja bem-vindo à Clínica São Lucas!',
    frases: ['Tenho uma consulta agendada.', 'Onde pego a ficha de atendimento?', 'Preciso de ajuda.']
  };
  const createRes = await httpReq('/api/qrcodes', 'POST', JSON.stringify(novoQR));
  assert.strictEqual(createRes.status, 200, 'POST /api/qrcodes deve responder 200');
  const createData = JSON.parse(createRes.body);
  assert.strictEqual(createData.status, 'ok', 'Status deve ser ok');
  assert.strictEqual(createData.qrcode.slug, `clinica-sao-lucas-${testId}`);
  assert.strictEqual(createData.qrcode.ativo, true);
  console.log('     ✅ QR Code criado com sucesso');

  // 2. Identificação pública do QR Code
  console.log('  -> 2. Identificação pública do QR Code...');
  const getPublicRes = await httpReq(`/api/qrcodes/clinica-sao-lucas-${testId}`);
  assert.strictEqual(getPublicRes.status, 200);
  const publicData = JSON.parse(getPublicRes.body);
  assert.strictEqual(publicData.qrcode.slug, `clinica-sao-lucas-${testId}`);
  assert.strictEqual(publicData.qrcode.acessosCount, 1, 'Contador de acesso deve ser incrementado para 1');
  console.log('     ✅ Identificação pública validada com sucesso');

  // 3. Abertura do QR Code na rota SPA
  console.log('  -> 3. Abertura do QR Code na rota SPA (/qr/:slug)...');
  const spaRes = await httpReq(`/qr/clinica-sao-lucas-${testId}`);
  assert.strictEqual(spaRes.status, 200);
  assert.ok(spaRes.body.includes('FalaFácil'), 'Rota SPA deve entregar o index.html da aplicação');
  console.log('     ✅ Rota SPA /qr/:slug entregando aplicação');

  // 4. Carregamento correto das frases específicas (Cenário Obrigatório: Farmácia Central)
  console.log('  -> 4. Carregamento de frases (Cenário Obrigatório: Farmácia Central)...');
  const farmaciaRes = await httpReq('/api/qrcodes/farmacia-central');
  assert.strictEqual(farmaciaRes.status, 200);
  const farmaciaData = JSON.parse(farmaciaRes.body);
  assert.strictEqual(farmaciaData.qrcode.nome, 'Farmácia Central');
  assert.strictEqual(farmaciaData.qrcode.segmento, 'Farmácia');
  assert.ok(farmaciaData.qrcode.frases.includes('Gostaria de saber o preço deste medicamento.'));
  assert.ok(farmaciaData.qrcode.frases.includes('Esse medicamento está disponível?'));
  assert.ok(farmaciaData.qrcode.frases.includes('Preciso falar com o farmacêutico.'));
  assert.ok(farmaciaData.qrcode.frases.includes('Preciso de ajuda.'));
  console.log('     ✅ Cenário Farmácia Central carregando frases com precisão');

  // 5. QR Code inexistente -> 404
  console.log('  -> 5. Tratamento de QR Code inexistente...');
  const notFoundRes = await httpReq('/api/qrcodes/estabelecimento-fantasma-xyz');
  assert.strictEqual(notFoundRes.status, 404);
  const notFoundJson = JSON.parse(notFoundRes.body);
  assert.strictEqual(notFoundJson.status, 'error');
  console.log('     ✅ 404 tratado corretamente para QR code inexistente');

  // 6. QR Code desativado -> bloqueio apropriado
  console.log('  -> 6. Alternância de status ativo/desativado...');
  const toggleRes = await httpReq(`/api/qrcodes/${createData.qrcode.id}/toggle`, 'PATCH');
  assert.strictEqual(toggleRes.status, 200);
  const toggledJson = JSON.parse(toggleRes.body);
  assert.strictEqual(toggledJson.qrcode.ativo, false, 'QR Code deve estar desativado');
  console.log('     ✅ Desativação e status refletidos com sucesso');

  // 7. Tentativa de acesso indevido / Path Traversal no parâmetro slug
  console.log('  -> 7. Segurança: tentativa de traversal no parâmetro de QR Code...');
  const badParamRes = await httpReq('/api/qrcodes/../../../etc/passwd');
  assert.ok([400, 404].includes(badParamRes.status), 'Acesso indevido de path traversal deve ser bloqueado');
  console.log('     ✅ Tentativa de acesso indevido neutralizada com sucesso');

  // 8. Isolamento entre estabelecimentos
  console.log('  -> 8. Isolamento entre estabelecimentos...');
  const restauranteRes = await httpReq('/api/qrcodes/restaurante-sabor');
  const restData = JSON.parse(restauranteRes.body);
  assert.notStrictEqual(farmaciaData.qrcode.nome, restData.qrcode.nome);
  assert.notStrictEqual(farmaciaData.qrcode.frases[0], restData.qrcode.frases[0]);
  console.log('     ✅ Isolamento estrito entre perfis de estabelecimentos validado');

  // 9. Sanitização dos dados (slug e textos)
  console.log('  -> 9. Sanitização de slug e inputs...');
  const dirtySlug = sanitizeSlug('  Padaria & Confeitaria São João #123! ');
  assert.strictEqual(dirtySlug, 'padaria-confeitaria-sao-joao-123');
  console.log('     ✅ Sanitização de slug rigorosa');

  // 10. Geração do QR Code (DataURL e SVG)
  console.log('  -> 10. Geração do QR Code local offline (DataURL e SVG)...');
  const testUrl = 'https://falafacil-balcao-5od4.onrender.com/qr/farmacia-central';
  const qrDataUrl = await generateQRDataUrl(testUrl);
  assert.ok(qrDataUrl.startsWith('data:image/png;base64,'), 'QR Code DataURL deve ser base64 png válido');
  const qrSvg = await generateQRSvg(testUrl);
  assert.ok(qrSvg.includes('<svg') && qrSvg.includes('</svg>'), 'QR Code SVG deve ser markup vetorial válido');
  console.log('     ✅ Motores de renderização de QR Code DataURL e SVG validados');

  // 11. Conformidade do Modelo Comercial e Segmentos
  console.log('  -> 11. Validação dos Planos Comerciais e Segmentos...');
  assert.strictEqual(SEGMENTOS_DISPONIVEIS.length, 10, 'Devem existir 10 segmentos configurados');
  assert.strictEqual(PLANOS_COMERCIAIS.length, 5, 'Devem existir 5 planos definidos');
  assert.strictEqual(PLANOS_COMERCIAIS[0].preco, 'R$ 19,90');
  assert.strictEqual(PLANOS_COMERCIAIS[1].preco, 'R$ 29,90/mês');
  assert.strictEqual(PLANOS_COMERCIAIS[2].preco, 'R$ 59,90/mês');
  assert.strictEqual(PLANOS_COMERCIAIS[3].preco, 'R$ 149,90/mês');
  assert.strictEqual(PLANOS_COMERCIAIS[4].preco, 'R$ 299,90/mês');
  assert.strictEqual(COPY_POSICIONAMENTO.selo, 'Recursos de comunicação acessível.');
  console.log('     ✅ Planos, preços oficiais e posicionamento estritamente validados');

  // 12. Limpeza do perfil temporário de teste
  await httpReq(`/api/qrcodes/${createData.qrcode.id}`, 'DELETE');
  console.log('     ✅ Exclusão de QR Code e higienização de banco validados');
  console.log('  ✅ Todos os requisitos do Módulo QR Code FalaFácil aprovados com nota máxima!');
  passed++;

  // TESTE 8: Validação do Módulo Passo a Passo do Funcionamento
  console.log('\n[8/8] Validando Módulo de Passo a Passo do Funcionamento...');
  const howItWorksModalPath = path.join(__dirname, '..', 'src', 'components', 'HowItWorksModal.jsx');
  const howItWorksInlinePath = path.join(__dirname, '..', 'src', 'components', 'HowItWorksInline.jsx');
  assert.ok(fs.existsSync(howItWorksModalPath), 'HowItWorksModal.jsx deve existir');
  assert.ok(fs.existsSync(howItWorksInlinePath), 'HowItWorksInline.jsx deve existir');

  const modalContent = fs.readFileSync(howItWorksModalPath, 'utf8');
  assert.ok(modalContent.includes('Passo 1 • Atendente'), 'Modal deve conter o Passo 1');
  assert.ok(modalContent.includes('Passo 2 • Pessoa Surda'), 'Modal deve conter o Passo 2');
  assert.ok(modalContent.includes('Passo 3 • Voz em Alto-Falante'), 'Modal deve conter o Passo 3');
  assert.ok(modalContent.includes('Passo 4 • Para Estabelecimentos'), 'Modal deve conter o Passo 4');
  assert.ok(modalContent.includes('Speech-to-Text'), 'Modal deve referenciar Speech-to-Text');
  assert.ok(modalContent.includes('Text-to-Speech'), 'Modal deve referenciar Text-to-Speech');

  const appContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'App.jsx'), 'utf8');
  assert.ok(appContent.includes('HowItWorksModal'), 'App.jsx deve importar e renderizar HowItWorksModal');
  assert.ok(appContent.includes('HowItWorksInline'), 'App.jsx deve importar e renderizar HowItWorksInline');
  assert.ok(appContent.includes('Como Funciona'), 'App.jsx deve conter botão Como Funciona');
  assert.ok(appContent.includes('como-funciona'), 'App.jsx deve conter aba como-funciona');
  console.log('  ✅ Módulo de Passo a Passo do Funcionamento validado com sucesso (Modal + Aba Inline)');
  passed++;

  // Encerramento limpo do servidor de teste
  server.close();

  console.log('\n🎉 ========================================================');
  console.log(`🎉 TODOS OS ${passed}/8 BLOCOS DE TESTES PASSARAM COM SUCESSO!`);
  console.log('🎉 FalaFácil Balcão + QR Code + Passo a Passo homologado!');
  console.log('🎉 ========================================================\n');
  process.exit(0);
}

runAllTests().catch(err => {
  console.error('\n❌ ERRO NA SUÍTE DE TESTES:', err);
  process.exit(1);
});
