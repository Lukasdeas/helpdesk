import React, { useState } from 'react';
import { useHelpdesk } from '../contexts/HelpdeskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
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
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  Download,
  Calendar,
  Clock,
  Star,
  Users,
  Ticket,
  CheckCircle,
  AlertTriangle,
  Activity,
  FileText,
  BarChart3,
} from 'lucide-react';

export const Relatorios: React.FC = () => {
  const { chamados, metricas, currentUser } = useHelpdesk();
  const [periodoFilter, setPeriodoFilter] = useState('30');

  // Verificar se o usuário tem acesso aos relatórios
  const hasAccess = currentUser && ['administrador', 'tecnico'].includes(currentUser.tipo);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3>Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Apenas técnicos e administradores podem acessar os relatórios.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dados simulados para demonstração
  const chamadosPorMes = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
    const count = Math.floor(Math.random() * 20) + 5;
    return { mes: monthName, chamados: count, resolvidos: Math.floor(count * 0.8) };
  });

  const satisfacaoPorMes = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
    return { 
      mes: monthName, 
      satisfacao: (Math.random() * 2 + 3).toFixed(1)
    };
  });

  const statusDistribution = [
    { status: 'Aberto', value: 25, color: '#ef4444' },
    { status: 'Em Andamento', value: 35, color: '#f59e0b' },
    { status: 'Pendente', value: 15, color: '#8b5cf6' },
    { status: 'Resolvido', value: 20, color: '#10b981' },
    { status: 'Fechado', value: 5, color: '#6b7280' },
  ];

  const problemasMaisComuns = [
    { problema: 'Computador não liga', quantidade: 15 },
    { problema: 'Internet lenta', quantidade: 12 },
    { problema: 'Impressora não funciona', quantidade: 10 },
    { problema: 'Email não sincroniza', quantidade: 8 },
    { problema: 'Sistema travando', quantidade: 6 },
  ];

  const chamadosPorHorario = Array.from({ length: 12 }, (_, i) => {
    const hora = (i + 8).toString().padStart(2, '0') + ':00';
    const quantidade = Math.floor(Math.random() * 5) + 1;
    return { hora, quantidade };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Relatórios</h1>
          <p className="text-muted-foreground">
            Análises detalhadas de performance e métricas do helpdesk
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 3 meses</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="visao-geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="satisfacao">Satisfação</TabsTrigger>
          <TabsTrigger value="tendencias">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
          {/* KPIs Principais */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Total de Chamados</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{metricas.totalChamados}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +12% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Taxa de Resolução</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-green-600">85%</div>
                <p className="text-xs text-muted-foreground">
                  Meta: 90%
                </p>
                <Progress value={85} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Tempo Médio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{metricas.tempoMedioResolucao}min</div>
                <p className="text-xs text-muted-foreground">
                  Meta: 45min
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Satisfação Média</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-yellow-600">{metricas.satisfacaoMedia}/5</div>
                <div className="flex mt-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(metricas.satisfacaoMedia) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Distribuição por Status */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
                <CardDescription>Status atual dos chamados</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value}%`, 'Porcentagem']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {statusDistribution.map((item) => (
                    <div key={item.status} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.status} ({item.value}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Problemas Mais Comuns */}
            <Card>
              <CardHeader>
                <CardTitle>Problemas Mais Comuns</CardTitle>
                <CardDescription>Top 5 tipos de problemas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={problemasMaisComuns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="problema" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
              <CardDescription>Indicadores gerais de produtividade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl text-blue-600">
                    {chamados.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Total de Chamados</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl text-green-600">
                    {chamados.filter(c => ['Resolvido', 'Fechado'].includes(c.status)).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Chamados Resolvidos</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl text-orange-600">
                    {chamados.filter(c => ['Aberto', 'Em Andamento', 'Pendente'].includes(c.status)).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Chamados Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="satisfacao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Satisfação</CardTitle>
              <CardDescription>Tendência de satisfação dos usuários</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={satisfacaoPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="satisfacao" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    dot={{ fill: '#8884d8', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tendencias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Volume de Chamados - 6 Meses</CardTitle>
              <CardDescription>Evolução mensal de abertura e resolução</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chamadosPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="chamados" 
                    stackId="1"
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    name="Chamados Abertos"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="resolvidos" 
                    stackId="2"
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    name="Chamados Resolvidos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Horário</CardTitle>
              <CardDescription>Padrão de abertura de chamados durante o dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chamadosPorHorario}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};