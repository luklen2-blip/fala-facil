import React from 'react';
import { X, ShieldCheck, AlertTriangle, FileText, Check } from 'lucide-react';

export default function LegalModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Topo do modal */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Termos de Uso & Privacidade LGPD</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          {/* Aviso Regulatório e Ético */}
          <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-xs">Aviso de Acessibilidade Assistiva</h4>
                <p className="mt-1 text-amber-800 text-[11px]">
                  O FalaFácil Balcão é uma tecnologia assistiva voltada para agilidade operacional no atendimento imediato e cotidiano de balcão. Ele <strong>não substitui</strong> o intérprete oficial de Libras ou fonoaudiólogo em audiências, exames médicos periciais ou atos formais quando exigido por legislação específica (Lei 10.436/2002 e Decreto 5.626/2005).
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-1">1. Faixa Etária e Capacidade</h4>
            <p>
              O uso da aplicação é livre para maiores de 13 anos. Contribuições financeiras, aquisições ou doações voluntárias via PIX são restritas a maiores de 18 anos ou menores assistidos por seus representantes legais (Código Civil Brasileiro).
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-1">2. Privacidade e Conformidade LGPD (Lei 13.709/2018)</h4>
            <p>
              Em conformidade com a LGPD e o princípio da minimização de dados:
            </p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li><strong>Zero retenção de áudio:</strong> Todo reconhecimento de fala (STT) e sintetização vocal (TTS) utilizam a Web Speech API local do navegador. Nenhuma gravação de voz é salva em servidores de banco de dados.</li>
              <li><strong>Histórico local efêmero:</strong> O texto exibido no visor pode ser apagado a qualquer momento pelo botão "Limpar conversa" e expira com a sessão.</li>
              <li><strong>Não compartilhamento com terceiros:</strong> Nenhum dado biométrico vocal é vendido ou transmitido para fins publicitários.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-1">3. Funcionamento Offline e PWA</h4>
            <p>
              A aplicação dispõe de Service Worker para permitir execução local mesmo em áreas com oscilação ou ausência de sinal de internet, promovendo inclusão contínua.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-1">4. Direitos do Titular</h4>
            <p>
              O titular pode revogar a permissão de uso do microfone a qualquer momento diretamente nas configurações de privacidade do navegador.
            </p>
          </div>
        </div>

        {/* Rodapé com botão de fechar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Entendido e Concordo
          </button>
        </div>
      </div>
    </div>
  );
}
