import React, { useState } from 'react';
import { Mic, MicOff, RotateCcw, Volume2, Ear, AlertCircle, Edit3, Check } from 'lucide-react';

export default function AttendantPanel({
  transcript,
  interimTranscript,
  isListening,
  onToggleListening,
  onClear,
  onManualTextSubmit,
  fontScale = 'text-xl',
  errorMessage = null,
  isSpeechSupported = true
}) {
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualText, setManualText] = useState('');

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    onManualTextSubmit(manualText.trim());
    setManualText('');
    setShowManualInput(false);
  };

  const hasContent = Boolean(transcript || interimTranscript);

  return (
    <section className="bg-white border-b-4 border-blue-600 rounded-b-2xl shadow-md p-4 flex flex-col transition-colors duration-200">
      {/* Cabeçalho do Painel do Atendente */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-100 text-blue-800 border border-blue-300">
            <Ear className="w-3.5 h-3.5 text-blue-600" />
            Atendente Ouvinte
          </span>
          {isListening && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Ao vivo
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Botão de Digitação Manual Alternativa */}
          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            title="Digitar texto manualmente"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Alternar digitação manual do atendente"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Botão Limpar Conversa */}
          <button
            type="button"
            onClick={onClear}
            disabled={!hasContent}
            title="Limpar texto da conversa"
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              hasContent
                ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 active:scale-95'
                : 'text-slate-400 bg-slate-100 cursor-not-allowed border border-transparent'
            }`}
            aria-label="Limpar conversa"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar conversa
          </button>
        </div>
      </div>

      {/* Caixa de Digitação Manual (se acionada) */}
      {showManualInput && (
        <form onSubmit={handleManualSubmit} className="mt-3 flex gap-2">
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Digite o que deseja responder..."
            className="flex-1 px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Inserir
          </button>
        </form>
      )}

      {/* Mensagem de Erro ou Permissão */}
      {errorMessage && (
        <div className="mt-2 p-2.5 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Aviso de Microfone</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {!isSpeechSupported && (
        <div className="mt-2 p-2.5 bg-rose-50 border border-rose-300 rounded-lg flex items-start gap-2 text-xs text-rose-900">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Navegador sem suporte a voz</p>
            <p>Utilize o Google Chrome, Edge ou Safari para ativar o microfone automático. Você ainda pode usar o botão de lápis para digitar.</p>
          </div>
        </div>
      )}

      {/* Área Central de Texto Transcrito (Fonte Grande e Alto Contraste) */}
      <div
        className="mt-3 min-h-[140px] max-h-[180px] overflow-y-auto p-3.5 bg-slate-900 text-white rounded-xl flex flex-col justify-between border-2 border-slate-700 shadow-inner"
        role="region"
        aria-live="polite"
        aria-label="Transcrição da voz do atendente em tempo real"
      >
        <div className="space-y-1">
          {hasContent ? (
            <p className={`font-semibold leading-relaxed tracking-wide ${fontScale}`}>
              <span className="text-white">{transcript}</span>
              {interimTranscript && (
                <span className="text-sky-300 italic opacity-90 font-normal ml-1">
                  {interimTranscript}
                </span>
              )}
            </p>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-6 text-center text-slate-400">
              {isListening ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-1.5 h-6">
                    <span className="w-1.5 bg-sky-400 rounded-full audio-bar"></span>
                    <span className="w-1.5 bg-sky-400 rounded-full audio-bar"></span>
                    <span className="w-1.5 bg-sky-400 rounded-full audio-bar"></span>
                    <span className="w-1.5 bg-sky-400 rounded-full audio-bar"></span>
                    <span className="w-1.5 bg-sky-400 rounded-full audio-bar"></span>
                  </div>
                  <span className="text-sky-300 font-medium text-base">
                    Ouvindo você... Fale no seu ritmo
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-slate-300 font-medium text-sm">Nenhuma fala no momento</p>
                  <p className="text-xs text-slate-400">
                    Toque no botão azul abaixo e fale em direção ao aparelho.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Indicador de Status na base do visor */}
        {hasContent && (
          <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Visível para a pessoa surda</span>
            {isListening && (
              <span className="flex items-center gap-1 text-sky-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                Transcrevendo...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Botão Grande de Ação: Toque para Falar / Parar de Ouvir */}
      <div className="mt-3.5 flex justify-center">
        <button
          type="button"
          onClick={onToggleListening}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.98] ${
            isListening
              ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse-fast ring-4 ring-rose-200'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
          }`}
          aria-pressed={isListening}
          aria-label={isListening ? 'Parar de ouvir transcrição de voz' : 'Iniciar transcrição de voz do atendente'}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              <span>Parar de Ouvir</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 text-white" />
              <span>Toque para Falar</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
