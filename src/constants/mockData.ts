import { Usuario, Chamado, DashboardStats } from '../types/helpdesk';

// Usuários mockados para diferentes tipos
export const mockUsers: Usuario[] = [
  // Administrador
  {
    id: '1',
    nome: 'João Silva',
    email: 'admin@helpdesk.com',
    tipo: 'administrador',
    senha: 'admin',
    ativo: true,
    dataCreacao: '2024-01-01',
    departamento: 'TI'
  },
  // Técnicos
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'tecnico1@helpdesk.com',
    tipo: 'tecnico',
    senha: 'tecnico',
    ativo: true,
    dataCreacao: '2024-01-02',
    departamento: 'Suporte'
  },
  {
    id: '3',
    nome: 'Carlos Oliveira',
    email: 'tecnico2@helpdesk.com',
    tipo: 'tecnico',
    senha: 'tecnico',
    ativo: true,
    dataCreacao: '2024-01-03',
    departamento: 'Suporte'
  },
  // Clientes
  {
    id: '4',
    nome: 'Ana Costa',
    email: 'cliente1@empresa.com',
    tipo: 'usuario',
    senha: 'cliente',
    ativo: true,
    dataCreacao: '2024-01-04',
    departamento: 'Vendas'
  },
  {
    id: '5',
    nome: 'Pedro Lima',
    email: 'cliente2@empresa.com',
    tipo: 'usuario',
    senha: 'cliente',
    ativo: true,
    dataCreacao: '2024-01-05',
    departamento: 'Marketing'
  },
  {
    id: '6',
    nome: 'Lucia Ferreira',
    email: 'cliente3@empresa.com',
    tipo: 'usuario',
    senha: 'cliente',
    ativo: true,
    dataCreacao: '2024-01-06',
    departamento: 'RH'
  }
];

