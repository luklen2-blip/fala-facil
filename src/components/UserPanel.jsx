import React, { useState } from 'react';
import { Landmark, ShoppingBag, HelpCircle, Volume2, UserCheck, MessageSquarePlus } from 'lucide-react';
import QuickCards from './QuickCards.jsx';
import FreeTextInput from './FreeTextInput.jsx';
import { CATEGORIES, QUICK_PHRASES } from '../data/quickPhrases.js';

export default function UserPanel({
  onSpeakPhrase,
  speakingText,
  fontScale = 'text-base'
}) {
  const [activeCategory, setActiveCategory] = useState('servicos');

  const currentPhrases = QUICK_PHRASES[activeCategory] || [];

  const getCategoryIcon = (id) => {
    switch (id) {
      case 'servicos':
        return <Landmark className="w-4 h-4" />;
      case 'comercio':
        return <ShoppingBag className="w-4 h-4" />;
      case 'suporte':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  return (
    <section className="bg-slate-50 rounded-t-2xl shadow-inner p-4 flex flex-col flex-1 border-t-2 border-slate-200">
      {/* Cabeçalho do Painel da Pessoa Surda */}
      <div className="flex items-center justify-between pb-2.5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          Minhas Respostas (Tocar para Falar)
        </span>

        {speakingText && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 animate-pulse">
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            Falando agora...
          </span>
        )}
      </div>

      {/* Barra Seletora de Categorias (Abas / Chips com Ícones) */}
      <div className="flex gap-1.5 p-1 bg-slate-200/80 rounded-xl mt-1 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              aria-selected={isActive}
              role="tab"
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Lista Rolável de Cartões de Resposta Rápida */}
      <div
        className="flex-1 overflow-y-auto mt-2.5 pr-1 max-h-[340px] min-h-[180px]"
        role="tabpanel"
      >
        <QuickCards
          phrases={currentPhrases}
          onSpeakPhrase={onSpeakPhrase}
          speakingText={speakingText}
          fontScale={fontScale}
        />
      </div>

      {/* Campo Inferior de Digitação Livre */}
      <div className="mt-2">
        <FreeTextInput
          onSpeakText={onSpeakPhrase}
          isSpeaking={Boolean(speakingText)}
        />
      </div>
    </section>
  );
}
