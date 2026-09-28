/**
 * Modelos de Segmentos, Frases Sugeridas e Planos Comerciais — QR Code FalaFácil
 * Conformidade com as diretrizes do projeto e restrições comerciais.
 */

export const SEGMENTOS_DISPONIVEIS = [
  'Farmácia',
  'Comércio',
  'Saúde',
  'Serviços Públicos',
  'Restaurante',
  'Hotelaria',
  'Educação',
  'Institucional',
  'Profissional',
  'Outros'
];

export const SEGMENTO_TEMPLATES = {
  'Farmácia': [
    'Gostaria de saber o preço deste medicamento.',
    'Esse medicamento está disponível?',
    'Preciso falar com o farmacêutico.',
    'Preciso de ajuda.',
    'Vocês aceitam receita digital?',
    'Tem opção de genérico para este item?'
  ],
  'Comércio': [
    'Quanto custa?',
    'Aceita Pix?',
    'Pode passar no cartão?',
    'Tem desconto à vista?',
    'Quero nota fiscal com CPF',
    'Tem garantia ou política de troca?'
  ],
  'Restaurante': [
    'Gostaria de fazer um pedido.',
    'Tenho alergia alimentar.',
    'Preciso de ajuda.',
    'Gostaria de pagar.',
    'Pode trazer a conta?',
    'Tem cardápio digital ou com fotos?'
  ],
  'Saúde': [
    'Tenho uma consulta agendada.',
    'Onde pego a ficha de atendimento?',
    'Preciso realizar um exame.',
    'Pode me indicar onde fica a sala?',
    'Qual é o tempo estimado de espera?'
  ],
  'Serviços Públicos': [
    'Preciso dar entrada em documento.',
    'Onde pego a senha de atendimento?',
    'Qual guichê devo ir?',
    'Pode me apontar onde assino?',
    'Qual o prazo para ficar pronto?',
    'Tenho prioridade por lei.'
  ],
  'Hotelaria': [
    'Gostaria de fazer meu check-in.',
    'Qual é a senha do Wi-Fi?',
    'Qual o horário do café da manhã?',
    'Pode me ajudar com as malas?',
    'Gostaria de solicitar o fechamento da conta.'
  ],
  'Educação': [
    'Onde fica a secretaria acadêmica?',
    'Preciso solicitar uma declaração.',
    'Onde fica este auditório ou sala?',
    'Com quem posso tirar dúvidas de matrícula?'
  ],
  'Institucional': [
    'Vim para uma reunião agendada.',
    'Onde faço a identificação na recepção?',
    'Pode avisar que já cheguei?',
    'Onde fica o elevador ou acesso acessível?'
  ],
  'Profissional': [
    'Tenho um horário marcado.',
    'Gostaria de tirar uma dúvida sobre o serviço.',
    'Preciso do comprovante ou recibo.',
    'Muito obrigado pelo atendimento!'
  ],
  'Outros': [
    'Preciso de orientação, por favor.',
    'Pode me ajudar com este atendimento?',
    'Pode escrever ou apontar para mim?',
    'Muito obrigado pela paciência!'
  ]
};

export const PLANOS_COMERCIAIS = [
  {
    id: 'falafacil_individual',
    nome: 'FALAFÁCIL',
    preco: 'R$ 19,90',
    cobranca: 'Acesso individual vitalício',
    destaque: '1 hora gratuita para experimentar',
    descricao: 'Ideal para uso pessoal e profissionais autônomos em atendimentos pontuais.',
    badge: 'Popular'
  },
  {
    id: 'comercio',
    nome: 'COMÉRCIO',
    preco: 'R$ 29,90/mês',
    cobranca: 'Assinatura mensal',
    destaque: 'Para balcões, caixas e pequenos negócios',
    descricao: 'QR Code no balcão para agilizar vendas e comunicação com clientes.'
  },
  {
    id: 'profissional',
    nome: 'PROFISSIONAL',
    preco: 'R$ 59,90/mês',
    cobranca: 'Assinatura mensal',
    destaque: 'Para consultórios, escritórios e especialistas',
    descricao: 'Comunicação acessível personalizada para ambientes de atendimento especializado.'
  },
  {
    id: 'institucional',
    nome: 'INSTITUCIONAL',
    preco: 'R$ 149,90/mês',
    cobranca: 'Assinatura mensal',
    destaque: 'Para escolas, repartições e clínicas médias',
    descricao: 'Múltiplos guichês e setores integrados em uma mesma instituição.'
  },
  {
    id: 'empresarial',
    nome: 'EMPRESARIAL',
    preco: 'R$ 299,90/mês',
    cobranca: 'Assinatura mensal',
    destaque: 'Para redes de lojas, hospitais e grandes empresas',
    descricao: 'Estrutura completa com QR Codes por setor, recepção e pontos de atendimento.'
  }
];

export const COPY_POSICIONAMENTO = {
  chamadaPrincipal: 'Transforme seu atendimento em uma experiência mais acessível.',
  subtitulo: 'Crie um QR Code e permita que seus clientes encontrem rapidamente as frases necessárias para se comunicar com sua equipe.',
  selo: 'Recursos de comunicação acessível.'
};
