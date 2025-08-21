import { Chamado, Metricas, ChamadoMensagem, UserProfile } from '../types/helpdesk';
import { MOCK_USERS } from '../constants/mockData';

export const calculateMockMetrics = (chamados: Chamado[]): Metricas => {
  const totalChamados = chamados.length;
  const chamadosAbertos = chamados.filter(c => 
    ['Aberto', 'Em Andamento', 'Pendente'].includes(c.status)
  ).length;
  
  const chamadosResolvidosHoje = chamados.filter(c => {
    if (!c.data_fechamento) return false;
    const hoje = new Date().toDateString();
    return new Date(c.data_fechamento).toDateString() === hoje;
  }).length;
  
  const chamadosComTempo = chamados.filter(c => c.tempo_gasto);
  const tempoMedioResolucao = chamadosComTempo.length > 0 
    ? chamadosComTempo.reduce((acc, c) => acc + (c.tempo_gasto || 0), 0) / chamadosComTempo.length
    : 42;

  const chamadosComSatisfacao = chamados.filter(c => c.satisfacao);
  const satisfacaoMedia = chamadosComSatisfacao.length > 0
    ? chamadosComSatisfacao.reduce((acc, c) => acc + (c.satisfacao || 0), 0) / chamadosComSatisfacao.length
    : 4.2;

  return {
    totalChamados,
    chamadosAbertos,
    chamadosResolvidosHoje,
    tempoMedioResolucao: Math.round(tempoMedioResolucao),
    satisfacaoMedia: Math.round(satisfacaoMedia * 10) / 10,
  };
};

export const getMockMessages = (chamadoId: string): ChamadoMensagem[] => [
  {
    id: '1',
    chamado_id: chamadoId,
    user_id: '3',
    mensagem: 'Aguardando atendimento para este problema.',
    tipo: 'comentario',
    created_at: new Date().toISOString(),
    user: MOCK_USERS[2]
  }
];

export const filterChamadosByUser = (chamados: Chamado[], user: UserProfile): Chamado[] => {
  if (user.tipo === 'usuario') {
    return chamados.filter(c => c.solicitante_id === user.user_id);
  }
  return chamados;
};

export const findMockUserByEmail = (email: string): UserProfile | undefined => {
  return MOCK_USERS.find(u => u.email === email);
};

export const createMockChamado = (
  data: { problema: string; descricao: string; prioridade: string },
  currentUser: UserProfile,
  existingCount: number
): Chamado => {
  return {
    id: String(existingCount + 1),
    numero: `HD-2024-${String(existingCount + 1).padStart(3, '0')}`,
    solicitante_id: currentUser.user_id,
    problema: data.problema,
    descricao: data.descricao,
    prioridade: data.prioridade as any,
    status: 'Aberto',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    solicitante: currentUser
  };
};

export const updateMockChamado = (
  chamados: Chamado[],
  id: string,
  updates: Partial<Chamado>
): Chamado[] => {
  const chamadoIndex = chamados.findIndex(c => c.id === id);
  if (chamadoIndex >= 0) {
    const updatedChamados = [...chamados];
    updatedChamados[chamadoIndex] = {
      ...updatedChamados[chamadoIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Update tecnico info if tecnico_id is provided
    if (updates.tecnico_id) {
      const tecnico = MOCK_USERS.find(u => u.user_id === updates.tecnico_id);
      if (tecnico) {
        updatedChamados[chamadoIndex].tecnico = tecnico;
      }
    }

    return updatedChamados;
  }
  return chamados;
};