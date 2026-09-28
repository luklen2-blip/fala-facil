import React, { useState, useEffect } from 'react';
import { 
  X, Plus, QrCode, Building2, Trash2, Edit3, Eye, Copy, Check, 
  ToggleLeft, ToggleRight, Sparkles, HelpCircle, Layers, CheckCircle2, ChevronRight, ArrowLeft
} from 'lucide-react';
import { 
  getQRCodes, saveQRCode, toggleQRCodeStatus, deleteQRCode, sanitizeSlug, buildPublicQRUrl 
} from '../services/qrCodeService.js';
import { 
  SEGMENTOS_DISPONIVEIS, SEGMENTO_TEMPLATES, PLANOS_COMERCIAIS, COPY_POSICIONAMENTO 
} from '../data/qrTemplates.js';

export default function QRAdminModal({ isOpen, onClose, onSelectVisualQR, onSelectPlan }) {
  const [tab, setTab] = useState('lista'); // 'lista' | 'novo' | 'planos'
  const [qrcodes, setQrcodes] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Form state
  const [formNome, setFormNome] = useState('');
  const [formSegmento, setFormSegmento] = useState('Farmácia');
  const [formSetor, setFormSetor] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formBoasVindas, setFormBoasVindas] = useState('');
  const [formFrases, setFormFrases] = useState([]);
  const [novaFraseInput, setNovaFraseInput] = useState('');

  const carregarDados = async () => {
    const list = await getQRCodes();
    setQrcodes(list);
  };

  useEffect(() => {
    if (isOpen) {
      carregarDados();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenNovo = (segmentoInicial = 'Farmácia') => {
    setEditingItem(null);
    setFormNome('');
    setFormSegmento(segmentoInicial);
    setFormSetor('');
    setFormSlug('');
    setFormBoasVindas('Como podemos ajudar você hoje?');
    setFormFrases(SEGMENTO_TEMPLATES[segmentoInicial] || []);
    setNovaFraseInput('');
    setTab('novo');
  };

  const handleOpenEditar = (item) => {
    setEditingItem(item);
    setFormNome(item.nome);
    setFormSegmento(item.segmento);
    setFormSetor(item.setor || '');
    setFormSlug(item.slug);
    setFormBoasVindas(item.fraseBoasVindas);
    setFormFrases(item.frases || []);
    setNovaFraseInput('');
    setTab('novo');
  };

  const handleSegmentoChange = (novoSegmento) => {
    setFormSegmento(novoSegmento);
    if (formFrases.length === 0) {
      setFormFrases(SEGMENTO_TEMPLATES[novoSegmento] || []);
    }
  };

  const handleCarregarTemplate = () => {
    const templates = SEGMENTO_TEMPLATES[formSegmento] || [];
    setFormFrases(templates);
  };

  const handleAddFrase = (e) => {
    e.preventDefault();
    const limpa = novaFraseInput.trim();
    if (!limpa) return;
    if (formFrases.includes(limpa)) {
      alert('Esta frase já está na lista.');
      return;
    }
    setFormFrases([...formFrases, limpa]);
    setNovaFraseInput('');
  };

  const handleRemoveFrase = (index) => {
    setFormFrases(formFrases.filter((_, i) => i !== index));
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!formNome.trim()) {
      alert('O nome do estabelecimento é obrigatório.');
      return;
    }
    if (formFrases.length === 0) {
      alert('Adicione pelo menos uma frase de atendimento para o QR Code.');
      return;
    }

    const payload = {
      id: editingItem ? editingItem.id : undefined,
      nome: formNome.trim(),
      segmento: formSegmento,
      setor: formSetor.trim(),
      slug: sanitizeSlug(formSlug || formNome),
      fraseBoasVindas: formBoasVindas.trim(),
      frases: formFrases,
      ativo: editingItem ? editingItem.ativo : true,
      criadoEm: editingItem ? editingItem.criadoEm : undefined
    };

    await saveQRCode(payload);
    await carregarDados();
    setTab('lista');
  };

  const handleToggle = async (item) => {
    await toggleQRCodeStatus(item.id);
    await carregarDados();
  };

  const handleExcluir = async (item) => {
    if (confirm(`Deseja realmente excluir o QR Code "${item.nome}"?`)) {
      await deleteQRCode(item.id);
      await carregarDados();
    }
  };

  const handleCopyLink = async (item) => {
    const url = buildPublicQRUrl(item.slug);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      alert(`Link: ${url}`);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-admin-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Cabeçalho do Painel Administrativo */}
        <header className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <QrCode size={18} />
            </div>
            <div>
              <h2 id="qr-admin-title" className="font-bold text-sm text-white">
                Painel QR Code FalaFácil
              </h2>
              <p className="text-[10px] text-slate-400">Atendimento Personalizado de Balcão</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            aria-label="Fechar painel de QR Codes"
          >
            <X size={20} />
          </button>
        </header>

        {/* Barra de Navegação de Abas */}
        <div className="flex bg-slate-100 p-1.5 border-b border-slate-200 gap-1">
          <button
            type="button"
            onClick={() => setTab('lista')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              tab === 'lista'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Meus QR Codes ({qrcodes.length})
          </button>

          <button
            type="button"
            onClick={() => handleOpenNovo()}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
              tab === 'novo'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus size={14} />
            <span>{editingItem ? 'Editar QR Code' : 'Criar QR Code'}</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('planos')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              tab === 'planos'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Planos Comerciais
          </button>
        </div>

        {/* Conteúdo Rolável da Aba */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-50 text-slate-800">
          
          {/* ABA 1: LISTA DE QR CODES */}
          {tab === 'lista' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Estabelecimentos Ativos
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenNovo()}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus size={14} /> Novo QR Code
                </button>
              </div>

              {qrcodes.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6">
                  <QrCode size={36} className="mx-auto text-slate-400 mb-2" />
                  <p className="font-semibold text-sm text-slate-700">Nenhum QR Code configurado ainda</p>
                  <p className="text-xs text-slate-500 mt-1">Crie o primeiro QR Code para o seu balcão.</p>
                  <button
                    type="button"
                    onClick={() => handleOpenNovo()}
                    className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Criar Meu Primeiro QR Code
                  </button>
                </div>
              ) : (
                qrcodes.map((item) => (
                  <div 
                    key={item.id}
                    className={`bg-white rounded-2xl p-4 border transition-all shadow-sm ${
                      item.ativo ? 'border-slate-200' : 'border-rose-200 bg-rose-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 leading-tight">
                            {item.nome}
                          </h3>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            item.ativo 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {item.ativo ? 'Ativo' : 'Desativado'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5">
                          <span className="font-semibold text-indigo-600">{item.segmento}</span>
                          {item.setor ? ` • ${item.setor}` : ''}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 italic">
                          "{item.fraseBoasVindas}"
                        </p>
                      </div>

                      {/* Botão de Toggle Ativo/Inativo */}
                      <button
                        type="button"
                        onClick={() => handleToggle(item)}
                        title={item.ativo ? 'Desativar QR Code' : 'Ativar QR Code'}
                        className="text-slate-400 hover:text-slate-700 p-1"
                      >
                        {item.ativo ? (
                          <ToggleRight size={26} className="text-emerald-600" />
                        ) : (
                          <ToggleLeft size={26} className="text-slate-400" />
                        )}
                      </button>
                    </div>

                    {/* Resumo de frases */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        {item.frases?.length || 0} frases configuradas
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {item.acessosCount || 0} acessos
                      </span>
                    </div>

                    {/* Barra de Ações Rápidas */}
                    <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => onSelectVisualQR(item)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <QrCode size={14} />
                        <span>Ver QR Code</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(item)}
                          title="Copiar link direto"
                          className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                            copiedId === item.id 
                              ? 'bg-emerald-600 text-white' 
                              : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {copiedId === item.id ? <Check size={15} /> : <Copy size={15} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditar(item)}
                          title="Editar frases e nome"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExcluir(item)}
                          title="Excluir QR Code"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ABA 2: CRIAR / EDITAR QR CODE */}
          {tab === 'novo' && (
            <form onSubmit={handleSalvar} className="space-y-3.5">
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={() => setTab('lista')}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft size={14} /> Voltar à lista
                </button>
                <span className="text-xs font-bold text-indigo-600">
                  {editingItem ? 'Editando Perfil' : 'Novo Perfil'}
                </span>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Estabelecimento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Farmácia Central"
                  value={formNome}
                  onChange={(e) => {
                    setFormNome(e.target.value);
                    if (!editingItem) {
                      setFormSlug(sanitizeSlug(e.target.value));
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Segmento & Setor */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Segmento
                  </label>
                  <select
                    value={formSegmento}
                    onChange={(e) => handleSegmentoChange(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {SEGMENTOS_DISPONIVEIS.map(seg => (
                      <option key={seg} value={seg}>{seg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Setor (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Balcão 1, Caixa"
                    value={formSetor}
                    onChange={(e) => setFormSetor(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Slug / Link Público */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Identificador Público (Link Seguro)
                </label>
                <div className="flex items-center gap-1 text-xs text-slate-500 bg-white border border-slate-300 px-3 py-2 rounded-xl">
                  <span>/qr/</span>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(sanitizeSlug(e.target.value))}
                    placeholder="farmacia-central"
                    className="flex-1 font-bold text-indigo-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Frase de Boas-Vindas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Frase de Boas-Vindas
                </label>
                <input
                  type="text"
                  value={formBoasVindas}
                  onChange={(e) => setFormBoasVindas(e.target.value)}
                  placeholder="Ex: Como podemos ajudar você hoje?"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Frases Específicas */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Frases de Atendimento ({formFrases.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleCarregarTemplate}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Sparkles size={12} /> Carregar modelo de {formSegmento}
                  </button>
                </div>

                {/* Input para adicionar frase */}
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={novaFraseInput}
                    onChange={(e) => setNovaFraseInput(e.target.value)}
                    placeholder="Adicionar frase personalizada..."
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFrase}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Plus size={14} /> Adicionar
                  </button>
                </div>

                {/* Lista rolável de frases */}
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {formFrases.map((frase, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 bg-white border border-slate-200 rounded-xl text-xs"
                    >
                      <span className="flex-1 font-medium text-slate-800">{frase}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFrase(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remover frase"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões do Formulário */}
              <div className="pt-3 border-t border-slate-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => setTab('lista')}
                  className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  {editingItem ? 'Salvar Alterações' : 'Criar QR Code'}
                </button>
              </div>
            </form>
          )}

          {/* ABA 3: PLANOS COMERCIAIS */}
          {tab === 'planos' && (
            <div className="space-y-4">
              {/* Copy Comercial Oficial (Regra 8) */}
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

              {/* Lista Estrita dos Planos e Preços Definidos (Regra 7) */}
              <div className="space-y-2.5">
                {PLANOS_COMERCIAIS.map((plano) => (
                  <div 
                    key={plano.id}
                    className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-slate-900">{plano.nome}</h4>
                          {plano.badge && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                              {plano.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-indigo-600 font-bold mt-0.5">{plano.destaque}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-base text-slate-900">{plano.preco}</span>
                        <p className="text-[10px] text-slate-500">{plano.cobranca}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{plano.descricao}</p>
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-700 font-bold">Ativação Instantânea</span>
                      <button
                        type="button"
                        onClick={() => {
                          const valorLimpo = plano.preco.replace('R$', '').split('/')[0].trim().replace(',', '.');
                          if (onSelectPlan) {
                            onClose();
                            onSelectPlan(plano.nome, valorLimpo);
                          }
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1 active:scale-95"
                      >
                        <span>Contratar via Pix</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center pt-2">
                <p className="text-[11px] text-slate-400">
                  Para contratar planos comerciais ou suporte a grandes redes, consulte a equipe FalaFácil.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
