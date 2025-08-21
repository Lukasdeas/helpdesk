import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Oops! Algo deu errado</p>
                  <p className="text-sm">
                    Ocorreu um erro inesperado na aplicação. Isso pode ser temporário.
                  </p>
                  {this.state.error && (
                    <details className="text-xs bg-muted p-2 rounded mt-2">
                      <summary className="cursor-pointer">Detalhes técnicos</summary>
                      <pre className="mt-2 whitespace-pre-wrap">
                        {this.state.error.message}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button 
                onClick={this.handleReset} 
                variant="outline" 
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
              
              <Button 
                onClick={this.handleReload} 
                variant="default" 
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Recarregar Página
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Se o problema persistir, tente recarregar a página.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version para componentes funcionais
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};