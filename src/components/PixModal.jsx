import React, { useState, useEffect } from 'react';
import { X, Copy, Check, QrCode, Heart, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { generatePixPayload, getPixQrCodeUrl } from '../services/pixService.js';

export const PLANOS_PIX = [
  { id: 'falafacil_individual', nome: 'FALAFÁCIL', valor: '19.90', precoExibicao: 'R$ 19,90', detalhe: 'Acesso vitalício • 1h grátis' },
  { id: 'comercio', nome: 'COMÉRCIO', valor: '29.90', precoExibicao: 'R$ 29,90/mês', detalhe: 'Balcões, caixas e lojas' },
  { id: 'profissional', nome: 'PROFISSIONAL', valor: '59.90', precoExibicao: 'R$ 59,90/mês', detalhe: 'Consultórios e clínicas' },
  { id: 'institucional', nome: 'INSTITUCIONAL', valor: '149.90', precoExibicao: 'R$ 149,90/mês', detalhe: 'Escolas e repartições' },
  { id: 'empresarial', nome: 'EMPRESARIAL', valor: '299.90', precoExibicao: 'R$ 299,90/mês', detalhe: 'Redes e hospitais' }
];

function formatMoeda(val) {
  if (!val) return '19,90';
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return num.toFixed(2).replace('.', ',');
}

export default function PixModal({ isOpen, onClose, initialAmount = '19.90', planName = '' }) {
  if (!isOpen) return null;

  const [amount, setAmount] = useState(initialAmount || '19.90');
  const [currentPlanName, setCurrentPlanName] = useState(planName || 'Plano FALAFÁCIL');
  const [copied, setCopied] = useState(false);
  const [copiedKeyOnly, setCopiedKeyOnly] = useState(false);

  useEffect(() => {
    if (initialAmount) {
      setAmount(initialAmount);
    }
    if (planName) {
      setCurrentPlanName(planName);
    } else {
      const match = PLANOS_PIX.find(p => p.valor === initialAmount);
      setCurrentPlanName(match ? `Plano ${match.nome}` : 'Plano FALAFÁCIL');
    }
  }, [initialAmount, planName, isOpen]);

  const handleSelectPlanPill = (plano) => {
    setAmount(plano.valor);
    setCurrentPlanName(`Plano ${plano.nome}`);
  };

  const pixKey = 'luklen2@gmail.com';
  const beneficiaryName = 'Luciano Sant Anna';
  const cityName = 'Rio de Janeiro';
  const payload = generatePixPayload({
    pixKey,
    name: beneficiaryName,
    city: cityName,
    amount: amount || undefined,
    txId: 'FALAFACIL'
  });

  const qrCodeUrl = getPixQrCodeUrl(payload);

  const handleCopy = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyKeyOnly = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedKeyOnly(true);
    setTimeout(() => setCopiedKeyOnly(false), 2500);
  };

  const planoAtivoObj = PLANOS_PIX.find(p => p.valor === amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-5 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Fechar modal de Pix"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 fill-emerald-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base leading-snug">
              {currentPlanName || 'Contratar Plano FalaFácil'}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Ativação imediata via Pix Oficial Banco Central
            </p>
          </div>
        </div>

        {/* Card Destaque: VALOR RESPECTIVO DO PLANO */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border-2 border-emerald-400/60 rounded-2xl p-3.5 text-center shadow-sm my-2">
          <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider block">
            Valor Respectivo a Pagar
          </span>
          <div className="text-3xl font-black text-emerald-700 my-0.5 tracking-tight">
            R$ {formatMoeda(amount)}
          </div>
          <p className="text-xs font-semibold text-emerald-900">
            {planoAtivoObj ? planoAtivoObj.detalhe : 'Plano Oficial FalaFácil'}
          </p>
        </div>

        {/* Seletor de Planos Comerciais com os Valores Exatos */}
        <div className="my-3">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
            Selecione o plano desejado:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {PLANOS_PIX.map((plano) => {
              const isSelected = amount === plano.valor;
              return (
                <button
                  key={plano.id}
                  type="button"
                  onClick={() => handleSelectPlanPill(plano)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="block text-[11px] font-black uppercase truncate">{plano.nome}</span>
                  <span className={`block text-xs font-bold ${isSelected ? 'text-emerald-100' : 'text-emerald-600'}`}>
                    {plano.precoExibicao}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Identificação Oficial do Beneficiário e Chave Pix */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 my-2 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-[11px] text-slate-500 font-medium">Beneficiário:</span>
            <span className="font-bold text-slate-900">{beneficiaryName}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-[11px] text-slate-500 font-medium">Chave Pix (E-mail):</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-emerald-700 select-all">{pixKey}</span>
              <button
                type="button"
                onClick={handleCopyKeyOnly}
                className="text-[10px] text-emerald-600 hover:text-emerald-800 font-semibold underline ml-1 cursor-pointer"
                title="Copiar apenas a chave de e-mail"
              >
                {copiedKeyOnly ? 'Copiada!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>

        {/* QR Code Dinâmico do Banco Central */}
        <div className="flex flex-col items-center justify-center p-3.5 bg-slate-50 rounded-2xl border border-slate-200 my-2">
          <img
            src={qrCodeUrl}
            alt={`QR Code Pix no valor de R$ ${formatMoeda(amount)}`}
            className="w-48 h-48 object-contain rounded-xl shadow-sm bg-white p-2 border border-slate-200"
          />
          <p className="text-[11px] text-slate-600 mt-2 font-medium text-center">
            Abra o app do seu banco e aponte a câmera para ler o QR Code
          </p>
        </div>

        {/* Botão Copia e Cola com o Valor Explícito */}
        <button
          type="button"
          onClick={handleCopy}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all mt-2.5"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-white" />
              <span>Código Pix de R$ {formatMoeda(amount)} Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5 text-white" />
              <span>Copiar Código Pix (R$ {formatMoeda(amount)})</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-2.5">
          <ShieldCheck size={13} className="text-emerald-600" />
          <span>Padrão oficial EMV BR Code do Banco Central do Brasil.</span>
        </div>
      </div>
    </div>
  );
}
