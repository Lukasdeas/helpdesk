import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Star, MessageSquare, Clock, User, Calendar, Tag } from 'lucide-react';
import { Chamado, Usuario, StatusChamado, ObservacaoChamado } from '../../types/helpdesk';
import { statusOptions, prioridades, mockUsers } from '../../constants/mockData';

interface ChamadoDetailsProps {
  chamado: Chamado;
  currentUser: Usuario;
  onUpdate: (chamado: Chamado) => void;
}

export const ChamadoDetails: React.FC<ChamadoDetailsProps> = ({ 
  chamado, 
  currentUser, 
  onUpdate 
}) => {
  const [novoComentario, setNovoComentario] = useState('');
  const [novoStatus, setNovoStatus] = useState(chamado.status);
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState(chamado.tecnicoResponsavelId || '');
  const [avaliacao, setAvaliacao] = useState(chamado.avaliacao || 0);
  const [comentarioResolucao, setComentarioResolucao] = useState(chamado.comentariosResolucao || '');

  const tecnicos = mockUsers.filter(u => u.tipo === 'tecnico' && u.ativo);

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPrioridadeColor = (prioridade: string) => {
    return prioridades.find(p => p.value === prioridade)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: StatusChamado) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const handleAdicionarComentario = () => {
    if (!novoComentario.trim()) return;

    const novaObservacao: ObservacaoChamado = {
      id: Date.now().toString(),
      texto: novoComentario,
      autor: currentUser.nome,
      dataHora: new Date().toISOString(),
      tipo: currentUser.tipo === 'usuario' ? 'usuario' : 'tecnico'
    };

    const chamadoAtualizado = {
      ...chamado,
      observacoes: [...chamado.observacoes, novaObservacao],
      dataUltimaAtualizacao: new Date().toISOString()
    };

    onUpdate(chamadoAtualizado);
    setNovoComentario('');
  };

  const handleAtualizarStatus = () => {
    const tecnico = tecnicos.find(t => t.id === tecnicoSelecionado);
    
    const chamadoAtualizado = {
      ...chamado,
      status: novoStatus,
      tecnicoResponsavelId: tecnicoSelecionado || null,
      tecnicoResponsavelNome: tecnico?.nome || null,
      dataUltimaAtualizacao: new Date().toISOString(),
      dataResolucao: novoStatus === 'resolvido' ? new Date().toISOString() : null,
      comentariosResolucao: novoStatus === 'resolvido' ? comentarioResolucao : null
    };

    onUpdate(chamadoAtualizado);
  };

  const handleAvaliacao = (nota: number) => {
    const chamadoAtualizado = {
      ...chamado,
      avaliacao: nota,
      dataUltimaAtualizacao: new Date().toISOString()
    };

    onUpdate(chamadoAtualizado);
    setAvaliacao(nota);
  };

  const calcularTempoDecorrido = () => {
    const agora = new Date();
    const abertura = new Date(chamado.dataAbertura);
    const diffHoras = Math.floor((agora.getTime() - abertura.getTime()) / (1000 * 60 * 60));
    
    if (diffHoras < 24) {
      return `${diffHoras}h`;
    } else {
      const diffDias = Math.floor(diffHoras / 24);
      return `${diffDias}d ${diffHoras % 24}h`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3>{chamado.numero}</h3>
              <Badge className={getPrioridadeColor(chamado.prioridade)}>
                {chamado.prioridade}
              </Badge>
              <Badge className={getStatusColor(chamado.status)}>
                {statusOptions.find(s => s.value === chamado.status)?.label}
              </Badge>
              <Badge variant="outline">{chamado.categoria}</Badge>
            </div>
            <h2>{chamado.titulo}</h2>
          </div>
          
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Aberto há {calcularTempoDecorrido()}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {chamado.tags.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {chamado.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Informações do Chamado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="mb-2">Descrição</h4>
            <div className="bg-muted p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{chamado.descricao}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Solicitante</p>
                <p className="text-sm text-muted-foreground">
                  {chamado.solicitanteNome} - {chamado.departamento}
                </p>
              </div>
            </div>

            {chamado.tecnicoResponsavelNome && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Técnico Responsável</p>
                  <p className="text-sm text-muted-foreground">
                    {chamado.tecnicoResponsavelNome}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Data de Abertura</p>
                <p className="text-sm text-muted-foreground">
                  {formatarData(chamado.dataAbertura)}
                </p>
              </div>
            </div>

            {chamado.dataResolucao && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Data de Resolução</p>
                  <p className="text-sm text-muted-foreground">
                    {formatarData(chamado.dataResolucao)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gerenciamento (apenas para técnicos e admins) */}
      {(currentUser.tipo === 'tecnico' || currentUser.tipo === 'administrador') && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4>Gerenciar Chamado</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={novoStatus} onValueChange={setNovoStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Técnico Responsável</label>
                <Select value={tecnicoSelecionado} onValueChange={setTecnicoSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum técnico</SelectItem>
                    {tecnicos.map(tecnico => (
                      <SelectItem key={tecnico.id} value={tecnico.id}>
                        {tecnico.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {novoStatus === 'resolvido' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Comentários da Resolução</label>
                <Textarea
                  value={comentarioResolucao}
                  onChange={(e) => setComentarioResolucao(e.target.value)}
                  placeholder="Descreva como o problema foi resolvido..."
                  rows={3}
                />
              </div>
            )}

            <Button onClick={handleAtualizarStatus}>
              Atualizar Chamado
            </Button>
          </div>
        </>
      )}

      {/* Avaliação (apenas para usuários em chamados resolvidos) */}
      {currentUser.tipo === 'usuario' && 
       currentUser.id === chamado.solicitanteId && 
       chamado.status === 'resolvido' && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4>Avaliação do Atendimento</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm">Avalie o atendimento:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((nota) => (
                  <button
                    key={nota}
                    onClick={() => handleAvaliacao(nota)}
                    className={`w-6 h-6 ${
                      nota <= avaliacao 
                        ? 'text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
              </div>
              {chamado.avaliacao && (
                <span className="text-sm text-muted-foreground">
                  ({chamado.avaliacao}/5)
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {/* Histórico de Observações */}
      <Separator />
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h4>Histórico de Observações ({chamado.observacoes.length})</h4>
        </div>

        <div className="space-y-3">
          {chamado.observacoes.map((obs, index) => (
            <div key={obs.id} className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{obs.autor}</span>
                  <Badge variant="outline" className="text-xs">
                    {obs.tipo === 'usuario' ? 'Cliente' : 'Técnico'}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatarData(obs.dataHora)}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{obs.texto}</p>
            </div>
          ))}
        </div>

        {/* Adicionar nova observação */}
        <div className="space-y-3">
          <Textarea
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            placeholder="Adicione um comentário..."
            rows={3}
          />
          <Button onClick={handleAdicionarComentario} disabled={!novoComentario.trim()}>
            Adicionar Comentário
          </Button>
        </div>
      </div>

      {/* Comentários de Resolução */}
      {chamado.comentariosResolucao && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4>Resolução</h4>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="whitespace-pre-wrap">{chamado.comentariosResolucao}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};