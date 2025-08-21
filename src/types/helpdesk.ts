// Tipos de usuário
export type TipoUsuario = 'administrador' | 'tecnico' | 'usuario';

// Interface do usuário
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  senha: string;
  ativo: boolean;
  dataCreacao: string;
  departamento: string;
}

// Tipos de status do chamado
export type StatusChamado = 'aberto' | 'em_andamento' | 'aguardando_usuario' | 'resolvido' | 'fechado';

// Tipos de prioridade
export type PrioridadeChamado = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

// Interface de observação/comentário
export interface ObservacaoChamado {
  id: string;
  texto: string;
  autor: string;
  dataHora: string;
  tipo: 'usuario' | 'tecnico' | 'sistema';
}

// Interface de anexo
export interface AnexoChamado {
  id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  url: string;
  dataUpload: string;
}

// Interface principal do chamado
export interface Chamado {
  id: string;
  numero: string;
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: PrioridadeChamado;
  status: StatusChamado;
  solicitanteId: string;
  solicitanteNome: string;
  departamento: string;
  dataAbertura: string;
  dataUltimaAtualizacao: string;
  tecnicoResponsavelId: string | null;
  tecnicoResponsavelNome: string | null;
  observacoes: ObservacaoChamado[];
  anexos: AnexoChamado[];
  tags: string[];
  tempoEstimado: number | null; // em minutos
  dataResolucao: string | null;
  avaliacao: number | null; // 1-5 estrelas
  comentariosResolucao: string | null;
}

// Interface para criar novo chamado
export interface NovoChamado {
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: PrioridadeChamado;
  solicitanteId: string;
  departamento: string;
  tags?: string[];
  anexos?: File[];
}

// Interface para estatísticas do dashboard
export interface DashboardStats {
  totalChamados: number;
  chamadosAbertos: number;
  chamadosEmAndamento: number;
  chamadosResolvidos: number;
  tempoMedioResolucao: number; // em minutos
  satisfacaoMedia: number;
  chamadosHoje: number;
  produtividadeTecnicos: number; // porcentagem
}

// Interface para filtros de chamados
export interface FiltrosChamados {
  status?: StatusChamado[];
  prioridade?: PrioridadeChamado[];
  categoria?: string[];
  tecnico?: string[];
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
}

// Interface para relatórios
export interface RelatorioItem {
  id: string;
  nome: string;
  descricao: string;
  tipo: 'chamados' | 'tecnicos' | 'satisfacao' | 'tempo';
  periodo: string;
  geradoEm: string;
  dadosJson?: any;
}