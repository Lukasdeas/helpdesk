import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Search, Filter, Eye, Edit, MessageSquare } from 'lucide-react';
import { Chamado, Usuario, StatusChamado, PrioridadeChamado } from '../../types/helpdesk';
import { mockChamados, statusOptions, prioridades, categorias } from '../../constants/mockData';
import { ChamadoForm } from './ChamadoForm';
import { ChamadoDetails } from './ChamadoDetails';

interface ChamadosManagerProps {
  currentUser: Usuario;
}

export const ChamadosManager: React.FC<ChamadosManagerProps> = ({ currentUser }) => {
  const [chamados, setChamados] = useState<Chamado[]>(mockChamados);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [chamadoEditando, setChamadoEditando] = useState<Chamado | null>(null);

  // Filtrar chamados baseado no tipo de usuário
  const chamadosFiltrados = useMemo(() => {
    let resultado = chamados;

    // Filtro por tipo de usuário
    if (currentUser.tipo === 'usuario') {
      // Clientes só veem seus próprios chamados
      resultado = resultado.filter(c => c.solicitanteId === currentUser.id);
    } else if (currentUser.tipo === 'tecnico') {
      // Técnicos veem chamados atribuídos a eles ou não atribuídos
      resultado = resultado.filter(c => 
        c.tecnicoResponsavelId === currentUser.id || 
        c.tecnicoResponsavelId === null ||
        c.status === 'aberto'
      );
    }
    // Administradores veem todos os chamados

    // Filtros de busca
    if (busca) {
      const termoBusca = busca.toLowerCase();
      resultado = resultado.filter(c => 
        c.numero.toLowerCase().includes(termoBusca) ||
        c.titulo.toLowerCase().includes(termoBusca) ||
        c.solicitanteNome.toLowerCase().includes(termoBusca) ||
        c.categoria.toLowerCase().includes(termoBusca)
      );
    }

    // Filtros específicos
    if (filtroStatus !== 'todos') {
      resultado = resultado.filter(c => c.status === filtroStatus);
    }

    if (filtroPrioridade !== 'todos') {
      resultado = resultado.filter(c => c.prioridade === filtroPrioridade);
    }

    if (filtroCategoria !== 'todos') {
      resultado = resultado.filter(c => c.categoria === filtroCategoria);
    }

    return resultado.sort((a, b) => 
      new Date(b.dataUltimaAtualizacao).getTime() - new Date(a.dataUltimaAtualizacao).getTime()
    );
  }, [chamados, busca, filtroStatus, filtroPrioridade, filtroCategoria, currentUser]);

  // Estatísticas rápidas
  const stats = useMemo(() => {
    const total = chamadosFiltrados.length;
    const abertos = chamadosFiltrados.filter(c => c.status === 'aberto').length;
    const emAndamento = chamadosFiltrados.filter(c => c.status === 'em_andamento').length;
    const resolvidos = chamadosFiltrados.filter(c => c.status === 'resolvido').length;

    return { total, abertos, emAndamento, resolvidos };
  }, [chamadosFiltrados]);

  const handleNovoChamado = (dados: any) => {
    const novoChamado: Chamado = {
      id: Date.now().toString(),
      numero: `#${new Date().getFullYear()}${(chamados.length + 1).toString().padStart(3, '0')}`,
      titulo: dados.titulo,
      descricao: dados.descricao,
      categoria: dados.categoria,
      prioridade: dados.prioridade,
      status: 'aberto',
      solicitanteId: currentUser.id,
      solicitanteNome: currentUser.nome,
      departamento: currentUser.departamento,
      dataAbertura: new Date().toISOString(),
      dataUltimaAtualizacao: new Date().toISOString(),
      tecnicoResponsavelId: null,
      tecnicoResponsavelNome: null,
      observacoes: [],
      anexos: [],
      tags: dados.tags || [],
      tempoEstimado: null,
      dataResolucao: null,
      avaliacao: null,
      comentariosResolucao: null
    };

    setChamados([novoChamado, ...chamados]);
    setMostrarFormulario(false);
  };

  const handleAtualizarChamado = (chamadoAtualizado: Chamado) => {
    setChamados(prev => prev.map(c => 
      c.id === chamadoAtualizado.id ? chamadoAtualizado : c
    ));
    setChamadoSelecionado(chamadoAtualizado);
  };

  const getPrioridadeColor = (prioridade: PrioridadeChamado) => {
    return prioridades.find(p => p.value === prioridade)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: StatusChamado) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>Gerenciar Chamados</h2>
          <p className="text-muted-foreground">
            {currentUser.tipo === 'administrador' && 'Visão completa de todos os chamados'}
            {currentUser.tipo === 'tecnico' && 'Chamados para atendimento'}
            {currentUser.tipo === 'usuario' && 'Seus chamados'}
          </p>
        </div>
        
        {currentUser.tipo === 'usuario' && (
          <Dialog open={mostrarFormulario} onOpenChange={setMostrarFormulario}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Chamado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Abrir Novo Chamado</DialogTitle>
              </DialogHeader>
              <ChamadoForm
                onSubmit={handleNovoChamado}
                onCancel={() => setMostrarFormulario(false)}
                currentUser={currentUser}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400">📊</span>
            </div>
            <div>
              <p className="text-2xl font-medium">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 dark:text-yellow-400">🟡</span>
            </div>
            <div>
              <p className="text-2xl font-medium">{stats.abertos}</p>
              <p className="text-sm text-muted-foreground">Abertos</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400">🔄</span>
            </div>
            <div>
              <p className="text-2xl font-medium">{stats.emAndamento}</p>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400">✅</span>
            </div>
            <div>
              <p className="text-2xl font-medium">{stats.resolvidos}</p>
              <p className="text-sm text-muted-foreground">Resolvidos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por número, título, solicitante..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Status</SelectItem>
              {statusOptions.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas Prioridades</SelectItem>
              {prioridades.map(prioridade => (
                <SelectItem key={prioridade.value} value={prioridade.value}>
                  {prioridade.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas Categorias</SelectItem>
              {categorias.map(categoria => (
                <SelectItem key={categoria} value={categoria}>
                  {categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lista de Chamados */}
      <Card>
        <div className="p-6">
          {chamadosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum chamado encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chamadosFiltrados.map((chamado) => (
                <div 
                  key={chamado.id}
                  className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium">{chamado.numero}</span>
                        <Badge className={getPrioridadeColor(chamado.prioridade)}>
                          {chamado.prioridade}
                        </Badge>
                        <Badge className={getStatusColor(chamado.status)}>
                          {statusOptions.find(s => s.value === chamado.status)?.label}
                        </Badge>
                        <Badge variant="outline">{chamado.categoria}</Badge>
                      </div>
                      
                      <h4 className="mb-2">{chamado.titulo}</h4>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Solicitante: {chamado.solicitanteNome}</span>
                        <span>Departamento: {chamado.departamento}</span>
                        {chamado.tecnicoResponsavelNome && (
                          <span>Técnico: {chamado.tecnicoResponsavelNome}</span>
                        )}
                        <span>Aberto em: {formatarData(chamado.dataAbertura)}</span>
                      </div>
                      
                      {chamado.observacoes.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                          <MessageSquare className="w-4 h-4" />
                          <span>{chamado.observacoes.length} comentário(s)</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setChamadoSelecionado(chamado)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <ChamadoDetails
                            chamado={chamadoSelecionado || chamado}
                            currentUser={currentUser}
                            onUpdate={handleAtualizarChamado}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};