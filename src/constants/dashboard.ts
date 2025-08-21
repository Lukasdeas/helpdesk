export const STATUS_COLORS = {
  'Aberto': '#ef4444',
  'Em Andamento': '#f59e0b',
  'Pendente': '#8b5cf6',
  'Resolvido': '#10b981',
  'Fechado': '#6b7280',
} as const;

export const PRIORIDADE_COLORS = {
  'Urgente': 'destructive',
  'Alta': 'destructive',
  'Média': 'default',
  'Baixa': 'secondary',
} as const;

export const STATUS_BADGE_COLORS = {
  'Aberto': 'destructive',
  'Em Andamento': 'default',
  'Pendente': 'secondary',
  'Resolvido': 'secondary',
  'Fechado': 'outline',
} as const;

export const TIPO_USER_COLORS = {
  'administrador': 'destructive',
  'tecnico': 'default',
  'usuario': 'secondary',
} as const;