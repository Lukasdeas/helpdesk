import { STATUS_COLORS } from '../constants/dashboard';

export interface Chamado {
  id: string;
  status: string;
  prioridade: string;
  created_at: string;
  [key: string]: any;
}

export const createStatusDistribution = (chamados: Chamado[]) => {
  return Object.entries(
    chamados.reduce((acc, chamado) => {
      acc[chamado.status] = (acc[chamado.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, quantidade]) => ({
    status,
    quantidade,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
  }));
};

export const createPriorityDistribution = (chamados: Chamado[]) => {
  return Object.entries(
    chamados.reduce((acc, chamado) => {
      acc[chamado.prioridade] = (acc[chamado.prioridade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([prioridade, quantidade]) => ({ prioridade, quantidade }));
};

export const createLast7DaysData = (chamados: Chamado[]) => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const count = chamados.filter(c => 
      new Date(c.created_at).toDateString() === date.toDateString()
    ).length;
    return {
      dia: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      chamados: count,
    };
  });
};

export const calculateResolutionRate = (chamados: Chamado[]): number => {
  if (chamados.length === 0) return 0;
  const resolved = chamados.filter(c => ['Resolvido', 'Fechado'].includes(c.status)).length;
  return (resolved / chamados.length) * 100;
};