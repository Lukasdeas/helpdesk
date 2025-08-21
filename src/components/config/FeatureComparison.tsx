import React from 'react';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Check, X, Database, Wifi } from 'lucide-react';

export const FeatureComparison: React.FC = () => {
  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="flex items-center space-x-2 mb-3 text-green-600">
            <Database className="h-4 w-4" />
            <span>Modo Online (Supabase)</span>
          </h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Autenticação real com segurança</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Persistência permanente de dados</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Múltiplos usuários simultâneos</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Sincronização em tempo real</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Backup automático na nuvem</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Escalabilidade para produção</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="flex items-center space-x-2 mb-3 text-orange-600">
            <Wifi className="h-4 w-4" />
            <span>Modo Demonstração (Demo)</span>
          </h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <span>Interface completa e funcional</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <span>Dados simulados realísticos</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <span>3 contas demo pré-configuradas</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <span>Todas as funcionalidades ativas</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <span>Perfeito para testes e demos</span>
            </li>
            <li className="flex items-center space-x-2">
              <X className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>Dados resetam ao recarregar</span>
            </li>
          </ul>
        </div>
      </div>

      <Separator className="my-6" />
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          O sistema está preparado para produção. Configure o Supabase quando estiver pronto para dados reais.
        </p>
        <div className="flex justify-center space-x-4">
          <Badge variant="outline" className="text-green-600 border-green-600">
            Pronto para Produção
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            100% Funcional
          </Badge>
        </div>
      </div>
    </div>
  );
};