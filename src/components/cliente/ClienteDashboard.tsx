import React, { useEffect, useState } from 'react';
import { useHelpdesk } from '../../contexts/HelpdeskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { 
  User,
  Plus,
  Clock,
  CheckCircle,
  Star,
  MessageSquare,
  Send,
  Eye,
  AlertCircle,
  Ticket,
  TrendingUp,
  Calendar,
  FileText,
  HelpCircle,
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

export const ClienteDashboard: React.FC = () => {
  const { currentUser, chamados, createChamado, loadChamados, loadMensagens, addMensagem } = useHelpdesk();
  const [novoChamado, setNovoChamado] = useState({
    problema: '',
    prioridade: 'Média',
    descricao: '',
  });
  const [showNovoChamado, setShowNovoChamado] = useState(false);
  const [selectedChamado, setSelectedChamado] = useState<any>(null);
  const [mensagens, setMensagens] = useState<ChamadoMensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [avaliacao, setAvaliacao] = useState(0);

  useEffect(() => {
    if (currentUser) {
      loadChamados();
    }
  }, [currentUser]);

  const meusChamados = chamados.filter(c => c.solicitante_id === currentUser?.user_id);
  const chamadosAbertos = meusChamados.filter(c => ['Aberto', 'Em Andamento', 'Pendente'].includes(c.status));
  const chamadosResolvidos = meusChamados.filter(c => ['Resolvido', 'Fechado'].includes(c.status));
  const ultimosChamados = meusChamados.slice(0, 5);

  const estatisticas = {
    total: meusChamados.length,
    abertos: chamadosAbertos.length,
    resolvidos: chamadosResolvidos.length,
    satisfacaoMedia: chamadosResolvidos.length > 0 
      ? chamadosResolvidos.reduce((acc, c) => acc + (c.satisfacao || 0), 0) / chamadosResolvidos.length 
      : 0,
  };

  const handleCriarChamado = async () => {
    if (!novoChamado.problema || !novoChamado.descricao) return;

    const success = await createChamado(novoChamado);
    
    if (success) {
      setNovoChamado({
        problema: '',
        prioridade: 'Média',
        descricao: '',
      });
      setShowNovoChamado(false);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aberto': return <AlertCircle className="h-4 w-4" />;
      case 'Em Andamento': return <Clock className="h-4 w-4" />;
      case 'Pendente': return <Clock className="h-4 w-4" />;
      case 'Resolvido': return <CheckCircle className="h-4 w-4" />;
      case 'Fechado': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
            <User className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Portal do Cliente</h1>
            <p className="text-muted-foreground">
              Olá, {currentUser?.nome}! Gerencie seus chamados de suporte.
            </p>
          </div>
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
              <DialogTitle>Abrir Novo Chamado de Suporte</DialogTitle>
              <DialogDescription>
                Descreva o problema que você está enfrentando. Nossa equipe técnica entrará em contato.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="problema">Título do Problema *</Label>
                <Input
                  id="problema"
                  value={novoChamado.problema}
                  onChange={(e) => setNovoChamado(prev => ({ ...prev, problema: e.target.value }))}
                  placeholder="Ex: Computador não liga, Erro no sistema, Internet lenta..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select 
                  value={novoChamado.prioridade} 
                  onValueChange={(value) => setNovoChamado(prev => ({ ...prev, prioridade: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                        Baixa - Não afeta o trabalho
                      </div>
                    </SelectItem>
                    <SelectItem value="Média">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                        Média - Afeta parcialmente o trabalho
                      </div>
                    </SelectItem>
                    <SelectItem value="Alta">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                        Alta - Impede trabalho importante
                      </div>
                    </SelectItem>
                    <SelectItem value="Urgente">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                        Urgente - Sistema crítico parado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição Detalhada *</Label>
                <Textarea
                  id="descricao"
                  value={novoChamado.descricao}
                  onChange={(e) => setNovoChamado(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva detalhadamente o problema: O que aconteceu? Quando começou? Quais passos você já tentou?"
                  rows={5}
                />
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">📋 Dicas para um atendimento mais rápido:</h4>
                <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                  <li>• Seja específico sobre o problema</li>
                  <li>• Mencione quando o problema começou</li>
                  <li>• Informe se há mensagens de erro</li>
                  <li>• Descreva o que você estava fazendo quando o problema ocorreu</li>
                </ul>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNovoChamado(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCriarChamado}>
                  Abrir Chamado
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo dos Chamados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Chamados</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
            <p className="text-xs text-muted-foreground">
              Histórico completo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{estatisticas.abertos}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando resolução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estatisticas.resolvidos}</div>
            <p className="text-xs text-muted-foreground">
              Problemas solucionados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.satisfacaoMedia.toFixed(1)}/5</div>
            <div className="flex mt-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star 
                  key={i} 
                  className={`h-3 w-3 ${i < Math.floor(estatisticas.satisfacaoMedia) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Chamados Ativos */}
      {chamadosAbertos.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              Status dos Seus Chamados Ativos
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-300">
              {chamadosAbertos.length} chamado(s) em andamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chamadosAbertos.slice(0, 3).map((chamado) => (
                <div key={chamado.id} className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="flex-shrink-0">
                    {getStatusIcon(chamado.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline">{chamado.numero}</Badge>
                      <Badge variant={getStatusColor(chamado.status)}>
                        {chamado.status}
                      </Badge>
                      {chamado.prioridade === 'Urgente' && (
                        <Badge variant="destructive">URGENTE</Badge>
                      )}
                    </div>
                    <p className="font-medium text-sm">{chamado.problema}</p>
                    <p className="text-xs text-muted-foreground">
                      Aberto em {new Date(chamado.created_at).toLocaleDateString('pt-BR')}
                      {chamado.tecnico && ` • Técnico: ${chamado.tecnico.nome}`}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedChamado(chamado);
                      loadChamadoMensagens(chamado.id);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Chamados */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Chamados</CardTitle>
          <CardDescription>
            Todos os seus chamados de suporte - {meusChamados.length} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ultimosChamados.map((chamado) => (
              <div key={chamado.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 space-y-1">
                  <Badge variant={getPrioridadeColor(chamado.prioridade)}>
                    {chamado.prioridade}
                  </Badge>
                  <Badge variant={getStatusColor(chamado.status)}>
                    {chamado.status}
                  </Badge>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium">{chamado.problema}</h4>
                    <span className="text-xs text-muted-foreground">#{chamado.numero}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{chamado.descricao}</p>
                  
                  <div className="flex items-center text-xs text-muted-foreground space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Aberto: {new Date(chamado.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {chamado.tecnico && (
                      <div className="flex items-center space-x-1">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-xs">
                            {chamado.tecnico.nome.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>Técnico: {chamado.tecnico.nome}</span>
                      </div>
                    )}
                    {chamado.data_fechamento && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Resolvido: {new Date(chamado.data_fechamento).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                    {chamado.satisfacao && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span>Avaliação: {chamado.satisfacao}/5</span>
                      </div>
                    )}
                  </div>
                  
                  {chamado.solucao_aplicada && (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded">
                      <p className="text-xs text-green-800 dark:text-green-200">
                        <strong>Solução:</strong> {chamado.solucao_aplicada}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedChamado(chamado);
                          loadChamadoMensagens(chamado.id);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Chamado #{selectedChamado?.numero}</DialogTitle>
                        <DialogDescription>
                          Detalhes completos e histórico de comunicação
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedChamado && (
                        <div className="space-y-6">
                          {/* Detalhes do Chamado */}
                          <Card>
                            <CardContent className="pt-4">
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <Label className="text-xs text-muted-foreground">Status Atual</Label>
                                  <div className="flex items-center space-x-2 mt-1">
                                    {getStatusIcon(selectedChamado.status)}
                                    <Badge variant={getStatusColor(selectedChamado.status)}>
                                      {selectedChamado.status}
                                    </Badge>
                                  </div>
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
                              
                              {selectedChamado.tecnico && (
                                <div className="mb-4">
                                  <Label className="text-xs text-muted-foreground">Técnico Responsável</Label>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">
                                        {selectedChamado.tecnico.nome.split(' ').map((n: string) => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{selectedChamado.tecnico.nome}</span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="mb-4">
                                <Label className="text-xs text-muted-foreground">Problema</Label>
                                <p className="font-medium mt-1">{selectedChamado.problema}</p>
                              </div>
                              
                              <div>
                                <Label className="text-xs text-muted-foreground">Descrição</Label>
                                <p className="text-sm mt-1">{selectedChamado.descricao}</p>
                              </div>
                              
                              {selectedChamado.solucao_aplicada && (
                                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                  <Label className="text-xs text-green-800 dark:text-green-200">Solução Aplicada</Label>
                                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                    {selectedChamado.solucao_aplicada}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Histórico de Comunicação */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Comunicação com o Suporte</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3 max-h-64 overflow-y-auto">
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
                                        {mensagem.user?.tipo === 'tecnico' ? '🔧 ' : '👤 '}
                                        {mensagem.user?.nome} • 
                                        {new Date(mensagem.created_at).toLocaleTimeString('pt-BR', { 
                                          hour: '2-digit', 
                                          minute: '2-digit',
                                          day: '2-digit',
                                          month: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Enviar Nova Mensagem - apenas se o chamado estiver aberto */}
                              {['Aberto', 'Em Andamento', 'Pendente'].includes(selectedChamado.status) && (
                                <div className="flex space-x-2 mt-4">
                                  <Input
                                    placeholder="Digite sua mensagem para o técnico..."
                                    value={novaMensagem}
                                    onChange={(e) => setNovaMensagem(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleEnviarMensagem()}
                                  />
                                  <Button onClick={handleEnviarMensagem}>
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          
                          {/* Avaliação do Atendimento - apenas para chamados resolvidos */}
                          {selectedChamado.status === 'Resolvido' && !selectedChamado.satisfacao && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-sm">Avaliar Atendimento</CardTitle>
                                <CardDescription>
                                  Como você avalia a resolução do seu problema?
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center space-x-2 mb-4">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Button
                                      key={i}
                                      variant={i < avaliacao ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setAvaliacao(i + 1)}
                                    >
                                      <Star className={`h-4 w-4 ${i < avaliacao ? 'fill-current' : ''}`} />
                                    </Button>
                                  ))}
                                </div>
                                <Button 
                                  disabled={avaliacao === 0}
                                  onClick={() => {
                                    // Aqui você implementaria a lógica de salvar a avaliação
                                    console.log('Avaliação:', avaliacao);
                                  }}
                                >
                                  Enviar Avaliação
                                </Button>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  {['Aberto', 'Em Andamento', 'Pendente'].includes(chamado.status) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedChamado(chamado);
                        loadChamadoMensagens(chamado.id);
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {meusChamados.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Nenhum chamado ainda</h3>
                <p className="text-muted-foreground mb-6">
                  Quando você precisar de suporte, abra um chamado e nossa equipe técnica irá ajudá-lo.
                </p>
                <Button onClick={() => setShowNovoChamado(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Abrir Primeiro Chamado
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};