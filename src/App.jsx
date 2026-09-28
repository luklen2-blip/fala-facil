import React, { useState, useEffect, useRef } from 'react';
import AccessibilityBar from './components/AccessibilityBar.jsx';
import AttendantPanel from './components/AttendantPanel.jsx';
import UserPanel from './components/UserPanel.jsx';
import PixModal from './components/PixModal.jsx';
import LegalModal from './components/LegalModal.jsx';
import { SpeechRecognitionManager, isSpeechRecognitionSupported } from './services/speechRecognition.js';
import { speakText, cancelSpeech, isSpeechSynthesisSupported } from './services/speechSynthesis.js';

export default function App() {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [speakingText, setSpeakingText] = useState(null);

  // Acessibilidade: Escala de fonte e Alto Contraste
  const [fontSizeIndex, setFontSizeIndex] = useState(1); // 0 = Padrão, 1 = Grande (Padrão inicial), 2 = Extra Grande
  const [highContrast, setHighContrast] = useState(false);

  // Modais
  const [isPixOpen, setIsPixOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(
    typeof window !== 'undefined' &&
    (window.location.pathname === '/termos' || window.location.pathname === '/privacidade')
  );

  const recognitionManagerRef = useRef(null);
  const isSpeechSupported = isSpeechRecognitionSupported();

  // Mapeamento de escalas de fonte
  const fontScales = {
    transcript: ['text-lg', 'text-xl', 'text-2xl'],
    cards: ['text-sm', 'text-base', 'text-lg']
  };

  useEffect(() => {
    // Inicialização do Gerenciador de Reconhecimento de Fala
    if (isSpeechSupported) {
      recognitionManagerRef.current = new SpeechRecognitionManager({
        onResult: (finalText, interimText) => {
          setTranscript(finalText);
          setInterimTranscript(interimText);
        },
        onError: (message, code) => {
          setErrorMessage(message);
          setIsListening(false);
        },
        onStatusChange: (status) => {
          setIsListening(status);
          if (status) {
            setErrorMessage(null);
          }
        }
      });
    }

    return () => {
      if (recognitionManagerRef.current) {
        recognitionManagerRef.current.stop();
      }
      cancelSpeech();
    };
  }, [isSpeechSupported]);

  // Alternar microfone
  const handleToggleListening = () => {
    if (!recognitionManagerRef.current) {
      setErrorMessage('Reconhecimento de voz não suportado neste navegador. Use o Chrome ou Edge.');
      return;
    }

    if (isListening) {
      recognitionManagerRef.current.stop();
    } else {
      setErrorMessage(null);
      recognitionManagerRef.current.start();
    }
  };

  // Limpar visor
  const handleClear = () => {
    if (recognitionManagerRef.current) {
      recognitionManagerRef.current.clear();
    }
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
  };

  // Inserção manual de texto pelo atendente
  const handleManualTextSubmit = (text) => {
    const updated = transcript ? `${transcript} ${text}` : text;
    setTranscript(updated);
    if (recognitionManagerRef.current) {
      recognitionManagerRef.current.setFinalText(updated);
    }
  };

  // Disparo de voz alta (TTS) para resposta da pessoa surda
  const handleSpeakPhrase = (textToSpeak) => {
    if (!isSpeechSynthesisSupported()) {
      alert(`Síntese de voz não disponível no navegador. Mensagem selecionada: "${textToSpeak}"`);
      return;
    }

    speakText(textToSpeak, {
      onStart: (txt) => {
        setSpeakingText(txt);
      },
      onEnd: () => {
        setSpeakingText(null);
      },
      onError: (err) => {
        console.warn('Erro ao falar:', err);
        setSpeakingText(null);
      }
    });
  };

  const handleChangeFontSize = () => {
    setFontSizeIndex((prev) => (prev + 1) % 3);
  };

  const handleToggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  return (
    <div
      className={`min-h-screen flex justify-center items-stretch bg-slate-900 ${
        highContrast ? 'high-contrast' : ''
      }`}
    >
      {/* Moldura mobile-first máx-w-md centralizada */}
      <main className="w-full max-w-md bg-white flex flex-col shadow-2xl relative border-x border-slate-300 min-h-screen overflow-hidden">
        {/* Barra Superior de Acessibilidade & Identidade */}
        <AccessibilityBar
          highContrast={highContrast}
          onToggleHighContrast={handleToggleHighContrast}
          fontSizeIndex={fontSizeIndex}
          onChangeFontSize={handleChangeFontSize}
          onOpenLegal={() => setIsLegalOpen(true)}
          onOpenPix={() => setIsPixOpen(true)}
        />

        {/* Bloco 1 (Topo - Painel do Atendente Ouvinte) */}
        <AttendantPanel
          transcript={transcript}
          interimTranscript={interimTranscript}
          isListening={isListening}
          onToggleListening={handleToggleListening}
          onClear={handleClear}
          onManualTextSubmit={handleManualTextSubmit}
          fontScale={fontScales.transcript[fontSizeIndex]}
          errorMessage={errorMessage}
          isSpeechSupported={isSpeechSupported}
        />

        {/* Bloco 2 (Base - Painel da Pessoa Surda) */}
        <UserPanel
          onSpeakPhrase={handleSpeakPhrase}
          speakingText={speakingText}
          fontScale={fontScales.cards[fontSizeIndex]}
        />

        {/* Rodapé sutil informativo */}
        <footer className="bg-slate-100 py-1.5 px-4 text-center border-t border-slate-200">
          <p className="text-[11px] text-slate-500 font-medium">
            FalaFácil Balcão v2.0 • Ferramenta de Inclusão Presencial
          </p>
        </footer>

        {/* Modais de Apoio PIX e Legalidade LGPD */}
        <PixModal isOpen={isPixOpen} onClose={() => setIsPixOpen(false)} />
        <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
      </main>
    </div>
  );
}
