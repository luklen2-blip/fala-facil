import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, RotateCcw, Send, Building2, 
  ShoppingBag, MessageCircle, Plus, Trash2, BookmarkCheck, CheckCircle2,
  Shield, Heart, Type, Eye, QrCode, Store, ArrowLeft, AlertCircle,
  Tag, Download, ExternalLink, Settings, Sparkles, Copy, Check
} from 'lucide-react';
import PixModal from './components/PixModal.jsx';
import LegalModal from './components/LegalModal.jsx';
import QRAdminModal from './components/QRAdminModal.jsx';
import QRVisualGeneratorModal from './components/QRVisualGeneratorModal.jsx';
import CommercialPlansModal from './components/CommercialPlansModal.jsx';
import QRQuickViewModal from './components/QRQuickViewModal.jsx';
import { getQRCodeBySlug, sanitizeSlug, generateQRDataUrl, buildPublicQRUrl } from './services/qrCodeService.js';
import { PLANOS_COMERCIAIS, COPY_POSICIONAMENTO } from './data/qrTemplates.js';

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
  
  // Acessibilidade: Escala de Fonte e Modo Alto Contraste
  const [fontSizeIndex, setFontSizeIndex] = useState(1); // 0 = Padrão (lg), 1 = Grande (xl), 2 = Extra Grande (2xl)
  const [altoContraste, setAltoContraste] = useState(false);

  // Módulo QR Code FalaFácil
  const [qrProfile, setQrProfile] = useState(null); // null | profile object | 'not_found' | 'disabled'
  const [viewStandardFallback, setViewStandardFallback] = useState(false);
  const [isQRAdminOpen, setIsQRAdminOpen] = useState(false);
  const [selectedVisualQR, setSelectedVisualQR] = useState(null);

  // Frases personalizadas salvas no navegador (com fallback resiliente)
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
  const [pixPlanData, setPixPlanData] = useState({ amount: '19.90', name: '' });
  const [isCommercialOpen, setIsCommercialOpen] = useState(false);
  const [isQRQuickOpen, setIsQRQuickOpen] = useState(false);
  const [painelAba, setPainelAba] = useState('frases'); // 'frases' | 'qrcode' | 'planos'
  const [inlineQRUrl, setInlineQRUrl] = useState('');
  const [copiedInlineLink, setCopiedInlineLink] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(
    typeof window !== 'undefined' &&
    (window.location.pathname === '/termos' || window.location.pathname === '/privacidade')
  );

  const recognitionRef = useRef(null);
  const shouldKeepListeningRef = useRef(false);

  // Gera o QR Code inline para visualização imediata no balcão
  useEffect(() => {
    const targetSlug = (qrProfile && typeof qrProfile === 'object' && qrProfile.slug) ? qrProfile.slug : 'farmacia-central';
    generateQRDataUrl(buildPublicQRUrl(targetSlug), { width: 320, margin: 2 }).then(url => {
      setInlineQRUrl(url);
    });
  }, [qrProfile]);

  const handleSelectPlan = (nomePlano, valorNumerico) => {
    setPixPlanData({ amount: valorNumerico, name: `Plano ${nomePlano}` });
    setIsCommercialOpen(false);
    setIsPixOpen(true);
  };

  // Mapeamento de escalas de fonte
  const fontScales = ['text-lg', 'text-xl', 'text-2xl'];
  const fontLabels = ['A', 'A+', 'A++'];

  // Detecção automática de QR Code no URL (/qr/:slug ou ?qr=slug)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    let slug = searchParams.get('qr');
    if (!slug && path.startsWith('/qr/')) {
      slug = path.replace('/qr/', '').split('/')[0];
    }

    if (slug) {
      const clean = sanitizeSlug(slug);
      getQRCodeBySlug(clean).then(item => {
        if (!item) {
          setQrProfile('not_found');
        } else if (item.ativo === false) {
          setQrProfile({ ...item, disabled: true });
        } else {
          setQrProfile(item);
        }
      });
    } else {
      setQrProfile(null);
    }
  }, []);

  // Salva no localStorage sempre que as frases customizadas mudarem
  useEffect(() => {
    try {
      localStorage.setItem('falafacil_frases_custom', JSON.stringify(frasesCustom));
    } catch (e) {
      console.warn('Nota: localStorage não disponível:', e);
    }
  }, [frasesCustom]);

  // Inicialização do Reconhecimento de Fala Nativo com Reconexão Resiliente
  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event) => {
        let textoCompleto = '';
        for (let i = 0; i < event.results.length; i++) {
          const pedaco = event.results[i][0].transcript.trim();
          if (pedaco) {
            textoCompleto = textoCompleto ? `${textoCompleto} ${pedaco}` : pedaco;
          }
        }
        setTranscricao(textoCompleto);
      };

      recognition.onerror = (e) => {
        console.warn('Aviso de reconhecimento:', e.error);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          shouldKeepListeningRef.current = false;
          setOuvindo(false);
        }
      };

      recognition.onend = () => {
        if (shouldKeepListeningRef.current) {
          try {
            recognition.start();
            setOuvindo(true);
            return;
          } catch (err) {
            console.warn('Erro ao reiniciar escuta contínua:', err);
          }
        }
        setOuvindo(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      shouldKeepListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const alternarMicrofone = () => {
    if (!recognitionRef.current) {
      alert("Navegador sem suporte nativo a reconhecimento de voz. Utilize o Chrome, Edge ou Safari.");
      return;
    }

    if (ouvindo) {
      shouldKeepListeningRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setOuvindo(false);
    } else {
      shouldKeepListeningRef.current = true;
      setTranscricao('');
      try {
        recognitionRef.current.start();
        setOuvindo(true);
      } catch (e) {
        console.warn('Erro ao iniciar reconhecimento:', e);
        shouldKeepListeningRef.current = false;
        setOuvindo(false);
      }
    }
  };

  // Síntese de Voz com Seleção Nativa de Voz pt-BR e Haptic Feedback
  const falarTexto = (texto) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto.trim());
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95; // Cadência confortável para balcão

    try {
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(v => v.lang === 'pt-BR' || v.lang === 'pt_BR') || voices.find(v => v.lang.startsWith('pt'));
      if (ptVoice) {
        utterance.voice = ptVoice;
      }
    } catch (e) {}

    utterance.onstart = () => {
      setFalando(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(60);
        } catch (e) {}
      }
    };

    utterance.onend = () => {
      setFalando(false);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([40, 60, 40]);
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
    const limpo = textoManual.trim();
    if (!limpo) return;
    falarTexto(limpo);
    setTextoManual('');
  };

  const handleAdicionarFraseCustom = (e) => {
    e.preventDefault();
    const limpa = novaFraseCustom.trim();
    if (!limpa) return;
    if (limpa.length > 120) {
      alert("A frase não pode exceder 120 caracteres.");
      return;
    }
    if (frasesCustom.some(f => f.toLowerCase() === limpa.toLowerCase())) {
      alert("Esta frase já está na sua lista.");
      return;
    }
    setFrasesCustom([limpa, ...frasesCustom]);
    setNovaFraseCustom('');
  };

  const handleRemoverFraseCustom = (index) => {
    setFrasesCustom(frasesCustom.filter((_, i) => i !== index));
  };

  const handleToggleFontSize = () => {
    setFontSizeIndex((prev) => (prev + 1) % 3);
  };

  const handleToggleAltoContraste = () => {
    setAltoContraste((prev) => !prev);
  };

  const handleResetToStandard = () => {
    setQrProfile(null);
    setViewStandardFallback(false);
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/');
    }
  };

  const isProfileActive = qrProfile && qrProfile !== 'not_found' && !qrProfile.disabled && !viewStandardFallback;

  return (
    <div className={`flex justify-center items-stretch min-h-screen ${altoContraste ? 'bg-black' : 'bg-slate-900'}`}>
      <main className={`flex flex-col h-screen w-full max-w-md mx-auto font-sans shadow-2xl select-none overflow-hidden border-x ${
        altoContraste ? 'bg-black text-yellow-300 border-yellow-500' : 'bg-slate-100 text-slate-800 border-slate-300'
      }`}>
        
        {/* PAINEL SUPERIOR: Atendente Ouvinte */}
        <section className={`flex-1 p-4 flex flex-col justify-between border-b-4 ${
          altoContraste ? 'bg-zinc-950 border-yellow-400' : 'bg-white border-indigo-600'
        }`}>
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                altoContraste ? 'bg-yellow-400 text-black font-black' : 'text-indigo-700 bg-indigo-50 border border-indigo-200'
              }`}>
                Atendente Ouvinte
              </span>
              {ouvindo && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Ao Vivo
                </span>
              )}
            </div>

            {/* Barra de Ferramentas de Acessibilidade & Gestão */}
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {/* Botão QR Code em destaque */}
              <button 
                type="button"
                onClick={() => setIsQRQuickOpen(true)}
                title="QR Code para o Balcão"
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 text-xs font-black shadow-sm ${
                  altoContraste 
                    ? 'bg-yellow-400 text-black' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
                aria-label="Abrir QR Code do Balcão"
              >
                <QrCode size={13} />
                <span className="text-[11px]">QR Code</span>
              </button>

              {/* Botão Planos e Valores */}
              <button 
                type="button"
                onClick={() => setIsCommercialOpen(true)}
                title="Planos Comerciais a partir de R$ 19,90"
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 text-xs font-black shadow-sm ${
                  altoContraste 
                    ? 'bg-yellow-300 text-black' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
                aria-label="Ver Planos e Valores"
              >
                <Tag size={13} />
                <span className="text-[11px]">Valores</span>
              </button>

              {/* Painel Administrativo de Gestão */}
              <button 
                type="button"
                onClick={() => setIsQRAdminOpen(true)}
                title="Gerenciar Meus QR Codes"
                className={`p-1.5 rounded-lg transition-colors ${
                  altoContraste 
                    ? 'bg-zinc-800 text-yellow-300 border border-yellow-400' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-label="Configurar QR Codes"
              >
                <Settings size={14} />
              </button>

              {/* Zoom de Fonte */}
              <button 
                type="button"
                onClick={handleToggleFontSize}
                title="Ajustar tamanho da fonte"
                className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                  altoContraste ? 'bg-zinc-800 text-yellow-300 border border-yellow-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                aria-label={`Tamanho da fonte: nível ${fontLabels[fontSizeIndex]}`}
              >
                {fontLabels[fontSizeIndex]}
              </button>

              {/* Modo Alto Contraste */}
              <button 
                type="button"
                onClick={handleToggleAltoContraste}
                title="Alternar Alto Contraste"
                className={`p-1 rounded transition-colors ${
                  altoContraste ? 'bg-yellow-400 text-black' : 'text-slate-400 hover:text-indigo-600'
                }`}
                aria-label="Alternar modo de alto contraste"
              >
                <Eye size={15} />
              </button>

              {/* Termos & LGPD */}
              <button 
                type="button"
                onClick={() => setIsLegalOpen(true)}
                title="Termos de Uso e LGPD"
                className={`p-1 transition-colors ${
                  altoContraste ? 'text-yellow-400' : 'text-slate-400 hover:text-indigo-600'
                }`}
                aria-label="Termos e LGPD"
              >
                <Shield size={15} />
              </button>

              {/* Limpar Conversa */}
              <button 
                type="button"
                onClick={() => setTranscricao('')} 
                className={`text-xs flex items-center gap-1 font-medium transition-colors ml-1 px-1.5 py-0.5 rounded ${
                  altoContraste ? 'bg-zinc-800 text-yellow-400 border border-yellow-500' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Limpar transcrição"
              >
                <RotateCcw size={13} /> Limpar
              </button>
            </div>
          </div>

          {/* Caixa de Exibição da Transcrição */}
          <div className={`my-auto min-h-[100px] max-h-[155px] overflow-y-auto flex items-center justify-center text-center p-3.5 rounded-2xl border ${
            altoContraste 
              ? 'bg-black border-yellow-400 text-yellow-300' 
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
          role="region"
          aria-live="polite"
          >
            <p className={`font-semibold leading-snug ${fontScales[fontSizeIndex]}`}>
              {transcricao || (ouvindo ? "Ouvindo atentamente... Fale no seu ritmo." : "Toque no botão abaixo e fale com clareza")}
            </p>
          </div>

          {/* Botão de Gravação Principal */}
          <button
            type="button"
            onClick={alternarMicrofone}
            className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold shadow-md transition-all active:scale-[0.98] ${
              ouvindo 
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200' 
                : altoContraste
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
            aria-pressed={ouvindo}
          >
            {ouvindo ? <MicOff size={26} /> : <Mic size={26} />}
            <span>{ouvindo ? "Concluir Fala" : "Toque para Falar"}</span>
          </button>
        </section>

        {/* FEEDBACK VISUAL DE FALA EM ANDAMENTO */}
        {falando && (
          <div className="bg-emerald-600 text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-bold animate-pulse shadow-inner">
            <Volume2 size={18} />
            <span>Celular reproduzindo áudio para o atendente...</span>
          </div>
        )}

        {/* PAINEL INFERIOR: Usuário Surdo */}
        <section className={`flex-[1.3] p-4 flex flex-col justify-between overflow-hidden ${
          altoContraste ? 'bg-zinc-950 text-yellow-300' : 'bg-slate-50'
        }`}>
          <div className="flex flex-col h-full overflow-hidden">
            {/* Navegação Rápida do Balcão: Frases, QR Code no Balcão, Planos & Valores */}
            <div className="flex items-center justify-between gap-1 mb-2 bg-slate-200/80 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setPainelAba('frases')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  painelAba === 'frases'
                    ? (altoContraste ? 'bg-yellow-400 text-black font-black' : 'bg-white text-indigo-900 shadow-sm')
                    : (altoContraste ? 'text-yellow-400 hover:text-yellow-200' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <MessageCircle size={13} />
                <span>Frases</span>
              </button>

              <button
                type="button"
                onClick={() => setPainelAba('qrcode')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  painelAba === 'qrcode'
                    ? (altoContraste ? 'bg-yellow-400 text-black font-black' : 'bg-white text-indigo-900 shadow-sm')
                    : (altoContraste ? 'text-yellow-400 hover:text-yellow-200' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <QrCode size={13} />
                <span>QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setPainelAba('planos')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  painelAba === 'planos'
                    ? (altoContraste ? 'bg-yellow-400 text-black font-black' : 'bg-white text-emerald-900 shadow-sm')
                    : (altoContraste ? 'text-yellow-400 hover:text-yellow-200' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <Tag size={13} />
                <span>Planos (R$ 19,90)</span>
              </button>
            </div>

            {/* ABA: QR CODE NO BALCÃO */}
            {painelAba === 'qrcode' && (
              <div className="flex-1 overflow-y-auto space-y-3 py-1 text-center">
                <div className={`p-3.5 rounded-2xl border text-center ${
                  altoContraste ? 'bg-zinc-900 border-yellow-400 text-yellow-300' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <h3 className="font-black text-sm uppercase tracking-wide">
                    QR Code Oficial do Balcão
                  </h3>
                  <p className={`text-xs mt-0.5 ${altoContraste ? 'text-yellow-400' : 'text-slate-600'}`}>
                    Aponte a câmera do celular para abrir o FalaFácil direto neste ponto
                  </p>

                  <div className="my-2.5 flex justify-center">
                    {inlineQRUrl ? (
                      <img 
                        src={inlineQRUrl} 
                        alt="QR Code do Balcão" 
                        className="w-44 h-44 object-contain rounded-xl p-2 bg-white border border-slate-200 shadow-md"
                      />
                    ) : (
                      <div className="w-44 h-44 bg-slate-100 flex items-center justify-center rounded-xl text-xs text-slate-400">
                        Gerando QR Code...
                      </div>
                    )}
                  </div>

                  {/* Link com Copiar */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 mb-2.5">
                    <span className="text-[10px] font-mono text-slate-600 truncate flex-1 px-2 text-left">
                      {buildPublicQRUrl((qrProfile && qrProfile.slug) || 'farmacia-central')}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        const url = buildPublicQRUrl((qrProfile && qrProfile.slug) || 'farmacia-central');
                        try {
                          await navigator.clipboard.writeText(url);
                          setCopiedInlineLink(true);
                          setTimeout(() => setCopiedInlineLink(false), 2000);
                        } catch {
                          alert(`Link: ${url}`);
                        }
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1"
                    >
                      {copiedInlineLink ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedInlineLink ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const item = (isProfileActive && qrProfile) ? qrProfile : { slug: 'farmacia-central', nome: 'Farmácia Central', segmento: 'Farmácia' };
                        setSelectedVisualQR(item);
                      }}
                      className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                        altoContraste ? 'bg-yellow-400 text-black' : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <Download size={14} />
                      <span>Placa de Balcão</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsQRAdminOpen(true)}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                        altoContraste ? 'border-yellow-400 text-yellow-300' : 'border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      Configurar QR
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: PLANOS & VALORES */}
            {painelAba === 'planos' && (
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                <div className={`p-2.5 rounded-xl border text-center ${
                  altoContraste ? 'bg-zinc-900 border-yellow-400 text-yellow-300' : 'bg-indigo-50 border-indigo-200'
                }`}>
                  <h4 className="font-extrabold text-xs text-indigo-950">{COPY_POSICIONAMENTO.chamadaPrincipal}</h4>
                  <p className="text-[10px] text-indigo-800 mt-0.5">{COPY_POSICIONAMENTO.selo}</p>
                </div>

                {PLANOS_COMERCIAIS.map((plano) => {
                  const valorLimpo = plano.preco.replace('R$', '').split('/')[0].trim().replace(',', '.');
                  const isPop = plano.badge === 'Popular';
                  return (
                    <div 
                      key={plano.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        altoContraste 
                          ? 'bg-black border-yellow-500 text-yellow-300' 
                          : isPop 
                          ? 'bg-gradient-to-br from-indigo-50/60 to-white border-indigo-300 ring-1 ring-indigo-400/30 shadow-sm'
                          : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm">{plano.nome}</span>
                            {plano.badge && (
                              <span className="px-1.5 py-0.2 bg-indigo-600 text-white text-[9px] font-bold rounded-full">
                                {plano.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-indigo-600 font-bold mt-0.5">{plano.destaque}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-base text-slate-900">{plano.preco}</span>
                          <p className="text-[10px] text-slate-400">{plano.cobranca}</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">{plano.descricao}</p>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-emerald-700 font-bold">Ativação Instantânea</span>
                        <button
                          type="button"
                          onClick={() => handleSelectPlan(plano.nome, valorLimpo)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all"
                        >
                          Contratar via Pix
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ABA: FRASES RÁPIDAS (PADRÃO / ESTABELECIMENTO) */}
            {painelAba === 'frases' && (
              <div className="flex-1 overflow-y-auto">
                {/* Banner Indicativo de QR Code e Valores */}
                <div className={`px-3 py-1.5 rounded-xl border flex items-center justify-between mb-2 shadow-sm ${
                  altoContraste ? 'bg-zinc-900 border-yellow-400 text-yellow-300' : 'bg-indigo-50 border-indigo-200 text-indigo-950'
                }`}>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 block">Balcão Acessível</span>
                    <span className="text-xs font-bold">📲 QR Code Ativo • Planos a partir de R$ 19,90</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setPainelAba('qrcode')}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2 py-0.5 rounded-lg shadow-sm"
                    >
                      Ver QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setPainelAba('planos')}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-lg shadow-sm"
                    >
                      Valores
                    </button>
                  </div>
                </div>

                {/* CENÁRIO 1: QR CODE ATIVO ESPECÍFICO DO ESTABELECIMENTO */}
                {isProfileActive ? (
              <div className="space-y-3">
                {/* Banner de Boas-Vindas do Estabelecimento */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  altoContraste ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-indigo-100 shadow-sm'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Store size={16} className={altoContraste ? 'text-yellow-400' : 'text-indigo-600'} />
                        <h2 className="font-black text-sm uppercase tracking-wide">
                          {qrProfile.nome}
                        </h2>
                      </div>
                      {qrProfile.setor && (
                        <p className={`text-[11px] font-semibold ml-5 ${altoContraste ? 'text-yellow-500' : 'text-indigo-500'}`}>
                          {qrProfile.setor}
                        </p>
                      )}
                      <p className={`text-xs mt-1 font-medium ${altoContraste ? 'text-yellow-300' : 'text-slate-600'}`}>
                        {qrProfile.fraseBoasVindas}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewStandardFallback(true)}
                      className="text-[10px] text-slate-400 hover:text-indigo-600 font-semibold underline shrink-0"
                    >
                      Todas categorias
                    </button>
                  </div>
                </div>

                {/* Lista Exclusiva de Frases do Estabelecimento */}
                <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                  {qrProfile.frases && qrProfile.frases.map((frase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => falarTexto(frase)}
                      className={`text-left border p-3 rounded-xl font-medium text-sm shadow-sm flex items-center justify-between transition-all active:scale-[0.99] ${
                        altoContraste 
                          ? 'bg-black border-yellow-500 text-yellow-300 hover:border-yellow-300' 
                          : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800 active:bg-indigo-50'
                      }`}
                      aria-label={`Falar frase: ${frase}`}
                    >
                      <span className="leading-snug">{frase}</span>
                      <Volume2 size={16} className={`shrink-0 ml-2 ${altoContraste ? 'text-yellow-400' : 'text-indigo-500'}`} />
                    </button>
                  ))}
                </div>
              </div>
            ) : qrProfile === 'not_found' ? (
              /* CENÁRIO 2: QR CODE NÃO ENCONTRADO */
              <div className="text-center py-6 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <AlertCircle size={32} className="mx-auto text-amber-500" />
                <h3 className="font-bold text-sm text-slate-800">QR Code Não Encontrado</h3>
                <p className="text-xs text-slate-500">
                  O perfil que você tentou acessar não foi localizado ou o link foi modificado.
                </p>
                <button
                  type="button"
                  onClick={handleResetToStandard}
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Acessar FalaFácil Balcão Padrão
                </button>
              </div>
            ) : qrProfile?.disabled ? (
              /* CENÁRIO 3: QR CODE DESATIVADO */
              <div className="text-center py-6 px-4 bg-white rounded-2xl border border-rose-200 shadow-sm space-y-2">
                <AlertCircle size={32} className="mx-auto text-rose-500" />
                <h3 className="font-bold text-sm text-slate-800">QR Code Temporariamente Desativado</h3>
                <p className="text-xs text-slate-500">
                  O estabelecimento "{qrProfile.nome}" pausou este ponto de atendimento.
                </p>
                <button
                  type="button"
                  onClick={handleResetToStandard}
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Acessar FalaFácil Balcão Padrão
                </button>
              </div>
            ) : (
              /* CENÁRIO 4: FALAFÁCIL PADRÃO (CATEGORIAS GLOBAIS + FRASES CUSTOM) */
              <div>
                {/* Botão de retorno se estiver vendo categorias como fallback de um QR */}
                {viewStandardFallback && qrProfile && (
                  <div className="mb-2 flex items-center justify-between pb-1 border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => setViewStandardFallback(false)}
                      className="text-xs font-bold text-indigo-600 flex items-center gap-1"
                    >
                      <ArrowLeft size={13} /> Voltar para {qrProfile.nome}
                    </button>
                  </div>
                )}

                {/* Cabeçalho de Navegação de Categorias */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    altoContraste ? 'text-yellow-400' : 'text-slate-500'
                  }`}>
                    Minhas Respostas
                  </span>
                  <div className={`flex gap-1 p-1 rounded-xl ${
                    altoContraste ? 'bg-zinc-900 border border-yellow-500' : 'bg-slate-200'
                  }`}>
                    <button 
                      type="button"
                      title="Serviços Públicos"
                      onClick={() => setCategoriaAtiva('servicos')} 
                      className={`p-1.5 rounded-lg transition-colors ${
                        categoriaAtiva === 'servicos' 
                          ? (altoContraste ? 'bg-yellow-400 text-black' : 'bg-white shadow-sm text-indigo-600') 
                          : (altoContraste ? 'text-yellow-400' : 'text-slate-600')
                      }`}
                      aria-label="Categoria Serviços Públicos"
                    >
                      <Building2 size={16} />
                    </button>
                    <button 
                      type="button"
                      title="Comércio e Farmácias"
                      onClick={() => setCategoriaAtiva('comercio')} 
                      className={`p-1.5 rounded-lg transition-colors ${
                        categoriaAtiva === 'comercio' 
                          ? (altoContraste ? 'bg-yellow-400 text-black' : 'bg-white shadow-sm text-indigo-600') 
                          : (altoContraste ? 'text-yellow-400' : 'text-slate-600')
                      }`}
                      aria-label="Categoria Comércio"
                    >
                      <ShoppingBag size={16} />
                    </button>
                    <button 
                      type="button"
                      title="Dúvidas de Comunicação"
                      onClick={() => setCategoriaAtiva('ajuda')} 
                      className={`p-1.5 rounded-lg transition-colors ${
                        categoriaAtiva === 'ajuda' 
                          ? (altoContraste ? 'bg-yellow-400 text-black' : 'bg-white shadow-sm text-indigo-600') 
                          : (altoContraste ? 'text-yellow-400' : 'text-slate-600')
                      }`}
                      aria-label="Categoria Ajuda e Diálogo"
                    >
                      <MessageCircle size={16} />
                    </button>
                    <button 
                      type="button"
                      title="Minhas Frases Salvas"
                      onClick={() => setCategoriaAtiva('personalizadas')} 
                      className={`p-1.5 rounded-lg transition-colors ${
                        categoriaAtiva === 'personalizadas' 
                          ? (altoContraste ? 'bg-yellow-400 text-black' : 'bg-white shadow-sm text-indigo-600') 
                          : (altoContraste ? 'text-yellow-400' : 'text-slate-600')
                      }`}
                      aria-label="Categoria Frases Salvas"
                    >
                      <BookmarkCheck size={16} />
                    </button>
                  </div>
                </div>

                {/* Área de Criação de Frases Personalizadas */}
                {categoriaAtiva === 'personalizadas' && (
                  <form onSubmit={handleAdicionarFraseCustom} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      maxLength={120}
                      placeholder="Salvar nova frase frequente..."
                      value={novaFraseCustom}
                      onChange={(e) => setNovaFraseCustom(e.target.value)}
                      className={`flex-1 border rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 ${
                        altoContraste 
                          ? 'bg-black border-yellow-400 text-yellow-300 focus:ring-yellow-300' 
                          : 'bg-white border-slate-300 focus:ring-indigo-500 text-slate-800'
                      }`}
                      aria-label="Texto da nova frase personalizada"
                    />
                    <button
                      type="submit"
                      className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold ${
                        altoContraste 
                          ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      <Plus size={14} /> Salvar
                    </button>
                  </form>
                )}

                {/* Grade de Frases Globais */}
                <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                  {categoriaAtiva === 'personalizadas' ? (
                    frasesCustom.length === 0 ? (
                      <p className={`text-center text-xs py-6 ${altoContraste ? 'text-yellow-500' : 'text-slate-400'}`}>
                        Nenhuma frase salva ainda. Digite acima para criar.
                      </p>
                    ) : (
                      frasesCustom.map((frase, idx) => (
                        <div key={idx} className={`flex items-center gap-1.5 border rounded-xl p-1 shadow-sm ${
                          altoContraste ? 'bg-black border-yellow-500' : 'bg-white border-slate-200'
                        }`}>
                          <button
                            type="button"
                            onClick={() => falarTexto(frase)}
                            className={`flex-1 text-left px-3 py-2 font-medium text-sm rounded-lg active:scale-[0.99] flex items-center justify-between ${
                              altoContraste ? 'text-yellow-300 hover:bg-zinc-900' : 'text-slate-800 active:bg-indigo-50'
                            }`}
                            aria-label={`Falar: ${frase}`}
                          >
                            <span>{frase}</span>
                            <Volume2 size={16} className={`shrink-0 ml-2 ${altoContraste ? 'text-yellow-400' : 'text-indigo-500'}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoverFraseCustom(idx)}
                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Excluir frase"
                            aria-label={`Excluir frase: ${frase}`}
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
                        className={`text-left border p-3 rounded-xl font-medium text-sm shadow-sm flex items-center justify-between transition-all active:scale-[0.99] ${
                          altoContraste 
                            ? 'bg-black border-yellow-500 text-yellow-300 hover:border-yellow-300' 
                            : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800 active:bg-indigo-50'
                        }`}
                        aria-label={`Falar: ${frase}`}
                      >
                        <span>{frase}</span>
                        <Volume2 size={16} className={`shrink-0 ml-2 ${altoContraste ? 'text-yellow-400' : 'text-indigo-500'}`} />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

          {/* Input de Fala Avulsa / Digitação Livre */}
          <form onSubmit={handleEnviarManual} className="flex gap-2 mt-3 shrink-0">
            <input
              type="text"
              maxLength={200}
              placeholder="Ou digite o que precisa agora..."
              value={textoManual}
              onChange={(e) => setTextoManual(e.target.value)}
              className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 shadow-inner ${
                altoContraste 
                  ? 'bg-black border-yellow-400 text-yellow-300 focus:ring-yellow-300' 
                  : 'bg-white border-slate-300 focus:ring-indigo-500 text-slate-800'
              }`}
              aria-label="Texto avulso para sintetizar em voz alta"
            />
            <button
              type="submit"
              disabled={!textoManual.trim()}
              className={`p-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center ${
                textoManual.trim()
                  ? (altoContraste ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
              }`}
              title="Falar em voz alta"
              aria-label="Falar em voz alta"
            >
              <Send size={18} />
            </button>
          </form>
        </section>

        {/* Modais de Apoio PIX, Legalidade LGPD, Planos Comerciais e QR Codes */}
        <PixModal 
          isOpen={isPixOpen} 
          onClose={() => setIsPixOpen(false)} 
          initialAmount={pixPlanData.amount}
          planName={pixPlanData.name}
        />
        <CommercialPlansModal
          isOpen={isCommercialOpen}
          onClose={() => setIsCommercialOpen(false)}
          onSelectPlan={handleSelectPlan}
        />
        <QRQuickViewModal
          isOpen={isQRQuickOpen}
          onClose={() => setIsQRQuickOpen(false)}
          onOpenPlacard={(item) => setSelectedVisualQR(item)}
          onOpenAdmin={() => setIsQRAdminOpen(true)}
          activeProfile={qrProfile}
        />
        <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
        <QRAdminModal 
          isOpen={isQRAdminOpen} 
          onClose={() => setIsQRAdminOpen(false)}
          onSelectVisualQR={(item) => setSelectedVisualQR(item)}
          onSelectPlan={handleSelectPlan}
        />
        <QRVisualGeneratorModal
          isOpen={Boolean(selectedVisualQR)}
          onClose={() => setSelectedVisualQR(null)}
          qrItem={selectedVisualQR}
        />
      </main>
    </div>
  );
}
