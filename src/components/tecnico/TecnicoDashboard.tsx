import React, { useEffect, useState } from 'react';
import { useHelpdesk } from '../../contexts/HelpdeskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Shield,
  Target,
  Clock,
  CheckCircle,
  Star,
  AlertTriangle,
  UserCheck,
  Plus,
  MessageSquare,
  Send,
  Eye,
  PlayCircle,
  Pause,
  StopCircle,
  Timer,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface ChamadoMensagem {
  id: string;
  mensagem: string;
  tipo: string;
  created_at: string;
  user?: {
    nome: string;
    tipo: string;
  };
}

export const TecnicoDashboard: React.FC = () => {
  const { currentUser, chamados, metricas, loadChamados, updateChamado, loadMensagens, addMensagem } = useHelpdesk();
  const [activeTab, setActiveTab] = useState('meus');
  const [selectedChamado, setSelectedChamado] = useState<any>(null);
  const [mensagens, setMensagens] = useState<ChamadoMensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [chamadoUpdate, setChamadoUpdate] = useState({
    status: '',
    solucao_aplicada: '',
    tempo_gasto: '',
    observacoes: '',
  });

  useEffect(() => {
    if (currentUser) {
      loadChamados();
    }
  }, [currentUser]);

  const meusChamados = chamados.filter(c => c.tecnico_id === currentUser?.user_id);
  const meusChamadosAbertos = meusChamados.filter(c => ['Aberto', 'Em Andamento', 'Pendente'].includes(c.status));
  const chamadosDisponiveis = chamados.filter(c => !c.tecnico_id && c.status === 'Aberto');
  const chamadosUrgentes = chamados.filter(c => c.prioridade === 'Urgente' && ['Aberto', 'Em Andamento'].includes(c.status));

  const minhaPerformance = {
    totalAtendidos: meusChamados.length,
    resolvidos: meusChamados.filter(c => c.status === 'Resolvido').length,
    taxaResolucao: meusChamados.length > 0 ? (meusChamados.filter(c => c.status === 'Resolvido').length / meusChamados.length) * 100 : 0,
    tempoMedio: metricas.tempoMedioResolucao || 0,
    satisfacaoMedia: metricas.minhaSatisfacaoMedia || 0,
  };

  const handleAssumirChamado = async (chamado: any) => {
    if (!currentUser) return;
    
    await updateChamado(chamado.id, {
      tecnico_id: currentUser.user_id,
      status: 'Em Andamento'
    });
    
    await loadChamados();
  };

  const handleAtualizarChamado = async () => {
    if (!selectedChamado) return;

    const updates: any = {};
    
    if (chamadoUpdate.status) updates.status = chamadoUpdate.status;
    if (chamadoUpdate.solucao_aplicada) updates.solucao_aplicada = chamadoUpdate.solucao_aplicada;
    if (chamadoUpdate.tempo_gasto) updates.tempo_gasto = parseInt(chamadoUpdate.tempo_gasto);
    if (chamadoUpdate.observacoes) updates.observacoes = chamadoUpdate.observacoes;

    await updateChamado(selectedChamado.id, updates);
    await loadChamados();
    setSelectedChamado(null);
    setChamadoUpdate({
      status: '',
      solucao_aplicada: '',
      tempo_gasto: '',
      observacoes: '',
    });
  };

  const loadChamadoMensagens = async (chamadoId: string) => {
    const mensagensData = await loadMensagens(chamadoId);
    setMensagens(mensagensData);
  };

  const handleEnviarMensagem = async () => {
    if (!selectedChamado || !novaMensagem.trim()) return;

    await addMensagem(selectedChamado.id, novaMensagem);
    setNovaMensagem('');
    await loadChamadoMensagens(selectedChamado.id);
  };

  const getFilteredChamados = () => {
    switch (activeTab) {
      case 'meus':
        return meusChamados;
      case 'disponiveis':
        return chamadosDisponiveis;
      case 'urgentes':
        return chamadosUrgentes;
      default:
        return chamados;
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Urgente': return 'destructive';
      case 'Alta': return 'destructive';
      case 'Média': return 'default';
      case 'Baixa': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto': return 'destructive';
      case 'Em Andamento': return 'default';
      case 'Pendente': return 'secondary';
      case 'Resolvido': return 'secondary';
      case 'Fechado': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Central de Atendimento</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {currentUser?.nome}! Gerencie seus chamados e ajude os usuários.
            </p>
          </div>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meus Pendentes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{meusChamadosAbertos.length}</div>
            <p className="text-xs text-muted-foreground">
              Para resolver
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{Math.round(minhaPerformance.taxaResolucao)}%</div>
            <Progress value={minhaPerformance.taxaResolucao} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{minhaPerformance.tempoMedio}min</div>
            <p className="text-xs text-muted-foreground">
              Por resolução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{minhaPerformance.satisfacaoMedia.toFixed(1)}/5</div>
            <div className="flex mt-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star 
                  key={i} 
                  className={`h-3 w-3 ${i < Math.floor(minhaPerformance.satisfacaoMedia) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas para Chamados Críticos */}
      {(chamadosUrgentes.length > 0 || chamadosDisponiveis.length > 0) && (
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
                      Prioridade máxima de atendimento
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="ml-auto"
                    onClick={() => setActiveTab('urgentes')}
                  >
                    Ver Urgentes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {chamadosDisponiveis.length > 0 && (
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      {chamadosDisponiveis.length} Chamado(s) Disponível(is)
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Prontos para você assumir
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => setActiveTab('disponiveis')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Assumir
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tabs de Chamados */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="meus">
            Meus Chamados
            {meusChamadosAbertos.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {meusChamadosAbertos.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="disponiveis">
            Disponíveis
            {chamadosDisponiveis.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {chamadosDisponiveis.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="urgentes">
            Urgentes
            {chamadosUrgentes.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {chamadosUrgentes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="todos">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value="meus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meus Chamados Atribuídos</CardTitle>
              <CardDescription>
                Chamados sob sua responsabilidade - {meusChamados.length} total, {meusChamadosAbertos.length} pendentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meusChamados.map((chamado) => (
                  <div key={chamado.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 space-y-1">
                      <Badge variant={getPrioridadeColor(chamado.prioridade)}>
                        {chamado.prioridade}
                      </Badge>
                      <Badge variant={getStatusColor(chamado.status)}>
                        {chamado.status}
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{chamado.problema}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{chamado.descricao}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {chamado.solicitante?.nome} • {chamado.numero} • 
                        {new Date(chamado.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedChamado(chamado);
                              loadChamadoMensagens(chamado.id);
                              setChamadoUpdate({
                                status: chamado.status,
                                solucao_aplicada: chamado.solucao_aplicada || '',
                                tempo_gasto: chamado.tempo_gasto?.toString() || '',
                                observacoes: chamado.observacoes || '',
                              });
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Atender Chamado - {selectedChamado?.numero}</DialogTitle>
                            <DialogDescription>
                              Comunicação e resolução do chamado
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedChamado && (
                            <Tabs defaultValue="conversa" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="conversa">Conversa</TabsTrigger>
                                <TabsTrigger value="resolucao">Resolução</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="conversa" className="space-y-4">
                                {/* Detalhes do Chamado */}
                                <Card>
                                  <CardContent className="pt-4">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                      <div>
                                        <Label className="text-xs text-muted-foreground">Solicitante</Label>
                                        <p className="font-medium">{selectedChamado.solicitante?.nome}</p>
                                        <p className="text-sm text-muted-foreground">{selectedChamado.solicitante?.departamento}</p>
                                      </div>
                                      <div>
                                        <Label className="text-xs text-muted-foreground">Prioridade</Label>
                                        <div className="mt-1">
                                          <Badge variant={getPrioridadeColor(selectedChamado.prioridade)}>
                                            {selectedChamado.prioridade}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Problema</Label>
                                      <p className="font-medium">{selectedChamado.problema}</p>
                                    </div>
                                    <div className="mt-2">
                                      <Label className="text-xs text-muted-foreground">Descrição</Label>
                                      <p className="text-sm">{selectedChamado.descricao}</p>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Histórico de Mensagens */}
                                <Card className="h-64 overflow-hidden flex flex-col">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Histórico de Comunicação</CardTitle>
                                  </CardHeader>
                                  <CardContent className="flex-1 overflow-y-auto space-y-3">
                                    {mensagens.map((mensagem) => (
                                      <div 
                                        key={mensagem.id}
                                        className={`flex ${mensagem.user?.nome === currentUser?.nome ? 'justify-end' : 'justify-start'}`}
                                      >
                                        <div className={`max-w-xs p-3 rounded-lg ${
                                          mensagem.user?.nome === currentUser?.nome 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-muted'
                                        }`}>
                                          <p className="text-sm">{mensagem.mensagem}</p>
                                          <p className="text-xs mt-1 opacity-70">
                                            {mensagem.user?.nome} • {new Date(mensagem.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </CardContent>
                                </Card>

                                {/* Enviar Nova Mensagem */}
                                <div className="flex space-x-2">
                                  <Input
                                    placeholder="Digite sua mensagem..."
                                    value={novaMensagem}
                                    onChange={(e) => setNovaMensagem(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleEnviarMensagem()}
                                  />
                                  <Button onClick={handleEnviarMensagem}>
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="resolucao" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select 
                                      value={chamadoUpdate.status} 
                                      onValueChange={(value) => setChamadoUpdate(prev => ({ ...prev, status: value }))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                                        <SelectItem value="Pendente">Pendente</SelectItem>
                                        <SelectItem value="Resolvido">Resolvido</SelectItem>
                                        <SelectItem value="Fechado">Fechado</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Tempo Gasto (minutos)</Label>
                                    <Input
                                      type="number"
                                      value={chamadoUpdate.tempo_gasto}
                                      onChange={(e) => setChamadoUpdate(prev => ({ ...prev, tempo_gasto: e.target.value }))}
                                      placeholder="0"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Solução Aplicada</Label>
                                  <Textarea
                                    value={chamadoUpdate.solucao_aplicada}
                                    onChange={(e) => setChamadoUpdate(prev => ({ ...prev, solucao_aplicada: e.target.value }))}
                                    placeholder="Descreva detalhadamente a solução aplicada..."
                                    rows={4}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Observações Técnicas</Label>
                                  <Textarea
                                    value={chamadoUpdate.observacoes}
                                    onChange={(e) => setChamadoUpdate(prev => ({ ...prev, observacoes: e.target.value }))}
                                    placeholder="Observações adicionais ou notas técnicas..."
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setSelectedChamado(null)}>
                                    Cancelar
                                  </Button>
                                  <Button onClick={handleAtualizarChamado}>
                                    Salvar Alterações
                                  </Button>
                                </div>
                              </TabsContent>
                            </Tabs>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
                
                {meusChamados.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum chamado atribuído</h3>
                    <p className="text-muted-foreground">
                      Verifique os chamados disponíveis para assumir novos atendimentos.
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setActiveTab('disponiveis')}
                    >
                      Ver Chamados Disponíveis
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disponiveis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chamados Disponíveis para Assumir</CardTitle>
              <CardDescription>
                {chamadosDisponiveis.length} chamado(s) aguardando atribuição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chamadosDisponiveis.map((chamado) => (
                  <div key={chamado.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 space-y-1">
                      <Badge variant={getPrioridadeColor(chamado.prioridade)}>
                        {chamado.prioridade}
                      </Badge>
                      <Badge variant="secondary">Disponível</Badge>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{chamado.problema}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{chamado.descricao}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {chamado.solicitante?.nome} • {chamado.numero} • 
                        {new Date(chamado.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detalhes do Chamado - {chamado.numero}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Solicitante</Label>
                              <p className="font-medium">{chamado.solicitante?.nome}</p>
                              <p className="text-sm text-muted-foreground">{chamado.solicitante?.departamento} - {chamado.solicitante?.cargo}</p>
                            </div>
                            <div>
                              <Label>Problema</Label>
                              <p className="font-medium">{chamado.problema}</p>
                            </div>
                            <div>
                              <Label>Descrição Completa</Label>
                              <p className="text-sm">{chamado.descricao}</p>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline">Fechar</Button>
                              <Button onClick={() => handleAssumirChamado(chamado)}>
                                <UserCheck className="h-4 w-4 mr-1" />
                                Assumir Chamado
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        size="sm" 
                        onClick={() => handleAssumirChamado(chamado)}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Assumir
                      </Button>
                    </div>
                  </div>
                ))}
                
                {chamadosDisponiveis.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Excelente trabalho!</h3>
                    <p className="text-muted-foreground">
                      Não há chamados disponíveis para assumir no momento.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urgentes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Chamados Urgentes - Ação Imediata</CardTitle>
              <CardDescription>
                {chamadosUrgentes.length} chamado(s) com prioridade máxima
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chamadosUrgentes.map((chamado) => (
                  <div key={chamado.id} className="flex items-center space-x-4 p-4 border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 rounded-lg">
                    <div className="flex-shrink-0 space-y-1">
                      <Badge variant="destructive">URGENTE</Badge>
                      <Badge variant={getStatusColor(chamado.status)}>
                        {chamado.status}
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800 dark:text-red-200">{chamado.problema}</h4>
                      <p className="text-sm text-red-600 dark:text-red-300 line-clamp-2">{chamado.descricao}</p>
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        {chamado.solicitante?.nome} • {chamado.numero} • 
                        {new Date(chamado.created_at).toLocaleDateString('pt-BR')}
                        {chamado.tecnico_id === currentUser?.user_id && ' • VOCÊ É O RESPONSÁVEL'}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      {chamado.tecnico_id === currentUser?.user_id ? (
                        <Button variant="destructive">
                          <Zap className="h-4 w-4 mr-1" />
                          Atender Agora
                        </Button>
                      ) : chamado.tecnico_id ? (
                        <Badge variant="outline">
                          Atribuído a {chamado.tecnico?.nome}
                        </Badge>
                      ) : (
                        <Button 
                          variant="destructive"
                          onClick={() => handleAssumirChamado(chamado)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Assumir Urgente
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {chamadosUrgentes.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Situação sob controle!</h3>
                    <p className="text-muted-foreground">
                      Não há chamados urgentes no momento.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="todos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Chamados</CardTitle>
              <CardDescription>Visão geral de todos os chamados do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chamados.slice(0, 10).map((chamado) => (
                  <div key={chamado.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0 space-y-1">
                      <Badge variant={getPrioridadeColor(chamado.prioridade)}>
                        {chamado.prioridade}
                      </Badge>
                      <Badge variant={getStatusColor(chamado.status)}>
                        {chamado.status}
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{chamado.problema}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">{chamado.descricao}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {chamado.solicitante?.nome} • {chamado.numero}
                        {chamado.tecnico_id && ` • ${chamado.tecnico?.nome}`}
                      </p>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {new Date(chamado.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};