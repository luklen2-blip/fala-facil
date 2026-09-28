/**
 * Serviço de Gerenciamento e Geração de QR Codes FalaFácil
 * Suporte a operação híbrida: API de servidor com fallback offline local (PWA-first).
 */

import QRCode from 'qrcode';

const STORAGE_KEY = 'falafacil_qrcodes_data';

export function sanitizeSlug(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9]+/g, '-')     // apenas a-z, 0-9 e hífens
    .replace(/^-+|-+$/g, '')         // remove hífens das pontas
    .slice(0, 50);
}

// Sementes iniciais caso o cliente esteja offline e sem dados salvos
export const DEFAULT_QR_CODES = [
  {
    id: 'qr_farmacia_central',
    slug: 'farmacia-central',
    nome: 'Farmácia Central',
    segmento: 'Farmácia',
    setor: 'Balcão de Atendimento',
    fraseBoasVindas: 'Bem-vindo à Farmácia Central! Como podemos ajudar você hoje?',
    frases: [
      'Gostaria de saber o preço deste medicamento.',
      'Esse medicamento está disponível?',
      'Preciso falar com o farmacêutico.',
      'Preciso de ajuda.'
    ],
    ativo: true,
    criadoEm: '2026-09-28T18:00:00.000Z',
    acessosCount: 0
  },
  {
    id: 'qr_restaurante_sabor',
    slug: 'restaurante-sabor',
    nome: 'Restaurante Sabor & Arte',
    segmento: 'Restaurante',
    setor: 'Salão Principal',
    fraseBoasVindas: 'Bem-vindo ao Restaurante Sabor & Arte! Como podemos atender você?',
    frases: [
      'Gostaria de fazer um pedido.',
      'Tenho alergia alimentar.',
      'Preciso de ajuda.',
      'Gostaria de pagar.',
      'Pode trazer a conta?'
    ],
    ativo: true,
    criadoEm: '2026-09-28T18:00:00.000Z',
    acessosCount: 0
  }
];

// Helper local storage
function getLocalQRCodes() {
  try {
    if (typeof window === 'undefined') return DEFAULT_QR_CODES;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_QR_CODES));
      return DEFAULT_QR_CODES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_QR_CODES;
  } catch (e) {
    return DEFAULT_QR_CODES;
  }
}

function saveLocalQRCodes(codes) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
    }
  } catch (e) {
    console.warn('Erro ao salvar QR codes localmente:', e);
  }
}

// 1. Obter todos os perfis
export async function getQRCodes() {
  try {
    const res = await fetch('/api/qrcodes', { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.qrcodes)) {
        saveLocalQRCodes(data.qrcodes);
        return data.qrcodes;
      }
    }
  } catch (e) {
    // Modo offline
  }
  return getLocalQRCodes();
}

// 2. Obter perfil público pelo slug
export async function getQRCodeBySlug(slug) {
  const clean = sanitizeSlug(slug);
  if (!clean) return null;

  try {
    const res = await fetch(`/api/qrcodes/${clean}`, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && data.qrcode) {
        return data.qrcode;
      }
    } else if (res.status === 404) {
      return null;
    }
  } catch (e) {
    // Fallback offline
  }

  const local = getLocalQRCodes();
  return local.find(item => item.slug === clean) || null;
}

// 3. Salvar ou atualizar perfil
export async function saveQRCode(qrData) {
  const cleanSlug = sanitizeSlug(qrData.slug || qrData.nome);
  const payload = {
    id: qrData.id || `qr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    slug: cleanSlug,
    nome: (qrData.nome || 'Estabelecimento').trim(),
    segmento: (qrData.segmento || 'Comércio').trim(),
    setor: (qrData.setor || '').trim(),
    fraseBoasVindas: (qrData.fraseBoasVindas || 'Como podemos ajudar você hoje?').trim(),
    frases: (qrData.frases || []).map(f => f.trim()).filter(Boolean),
    ativo: qrData.ativo !== false,
    criadoEm: qrData.criadoEm || new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    acessosCount: qrData.acessosCount || 0
  };

  // Salva no servidor
  try {
    const res = await fetch('/api/qrcodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const resData = await res.json();
      if (resData.status === 'ok' && resData.qrcode) {
        // Atualiza local
        const local = getLocalQRCodes();
        const idx = local.findIndex(q => q.id === resData.qrcode.id || q.slug === resData.qrcode.slug);
        if (idx >= 0) {
          local[idx] = resData.qrcode;
        } else {
          local.unshift(resData.qrcode);
        }
        saveLocalQRCodes(local);
        return resData.qrcode;
      }
    }
  } catch (e) {}

  // Fallback se servidor estiver inacessível
  const local = getLocalQRCodes();
  const idx = local.findIndex(q => q.id === payload.id || q.slug === payload.slug);
  if (idx >= 0) {
    local[idx] = payload;
  } else {
    local.unshift(payload);
  }
  saveLocalQRCodes(local);
  return payload;
}

// 4. Alternar status ativo/inativo
export async function toggleQRCodeStatus(id) {
  try {
    const res = await fetch(`/api/qrcodes/${id}/toggle`, { method: 'PATCH' });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok') {
        const local = getLocalQRCodes();
        const item = local.find(q => q.id === id);
        if (item) {
          item.ativo = !item.ativo;
          saveLocalQRCodes(local);
          return item;
        }
      }
    }
  } catch (e) {}

  const local = getLocalQRCodes();
  const item = local.find(q => q.id === id);
  if (item) {
    item.ativo = !item.ativo;
    saveLocalQRCodes(local);
    return item;
  }
  return null;
}

// 5. Excluir QR Code
export async function deleteQRCode(id) {
  try {
    await fetch(`/api/qrcodes/${id}`, { method: 'DELETE' });
  } catch (e) {}

  const local = getLocalQRCodes().filter(q => q.id !== id);
  saveLocalQRCodes(local);
  return true;
}

// 6. Gerar DataURL do QR Code com margem e resolução profissional
export async function generateQRDataUrl(targetUrl, { width = 400, margin = 2 } = {}) {
  try {
    return await QRCode.toDataURL(targetUrl, {
      width,
      margin,
      color: {
        dark: '#0f172a', // slate-900 para contraste de leitura excelente
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.warn('Fallback para QR code API externo:', err);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${width}x${width}&margin=${margin * 5}&data=${encodeURIComponent(targetUrl)}`;
  }
}

// 7. Gerar SVG do QR Code para impressão vetorial
export async function generateQRSvg(targetUrl, { margin = 2 } = {}) {
  try {
    return await QRCode.toString(targetUrl, {
      type: 'svg',
      margin,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  } catch (err) {
    return null;
  }
}

// 8. Construir URL pública do QR Code
export function buildPublicQRUrl(slug) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://falafacil-balcao-5od4.onrender.com';
  return `${origin}/qr/${sanitizeSlug(slug)}`;
}
