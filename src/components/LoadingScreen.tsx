import React from 'react';
import { Loader2, HelpCircle } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Carregando...", 
  showLogo = true 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {showLogo && (
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-primary rounded-lg">
              <HelpCircle className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-lg text-foreground">{message}</span>
        </div>
        
        <p className="text-sm text-muted-foreground max-w-sm">
          Sistema Helpdesk inicializando...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;