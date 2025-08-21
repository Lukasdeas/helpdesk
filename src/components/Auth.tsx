import React, { useState } from 'react';
import { useHelpdesk } from '../contexts/HelpdeskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Moon, Sun, HelpCircle } from 'lucide-react';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';
import { DemoAccounts } from './auth/DemoAccounts';
import { validateLoginForm, validateRegisterForm } from '../utils/auth-helpers';

export const Auth: React.FC = () => {
  const { signIn, signUp, error, loading, darkMode, toggleDarkMode } = useHelpdesk();
  const [activeTab, setActiveTab] = useState('login');
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
    telefone: '',
    departamento: '',
    cargo: '',
    tipo: 'usuario' as 'usuario' | 'tecnico' | 'administrador'
  });

  const [localError, setLocalError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    const validationError = validateLoginForm(loginForm);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    const success = await signIn(loginForm.email, loginForm.password);
    if (!success && error) {
      setLocalError(error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    const validationError = validateRegisterForm(registerForm);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    const userData = {
      nome: registerForm.nome,
      telefone: registerForm.telefone,
      departamento: registerForm.departamento,
      cargo: registerForm.cargo,
      tipo: registerForm.tipo
    };

    const success = await signUp(registerForm.email, registerForm.password, userData);
    if (success) {
      setActiveTab('login');
      setLoginForm({ email: registerForm.email, password: '' });
      setRegisterForm({
        email: '',
        password: '',
        confirmPassword: '',
        nome: '',
        telefone: '',
        departamento: '',
        cargo: '',
        tipo: 'usuario'
      });
    } else if (error) {
      setLocalError(error);
    }
  };

  const handleDemoAccount = (email: string, password: string) => {
    setLoginForm({ email, password });
  };

  const handleRegisterFormChange = (field: keyof typeof registerForm, value: string) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
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
              Plataforma integrada de suporte técnico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm
                  email={loginForm.email}
                  password={loginForm.password}
                  loading={loading}
                  onEmailChange={(email) => setLoginForm(prev => ({ ...prev, email }))}
                  onPasswordChange={(password) => setLoginForm(prev => ({ ...prev, password }))}
                  onSubmit={handleLogin}
                />

                {(localError || error) && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{localError || error}</AlertDescription>
                  </Alert>
                )}

                <DemoAccounts onSelectAccount={handleDemoAccount} />
              </TabsContent>
              
              <TabsContent value="register">
                <RegisterForm
                  formData={registerForm}
                  loading={loading}
                  onFormChange={handleRegisterFormChange}
                  onSubmit={handleRegister}
                />

                {(localError || error) && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{localError || error}</AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};