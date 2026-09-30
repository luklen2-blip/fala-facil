import React, { useState } from 'react';
import { 
  X, Mic, Volume2, MessageSquare, QrCode, Sparkles, CheckCircle2, 
  HelpCircle, ArrowRight, Smartphone, Eye, Type, Shield, Download,
  Store, Building2, Users, Heart
} from 'lucide-react';

export default function HowItWorksModal({ 
  isOpen, 
  onClose, 
  onOpenQR, 
  onOpenPlans, 
  altoContraste = false 
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(0);

  const passos = [
    {
      id: 'oquee',
      numero: '1',
      navTitulo: '1. O Que É',
      badge: 'Visão Geral • O Que É',
      titulo: 'O que é o FalaFácil Balcão?',
      subtitulo: 'Comunicação Acessível Imediata em Balcões',
      cor: 'indigo',
      icone: Sparkles,
      descricao: 'O FalaFácil é uma ferramenta assistiva web desenvolvida para tornar o atendimento presencial rápido, claro e inclusivo entre pessoas ouvintes e pessoas que necessitam de apoio para se comunicar.',
      detalhes: [
        'Funciona direto no navegador (web/PWA), sem exigir download ou instalação de aplicativo.',
        'Conecta o atendente ouvinte ao cliente com dificuldades de fala ou audição de forma fluida.',
        'Transforma a voz do atendente em texto grande e as frases do cliente em voz alta com vibração.',
        'Pronto para uso em farmácias, comércios, clínicas, órgãos públicos, cartórios e serviços.'
      ],
      dica: 'Dica: O FalaFácil pode ser utilizado em qualquer smartphone, tablet ou computador com microfone.'
    },
    {
      id: 'paraquem',
      numero: '2',
      navTitulo: '2. Para Quem',
      badge: 'Inclusão • Públicos Atendidos',
      titulo: 'Para quem o FalaFácil pode ajudar?',
      subtitulo: 'Comunicação Acessível em Atendimentos Presenciais',
      cor: 'blue',
      icone: Users,
      descricao: 'O FalaFácil é uma ferramenta de comunicação acessível para pessoas que podem encontrar dificuldades para se comunicar durante atendimentos presenciais.',
      isPublicos: true,
      publicos: [
        {
          emoji: '🗣️',
          titulo: 'Pessoas com dificuldades de fala ou comunicação',
          texto: 'Pode ajudar quem encontra dificuldades para expressar verbalmente o que precisa durante um atendimento.'
        },
        {
          emoji: '👂',
          titulo: 'Pessoas surdas ou com deficiência auditiva',
          texto: 'Pode funcionar como recurso complementar de comunicação em determinadas situações.'
        },
        {
          emoji: '🧩',
          titulo: 'Pessoas neurodivergentes',
          texto: 'Pode ser útil para quem prefere utilizar frases previamente preparadas ou uma comunicação mais previsível.'
        },
        {
          emoji: '👵',
          titulo: 'Idosos',
          texto: 'Recursos como texto ampliado, contraste e voz podem facilitar determinadas situações de comunicação.'
        },
        {
          emoji: '👨‍👩‍👧',
          titulo: 'Familiares e cuidadores',
          texto: 'Pode ajudar familiares e cuidadores que acompanham alguém durante atendimentos.'
        },
        {
          emoji: '🏪',
          titulo: 'Estabelecimentos',
          texto: 'Farmácias, lojas, clínicas, restaurantes e outros estabelecimentos podem disponibilizar o FalaFácil como uma alternativa de comunicação acessível aos seus clientes.'
        }
      ],
      observacaoImportante: 'O FalaFácil é uma ferramenta complementar de comunicação. As necessidades de cada pessoa são diferentes e, quando necessário, não substitui intérpretes, profissionais especializados ou outros recursos de acessibilidade.'
    },
    {
      id: 'atendente',
      numero: '3',
      navTitulo: '3. Atendente',
      badge: 'Passo 1 • Atendente',
      titulo: 'O Atendente Fala no Microfone',
      subtitulo: 'Reconhecimento de Voz Inteligente (Speech-to-Text)',
      cor: 'indigo',
      icone: Mic,
      descricao: 'O atendente ouvinte aperta o botão "Toque para Falar" e fala com clareza e ritmo natural.',
      detalhes: [
        'A fala é transcrita em tempo real na parte superior da tela em letras grandes.',
        'A pessoa surda ou com deficiência auditiva lê instantaneamente o que foi falado.',
        'Funciona direto no navegador com idioma Português (Brasil).',
        'Botão "Concluir Fala" finaliza e mantém o texto exibido na tela.'
      ],
      dica: 'Dica: Se o ambiente estiver barulhento, aproxime o aparelho da pessoa que está falando.'
    },
    {
      id: 'usuario',
      numero: '4',
      navTitulo: '4. Resposta',
      badge: 'Passo 2 • Pessoa Surda',
      titulo: 'A Pessoa Surda Escolhe ou Digita',
      subtitulo: 'Comunicação Direta por Frases ou Texto Livre',
      cor: 'blue',
      icone: MessageSquare,
      descricao: 'Na metade inferior da tela, o usuário tem frases prontas organizadas por contexto.',
      detalhes: [
        'Categorias rápidas: Serviços Públicos, Comércio, Pedidos de Ajuda e Frases Customizadas.',
        'Se o balcão tiver perfil próprio (ex: Farmácia), as frases específicas do local aparecem no topo.',
        'Campo de digitação livre: permite escrever qualquer mensagem avulsa de até 200 caracteres.',
        'Possibilidade de salvar suas próprias frases favoritas na memória do aparelho.'
      ],
      dica: 'Dica: As frases cobrem as situações mais comuns de guichê, reduzindo o tempo de atendimento.'
    },
    {
      id: 'audio',
      numero: '5',
      navTitulo: '5. Voz',
      badge: 'Passo 3 • Voz em Alto-Falante',
      titulo: 'O Celular Fala para o Atendente',
      subtitulo: 'Síntese de Voz com Confirmação Tátil (Text-to-Speech)',
      cor: 'emerald',
      icone: Volume2,
      descricao: 'Ao tocar em qualquer frase ou enviar uma mensagem digitada, o celular reproduz a fala em voz alta.',
      detalhes: [
        'Voz neural clara em português com cadência adaptada para balcão de atendimento.',
        'Aviso visual pulsante na tela indicando que o áudio está sendo emitido.',
        'Vibração tátil dupla (feedback háptico) no aparelho para o usuário surdo saber quando terminou de falar.',
        'O atendente ouve sem precisar olhar para a tela do celular do cliente.'
      ],
      dica: 'Dica: Certifique-se de que o volume do smartphone ou tablet esteja ajustado para ser ouvido no balcão.'
    },
    {
      id: 'qrcode',
      numero: '6',
      navTitulo: '6. QR Balcão',
      badge: 'Passo 4 • Para Estabelecimentos',
      titulo: 'QR Code Exclusivo no Balcão',
      subtitulo: 'Acesso Instantâneo Sem Instalação de App',
      cor: 'purple',
      icone: QrCode,
      descricao: 'O estabelecimento gera e imprime a placa oficial do FalaFácil para colocar no balcão.',
      detalhes: [
        'O cliente apenas aponta a câmera do celular para o QR Code.',
        'Abre na hora via web: não requer baixar nada da Google Play ou App Store.',
        'Identifica o perfil do estabelecimento (Farmácia, Loja, Clínica, Cartório, Hotel).',
        'Exibe mensagem de boas-vindas acolhedora e as perguntas específicas do local.'
      ],
      dica: 'Dica: No menu "Meus QR Codes", você pode baixar o adesivo ou placa em alta resolução para imprimir.'
    }
  ];

  const passoAtual = passos[activeTab];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-it-works-title"
    >
      <div className={`rounded-3xl max-w-lg w-full shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden ${
        altoContraste ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Cabeçalho */}
        <header className={`px-5 py-4 flex items-center justify-between border-b shrink-0 ${
          altoContraste ? 'bg-zinc-950 border-yellow-500 text-yellow-400' : 'bg-slate-900 text-white border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              altoContraste ? 'bg-yellow-400 text-black font-black' : 'bg-indigo-600 text-white shadow-md'
            }`}>
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 id="how-it-works-title" className="font-extrabold text-sm sm:text-base leading-tight">
                Como Funciona o FalaFácil Balcão
              </h2>
              <p className={`text-[11px] ${altoContraste ? 'text-yellow-300' : 'text-slate-400'}`}>
                Passo a passo da comunicação acessível entre atendentes e clientes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              altoContraste ? 'text-yellow-400 hover:bg-zinc-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            aria-label="Fechar guia de funcionamento"
          >
            <X size={20} />
          </button>
        </header>

        {/* Seletor de Passos (Navegação Superior Responsiva com Scroll Horizontal Suave) */}
        <div className={`flex overflow-x-auto no-scrollbar p-1.5 gap-1 border-b text-center shrink-0 ${
          altoContraste ? 'bg-zinc-900 border-yellow-500' : 'bg-slate-100 border-slate-200'
        }`}>
          {passos.map((p, idx) => {
            const Icon = p.icone;
            const isSelected = activeTab === idx;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`flex-1 min-w-[72px] sm:min-w-[80px] py-1.5 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 shrink-0 ${
                  isSelected
                    ? (altoContraste 
                        ? 'bg-yellow-400 text-black font-black shadow' 
                        : 'bg-indigo-600 text-white shadow-md')
                    : (altoContraste 
                        ? 'text-yellow-400 hover:bg-zinc-800' 
                        : 'text-slate-600 hover:bg-slate-200')
                }`}
                aria-pressed={isSelected}
              >
                <Icon size={13} />
                <span className="text-[10px] whitespace-nowrap">{p.navTitulo}</span>
              </button>
            );
          })}
        </div>

        {/* Conteúdo do Passo Ativo com Rolagem */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Card Principal do Passo */}
          <div className={`p-4 rounded-2xl border transition-all ${
            altoContraste 
              ? 'bg-zinc-950 border-yellow-400 text-yellow-300' 
              : 'bg-gradient-to-br from-indigo-50/70 to-white border-indigo-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                altoContraste ? 'bg-yellow-400 text-black' : 'bg-indigo-600 text-white'
              }`}>
                {passoAtual.badge}
              </span>
              <span className="text-xs font-bold opacity-75">
                {activeTab + 1} de {passos.length}
              </span>
            </div>

            <h3 className="font-black text-base sm:text-lg mt-2 leading-snug">
              {passoAtual.titulo}
            </h3>
            <p className={`text-xs font-semibold mt-0.5 ${
              altoContraste ? 'text-yellow-400' : 'text-indigo-700'
            }`}>
              {passoAtual.subtitulo}
            </p>

            <p className={`text-xs sm:text-sm mt-2.5 leading-relaxed ${
              altoContraste ? 'text-yellow-200' : 'text-slate-700'
            }`}>
              {passoAtual.descricao}
            </p>
          </div>

          {/* RENDERIZAÇÃO ESPECIAL DA ETAPA: PARA QUEM O FALAFÁCIL PODE AJUDAR */}
          {passoAtual.isPublicos ? (
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider opacity-90 flex items-center gap-1.5">
                <Users size={14} className={altoContraste ? 'text-yellow-400' : 'text-indigo-600'} />
                <span>Públicos que podem se beneficiar:</span>
              </h4>

              {/* Grid dos 6 Públicos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {passoAtual.publicos.map((pub, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all ${
                      altoContraste 
                        ? 'bg-zinc-900 border-yellow-500/60 text-yellow-300' 
                        : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl shrink-0 select-none" role="img" aria-hidden="true">
                        {pub.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs leading-tight text-slate-900 dark:text-yellow-300">
                          {pub.titulo}
                        </h5>
                        <p className={`text-[11px] mt-1 leading-snug ${
                          altoContraste ? 'text-yellow-200' : 'text-slate-600'
                        }`}>
                          {pub.texto}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Observação Importante Exigida (Texto legível, sem linguagem médica e sem promessa) */}
              <div className={`p-3 rounded-xl border text-[11px] leading-relaxed font-medium ${
                altoContraste 
                  ? 'bg-black border-yellow-400 text-yellow-300' 
                  : 'bg-amber-50/90 border-amber-200 text-amber-950'
              }`}>
                <p className="font-bold mb-0.5 text-xs">
                  ℹ️ Observação Importante:
                </p>
                <p>
                  {passoAtual.observacaoImportante}
                </p>
              </div>

              {/* Botão de Ação Rápida: Experimente Agora */}
              <div className="pt-1 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab(2)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                    altoContraste ? 'border-yellow-400 text-yellow-300 hover:bg-zinc-900' : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span>Ver Como Funciona</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1 ${
                    altoContraste ? 'bg-yellow-400 text-black font-black' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <span>Agora experimente o FalaFácil</span>
                  <CheckCircle2 size={13} />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Lista de Detalhes Práticos para as Demais Etapas */}
              {passoAtual.detalhes && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider opacity-90">
                    Como funciona na prática:
                  </h4>
                  <div className="space-y-1.5">
                    {passoAtual.detalhes.map((item, i) => (
                      <div 
                        key={i} 
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs leading-relaxed ${
                          altoContraste ? 'bg-zinc-900 border-yellow-500/50' : 'bg-white border-slate-200'
                        }`}
                      >
                        <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${
                          altoContraste ? 'text-yellow-400' : 'text-emerald-600'
                        }`} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Caixa de Dica Prática */}
              {passoAtual.dica && (
                <div className={`p-3 rounded-xl border text-xs font-medium ${
                  altoContraste 
                    ? 'bg-black border-yellow-400 text-yellow-300' 
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  💡 {passoAtual.dica}
                </div>
              )}
            </>
          )}

          {/* Recursos Essenciais de Acessibilidade */}
          <div className={`p-3.5 rounded-2xl border ${
            altoContraste ? 'bg-zinc-900 border-yellow-400' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="font-extrabold text-xs uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <Sparkles size={14} className={altoContraste ? 'text-yellow-400' : 'text-indigo-600'} />
              Recursos de Acessibilidade Incluídos
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <Type size={14} className="text-indigo-600 shrink-0" />
                <span>Zoom A / A+ / A++</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye size={14} className="text-yellow-500 shrink-0" />
                <span>Modo Alto Contraste</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone size={14} className="text-emerald-600 shrink-0" />
                <span>PWA (Modo Offline)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield size={14} className="text-blue-600 shrink-0" />
                <span>Amparo Legal LBI (Lei 13.146)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Rodapé com Navegação Entre Passos e Ações */}
        <footer className={`px-5 py-3.5 border-t flex items-center justify-between shrink-0 ${
          altoContraste ? 'bg-zinc-950 border-yellow-500' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            type="button"
            disabled={activeTab === 0}
            onClick={() => setActiveTab(prev => Math.max(0, prev - 1))}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 0
                ? 'opacity-40 cursor-not-allowed'
                : (altoContraste ? 'border border-yellow-400 text-yellow-300 hover:bg-zinc-800' : 'border border-slate-300 text-slate-700 hover:bg-slate-100')
            }`}
          >
            Anterior
          </button>

          <div className="flex items-center gap-1.5">
            {passos.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeTab === i 
                    ? (altoContraste ? 'w-4 bg-yellow-400' : 'w-4 bg-indigo-600') 
                    : (altoContraste ? 'bg-zinc-700' : 'bg-slate-300')
                }`}
              />
            ))}
          </div>

          {activeTab < passos.length - 1 ? (
            <button
              type="button"
              onClick={() => setActiveTab(prev => Math.min(passos.length - 1, prev + 1))}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all ${
                altoContraste ? 'bg-yellow-400 text-black font-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <span>Próximo</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all ${
                altoContraste ? 'bg-yellow-400 text-black font-black' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <span>Agora experimente o FalaFácil</span>
              <CheckCircle2 size={13} />
            </button>
          )}
        </footer>

      </div>
    </div>
  );
}
