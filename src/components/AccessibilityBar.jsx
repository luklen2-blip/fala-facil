import React from 'react';
import { Eye, Type, Heart, Shield, Sparkles } from 'lucide-react';

export default function AccessibilityBar({
  highContrast,
  onToggleHighContrast,
  fontSizeIndex,
  onChangeFontSize,
  onOpenLegal,
  onOpenPix
}) {
  const fontLabels = ['A', 'A+', 'A++'];

  return (
    <header className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shadow-sm">
      {/* Nome e Identidade da Aplicação */}
      <div className="flex items-center space-x-2">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs tracking-wider">
          FF
        </div>
        <div>
          <h1 className="font-extrabold text-sm leading-tight text-white flex items-center gap-1.5">
            FalaFácil Balcão
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">Inclusão Imediata</p>
        </div>
      </div>

      {/* Ferramentas Rápidas de Acessibilidade */}
      <div className="flex items-center space-x-1.5">
        {/* Alternador de Tamanho de Fonte */}
        <button
          type="button"
          onClick={onChangeFontSize}
          title="Aumentar ou diminuir tamanho da fonte"
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
          aria-label={`Alterar tamanho do texto. Nível atual: ${fontLabels[fontSizeIndex]}`}
        >
          <Type className="w-3.5 h-3.5 text-blue-400" />
          <span>{fontLabels[fontSizeIndex]}</span>
        </button>

        {/* Alternador de Alto Contraste (Baixa Visão) */}
        <button
          type="button"
          onClick={onToggleHighContrast}
          title="Ativar/Desativar modo alto contraste (amarelo e preto)"
          className={`p-1.5 rounded-md border text-xs transition-all active:scale-95 ${
            highContrast
              ? 'bg-yellow-400 text-black border-yellow-300 font-bold'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          aria-pressed={highContrast}
          aria-label="Alternar modo de alto contraste"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Apoio PIX */}
        <button
          type="button"
          onClick={onOpenPix}
          title="Apoiar com PIX voluntário"
          className="p-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/80 rounded-md text-xs transition-all active:scale-95"
          aria-label="Apoiar projeto FalaFácil via PIX"
        >
          <Heart className="w-3.5 h-3.5 fill-emerald-400/20" />
        </button>

        {/* Termos & LGPD */}
        <button
          type="button"
          onClick={onOpenLegal}
          title="Termos de uso e Privacidade LGPD"
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md text-xs transition-all active:scale-95"
          aria-label="Abrir termos de uso e conformidade LGPD"
        >
          <Shield className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
