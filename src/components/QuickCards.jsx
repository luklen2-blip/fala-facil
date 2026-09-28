import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function QuickCards({
  phrases = [],
  onSpeakPhrase,
  speakingText = null,
  fontScale = 'text-base'
}) {
  return (
    <div className="space-y-2 py-1">
      {phrases.map((item) => {
        const isSpeaking = speakingText === item.text;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSpeakPhrase(item.text)}
            className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center justify-between gap-3 active:scale-[0.98] ${
              isSpeaking
                ? 'bg-emerald-500 border-emerald-600 text-white shadow-md ring-2 ring-emerald-300'
                : 'bg-white hover:bg-emerald-50 border-slate-200 hover:border-emerald-300 text-slate-800 shadow-sm'
            }`}
            aria-label={`Falar em voz alta: ${item.text}`}
          >
            <span className={`font-semibold leading-snug flex-1 ${fontScale}`}>
              {item.text}
            </span>

            <div
              className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                isSpeaking
                  ? 'bg-white text-emerald-600 animate-pulse'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <Volume2 className="w-5 h-5" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
