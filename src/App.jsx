import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, RotateCcw, Send, Building2, 
  ShoppingBag, MessageCircle, Plus, Trash2, BookmarkCheck, CheckCircle2,
  Shield, Heart 
} from 'lucide-react';
import PixModal from './components/PixModal.jsx';
import LegalModal from './components/LegalModal.jsx';

const CATEGORIAS_PADRAO = {
  servicos: [
    "Preciso dar entrada em documento",
    "Onde pego a senha?",
    "Qual guichê devo ir?",
    "Pode me apontar onde assino?",
    "Qual o prazo para ficar pronto?"
  ],
  comercio: [
    "Quanto custa?",
    "Aceita Pix?",
    "Pode passar no cartão?",
    "Tem desconto à vista?",
    "Quero nota fiscal com CPF"
  ],
  ajuda: [
    "Pode falar mais devagar?",
    "Não entendi, pode repetir?",
    "Pode digitar aqui para mim?",
    "Muito obrigado pela paciência!"
  ]
};

export default function FalaFacilApp() {
  const [ouvindo, setOuvindo] = useState(false);
  const [falando, setFalando] = useState(false);
  const [transcricao, setTranscricao] = useState('');
  const [textoManual, setTextoManual] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('servicos');
  
  // Frases personalizadas salvas no navegador
  const [frasesCustom, setFrasesCustom] = useState(() => {
    try {
      const salvas = typeof window !== 'undefined' ? localStorage.getItem('falafacil_frases_custom') : null;
      return salvas ? JSON.parse(salvas) : [
        "Preciso de atendimento prioritário por lei",
        "Pode anotar os valores em um papel?",
        "Prefiro me comunicar escrevendo"
      ];
    } catch {
      return [
        "Preciso de atendimento prioritário por lei",
        "Pode anotar os valores em um papel?",
        "Prefiro me comunicar escrevendo"
      ];
    }
  });
  const [novaFraseCustom, setNovaFraseCustom] = useState('');

  // Modais de Apoio e Conformidade LGPD
  const [isPixOpen, setIsPixOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(
    typeof window !== 'undefined' &&
    (window.location.pathname === '/termos' || window.location.pathname === '/privacidade')
  );

  const recognitionRef = useRef(null);

  // Salva no localStorage sempre que as frases customizadas mudarem
  useEffect(() => {
    try {
      localStorage.setItem('falafacil_frases_custom', JSON.stringify(frasesCustom));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  }, [frasesCustom]);

  // Inicialização do Reconhecimento de Fala Nativo
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event) => {
        let textoAtual = '';
        for (let i = 0; i < event.results.length; i++) {
          textoAtual += event.results[i][0].transcript;
        }
        setTranscricao(textoAtual);
      };

      recognition.onerror = () => setOuvindo(false);
      recognition.onend = () => setOuvindo(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const alternarMicrofone = () => {
    if (!recognitionRef.current) {
      alert("Navegador sem suporte nativo a reconhecimento de voz. Utilize o Chrome ou Edge.");
      return;
    }
    if (ouvindo) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setOuvindo(false);
    } else {
      setTranscricao('');
      try {
        recognitionRef.current.start();
        setOuvindo(true);
      } catch (e) {
        console.warn('Erro ao iniciar reconhecimento:', e);
        setOuvindo(false);
      }
    }
  };

  // Síntese de Voz com Feedback Tátil (Vibração) e Visual
  const falarTexto = (texto) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95; // Cadência confortável para balcão

    utterance.onstart = () => {
      setFalando(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(60); // Vibração curta de confirmação de início
        } catch (e) {}
      }
    };

    utterance.onend = () => {
      setFalando(false);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([40, 60, 40]); // Pulso tátil duplo avisando que terminou de falar
        } catch (e) {}
      }
    };

    utterance.onerror = () => {
      setFalando(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleEnviarManual = (e) => {
    e.preventDefault();
    if (!textoManual.trim()) return;
    falarTexto(textoManual);
    setTextoManual('');
  };

  const handleAdicionarFraseCustom = (e) => {
    e.preventDefault();
    if (!novaFraseCustom.trim()) return;
    setFrasesCustom([novaFraseCustom.trim(), ...frasesCustom]);
    setNovaFraseCustom('');
  };

  const handleRemoverFraseCustom = (index) => {
    setFrasesCustom(frasesCustom.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-100 border border-slate-300 font-sans shadow-2xl select-none">
      
      {/* PAINEL SUPERIOR: Atendente Ouvinte */}
      <div className="flex-1 bg-white p-4 flex flex-col justify-between border-b-4 border-indigo-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
              Atendente Ouvinte
            </span>
            {ouvindo && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Gravando
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setIsLegalOpen(true)}
              title="Termos de Uso e Privacidade LGPD"
              className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
              aria-label="Termos e LGPD"
            >
              <Shield size={15} />
            </button>
            <button 
              type="button"
              onClick={() => setIsPixOpen(true)}
              title="Apoio Pix Bacen"
              className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
              aria-label="Apoiar projeto via Pix"
            >
              <Heart size={15} />
            </button>
            <button 
              type="button"
              onClick={() => setTranscricao('')} 
              className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 font-medium transition-colors ml-1"
            >
              <RotateCcw size={14} /> Limpar
            </button>
          </div>
        </div>

        {/* Caixa de Exibição da Transcrição */}
        <div className="my-auto min-h-[96px] flex items-center justify-center text-center p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-xl font-semibold text-slate-800 leading-snug">
            {transcricao || (ouvindo ? "Ouvindo atentamente..." : "Toque no microfone e fale com clareza")}
          </p>
        </div>

        {/* Botão de Gravação Principal */}
        <button
          type="button"
          onClick={alternarMicrofone}
          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold shadow-md transition-all active:scale-[0.98] ${
            ouvindo 
              ? 'bg-rose-600 text-white animate-pulse' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {ouvindo ? <MicOff size={26} /> : <Mic size={26} />}
          {ouvindo ? "Concluir Fala" : "Toque para Falar"}
        </button>
      </div>

      {/* FEEDBACK VISUAL DE FALA EM ANDAMENTO */}
      {falando && (
        <div className="bg-emerald-600 text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-bold animate-pulse shadow-inner">
          <Volume2 size={18} />
          <span>Celular reproduzindo áudio para o atendente...</span>
        </div>
      )}

      {/* PAINEL INFERIOR: Usuário Surdo */}
      <div className="flex-[1.3] bg-slate-50 p-4 flex flex-col justify-between overflow-hidden">
        <div>
          {/* Cabeçalho de Navegação de Categorias */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Minhas Respostas
            </span>
            <div className="flex gap-1 bg-slate-200 p-1 rounded-xl">
              <button 
                type="button"
                title="Serviços Públicos"
                onClick={() => setCategoriaAtiva('servicos')} 
                className={`p-1.5 rounded-lg transition-colors ${categoriaAtiva === 'servicos' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
              >
                <Building2 size={16} />
              </button>
              <button 
                type="button"
                title="Comércio e Farmácias"
                onClick={() => setCategoriaAtiva('comercio')} 
                className={`p-1.5 rounded-lg transition-colors ${categoriaAtiva === 'comercio' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
              >
                <ShoppingBag size={16} />
              </button>
              <button 
                type="button"
                title="Dúvidas de Comunicação"
                onClick={() => setCategoriaAtiva('ajuda')} 
                className={`p-1.5 rounded-lg transition-colors ${categoriaAtiva === 'ajuda' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
              >
                <MessageCircle size={16} />
              </button>
              <button 
                type="button"
                title="Minhas Frases Salvas"
                onClick={() => setCategoriaAtiva('personalizadas')} 
                className={`p-1.5 rounded-lg transition-colors ${categoriaAtiva === 'personalizadas' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
              >
                <BookmarkCheck size={16} />
              </button>
            </div>
          </div>

          {/* Área de Criação de Frases Personalizadas (Exibida somente na aba correspondente) */}
          {categoriaAtiva === 'personalizadas' && (
            <form onSubmit={handleAdicionarFraseCustom} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Salvar nova frase frequente..."
                value={novaFraseCustom}
                onChange={(e) => setNovaFraseCustom(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <Plus size={14} /> Salvar
              </button>
            </form>
          )}

          {/* Grade de Frases / Respostas Rápidas */}
          <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
            {categoriaAtiva === 'personalizadas' ? (
              frasesCustom.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">Nenhuma frase salva ainda.</p>
              ) : (
                frasesCustom.map((frase, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => falarTexto(frase)}
                      className="flex-1 text-left px-3 py-2 font-medium text-slate-800 text-sm active:bg-indigo-50 flex items-center justify-between rounded-lg"
                    >
                      <span>{frase}</span>
                      <Volume2 size={16} className="text-indigo-500 shrink-0 ml-2" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoverFraseCustom(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Excluir frase"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )
            ) : (
              CATEGORIAS_PADRAO[categoriaAtiva].map((frase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => falarTexto(frase)}
                  className="text-left bg-white border border-slate-200 hover:border-indigo-400 p-3 rounded-xl font-medium text-slate-800 text-sm shadow-sm active:bg-indigo-50 flex items-center justify-between transition-colors"
                >
                  <span>{frase}</span>
                  <Volume2 size={16} className="text-indigo-500 shrink-0 ml-2" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Input de Fala Avulsa / Digitação Livre */}
        <form onSubmit={handleEnviarManual} className="flex gap-2 mt-3">
          <input
            type="text"
            placeholder="Ou digite o que precisa agora..."
            value={textoManual}
            onChange={(e) => setTextoManual(e.target.value)}
            className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl shadow-md transition-colors active:scale-95 flex items-center justify-center"
            title="Falar em voz alta"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Modais de Apoio PIX e Legalidade LGPD */}
      <PixModal isOpen={isPixOpen} onClose={() => setIsPixOpen(false)} />
      <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
    </div>
  );
}
