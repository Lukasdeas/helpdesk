import React, { useEffect } from 'react';
import { useHelpdesk } from '../../contexts/HelpdeskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
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
  AreaChart,
  Area,
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
  Crown,
  Settings,
  BarChart3,
  UserCheck,
  Timer,
  Target,
  Zap,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { metricas, chamados, loadMetricas } = useHelpdesk();

  useEffect(() => {
    loadMetricas();
  }, []);

  const statusColors = {
    'Aberto': '#ef4444',
    'Em Andamento': '#f59e0b',
    'Pendente': '#8b5cf6',
    'Resolvido': '#10b981',
    'Fechado': '#6b7280',
  };

  const chamadosPorStatus = Object.entries(
    chamados.reduce((acc, chamado) => {
      acc[chamado.status] = (acc[chamado.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, quantidade]) => ({
    status,
    quantidade,
    color: statusColors[status as keyof typeof statusColors],
  }));

  const chamadosPorPrioridade = Object.entries(
    chamados.reduce((acc, chamado) => {
      acc[chamado.prioridade] = (acc[chamado.prioridade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([prioridade, quantidade]) => ({ prioridade, quantidade }));

  const chamadosUltimos7Dias = Array.from({ length: 7 }, (_, i) => {
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

  const chamadosUrgentes = chamados.filter(c => 
    c.prioridade === 'Urgente' && ['Aberto', 'Em Andamento'].includes(c.status)
  );

  const chamadosNaoAtribuidos = chamados.filter(c => 
    !c.tecnico_id && c.status === 'Aberto'
  );

  const taxaResolucao = chamados.length > 0 
    ? (chamados.filter(c => ['Resolvido', 'Fechado'].includes(c.status)).length / chamados.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900">
            <Crown className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
            <p className="text-muted-foreground">Visão completa e controle total do sistema</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Relatório Executivo
          </Button>
        </div>
      </div>

      {/* Alertas Críticos */}
      {(chamadosUrgentes.length > 0 || chamadosNaoAtribuidos.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {chamadosUrgentes.length > 0 && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-200">
                      {chamadosUrgentes.length} Chamado(s) Urgente(s)
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      Requerem atenção imediata
                    </p>
                  </div>
                  <Button size="sm" variant="destructive" className="ml-auto">
                    Revisar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {chamadosNaoAtribuidos.length > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-800 dark:text-orange-200">
                      {chamadosNaoAtribuidos.length} Chamado(s) Não Atribuído(s)
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-300">
                      Aguardando designação de técnico
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto">
                    Atribuir
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Chamados</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.totalChamados}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{Math.round(taxaResolucao)}%</div>
            <Progress value={taxaResolucao} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Meta: 90%
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
      </div>

      {/* Performance da Equipe */}
      <Card>
        <CardHeader>
          <CardTitle>Performance da Equipe de Suporte</CardTitle>
          <CardDescription>Métricas operacionais em tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {chamados.filter(c => c.tecnico_id).length}
              </div>
              <div className="text-sm text-muted-foreground">Chamados Atribuídos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round(metricas.satisfacaoMedia * 10) / 10}
              </div>
              <div className="text-sm text-muted-foreground">Satisfação Média</div>
              <div className="flex justify-center mt-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${i < Math.floor(metricas.satisfacaoMedia) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {metricas.chamadosResolvidosHoje}
              </div>
              <div className="text-sm text-muted-foreground">Resolvidos Hoje</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Distribuição por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>Status atual de todos os chamados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chamadosPorStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="quantidade"
                >
                  {chamadosPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, 'Chamados']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
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

        {/* Chamados por Prioridade */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Prioridade</CardTitle>
            <CardDescription>Análise de urgência dos chamados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chamadosPorPrioridade}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="prioridade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tendência Temporal */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência - Últimos 7 Dias</CardTitle>
          <CardDescription>Volume de chamados abertos por dia</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chamadosUltimos7Dias}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="chamados" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Insights Automáticos</span>
            </CardTitle>
            <CardDescription>Análises baseadas em IA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Performance Melhorando
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Taxa de resolução aumentou 15% esta semana
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">
                    Pico de Demanda
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Terças-feiras registram 40% mais chamados
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Padrão Identificado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    80% dos problemas de hardware ocorrem às segundas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Recomendações Estratégicas</span>
            </CardTitle>
            <CardDescription>Sugestões para otimização</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  🎯 Treinamento de Equipe
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  Implementar treinamento especializado em hardware para reduzir tempo de resolução
                </p>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="font-medium text-green-800 dark:text-green-200">
                  📋 Base de Conhecimento
                </p>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                  Criar FAQ automatizado para problemas recorrentes (economia de 30% do tempo)
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <p className="font-medium text-purple-800 dark:text-purple-200">
                  ⚡ Automação
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                  Implementar chatbot para triagem inicial de chamados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chamados Críticos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Chamados Críticos - Atenção Necessária</CardTitle>
          <CardDescription>Chamados que requerem supervisão administrativa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chamados
              .filter(c => c.prioridade === 'Urgente' || !c.tecnico_id)
              .slice(0, 5)
              .map((chamado) => (
                <div key={chamado.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0">
                    <Badge variant={chamado.prioridade === 'Urgente' ? 'destructive' : 'secondary'}>
                      {chamado.prioridade}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{chamado.problema}</p>
                    <p className="text-sm text-muted-foreground">
                      {chamado.solicitante?.nome} • {chamado.numero}
                      {!chamado.tecnico_id && ' • Sem atribuição'}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <Badge variant="outline">
                      {chamado.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(chamado.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Supervisionar
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};