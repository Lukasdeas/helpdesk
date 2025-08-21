import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
import { Usuario, PrioridadeChamado } from '../../types/helpdesk';
import { categorias, prioridades } from '../../constants/mockData';

interface ChamadoFormProps {
  onSubmit: (dados: any) => void;
  onCancel: () => void;
  currentUser: Usuario;
  chamado?: any;
}

export const ChamadoForm: React.FC<ChamadoFormProps> = ({ 
  onSubmit, 
  onCancel, 
  currentUser,
  chamado 
}) => {
  const [formData, setFormData] = useState({
    titulo: chamado?.titulo || '',
    descricao: chamado?.descricao || '',
    categoria: chamado?.categoria || '',
    prioridade: chamado?.prioridade || 'Média' as PrioridadeChamado,
    tags: chamado?.tags || []
  });
  
  const [novaTags, setNovaTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular delay
    setTimeout(() => {
      onSubmit(formData);
      setLoading(false);
    }, 500);
  };

  const adicionarTag = () => {
    if (novaTags.trim() && !formData.tags.includes(novaTags.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, novaTags.trim()]
      }));
      setNovaTags('');
    }
  };

  const removerTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionarTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="titulo">Título do Chamado *</Label>
        <Input
          id="titulo"
          value={formData.titulo}
          onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
          placeholder="Descreva brevemente o problema"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição Detalhada *</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
          placeholder="Descreva o problema com o máximo de detalhes possível..."
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoria *</Label>
          <Select 
            value={formData.categoria} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map(categoria => (
                <SelectItem key={categoria} value={categoria}>
                  {categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Prioridade *</Label>
          <Select 
            value={formData.prioridade} 
            onValueChange={(value: PrioridadeChamado) => setFormData(prev => ({ ...prev, prioridade: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {prioridades.map(prioridade => (
                <SelectItem key={prioridade.value} value={prioridade.value}>
                  {prioridade.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags (opcional)</Label>
        <div className="flex gap-2">
          <Input
            value={novaTags}
            onChange={(e) => setNovaTags(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma tag e pressione Enter"
          />
          <Button type="button" onClick={adicionarTag} variant="outline">
            Adicionar
          </Button>
        </div>
        
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button 
                  type="button"
                  onClick={() => removerTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="mb-2">Informações do Solicitante</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <Label>Nome:</Label>
            <p>{currentUser.nome}</p>
          </div>
          <div>
            <Label>Email:</Label>
            <p>{currentUser.email}</p>
          </div>
          <div>
            <Label>Departamento:</Label>
            <p>{currentUser.departamento}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Salvando...' : (chamado ? 'Atualizar Chamado' : 'Abrir Chamado')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};