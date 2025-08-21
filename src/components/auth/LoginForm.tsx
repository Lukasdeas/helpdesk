import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Usuario } from '../../types/helpdesk';
import { mockUsers } from '../../constants/mockData';

interface LoginFormProps {
  onLogin: (user: Usuario) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simular delay de autenticação
    setTimeout(() => {
      const user = mockUsers.find(u => 
        u.email === email && 
        u.senha === password && 
        u.ativo
      );

      if (user) {
        onLogin(user);
      } else {
        setError('Email ou senha incorretos, ou usuário inativo.');
      }
      setLoading(false);
    }, 500);
  };

  const handleDemoLogin = (user: Usuario) => {
    setEmail(user.email);
    setPassword(user.senha);
    onLogin(user);
  };

  const demoAccounts = [
    { 
      user: mockUsers.find(u => u.tipo === 'administrador')!, 
      description: 'Acesso completo ao sistema'
    },
    { 
      user: mockUsers.find(u => u.tipo === 'tecnico')!, 
      description: 'Atendimento e resolução de chamados'
    },
    { 
      user: mockUsers.find(u => u.tipo === 'usuario')!, 
      description: 'Abertura e acompanhamento de chamados'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-background">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="mb-2">Sistema Helpdesk</h1>
          <p className="text-muted-foreground">Faça login para continuar</p>
        </div>

        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            className="w-full"
          >
            {showDemoAccounts ? 'Ocultar' : 'Ver'} Contas Demo
          </Button>

          {showDemoAccounts && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Clique em uma conta para fazer login automaticamente:
              </p>
              
              {demoAccounts.map((account, index) => (
                <Card 
                  key={index}
                  className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleDemoLogin(account.user)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{account.user.nome}</span>
                        <Badge variant="secondary">
                          {account.user.tipo}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {account.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {account.user.email}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};