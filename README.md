# 🗣️ FalaFácil Balcão — Inclusão e Acessibilidade Imediata

Aplicação web progressiva (**mobile-first PWA**) concebida para quebrar barreiras de comunicação em balcões e guichês de atendimento presencial entre atendentes ouvintes e pessoas surdas ou com deficiência auditiva, utilizando recursos 100% nativos do navegador (**Web Speech API**), sem custo de APIs externas.

---

## 🌟 Principais Recursos

### 1. Bloco do Atendente Ouvinte (Topo)
- **Tag visual:** "Atendente Ouvinte" com status ativo/inativo.
- **Transcrição Contínua em Tempo Real:** Utiliza `SpeechRecognition` / `webkitSpeechRecognition` nativo em `pt-BR`.
- **Estados Visuais Imediatos:** Indicador "Ouvindo você..." com ondas sonoras animadas e diferenciação entre palavras em curso (`interimResults`) e finalizadas.
- **Botão Central Ergonômico:** "Toque para Falar" com ícone de microfone e pulsação suave em vermelho/verde ("Parar de Ouvir").
- **Reset Rápido:** Botão "Limpar" para recomeçar o diálogo a qualquer momento.
- **Fallback Inclusivo:** Botão de lápis para digitação manual do atendente caso o microfone não esteja disponível ou haja muito ruído ambiente.

### 2. Bloco da Pessoa Surda (Base)
- **Tag visual:** "Minhas Respostas (Tocar para Falar)".
- **Categorias Temáticas em Abas com Ícones:**
  1. **Serviços & Repartições:** Frases padrão como *"Preciso dar entrada em documento"*, *"Onde pego a senha?"*, *"Qual guichê devo ir?"*, *"Pode me apontar onde assino?"*, *"Qual o prazo para ficar pronto?"*.
  2. **Comércio & Compras:** Frases padrão como *"Quanto custa?"*, *"Aceita Pix?"*, *"Pode passar no cartão?"*, *"Tem desconto à vista?"*, *"Quero nota fiscal com CPF"*.
  3. **Suporte / Dúvidas de Diálogo:** Frases padrão como *"Pode falar mais devagar?"*, *"Não entendi, pode repetir?"*, *"Pode digitar aqui para mim?"*, *"Muito obrigado pela paciência!"*.
- **Síntese Vocal Instantânea (TTS):** Ao tocar em qualquer cartão, o navegador dispara `window.speechSynthesis` em voz alta em português do Brasil (`pt-BR`) com feedback visual e vibração tátil.
- **Campo de Digitação Livre:** Campo de texto + botão Enviar que lê o texto digitado imediatamente em voz alta e o limpa.

### 3. Acessibilidade & Usabilidade (Acessibilidade Universal)
- **Design Mobile-First:** Contido em `max-w-md` centralizado na tela, simulando uma experiência ergonômica de celular ou tablet de balcão.
- **Ajuste de Tipografia:** Três níveis de zoom de fonte acessíveis diretamente na barra superior (A / A+ / A++).
- **Modo Alto Contraste:** Alternador imediato para modo preto e amarelo puro, facilitando a leitura para pessoas com baixa visão ou em ambientes com reflexo de luz.
- **Vibração Tátil:** Haptic feedback (`navigator.vibrate`) ao tocar nos cartões e botões em dispositivos móveis.
- **PWA Instalável e Offline:** Suporte a Service Worker (`sw.js`) e `manifest.json` para funcionamento ininterrupto mesmo com sinal oscilante.

### 4. Padrão de Engenharia de Nuvem 24/7 (Luciano Standard)
- **Endpoint de Saúde:** `GET /api/health` respondendo HTTP 200 JSON `{ status: "ok", app: "FalaFácil Balcão", version: "2.0.0", uptime_seconds: ..., timestamp: ... }`.
- **Infraestrutura Pronta:** `render.yaml` e `Dockerfile` (Node 20 Alpine) prontos para deploy automático ininterrupto.
- **Testes Automatizados:** Suíte local formal (`tests/run_all.js`) e validador ao vivo na nuvem (`tests/test_cloud_live.js`).
- **Conformidade Legal & LGPD:** Termos de Uso e Política de Privacidade de acordo com a LGPD (Lei 13.709/2018), ECA, Código Civil e aviso ético assistivo.
- **Pagamento Brasileiro Oficial:** Gerador nativo de PIX EMV Copia-e-Cola (Banco Central) com cálculo rigoroso CRC-16/CCITT-FALSE e QR Code dinâmico.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+ instalado.

### Passos
```bash
# 1. Instalar dependências
npm install

# 2. Compilar aplicação para produção
npm run build

# 3. Executar suíte de testes de integridade
npm test

# 4. Iniciar o servidor de produção
npm start
```
Acesse no seu navegador: **http://localhost:3000**

---

## ☁️ Deploy Contínuo na Nuvem

### Deploy no Render.com
1. Conecte o repositório no [Render](https://render.com).
2. O arquivo `render.yaml` na raiz do projeto configurará o Web Service automaticamente.
3. Health check configurado em `/api/health`.

### Teste de Homologação em Produção (Live Cloud E2E)
```bash
node tests/test_cloud_live.js https://sua-url-no-render.onrender.com
```

---

## ⚖️ Conformidade Legal e Aviso Regulatório
O **FalaFácil Balcão** é uma tecnologia assistiva voltada para agilidade operacional no atendimento imediato e cotidiano de balcão. Ele **não substitui** o intérprete oficial de Libras ou fonoaudiólogo em audiências, exames médicos periciais ou atos formais quando exigido por legislação específica (Lei 10.436/2002 e Decreto 5.626/2005).

Faixa etária recomendada: 13+ anos. Doações e contribuições financeiras restritas a maiores de 18 anos ou assistidos por responsáveis.
