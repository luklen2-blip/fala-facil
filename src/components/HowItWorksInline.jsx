import React from 'react';
import { 
  Mic, MessageSquare, Volume2, QrCode, Sparkles, CheckCircle2, 
  HelpCircle, ArrowRight, Smartphone, Eye, Type, Shield, Users, Heart
} from 'lucide-react';

export default function HowItWorksInline({ 
  onOpenFullGuide, 
  onOpenQR, 
  onOpenPlans, 
  onStartExperience,
  altoContraste = false 
}) {
  const publicos = [
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
  ];

  const etapas = [
    {
      numero: '1',
      icone: Mic,
      titulo: '1. Atendente Fala no Microfone',
      subtitulo: 'Reconhecimento de Voz (Speech-to-Text)',
      texto: 'O atendente ouvinte aperta "Toque para Falar" e fala com calma. O texto é transcrito em tempo real na tela superior em letras grandes.',
      cor: 'border-indigo-200 bg-indigo-50/50'
    },
    {
      numero: '2',
      icone: MessageSquare,
      titulo: '2. Pessoa Surda Escolhe ou Digita',
      subtitulo: 'Frases Rápidas ou Mensagem Livre',
      texto: 'A pessoa surda lê o que foi falado e responde tocando em uma frase pronta (Serviços, Comércio, Ajuda) ou digitando no campo de texto.',
      cor: 'border-blue-200 bg-blue-50/50'
    },
    {
      numero: '3',
      icone: Volume2,
      titulo: '3. Celular Fala para o Atendente',
      subtitulo: 'Síntese de Voz com Pulso Tátil (Text-to-Speech)',
      texto: 'Ao tocar na frase, o celular fala em voz alta em português claro para o atendente ouvir, emitindo vibração dupla ao finalizar.',
      cor: 'border-emerald-200 bg-emerald-50/50'
    },
    {
      numero: '4',
      icone: QrCode,
      titulo: '4. QR Code nos Estabelecimentos',
      subtitulo: 'Atendimento Rápido Sem Baixar App',
      texto: 'Farmácias, lojas e guichês imprimem a placa de QR Code FalaFácil. Qualquer pessoa aponta a câmera e o sistema abre na hora.',
      cor: 'border-purple-200 bg-purple-50/50'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
      {/* Banner Principal com Atalho para Modal Completo */}
      <div className={`p-3 rounded-2xl border text-center transition-all ${
        altoContraste ? 'bg-zinc-900 border-yellow-400 text-yellow-300' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <HelpCircle size={16} className={altoContraste ? 'text-yellow-400' : 'text-indigo-600'} />
          <h3 className="font-black text-xs uppercase tracking-wide">
            Passo a Passo do Funcionamento
          </h3>
        </div>
        <p className={`text-[11px] leading-relaxed ${altoContraste ? 'text-yellow-300' : 'text-slate-600'}`}>
          Comunicação fluida, instantânea e acessível para qualquer balcão de atendimento.
        </p>

        <button
          type="button"
          onClick={onOpenFullGuide}
          className={`mt-2 px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition-all ${
            altoContraste ? 'bg-yellow-400 text-black font-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <span>Abrir Guia Interativo Completo</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* NOVA ETAPA: PARA QUEM O FALAFÁCIL PODE AJUDAR */}
      <section className={`p-3.5 rounded-2xl border transition-all ${
        altoContraste ? 'bg-zinc-950 border-yellow-400 text-yellow-300' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2 mb-1.5">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
            altoContraste ? 'bg-yellow-400 text-black font-black' : 'bg-indigo-600 text-white'
          }`}>
            <Users size={14} />
          </div>
          <h4 className="font-extrabold text-xs uppercase tracking-wide">
            Para quem o FalaFácil pode ajudar?
          </h4>
        </div>

        <p className={`text-xs leading-relaxed mb-3 ${
          altoContraste ? 'text-yellow-200' : 'text-slate-700'
        }`}>
          O FalaFácil é uma ferramenta de comunicação acessível para pessoas que podem encontrar dificuldades para se comunicar durante atendimentos presenciais.
        </p>

        {/* Grade dos 6 Públicos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {publicos.map((pub, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border transition-all ${
                altoContraste 
                  ? 'bg-zinc-900 border-yellow-500/60 text-yellow-300' 
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg shrink-0 select-none" role="img" aria-hidden="true">
                  {pub.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-[11px] leading-tight">
                    {pub.titulo}
                  </h5>
                  <p className={`text-[10px] mt-0.5 leading-snug ${
                    altoContraste ? 'text-yellow-200' : 'text-slate-600'
                  }`}>
                    {pub.texto}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Observação Importante */}
        <div className={`mt-3 p-2.5 rounded-xl border text-[11px] leading-relaxed font-medium ${
          altoContraste 
            ? 'bg-black border-yellow-400 text-yellow-300' 
            : 'bg-amber-50/90 border-amber-200 text-amber-950'
        }`}>
          <p className="font-bold mb-0.5 text-[11px]">
            ℹ️ Observação Importante:
          </p>
          <p className="text-[10px]">
            O FalaFácil é uma ferramenta complementar de comunicação. As necessidades de cada pessoa são diferentes e, quando necessário, não substitui intérpretes, profissionais especializados ou outros recursos de acessibilidade.
          </p>
        </div>
      </section>

      {/* Lista das 4 Etapas Práticas de Atendimento */}
      <div className="space-y-2">
        <h4 className="font-bold text-xs uppercase tracking-wider opacity-90 px-1">
          Como funciona na prática:
        </h4>
        {etapas.map((etapa) => {
          const Icon = etapa.icone;
          return (
            <div
              key={etapa.numero}
              className={`p-3 rounded-2xl border transition-all ${
                altoContraste 
                  ? 'bg-black border-yellow-500 text-yellow-300' 
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  altoContraste 
                    ? 'bg-yellow-400 text-black font-black' 
                    : 'bg-indigo-600 text-white shadow-sm'
                }`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-xs leading-tight">
                      {etapa.titulo}
                    </h5>
                    <span className="text-[10px] font-bold opacity-60">
                      {etapa.numero}/4
                    </span>
                  </div>
                  <p className={`text-[10px] font-semibold mt-0.5 ${
                    altoContraste ? 'text-yellow-400' : 'text-indigo-600'
                  }`}>
                    {etapa.subtitulo}
                  </p>
                  <p className={`text-[11px] mt-1 leading-snug ${
                    altoContraste ? 'text-yellow-200' : 'text-slate-600'
                  }`}>
                    {etapa.texto}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão de Chamada para Ação Final */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onStartExperience || onOpenFullGuide}
          className={`w-full py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
            altoContraste 
              ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <span>Agora experimente o FalaFácil</span>
          <CheckCircle2 size={16} />
        </button>
      </div>

      {/* Amparo Legal e Inclusão */}
      <div className={`p-2.5 rounded-xl border text-[11px] leading-relaxed ${
        altoContraste ? 'bg-zinc-950 border-yellow-400 text-yellow-300' : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-1.5 font-bold mb-1">
          <Shield size={13} className={altoContraste ? 'text-yellow-400' : 'text-indigo-600'} />
          <span>Atendimento Prioritário por Lei (LBI 13.146/2015)</span>
        </div>
        <p className="text-[10px] opacity-80">
          O FalaFácil garante acessibilidade comunicacional imediata em repartições públicas, comércios, farmácias e serviços em conformidade com as diretrizes brasileiras de inclusão.
        </p>
      </div>
    </div>
  );
}
