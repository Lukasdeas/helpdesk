import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface DiagnosticItem {
  name: string;
  status: 'ok' | 'warning' | 'error' | 'loading';
  message: string;
  details?: any;
}

export const SystemDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticItem[] = [];

    // Test 1: Check if React is working
    results.push({
      name: 'React Runtime',
      status: 'ok',
      message: 'React está funcionando corretamente'
    });

    // Test 2: Check localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      results.push({
        name: 'LocalStorage',
        status: 'ok',
        message: 'LocalStorage disponível'
      });
    } catch (error) {
      results.push({
        name: 'LocalStorage',
        status: 'error',
        message: 'LocalStorage não disponível',
        details: error
      });
    }

    // Test 3: Check if context files exist
    try {
      const contextModule = await import('../contexts/HelpdeskContext');
      results.push({
        name: 'HelpdeskContext',
        status: contextModule ? 'ok' : 'error',
        message: contextModule ? 'Context carregado com sucesso' : 'Falha ao carregar context'
      });
    } catch (error) {
      results.push({
        name: 'HelpdeskContext',
        status: 'error',
        message: 'Erro ao importar HelpdeskContext',
        details: error
      });
    }

    // Test 4: Check if auth component exists
    try {
      const authModule = await import('../components/Auth');
      results.push({
        name: 'Auth Component',
        status: authModule ? 'ok' : 'error',
        message: authModule ? 'Componente Auth carregado' : 'Falha ao carregar Auth'
      });
    } catch (error) {
      results.push({
        name: 'Auth Component',
        status: 'error',
        message: 'Erro ao importar Auth',
        details: error
      });
    }

    // Test 5: Check if dashboard components exist
    const dashboards = [
      { name: 'AdminDashboard', path: '../components/admin/AdminDashboard' },
      { name: 'TecnicoDashboard', path: '../components/tecnico/TecnicoDashboard' },
      { name: 'ClienteDashboard', path: '../components/cliente/ClienteDashboard' }
    ];

    for (const dashboard of dashboards) {
      try {
        const module = await import(dashboard.path);
        results.push({
          name: dashboard.name,
          status: module ? 'ok' : 'error',
          message: module ? `${dashboard.name} carregado` : `Falha ao carregar ${dashboard.name}`
        });
      } catch (error) {
        results.push({
          name: dashboard.name,
          status: 'error',
          message: `Erro ao importar ${dashboard.name}`,
          details: error
        });
      }
    }

    // Test 6: Check mock data
    try {
      const mockData = await import('../constants/mockData');
      results.push({
        name: 'Mock Data',
        status: mockData ? 'ok' : 'error',
        message: mockData ? 'Dados mock disponíveis' : 'Dados mock indisponíveis'
      });
    } catch (error) {
      results.push({
        name: 'Mock Data',
        status: 'error',
        message: 'Erro ao carregar dados mock',
        details: error
      });
    }

    // Test 7: Check if Supabase connection exists
    try {
      const supabaseConnection = await import('../utils/supabase-connection');
      results.push({
        name: 'Supabase Connection',
        status: supabaseConnection ? 'ok' : 'warning',
        message: supabaseConnection ? 'Conexão Supabase configurada' : 'Conexão Supabase não configurada'
      });
    } catch (error) {
      results.push({
        name: 'Supabase Connection',
        status: 'warning',
        message: 'Supabase connection não encontrado (modo offline)',
        details: error
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusColor = (status: DiagnosticItem['status']) => {
    switch (status) {
      case 'ok': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'loading': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: DiagnosticItem['status']) => {
    switch (status) {
      case 'ok': return 'OK';
      case 'warning': return 'AVISO';
      case 'error': return 'ERRO';
      case 'loading': return 'CARREGANDO';
      default: return 'DESCONHECIDO';
    }
  };

  const successCount = diagnostics.filter(d => d.status === 'ok').length;
  const warningCount = diagnostics.filter(d => d.status === 'warning').length;
  const errorCount = diagnostics.filter(d => d.status === 'error').length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="mb-2">Diagnóstico do Sistema</h1>
        <p className="text-muted-foreground">
          Verificação do status dos componentes do sistema Helpdesk
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Sucessos: {successCount}</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Avisos: {warningCount}</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Erros: {errorCount}</span>
          </div>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          {isRunning && <div className="w-4 h-4 border-2 border-border border-t-current rounded-full animate-spin" />}
          {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Recarregar Página
        </Button>
      </div>

      <div className="space-y-4">
        {diagnostics.map((item, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={`text-white ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </Badge>
                  <h3>{item.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{item.message}</p>
                {item.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-muted-foreground">
                      Ver detalhes
                    </summary>
                    <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto max-h-32">
                      {JSON.stringify(item.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {diagnostics.length === 0 && !isRunning && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Nenhum diagnóstico executado. Clique no botão acima para começar.
          </p>
        </Card>
      )}
    </div>
  );
};