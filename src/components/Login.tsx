import React, { useState } from 'react';
import { useHelpdesk } from '../contexts/HelpdeskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Moon, Sun, HelpCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, darkMode, toggleDarkMode } = useHelpdesk();
  const [email, setEmail] = useState('admin@empresa.com');
  const [senha, setSenha] = useState('123456');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    // Simula delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = login(email, senha);
    if (!success) {
      setErro('Email ou senha inválidos');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="mb-4"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <Card className="shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-3 bg-primary rounded-full">
                <HelpCircle className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Sistema Helpdesk</CardTitle>
            <CardDescription>
              Faça login para acessar o sistema de suporte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@empresa.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                />
              </div>

              {erro && (
                <Alert variant="destructive">
                  <AlertDescription>{erro}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="mb-2">Contas de Teste:</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Admin:</strong> admin@empresa.com</div>
                <div><strong>Técnico:</strong> joao.silva@empresa.com</div>
                <div><strong>Usuário:</strong> maria.santos@empresa.com</div>
                <div><strong>Senha:</strong> 123456</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};