import React from 'react';
import { X, Check, Sparkles, Tag, ShieldCheck, ArrowRight } from 'lucide-react';
import { PLANOS_COMERCIAIS, COPY_POSICIONAMENTO } from '../data/qrTemplates.js';

export default function CommercialPlansModal({ isOpen, onClose, onSelectPlan }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plans-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Cabeçalho */}
        <header className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Tag size={18} />
            </div>
            <div>
              <h2 id="plans-modal-title" className="font-bold text-sm text-white">
                Planos e Valores Oficiais
              </h2>
              <p className="text-[11px] text-slate-400">
                Ativação imediata para estabelecimentos e balcões
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Fechar modal de planos"
          >
            <X size={18} />
          </button>
        </header>

        {/* Conteúdo com rolagem suave */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Posicionamento Oficial */}
          <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-2xl text-center">
            <h3 className="font-extrabold text-sm text-indigo-950 leading-snug">
              {COPY_POSICIONAMENTO.chamadaPrincipal}
            </h3>
            <p className="text-xs text-indigo-800 mt-1 font-medium leading-relaxed">
              {COPY_POSICIONAMENTO.subtitulo}
            </p>
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-indigo-200/80 text-indigo-900 rounded-full text-[10px] font-bold">
              {COPY_POSICIONAMENTO.selo}
            </span>
          </div>

          {/* Grid com os 5 Planos Oficiais */}
          <div className="space-y-3">
            {PLANOS_COMERCIAIS.map((plano) => {
              const valorLimpo = plano.preco.replace('R$', '').split('/')[0].trim().replace(',', '.');
              const isPopular = plano.badge === 'Popular';

              return (
                <div 
                  key={plano.id}
                  className={`rounded-2xl p-4 transition-all border ${
                    isPopular 
                      ? 'bg-gradient-to-br from-indigo-50/70 to-white border-indigo-300 ring-2 ring-indigo-500/20 shadow-md' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-base text-slate-900">{plano.nome}</h4>
                        {plano.badge && (
                          <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                            {plano.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-indigo-600 font-bold mt-0.5">{plano.destaque}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-lg text-slate-900">{plano.preco}</span>
                      <p className="text-[10px] text-slate-500 font-medium">{plano.cobranca}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    {plano.descricao}
                  </p>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck size={14} /> Ativação Imediata
                    </span>

                    <button
                      type="button"
                      onClick={() => onSelectPlan && onSelectPlan(plano.nome, valorLimpo)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all ${
                        isPopular
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span>Contratar via Pix</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-400">
              Pagamentos processados instantaneamente no padrão oficial EMV do Banco Central do Brasil.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
