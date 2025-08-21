import React from 'react';
import { Button } from '../ui/button';
import { Copy } from 'lucide-react';

export const ConfigurationSteps: React.FC = () => {
  const handleCopyTemplate = () => {
    const template = `# Variáveis de Ambiente para Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui

# Instruções:
# 1. Acesse https://supabase.com e crie um projeto
# 2. Vá em Settings > API
# 3. Copie os valores reais e substitua acima
# 4. Reinicie a aplicação`;

    navigator.clipboard.writeText(template).then(() => {
      alert('Template copiado para a área de transferência!');
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
          1
        </div>
        <div>
          <h4>Criar Projeto no Supabase</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Acesse <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">supabase.com</a> e crie um novo projeto
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
          2
        </div>
        <div>
          <h4>Obter Credenciais</h4>
          <p className="text-sm text-muted-foreground mt-1">
            No painel do projeto, vá em Settings → API e copie:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 ml-4 space-y-1">
            <li>• Project URL</li>
            <li>• Anon/Public Key (para acesso público)</li>
            <li>• Service Role Key (para operações administrativas)</li>
          </ul>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
          3
        </div>
        <div>
          <h4>Configurar Variáveis de Ambiente</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Configure as seguintes variáveis de ambiente no seu sistema:
          </p>
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <code className="text-xs">Template de Configuração</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyTemplate}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
{`SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role`}
            </pre>
          </div>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
          4
        </div>
        <div>
          <h4>Reiniciar Aplicação</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Após configurar as variáveis, reinicie a aplicação para aplicar as mudanças.
            O sistema detectará automaticamente as novas configurações.
          </p>
        </div>
      </div>
    </div>
  );
};