import React, { useState } from 'react';
import { Send, Volume2, CornerDownLeft, Sparkles } from 'lucide-react';

export default function FreeTextInput({ onSpeakText, isSpeaking = false }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSpeakText(text.trim());
    setText('');
  };

  return (
    <div className="pt-2 border-t border-slate-200 bg-white">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ou digite o que deseja falar..."
            className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200 transition-all"
            aria-label="Digitação livre para síntese de voz"
          />
          {text.trim() && (
            <span className="absolute right-3 top-2.5 text-xs text-slate-400">
              <CornerDownLeft className="w-4 h-4 text-emerald-600" />
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={!text.trim()}
          className={`shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all ${
            text.trim()
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          aria-label="Enviar e falar texto digitado em voz alta"
        >
          <Send className="w-4 h-4" />
          <span>Enviar</span>
        </button>
      </form>
    </div>
  );
}
