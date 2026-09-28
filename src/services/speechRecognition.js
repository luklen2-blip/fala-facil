/**
 * Gerenciador nativo de Reconhecimento de Voz (STT) via Web Speech API em pt-BR.
 * Não requer chaves de API pagas e opera diretamente no navegador.
 */

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export class SpeechRecognitionManager {
  constructor({ onResult, onError, onStatusChange }) {
    this.onResult = onResult || (() => {});
    this.onError = onError || (() => {});
    this.onStatusChange = onStatusChange || (() => {});
    
    this.recognition = null;
    this.isListening = false;
    this.shouldKeepListening = false;
    this.finalTranscript = '';

    this._init();
  }

  _init() {
    if (!isSpeechRecognitionSupported()) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'pt-BR';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStatusChange(true);
    };

    this.recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          this.finalTranscript = this.finalTranscript
            ? `${this.finalTranscript} ${transcript.trim()}`
            : transcript.trim();
        } else {
          interim += transcript;
        }
      }
      this.onResult(this.finalTranscript, interim);
    };

    this.recognition.onerror = (event) => {
      console.warn('SpeechRecognition error:', event.error);
      let friendlyMessage = 'Ocorreu uma falha no microfone.';

      switch (event.error) {
        case 'not-allowed':
          friendlyMessage = 'Permissão de microfone negada. Permita o acesso ao microfone no cadeado da barra de endereço.';
          this.shouldKeepListening = false;
          break;
        case 'no-speech':
          friendlyMessage = 'Nenhuma voz foi detectada.';
          break;
        case 'audio-capture':
          friendlyMessage = 'Nenhum microfone encontrado neste aparelho.';
          this.shouldKeepListening = false;
          break;
        case 'network':
          friendlyMessage = 'Falha de conexão com o serviço de transcrição do navegador.';
          break;
        case 'aborted':
          return; // Ação voluntária de cancelamento
        default:
          friendlyMessage = `Aviso do microfone: ${event.error}`;
      }

      this.onError(friendlyMessage, event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      // Reconexão resiliente se o usuário não tiver clicado para parar
      if (this.shouldKeepListening) {
        try {
          this.recognition.start();
          this.isListening = true;
          this.onStatusChange(true);
          return;
        } catch (e) {
          console.warn('Erro ao reiniciar reconhecimento contínuo:', e);
        }
      }
      this.onStatusChange(false);
    };
  }

  start() {
    if (!this.recognition) {
      this.onError('Reconhecimento de fala não suportado neste navegador. Use o Chrome, Edge ou Safari.', 'unsupported');
      return false;
    }

    if (this.isListening) {
      return true;
    }

    try {
      this.shouldKeepListening = true;
      this.recognition.start();
      return true;
    } catch (err) {
      console.warn('Erro ao disparar microfone:', err);
      // Se já estiver em execução, não derruba
      if (err.name === 'InvalidStateError') {
        this.isListening = true;
        this.onStatusChange(true);
        return true;
      }
      this.onError('Não foi possível iniciar o microfone. Verifique as permissões.', 'start_error');
      return false;
    }
  }

  stop() {
    this.shouldKeepListening = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Erro ao parar reconhecimento:', e);
      }
    }
    this.isListening = false;
    this.onStatusChange(false);
  }

  clear() {
    this.finalTranscript = '';
    this.onResult('', '');
  }

  setFinalText(text) {
    this.finalTranscript = text;
    this.onResult(text, '');
  }
}
