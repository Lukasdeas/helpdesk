import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Crown, Shield, User } from 'lucide-react';
import { DEPARTAMENTOS } from '../../constants/auth';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  nome: string;
  telefone: string;
  departamento: string;
  cargo: string;
  tipo: 'usuario' | 'tecnico' | 'administrador';
}

interface RegisterFormProps {
  formData: RegisterFormData;
  loading: boolean;
  onFormChange: (field: keyof RegisterFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  formData,
  loading,
  onFormChange,
  onSubmit
}) => {
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'administrador': return <Crown className="h-4 w-4 text-red-500" />;
      case 'tecnico': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'usuario': return <User className="h-4 w-4 text-green-500" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="register-nome">Nome Completo *</Label>
          <Input
            id="register-nome"
            value={formData.nome}
            onChange={(e) => onFormChange('nome', e.target.value)}
            placeholder="Seu nome completo"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="register-email">Email *</Label>
          <Input
            id="register-email"
            type="email"
            value={formData.email}
            onChange={(e) => onFormChange('email', e.target.value)}
            placeholder="seu.email@empresa.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="register-password">Senha *</Label>
          <Input
            id="register-password"
            type="password"
            value={formData.password}
            onChange={(e) => onFormChange('password', e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="register-confirm">Confirmar Senha *</Label>
          <Input
            id="register-confirm"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => onFormChange('confirmPassword', e.target.value)}
            placeholder="Repita a senha"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="register-telefone">Telefone *</Label>
          <Input
            id="register-telefone"
            value={formData.telefone}
            onChange={(e) => onFormChange('telefone', e.target.value)}
            placeholder="(11) 99999-9999"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="register-departamento">Departamento *</Label>
          <Select 
            value={formData.departamento} 
            onValueChange={(value) => onFormChange('departamento', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTAMENTOS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="register-cargo">Cargo/Função *</Label>
          <Input
            id="register-cargo"
            value={formData.cargo}
            onChange={(e) => onFormChange('cargo', e.target.value)}
            placeholder="Seu cargo na empresa"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="register-tipo">Tipo de Conta</Label>
          <Select 
            value={formData.tipo} 
            onValueChange={(value: any) => onFormChange('tipo', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usuario">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-green-500" />
                  <span>Usuário</span>
                </div>
              </SelectItem>
              <SelectItem value="tecnico">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Técnico</span>
                </div>
              </SelectItem>
              <SelectItem value="administrador">
                <div className="flex items-center space-x-2">
                  <Crown className="h-4 w-4 text-red-500" />
                  <span>Administrador</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>Dica:</strong> Escolha "Usuário" se você irá apenas abrir chamados. 
          Escolha "Técnico" se irá resolver chamados. Administrador tem acesso completo.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Criando conta...' : 'Criar Conta'}
      </Button>
    </form>
  );
};