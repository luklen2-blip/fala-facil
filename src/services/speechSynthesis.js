/**
 * Gerenciador nativo de Síntese de Voz (TTS) via Web Speech API em pt-BR.
 * Não requer chaves de API pagas e funciona offline na maioria dos sistemas.
 */

export function isSpeechSynthesisSupported() {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

let cachedVoices = [];

function loadVoices() {
  if (!isSpeechSynthesisSupported()) return [];
  cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices();
    };
  }
}

export function getPtBrVoice() {
  const voices = cachedVoices.length ? cachedVoices : loadVoices();
  
  // 1. Tentar encontrar voz nativa pt-BR brasileira
  const ptBr = voices.find(v => v.lang === 'pt-BR' || v.lang === 'pt_BR');
  if (ptBr) return ptBr;

  // 2. Tentar qualquer voz em português
  const anyPt = voices.find(v => v.lang.startsWith('pt'));
  if (anyPt) return anyPt;

  // 3. Fallback para voz padrão
  return voices.find(v => v.default) || null;
}

export function speakText(text, { onStart, onEnd, onError, rate = 1.0, pitch = 1.0, volume = 1.0 } = {}) {
  if (!isSpeechSynthesisSupported()) {
    if (onError) onError(new Error('Síntese de voz não suportada neste dispositivo.'));
    return false;
  }

  if (!text || !text.trim()) return false;

  try {
    // Cancela qualquer fala pendente para evitar sobreposição
    window.speechSynthesis.cancel();

    // Haptic feedback leve em dispositivos com vibração
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(35);
      } catch (e) {
        // silencioso
      }
    }

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = 'pt-BR';
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    const voice = getPtBrVoice();
    if (voice) {
      utterance.voice = voice;
    }

    if (onStart) {
      utterance.onstart = () => onStart(text);
    }

    utterance.onend = () => {
      if (onEnd) onEnd(text);
    };

    utterance.onerror = (event) => {
      console.warn('SpeechSynthesis error:', event);
      if (onError) onError(event);
      if (onEnd) onEnd(text);
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Falha ao disparar síntese de voz:', err);
    if (onError) onError(err);
    return false;
  }
}

export function cancelSpeech() {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('Erro ao cancelar áudio:', e);
    }
  }
}