// Chamados mockados
export const mockChamados: Chamado[] = [
  {
    id: '1',
    numero: '#2024001',
    titulo: 'Problema no sistema de email',
    descricao: 'Não consigo enviar emails desde ontem. O sistema apresenta erro de conexão.',
    categoria: 'Email',
    prioridade: 'Alta',
    status: 'aberto',
    solicitanteId: '4',
    solicitanteNome: 'Ana Costa',
    departamento: 'Vendas',
    dataAbertura: '2024-01-15T09:00:00.000Z',
    dataUltimaAtualizacao: '2024-01-15T09:00:00.000Z',
    tecnicoResponsavelId: null,
    tecnicoResponsavelNome: null,
    observacoes: [],
    anexos: [],
    tags: ['email', 'conexão'],
    tempoEstimado: null,
    dataResolucao: null,
    avaliacao: null,
    comentariosResolucao: null
  },
  {
    id: '2',
    numero: '#2024002',
    titulo: 'Solicitação de acesso ao sistema financeiro',
    descricao: 'Preciso de acesso ao módulo financeiro para gerar relatórios mensais.',
    categoria: 'Acesso',
    prioridade: 'Média',
    status: 'em_andamento',
    solicitanteId: '5',
    solicitanteNome: 'Pedro Lima',
    departamento: 'Marketing',
    dataAbertura: '2024-01-14T14:30:00.000Z',
    dataUltimaAtualizacao: '2024-01-15T10:15:00.000Z',
    tecnicoResponsavelId: '2',
    tecnicoResponsavelNome: 'Maria Santos',
    observacoes: [
      {
        id: '1',
        texto: 'Verificando permissões necessárias com o supervisor.',
        autor: 'Maria Santos',
        dataHora: '2024-01-15T10:15:00.000Z',
        tipo: 'tecnico'
      }
    ],
    anexos: [],
    tags: ['acesso', 'financeiro'],
    tempoEstimado: 120,
    dataResolucao: null,
    avaliacao: null,
    comentariosResolucao: null
  },
  {
    id: '3',
    numero: '#2024003',
    titulo: 'Computador não liga',
    descricao: 'Meu computador não está ligando desde esta manhã. Já tentei diferentes tomadas.',
    categoria: 'Hardware',
    prioridade: 'Alta',
    status: 'resolvido',
    solicitanteId: '6',
    solicitanteNome: 'Lucia Ferreira',
    departamento: 'RH',
    dataAbertura: '2024-01-13T08:00:00.000Z',
    dataUltimaAtualizacao: '2024-01-14T16:45:00.000Z',
    tecnicoResponsavelId: '3',
    tecnicoResponsavelNome: 'Carlos Oliveira',
    observacoes: [
      {
        id: '1',
        texto: 'Realizando diagnóstico no local.',
        autor: 'Carlos Oliveira',
        dataHora: '2024-01-13T10:30:00.000Z',
        tipo: 'tecnico'
      },
      {
        id: '2',
        texto: 'Problema identificado: fonte queimada. Substituindo.',
        autor: 'Carlos Oliveira',
        dataHora: '2024-01-14T14:20:00.000Z',
        tipo: 'tecnico'
      }
    ],
    anexos: [],
    tags: ['hardware', 'urgente'],
    tempoEstimado: 180,
    dataResolucao: '2024-01-14T16:45:00.000Z',
    avaliacao: 5,
    comentariosResolucao: 'Fonte de alimentação substituída. Computador funcionando normalmente.'
  },
  {
    id: '4',
    numero: '#2024004',
    titulo: 'Lentidão no sistema',
    descricao: 'O sistema está muito lento, principalmente ao gerar relatórios.',
    categoria: 'Performance',
    prioridade: 'Média',
    status: 'aberto',
    solicitanteId: '4',
    solicitanteNome: 'Ana Costa',
    departamento: 'Vendas',
    dataAbertura: '2024-01-15T11:20:00.000Z',
    dataUltimaAtualizacao: '2024-01-15T11:20:00.000Z',
    tecnicoResponsavelId: null,
    tecnicoResponsavelNome: null,
    observacoes: [],
    anexos: [],
    tags: ['performance', 'relatórios'],
    tempoEstimado: null,
    dataResolucao: null,
    avaliacao: null,
    comentariosResolucao: null
  },
  {
    id: '5',
    numero: '#2024005',
    titulo: 'Configuração de impressora',
    descricao: 'Preciso instalar uma nova impressora na minha estação.',
    categoria: 'Instalação',
    prioridade: 'Baixa',
    status: 'em_andamento',
    solicitanteId: '5',
    solicitanteNome: 'Pedro Lima',
    departamento: 'Marketing',
    dataAbertura: '2024-01-12T16:00:00.000Z',
    dataUltimaAtualizacao: '2024-01-14T09:30:00.000Z',
    tecnicoResponsavelId: '2',
    tecnicoResponsavelNome: 'Maria Santos',
    observacoes: [
      {
        id: '1',
        texto: 'Agendado para instalação amanhã.',
        autor: 'Maria Santos',
        dataHora: '2024-01-14T09:30:00.000Z',
        tipo: 'tecnico'
      }
    ],
    anexos: [],
    tags: ['impressora', 'instalação'],
    tempoEstimado: 60,
    dataResolucao: null,
    avaliacao: null,
    comentariosResolucao: null
  }
];

// Estatísticas mockadas
export const mockStats: DashboardStats = {
  totalChamados: mockChamados.length,
  chamadosAbertos: mockChamados.filter(c => c.status === 'aberto').length,
  chamadosEmAndamento: mockChamados.filter(c => c.status === 'em_andamento').length,
  chamadosResolvidos: mockChamados.filter(c => c.status === 'resolvido').length,
  tempoMedioResolucao: 156, // em minutos
  satisfacaoMedia: 4.2,
  chamadosHoje: 2,
  produtividadeTecnicos: 85
};

// Categorias disponíveis
export const categorias = [
  'Email',
  'Hardware',
  'Software',
  'Acesso',
  'Rede',
  'Impressora',
  'Instalação',
  'Performance',
  'Backup',
  'Segurança',
  'Outro'
];

// Prioridades disponíveis
export const prioridades = [
  { value: 'Baixa', label: 'Baixa', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'Média', label: 'Média', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'Alta', label: 'Alta', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'Crítica', label: 'Crítica', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
];

// Status disponíveis
export const statusOptions = [
  { value: 'aberto', label: 'Aberto', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'em_andamento', label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'aguardando_usuario', label: 'Aguardando Usuário', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'resolvido', label: 'Resolvido', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'fechado', label: 'Fechado', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' }
];