import React, { useState, useEffect } from 'react';
import { 
  X, QrCode, Copy, Check, Download, ExternalLink, Settings, Building2, ShieldCheck, Sparkles 
} from 'lucide-react';
import { generateQRDataUrl, buildPublicQRUrl, getQRCodes } from '../services/qrCodeService.js';

export default function QRQuickViewModal({ 
  isOpen, 
  onClose, 
  onOpenPlacard, 
  onOpenAdmin,
  activeProfile = null 
}) {
  if (!isOpen) return null;

  const [qrcodes, setQrcodes] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getQRCodes().then(list => {
      if (!isMounted) return;
      setQrcodes(list);
      // Seleciona o perfil ativo ou o primeiro da lista
      const initial = (activeProfile && typeof activeProfile === 'object' && activeProfile.slug)
        ? list.find(q => q.slug === activeProfile.slug) || activeProfile
        : list[0] || null;
      setSelectedItem(initial);
    });
    return () => { isMounted = false; };
  }, [activeProfile, isOpen]);

  useEffect(() => {
    if (!selectedItem) return;
    setLoading(true);
    const targetUrl = buildPublicQRUrl(selectedItem.slug);
    generateQRDataUrl(targetUrl, { width: 400, margin: 2 }).then(url => {
      setQrDataUrl(url);
      setLoading(false);
    });
  }, [selectedItem]);

  const publicUrl = selectedItem ? buildPublicQRUrl(selectedItem.slug) : '';

  const handleCopy = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert(`Link: ${publicUrl}`);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-quick-title"
    >
      <div className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Cabeçalho */}
        <header className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <QrCode size={18} />
            </div>
            <div>
              <h2 id="qr-quick-title" className="font-bold text-sm text-white">
                QR Code para Balcão
              </h2>
              <p className="text-[11px] text-slate-400">
                Acesso imediato via câmera do celular
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Fechar visualizador de QR Code"
          >
            <X size={18} />
          </button>
        </header>

        {/* Conteúdo */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-center">
          
          {/* Seletor de Estabelecimento */}
          {qrcodes.length > 1 && (
            <div className="text-left bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                Estabelecimento Selecionado:
              </label>
              <select
                value={selectedItem ? selectedItem.id : ''}
                onChange={(e) => {
                  const found = qrcodes.find(q => q.id === e.target.value);
                  if (found) setSelectedItem(found);
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {qrcodes.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.nome} ({q.segmento})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cartão de Informação do Balcão */}
          {selectedItem && (
            <div>
              <h3 className="text-base font-black text-slate-900">{selectedItem.nome}</h3>
              <p className="text-xs font-semibold text-indigo-600">{selectedItem.segmento} • {selectedItem.setor || 'Balcão Principal'}</p>
            </div>
          )}

          {/* Imagem do QR Code em Alta Resolução */}
          <div className="bg-slate-50 border-2 border-dashed border-indigo-200 p-4 rounded-3xl inline-flex flex-col items-center justify-center shadow-inner mx-auto w-full max-w-[260px]">
            {loading ? (
              <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-400">
                Gerando QR Code...
              </div>
            ) : qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt={`QR Code para ${selectedItem ? selectedItem.nome : 'Balcão'}`}
                className="w-52 h-52 object-contain rounded-xl bg-white p-2 shadow-sm"
              />
            ) : null}
            <p className="text-[11px] font-medium text-slate-600 mt-2">
              Aponte a câmera para abrir sem instalar nada
            </p>
          </div>

          {/* Link público e Copiar */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-mono text-slate-600 truncate flex-1 px-2 text-left">
              {publicUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 transition-all"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          {/* Ações Rápidas */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (selectedItem && onOpenPlacard) {
                  onClose();
                  onOpenPlacard(selectedItem);
                }
              }}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Download size={14} />
              <span>Placa de Balcão</span>
            </button>

            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <ExternalLink size={14} />
              <span>Abrir Visão Visitante</span>
            </a>
          </div>

          {/* Botão para Gerenciar */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Deseja personalizar frases ou nome?</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenAdmin) onOpenAdmin();
              }}
              className="text-indigo-600 font-bold hover:underline flex items-center gap-1 text-xs"
            >
              <Settings size={13} /> Gerenciar QR Codes
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
