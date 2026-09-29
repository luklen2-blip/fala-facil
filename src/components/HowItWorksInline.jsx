import React from 'react';
import { 
  Mic, MessageSquare, Volume2, QrCode, Sparkles, CheckCircle2, 
  HelpCircle, ArrowRight, Smartphone, Eye, Type, Shield, ExternalLink
} from 'lucide-react';

export default function HowItWorksInline({ 
  onOpenFullGuide, 
  onOpenQR, 
  onOpenPlans, 
  altoContraste = false 
}) {
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
    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
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

      {/* Lista dos 4 Passos Essenciais */}
      <div className="space-y-2">
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
                    <h4 className="font-black text-xs leading-tight">
                      {etapa.titulo}
                    </h4>
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
