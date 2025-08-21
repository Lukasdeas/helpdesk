import React, { useState } from 'react';
import { useHelpdesk } from '../contexts/HelpdeskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Settings, 
  Check, 
  X, 
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  RefreshCw,
  WifiOff
} from 'lucide-react';
import { getDebugInfo, validateConfig } from '../utils/supabase/info';
import { ConfigurationSteps } from './config/ConfigurationSteps';
import { FeatureComparison } from './config/FeatureComparison';

export const SupabaseConfig: React.FC = () => {
  const { isOnlineMode, connectionStatus, testConnection, loading } = useHelpdesk();
  const [showCredentials, setShowCredentials] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [configValidation, setConfigValidation] = useState<any>(null);

  const handleShowDebug = () => {
    const info = getDebugInfo();
    const validation = validateConfig();
    setDebugInfo(info);
    setConfigValidation(validation);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
      case 'offline': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
      case 'checking': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'online': return <Check className="h-4 w-4" />;
      case 'offline': return <WifiOff className="h-4 w-4" />;
      case 'error': return <X className="h-4 w-4" />;
      case 'checking': return <RefreshCw className="h-4 w-4 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'online': return 'Conectado ao Supabase';
      case 'offline': return 'Modo Demonstração';
      case 'error': return 'Erro de Conexão';
      case 'checking': return 'Verificando...';
      default: return 'Status Desconhecido';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
          <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1>Configuração do Supabase</h1>
          <p className="text-muted-foreground">
            Configure a conexão com o banco de dados para habilitar o modo online
          </p>
        </div>
      </div>

      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle>Status da Conexão</CardTitle>
          <CardDescription>
            Estado atual da conexão com o Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <p>{getStatusText()}</p>
                <p className="text-sm text-muted-foreground">
                  {isOnlineMode ? 
                    'Sistema funcionando com dados reais do Supabase' : 
                    'Sistema funcionando com dados simulados para demonstração'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor()}>
                {isOnlineMode ? 'Online' : 'Demo'}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testConnection}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Testando...
                  </>
                ) : (
                  'Testar'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções de Configuração */}
      <Card>
        <CardHeader>
          <CardTitle>Como Configurar o Supabase</CardTitle>
          <CardDescription>
            Siga estas etapas para conectar o sistema ao seu projeto Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <ConfigurationSteps />
            
            <Separator />

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Modo Demonstração:</strong> Mesmo sem configurar o Supabase, o sistema funciona 
                completamente com dados simulados. Use as contas demo: admin@helpdesk.com, 
                tecnico@helpdesk.com, cliente@helpdesk.com (senha: 123456).
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Informações de Debug */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Técnicas</CardTitle>
          <CardDescription>
            Dados para diagnóstico e resolução de problemas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleShowDebug}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                {debugInfo ? 'Atualizar' : 'Carregar'} Info Debug
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCredentials(!showCredentials)}
              >
                {showCredentials ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {showCredentials ? 'Ocultar' : 'Mostrar'} Credenciais
              </Button>
            </div>

            {configValidation && (
              <div className="space-y-2">
                <h4>Validação de Configuração</h4>
                <div className={`p-3 rounded-lg ${configValidation.isValid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {configValidation.isValid ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                    <span className={configValidation.isValid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                      {configValidation.isValid ? 'Configuração válida' : 'Problemas na configuração'}
                    </span>
                  </div>
                  {!configValidation.isValid && (
                    <ul className="text-sm space-y-1 ml-6">
                      {configValidation.issues.map((issue: string, index: number) => (
                        <li key={index} className="text-red-700 dark:text-red-300">• {issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {debugInfo && (
              <div className="p-4 bg-muted rounded-lg">
                <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-96">
                  {JSON.stringify({
                    ...debugInfo,
                    credentials: showCredentials ? debugInfo.credentials : '*** OCULTADO ***'
                  }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recursos Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades por Modo</CardTitle>
          <CardDescription>
            Comparação entre modo online (Supabase) e demonstração (offline)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureComparison />
        </CardContent>
      </Card>
    </div>
  );
};