import React from 'react';
import { useHelpdesk } from '../contexts/HelpdeskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Ticket,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  AlertTriangle,
  Activity,
  User,
  Shield,
  Crown,
  Plus,
  Filter,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { metricas, chamados, currentUser } = useHelpdesk();

  const statusColors = {
    'Aberto': '#ef4444',
    'Em Andamento': '#f59e0b',
    'Pendente': '#8b5cf6',
    'Resolvido': '#10b981',
    'Fechado': '#6b7280',
  };

  // Dados específicos para técnicos
  const isTecnico = currentUser?.tipo === 'tecnico';
  const isAdmin = currentUser?.tipo === 'administrador';

  const meusChamados = isTecnico 
    ? chamados.filter(c => c.tecnicoResponsavel?.id === currentUser.id)
    : [];

  const meusChamadosAbertos = meusChamados.filter(c => ['Aberto', 'Em Andamento', 'Pendente'].includes(c.status));
  const meusChamadosResolvidos = meusChamados.filter(c => c.status === 'Resolvido');
  const meuTempoMedio = meusChamadosResolvidos.reduce((acc, c) => acc + (c.tempoGasto || 0), 0) / meusChamadosResolvidos.length || 0;
  const minhaSatisfacao = meusChamadosResolvidos.reduce((acc, c) => acc + (c.satisfacao || 0), 0) / meusChamadosResolvidos.length || 0;

  // Chamados não atribuídos (para técnicos)
  const chamadosNaoAtribuidos = chamados.filter(c => !c.tecnicoResponsavel && ['Aberto', 'Em Andamento'].includes(c.status));

  const chamadosPorStatus = Object.entries(
    (isTecnico ? meusChamados : chamados).reduce((acc, chamado) => {
      acc[chamado.status] = (acc[chamado.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, quantidade]) => ({
    status,
    quantidade,
    color: statusColors[status as keyof typeof statusColors],
  }));

  const chamadosUltimos7Dias = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const count = (isTecnico ? meusChamados : chamados).filter(c => 
      c.dataAbertura.toDateString() === date.toDateString()
    ).length;
    return {
      dia: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      chamados: count,
    };
  });

  const chamadosRecentes = (isTecnico ? meusChamados : chamados)
    .sort((a, b) => b.dataAbertura.getTime() - a.dataAbertura.getTime())
    .slice(0, 5);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'administrador': return <Crown className="h-4 w-4 text-red-500" />;
      case 'tecnico': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'usuario': return <User className="h-4 w-4 text-green-500" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            {getTipoIcon(currentUser?.tipo || '')}
            <h1 className="text-3xl font-bold tracking-tight">
              {isTecnico ? 'Painel do Técnico' : isAdmin ? 'Dashboard Administrativo' : 'Dashboard'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isTecnico 
              ? 'Seus chamados e performance individual'
              : isAdmin 
              ? 'Visão geral completa do sistema de suporte'
              : 'Visão geral do sistema de suporte'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Badge variant="secondary">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Badge>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isTecnico ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meus Chamados</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{meusChamados.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total atribuído
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {meusChamadosAbertos.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Para resolver
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meu Tempo Médio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(meuTempoMedio)}min</div>
                <p className="text-xs text-muted-foreground">
                  Resolução média
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Minha Avaliação</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {minhaSatisfacao.toFixed(1)}/5
                </div>
                <p className="text-xs text-muted-foreground">
                  Satisfação média
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Chamados</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metricas.totalChamados}</div>
                <p className="text-xs text-muted-foreground">
                  +2 desde ontem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chamados Abertos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {metricas.chamadosAbertos}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requerem atenção
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metricas.tempoMedioResolucao}min</div>
                <p className="text-xs text-muted-foreground">
                  Resolução média
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {metricas.satisfacaoMedia}/5
                </div>
                <p className="text-xs text-muted-foreground">
                  Avaliação média
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Chamados Não Atribuídos - Apenas para técnicos */}
      {isTecnico && chamadosNaoAtribuidos.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-orange-800 dark:text-orange-200">
                  Chamados Aguardando Atribuição
                </CardTitle>
                <CardDescription className="text-orange-600 dark:text-orange-300">
                  {chamadosNaoAtribuidos.length} chamado(s) disponível(is) para assumir
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                <Plus className="h-4 w-4 mr-1" />
                Ver Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chamadosNaoAtribuidos.slice(0, 3).map((chamado) => (
                <div key={chamado.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline">{chamado.numero}</Badge>
                      <Badge variant={
                        chamado.prioridade === 'Urgente' ? 'destructive' :
                        chamado.prioridade === 'Alta' ? 'destructive' :
                        chamado.prioridade === 'Média' ? 'default' : 'secondary'
                      }>
                        {chamado.prioridade}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm">{chamado.problema}</p>
                    <p className="text-xs text-muted-foreground">
                      {chamado.solicitante.nome} • {chamado.dataAbertura.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button size="sm" className="ml-4">
                    Assumir
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Chamados por Status */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isTecnico ? 'Meus Chamados por Status' : 'Chamados por Status'}
            </CardTitle>
            <CardDescription>
              {isTecnico ? 'Distribuição dos seus chamados' : 'Distribuição atual dos chamados'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chamadosPorStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="quantidade"
                >
                  {chamadosPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [value, 'Chamados']}
                  labelFormatter={(label: any) => `Status: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {chamadosPorStatus.map((item) => (
                <div key={item.status} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.status} ({item.quantidade})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tendência dos Últimos 7 Dias */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isTecnico ? 'Meus Chamados - 7 Dias' : 'Chamados - Últimos 7 Dias'}
            </CardTitle>
            <CardDescription>
              {isTecnico ? 'Seus chamados dos últimos 7 dias' : 'Evolução diária de abertura de chamados'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chamadosUltimos7Dias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="chamados" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Individual - Apenas para técnicos */}
      {isTecnico && meusChamadosResolvidos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Minha Performance</CardTitle>
            <CardDescription>Análise da sua produtividade e qualidade de atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{meusChamados.length}</div>
                <div className="text-sm text-muted-foreground">Total Atribuídos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{meusChamadosResolvidos.length}</div>
                <div className="text-sm text-muted-foreground">Resolvidos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {meusChamados.length > 0 ? Math.round((meusChamadosResolvidos.length / meusChamados.length) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Taxa de Resolução</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">{minhaSatisfacao.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Satisfação Média</div>
                <div className="flex justify-center mt-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3 w-3 ${i < Math.floor(minhaSatisfacao) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Taxa de Resolução</span>
                <span>{meusChamados.length > 0 ? Math.round((meusChamadosResolvidos.length / meusChamados.length) * 100) : 0}%</span>
              </div>
              <Progress value={meusChamados.length > 0 ? (meusChamadosResolvidos.length / meusChamados.length) * 100 : 0} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chamados por Departamento - Apenas para admin */}
      {!isTecnico && (
        <Card>
          <CardHeader>
            <CardTitle>Chamados por Departamento</CardTitle>
            <CardDescription>Volume de chamados por área</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metricas.chamadosPorDepartamento}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="departamento" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Problemas Mais Comuns */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isTecnico ? 'Problemas Mais Frequentes (Seus Chamados)' : 'Problemas Mais Comuns'}
          </CardTitle>
          <CardDescription>
            {isTecnico ? 'Tipos de problema que você mais resolve' : 'Ranking dos problemas mais frequentes'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(isTecnico ? 
              Object.entries(meusChamados.reduce((acc, c) => {
                acc[c.problema] = (acc[c.problema] || 0) + 1;
                return acc;
              }, {} as Record<string, number>))
              .map(([problema, quantidade]) => ({ problema, quantidade }))
              .sort((a, b) => b.quantidade - a.quantidade)
              .slice(0, 5) 
              : metricas.problemasMaisComuns
            ).map((problema, index) => (
              <div key={problema.problema} className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{problema.problema}</p>
                    <Badge variant="secondary">{problema.quantidade} ocorrências</Badge>
                  </div>
                  <Progress 
                    value={(problema.quantidade / (isTecnico ? 
                      Object.values(meusChamados.reduce((acc, c) => {
                        acc[c.problema] = (acc[c.problema] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>))[0] || 1
                      : metricas.problemasMaisComuns[0].quantidade)) * 100} 
                    className="mt-2" 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chamados Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isTecnico ? 'Meus Chamados Recentes' : 'Chamados Recentes'}
          </CardTitle>
          <CardDescription>
            {isTecnico ? 'Seus últimos chamados atribuídos' : 'Últimos chamados abertos no sistema'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chamadosRecentes.map((chamado) => (
              <div key={chamado.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0">
                  <Badge variant={
                    chamado.prioridade === 'Urgente' ? 'destructive' :
                    chamado.prioridade === 'Alta' ? 'destructive' :
                    chamado.prioridade === 'Média' ? 'default' : 'secondary'
                  }>
                    {chamado.prioridade}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{chamado.problema}</p>
                  <p className="text-sm text-muted-foreground">
                    {chamado.solicitante.nome} • {chamado.numero}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <Badge variant="outline">
                    {chamado.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {chamado.dataAbertura.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};