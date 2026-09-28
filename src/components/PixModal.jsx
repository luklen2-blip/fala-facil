import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Heart, Sparkles } from 'lucide-react';
import { generatePixPayload, getPixQrCodeUrl } from '../services/pixService.js';

export default function PixModal({ isOpen, onClose, initialAmount = '19.90', planName = '' }) {
  if (!isOpen) return null;

  const [amount, setAmount] = useState(initialAmount || '19.90');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (initialAmount) {
      setAmount(initialAmount);
    }
  }, [initialAmount, isOpen]);

  const pixKey = 'contato@falafacil.com.br';
  const payload = generatePixPayload({
    pixKey,
    name: 'FalaFacil Balcao',
    city: 'BRASILIA',
    amount: amount || undefined,
    txId: 'FALAFACIL'
  });

  const qrCodeUrl = getPixQrCodeUrl(payload);

  const handleCopy = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
          aria-label="Fechar modal de Pix"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Heart className="w-4 h-4 fill-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {planName ? `Contratar ${planName}` : 'Apoie o FalaFácil'}
            </h3>
            <p className="text-xs text-slate-500">
              {planName ? 'Ativação imediata via Pix Oficial Bacen' : 'Mantenha a ferramenta viva e acessível'}
            </p>
          </div>
        </div>

        {/* Seleção rápida de valor */}
        <div className="grid grid-cols-4 gap-1.5 my-3">
          {['5.00', '10.00', '25.00', '50.00'].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val)}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                amount === val
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              R$ {val.replace('.00', '')}
            </button>
          ))}
        </div>

        {/* QR Code Dinâmico */}
        <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200 my-2">
          <img
            src={qrCodeUrl}
            alt="QR Code Pix Banco Central"
            className="w-44 h-44 object-contain rounded-lg shadow-sm"
          />
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Abra o app do seu banco e aponte a câmera
          </p>
        </div>

        {/* Botão Copia e Cola */}
        <button
          type="button"
          onClick={handleCopy}
          className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all mt-3"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Código Pix Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar Chave Copia-e-Cola (Bacen)</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-slate-400 mt-2">
          Padrão oficial EMV BR Code do Banco Central do Brasil.
        </p>
      </div>
    </div>
  );
}
