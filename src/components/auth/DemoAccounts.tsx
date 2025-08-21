import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Crown, Shield, User, Wifi, WifiOff } from 'lucide-react';
import { DEMO_ACCOUNTS } from '../../constants/auth';
import { useHelpdesk } from '../../contexts/HelpdeskContext';

interface DemoAccountsProps {
  onSelectAccount: (email: string, password: string) => void;
}

export const DemoAccounts: React.FC<DemoAccountsProps> = ({ onSelectAccount }) => {
  const { isOnlineMode } = useHelpdesk();
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crown': return <Crown className="h-4 w-4 text-red-500" />;
      case 'Shield': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'User': return <User className="h-4 w-4 text-green-500" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Status do Sistema */}
      <div className="flex items-center justify-center space-x-2 p-3 bg-muted rounded-lg">
        {isOnlineMode ? (
          <>
            <Wifi className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-700 dark:text-green-300">Modo Online</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Conectado
            </Badge>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-700 dark:text-orange-300">Modo Demonstração</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Offline
            </Badge>
          </>
        )}
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-3 flex items-center">
          🎯 Contas para Demonstração
          {!isOnlineMode && (
            <Badge variant="outline" className="ml-2 text-xs">
              Dados Mock
            </Badge>
          )}
        </h4>
        <div className="space-y-3 text-sm">
          {DEMO_ACCOUNTS.map((account) => (
            <div key={account.email} className="flex items-center justify-between p-3 bg-background rounded border">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {getIcon(account.icon)}
                  <span className="font-medium capitalize">{account.tipo}</span>
                </div>
                <p className="text-xs text-muted-foreground">{account.email}</p>
                <p className="text-xs text-muted-foreground">{account.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectAccount(account.email, account.senha)}
                className="ml-3"
              >
                Testar
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded text-xs">
          <p className="text-blue-800 dark:text-blue-200">
            <strong>Senha padrão:</strong> 123456 (para todas as contas demo)
          </p>
        </div>

        {!isOnlineMode && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded text-xs">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Modo Demonstração:</strong> Usando dados simulados. 
              Configure o Supabase para acesso completo ao banco de dados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};