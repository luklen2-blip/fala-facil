import React, { useState, useEffect } from 'react';
import { X, Download, Printer, Copy, Check, QrCode, ExternalLink, Sparkles } from 'lucide-react';
import { generateQRDataUrl, buildPublicQRUrl } from '../services/qrCodeService.js';

export default function QRVisualGeneratorModal({ isOpen, onClose, qrItem }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const publicUrl = qrItem ? buildPublicQRUrl(qrItem.slug) : '';

  useEffect(() => {
    if (!isOpen || !qrItem) return;
    setLoading(true);
    generateQRDataUrl(publicUrl, { width: 512, margin: 3 })
      .then(url => {
        setQrDataUrl(url);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isOpen, qrItem, publicUrl]);

  if (!isOpen || !qrItem) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      alert(`Link público: ${publicUrl}`);
    }
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;

    // Cria um canvas para renderizar um cartaz profissional com o nome da empresa
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 1000;

    // Fundo branco limpo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Borda elegante
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Cabeçalho da Marca
    ctx.fillStyle = '#4338ca'; // indigo-700
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FalaFácil Balcão', canvas.width / 2, 90);

    ctx.fillStyle = '#64748b'; // slate-500
    ctx.font = '500 20px sans-serif';
    ctx.fillText('Comunicação Acessível e Imediata', canvas.width / 2, 130);

    // Linha divisória
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 160);
    ctx.lineTo(canvas.width - 80, 160);
    ctx.stroke();

    // Nome do Estabelecimento
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(qrItem.nome, canvas.width / 2, 230);

    if (qrItem.setor) {
      ctx.fillStyle = '#4f46e5';
      ctx.font = '600 24px sans-serif';
      ctx.fillText(qrItem.setor, canvas.width / 2, 270);
    }

    // Desenha o QR Code
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 150, 310, 500, 500);

      // Instrução ao cliente
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('Escaneie com a câmera do seu celular', canvas.width / 2, 860);

      ctx.fillStyle = '#64748b';
      ctx.font = '500 20px sans-serif';
      ctx.fillText('Toque nas frases para o aparelho falar por você', canvas.width / 2, 900);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText('Não requer cadastro nem instalação de aplicativo', canvas.width / 2, 940);

      // Dispara download
      const link = document.createElement('a');
      link.download = `qrcode-falafacil-${qrItem.slug}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = qrDataUrl;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 flex flex-col items-center text-center relative max-h-[92vh] overflow-y-auto">
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Fechar janela do QR Code"
        >
          <X size={20} />
        </button>

        {/* Cabeçalho */}
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-2 mt-1">
          <QrCode size={26} />
        </div>

        <h2 id="qr-modal-title" className="text-lg font-bold text-slate-900 leading-tight">
          Seu QR Code FalaFácil
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Escaneie para acessar a comunicação acessível
        </p>

        {/* Card do QR Code com margem de segurança para câmera */}
        <div className="my-4 p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center">
          <div className="bg-slate-900 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2.5">
            {qrItem.nome}
          </div>

          {loading ? (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs animate-pulse">
              Gerando QR Code...
            </div>
          ) : (
            <img 
              src={qrDataUrl} 
              alt={`QR Code para ${qrItem.nome}`}
              className="w-56 h-56 rounded-lg object-contain"
            />
          )}

          <p className="text-[11px] text-slate-500 font-semibold mt-2.5">
            {qrItem.segmento} {qrItem.setor ? `• ${qrItem.setor}` : ''}
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="w-full space-y-2 mt-1">
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={!qrDataUrl}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <Download size={16} />
            <span>Baixar PNG de Alta Resolução</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer size={15} />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className={`py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>

          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 text-slate-500 hover:text-indigo-600 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <ExternalLink size={13} />
            <span>Testar abertura em nova aba</span>
          </a>
        </div>
      </div>
    </div>
  );
}
