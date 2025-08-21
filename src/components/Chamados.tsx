import React, { useState } from 'react';
import { useHelpdesk } from '../contexts/HelpdeskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Calendar,
  FileText,
  Star,
  Edit,
  MessageSquare,
  CheckCircle,
  X,
  AlertTriangle,
  Eye,
  UserCheck,
  Timer,
  Target,
} from 'lucide-react';
import { Chamado } from '../types/helpdesk';

export const Chamados: React.FC = () => {
  const { chamados, currentUser, users, addChamado, updateChamado } = useHelpdesk();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState('todas');
  const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null);
  const [showNovoChamado, setShowNovoChamado] = useState(false);
  const [activeTab, setActiveTab] = useState('todos');

  // Form states
  const [novoChamado, setNovoChamado] = useState({
    problema: '',
    prioridade: 'Média' as 'Baixa' | 'Média' | 'Alta' | 'Urgente',
    descricao: '',
  });

  const [atualizacaoChamado, setAtualizacaoChamado] = useState({
    status: '',
    tecnicoResponsavel: '',
    solucaoAplicada: '',
    tempoGasto: '',
    observacoes: '',
    satisfacao: '',
  });

  const isTecnico = currentUser?.tipo === 'tecnico';
  const isAdmin = currentUser?.tipo === 'administrador';

  // Filtrar chamados baseado no tipo de usuário e tab ativa
  const getFilteredChamados = () => {
    let baseChamados = chamados;
    
    if (isTecnico) {
      switch (activeTab) {
        case 'meus':
          baseChamados = chamados.filter(c => c.tecnicoResponsavel?.id === currentUser.id);
          break;
        case 'disponiveis':
          baseChamados = chamados.filter(c => !c.tecnicoResponsavel && ['Aberto'].includes(c.status));
          break;
        case 'todos':
        default:
          // Técnico pode ver todos os chamados
          break;
      }
    } else if (!isAdmin) {
      // Usuário comum só vê seus próprios chamados
      baseChamados = chamados.filter(c => c.solicitante.id === currentUser?.id);
    }

    return baseChamados.filter(chamado => {
      const matchesSearch = chamado.problema.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           chamado.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           chamado.solicitante.nome.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todos' || chamado.status === statusFilter;
      const matchesPrioridade = prioridadeFilter === 'todas' || chamado.prioridade === prioridadeFilter;
      
      return matchesSearch && matchesStatus && matchesPrioridade;
    });
  };

  const filteredChamados = getFilteredChamados();

  const handleNovoChamado = () => {
    if (!novoChamado.problema || !novoChamado.descricao || !currentUser) return;

    addChamado({
      solicitante: currentUser,
      problema: novoChamado.problema,
      prioridade: novoChamado.prioridade,
      descricao: novoChamado.descricao,
      anexos: [],
    });

    setNovoChamado({
      problema: '',
      prioridade: 'Média',
      descricao: '',
    });
    setShowNovoChamado(false);
  };

  const handleAtualizarChamado = () => {
    if (!selectedChamado) return;

    const updates: Partial<Chamado> = {};
    
    if (atualizacaoChamado.status) {
      updates.status = atualizacaoChamado.status as any;
      if (atualizacaoChamado.status === 'Resolvido' || atualizacaoChamado.status === 'Fechado') {
        updates.dataFechamento = new Date();
      }
    }
    
    if (atualizacaoChamado.tecnicoResponsavel) {
      const tecnico = users.find(u => u.id === atualizacaoChamado.tecnicoResponsavel);
      if (tecnico) updates.tecnicoResponsavel = tecnico;
    }
    
    if (atualizacaoChamado.solucaoAplicada) {
      updates.solucaoAplicada = atualizacaoChamado.solucaoAplicada;
    }
    
    if (atualizacaoChamado.tempoGasto) {
      updates.tempoGasto = parseInt(atualizacaoChamado.tempoGasto);
    }
    
    if (atualizacaoChamado.observacoes) {
      updates.observacoes = atualizacaoChamado.observacoes;
    }

    if (atualizacaoChamado.satisfacao) {
      updates.satisfacao = parseInt(atualizacaoChamado.satisfacao);
    }

    updateChamado(selectedChamado.id, updates);
    setSelectedChamado(null);
    setAtualizacaoChamado({
      status: '',
      tecnicoResponsavel: '',
      solucaoAplicada: '',
      tempoGasto: '',
      observacoes: '',
      satisfacao: '',
    });
  };

  const handleAssumirChamado = (chamado: Chamado) => {
    if (!currentUser || currentUser.tipo !== 'tecnico') return;
    
    updateChamado(chamado.id, { 
      tecnicoResponsavel: currentUser,
      status: 'Em Andamento'
    });
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

  const tecnicos = users.filter(u => ['tecnico', 'administrador'].includes(u.tipo));

  // Estatísticas para técnicos
  const meusChamados = isTecnico ? chamados.filter(c => c.tecnicoResponsavel?.id === currentUser.id) : [];
  const meusChamadosAbertos = meusChamados.filter(c => ['Aberto', 'Em Andamento', 'Pendente'].includes(c.status));
  const chamadosDisponiveis = chamados.filter(c => !c.tecnicoResponsavel && c.status === 'Aberto');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isTecnico ? 'Central de Atendimento' : isAdmin ? 'Gerenciar Chamados' : 'Meus Chamados'}
          </h1>
          <p className="text-muted-foreground">
            {isTecnico 
              ? 'Gerencie seus chamados e assuma novos atendimentos'
              : isAdmin 
              ? 'Gerencie e acompanhe todos os chamados de suporte'
              : 'Acompanhe o status dos seus chamados de suporte'
            }
          </p>
        </div>
        
        <Dialog open={showNovoChamado} onOpenChange={setShowNovoChamado}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Chamado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Novo Chamado</DialogTitle>
              <DialogDescription>
                Descreva o problema que precisa de suporte técnico.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="problema">Problema</Label>
                <Input
                  id="problema"
                  value={novoChamado.problema}
                  onChange={(e) => setNovoChamado(prev => ({ ...prev, problema: e.target.value }))}
                  placeholder="Descreva brevemente o problema"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select 
                  value={novoChamado.prioridade} 
                  onValueChange={(value: any) => setNovoChamado(prev => ({ ...prev, prioridade: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição Detalhada</Label>
                <Textarea
                  id="descricao"
                  value={novoChamado.descricao}
                  onChange={(e) => setNovoChamado(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Forneça uma descrição detalhada do problema..."
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNovoChamado(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleNovoChamado}>
                  Criar Chamado
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas rápidas para técnicos */}
      {isTecnico && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{meusChamadosAbertos.length}</p>
                  <p className="text-xs text-muted-foreground">Meus Chamados Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{meusChamados.filter(c => c.status === 'Resolvido').length}</p>
                  <p className="text-xs text-muted-foreground">Resolvidos Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{chamadosDisponiveis.length}</p>
                  <p className="text-xs text-muted-foreground">Disponíveis para Assumir</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs para técnicos */}
      {isTecnico && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="todos">Todos os Chamados</TabsTrigger>
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
          </TabsList>
        </Tabs>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, problema ou solicitante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="Aberto">Aberto</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Resolvido">Resolvido</SelectItem>
                <SelectItem value="Fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="Urgente">Urgente</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerta para chamados urgentes */}
      {filteredChamados.some(c => c.prioridade === 'Urgente' && ['Aberto', 'Em Andamento'].includes(c.status)) && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            Há {filteredChamados.filter(c => c.prioridade === 'Urgente' && ['Aberto', 'Em Andamento'].includes(c.status)).length} chamado(s) com prioridade urgente aguardando atendimento.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Chamados */}
      <div className="grid gap-4">
        {filteredChamados.map((chamado) => (
          <Card key={chamado.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{chamado.numero}</Badge>
                    <Badge variant={getPrioridadeColor(chamado.prioridade)}>
                      {chamado.prioridade}
                    </Badge>
                    <Badge variant={getStatusColor(chamado.status)}>
                      {chamado.status}
                    </Badge>
                    {isTecnico && chamado.tecnicoResponsavel?.id === currentUser?.id && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Meu
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg">{chamado.problema}</h3>
                  <p className="text-muted-foreground line-clamp-2">{chamado.descricao}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{chamado.solicitante.nome}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{chamado.dataAbertura.toLocaleDateString('pt-BR')}</span>
                    </div>
                    {chamado.tecnicoResponsavel && (
                      <div className="flex items-center space-x-1">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-xs">
                            {chamado.tecnicoResponsavel.nome.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{chamado.tecnicoResponsavel.nome}</span>
                      </div>
                    )}
                    {chamado.tempoGasto && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{chamado.tempoGasto}min</span>
                      </div>
                    )}
                    {chamado.satisfacao && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{chamado.satisfacao}/5</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {/* Botão para assumir chamado (apenas técnicos) */}
                  {isTecnico && !chamado.tecnicoResponsavel && chamado.status === 'Aberto' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAssumirChamado(chamado)}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Assumir
                    </Button>
                  )}

                  {/* Botão para editar/atualizar (técnicos e admins) */}
                  {(['tecnico', 'administrador'].includes(currentUser?.tipo || '') || 
                    (isTecnico && chamado.tecnicoResponsavel?.id === currentUser?.id)) && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedChamado(chamado);
                            setAtualizacaoChamado({
                              status: chamado.status,
                              tecnicoResponsavel: chamado.tecnicoResponsavel?.id || '',
                              solucaoAplicada: chamado.solucaoAplicada || '',
                              tempoGasto: chamado.tempoGasto?.toString() || '',
                              observacoes: chamado.observacoes || '',
                              satisfacao: chamado.satisfacao?.toString() || '',
                            });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[700px]">
                        <DialogHeader>
                          <DialogTitle>Atualizar Chamado - {chamado.numero}</DialogTitle>
                          <DialogDescription>
                            Atualize o status e informações do chamado.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue="detalhes" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                            <TabsTrigger value="atualizacao">Atualização</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="detalhes" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Solicitante</Label>
                                <p className="text-sm font-medium">{chamado.solicitante.nome}</p>
                                <p className="text-xs text-muted-foreground">{chamado.solicitante.email}</p>
                                <p className="text-xs text-muted-foreground">{chamado.solicitante.departamento}</p>
                              </div>
                              <div>
                                <Label>Data de Abertura</Label>
                                <p className="text-sm">{chamado.dataAbertura.toLocaleString('pt-BR')}</p>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <Label>Problema</Label>
                              <p className="text-sm font-medium">{chamado.problema}</p>
                            </div>
                            
                            <div>
                              <Label>Descrição</Label>
                              <p className="text-sm">{chamado.descricao}</p>
                            </div>
                            
                            {chamado.solucaoAplicada && (
                              <div>
                                <Label>Solução Aplicada</Label>
                                <p className="text-sm">{chamado.solucaoAplicada}</p>
                              </div>
                            )}

                            {chamado.observacoes && (
                              <div>
                                <Label>Observações</Label>
                                <p className="text-sm">{chamado.observacoes}</p>
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="atualizacao" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Status</Label>
                                <Select 
                                  value={atualizacaoChamado.status} 
                                  onValueChange={(value) => setAtualizacaoChamado(prev => ({ ...prev, status: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Aberto">Aberto</SelectItem>
                                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                                    <SelectItem value="Pendente">Pendente</SelectItem>
                                    <SelectItem value="Resolvido">Resolvido</SelectItem>
                                    <SelectItem value="Fechado">Fechado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {(isAdmin || currentUser?.tipo === 'administrador') && (
                                <div className="space-y-2">
                                  <Label>Técnico Responsável</Label>
                                  <Select 
                                    value={atualizacaoChamado.tecnicoResponsavel} 
                                    onValueChange={(value) => setAtualizacaoChamado(prev => ({ ...prev, tecnicoResponsavel: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecionar técnico" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {tecnicos.map((tecnico) => (
                                        <SelectItem key={tecnico.id} value={tecnico.id}>
                                          {tecnico.nome}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Solução Aplicada</Label>
                              <Textarea
                                value={atualizacaoChamado.solucaoAplicada}
                                onChange={(e) => setAtualizacaoChamado(prev => ({ ...prev, solucaoAplicada: e.target.value }))}
                                placeholder="Descreva a solução aplicada..."
                                rows={3}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Tempo Gasto (minutos)</Label>
                                <Input
                                  type="number"
                                  value={atualizacaoChamado.tempoGasto}
                                  onChange={(e) => setAtualizacaoChamado(prev => ({ ...prev, tempoGasto: e.target.value }))}
                                  placeholder="0"
                                />
                              </div>
                              
                              {atualizacaoChamado.status === 'Resolvido' && (
                                <div className="space-y-2">
                                  <Label>Avaliação (1-5)</Label>
                                  <Select 
                                    value={atualizacaoChamado.satisfacao} 
                                    onValueChange={(value) => setAtualizacaoChamado(prev => ({ ...prev, satisfacao: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">1 - Muito Ruim</SelectItem>
                                      <SelectItem value="2">2 - Ruim</SelectItem>
                                      <SelectItem value="3">3 - Regular</SelectItem>
                                      <SelectItem value="4">4 - Bom</SelectItem>
                                      <SelectItem value="5">5 - Excelente</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Observações</Label>
                              <Textarea
                                value={atualizacaoChamado.observacoes}
                                onChange={(e) => setAtualizacaoChamado(prev => ({ ...prev, observacoes: e.target.value }))}
                                placeholder="Observações adicionais..."
                                rows={2}
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
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* Botão apenas para visualizar (usuários comuns) */}
                  {!['tecnico', 'administrador'].includes(currentUser?.tipo || '') && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Detalhes do Chamado - {chamado.numero}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Status Atual</Label>
                            <Badge variant={getStatusColor(chamado.status)} className="mt-1">
                              {chamado.status}
                            </Badge>
                          </div>
                          
                          <div>
                            <Label>Problema</Label>
                            <p className="text-sm">{chamado.problema}</p>
                          </div>
                          
                          <div>
                            <Label>Descrição</Label>
                            <p className="text-sm">{chamado.descricao}</p>
                          </div>
                          
                          {chamado.tecnicoResponsavel && (
                            <div>
                              <Label>Técnico Responsável</Label>
                              <p className="text-sm">{chamado.tecnicoResponsavel.nome}</p>
                            </div>
                          )}
                          
                          {chamado.solucaoAplicada && (
                            <div>
                              <Label>Solução Aplicada</Label>
                              <p className="text-sm">{chamado.solucaoAplicada}</p>
                            </div>
                          )}
                          
                          {chamado.satisfacao && (
                            <div>
                              <Label>Sua Avaliação</Label>
                              <div className="flex items-center space-x-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < chamado.satisfacao! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                                <span className="text-sm ml-2">{chamado.satisfacao}/5</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChamados.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum chamado encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'todos' || prioridadeFilter !== 'todas' 
                ? 'Tente ajustar os filtros de busca.'
                : isTecnico && activeTab === 'disponiveis'
                ? 'Não há chamados disponíveis para assumir no momento.'
                : 'Comece criando um novo chamado.'}
            </p>
            {isTecnico && activeTab === 'disponiveis' && chamadosDisponiveis.length === 0 && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setActiveTab('todos')}
              >
                Ver Todos os Chamados
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};