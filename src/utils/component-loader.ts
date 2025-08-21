export interface ComponentLoadResult<T> {
  component: T | null;
  error: Error | null;
  isLoading: boolean;
}

export const createSafeImport = <T extends React.ComponentType<any>>(
  importPromise: () => Promise<{ default: T }>,
  fallback: T,
  componentName: string
): (() => Promise<{ default: T }>) => {
  return async () => {
    try {
      const module = await importPromise();
      console.log(`✓ Successfully loaded ${componentName}`);
      return module;
    } catch (error) {
      console.warn(`⚠ Failed to load ${componentName}, using fallback:`, error);
      return { default: fallback };
    }
  };
};

export const withLoadingStates = <P extends object>(
  Component: React.ComponentType<P>,
  LoadingComponent: React.ComponentType<any>,
  ErrorComponent: React.ComponentType<{ error: Error; retry: () => void }>,
  displayName: string
) => {
  return React.memo((props: P) => {
    const [loadState, setLoadState] = React.useState<ComponentLoadResult<React.ComponentType<P>>>({
      component: null,
      error: null,
      isLoading: true
    });

    React.useEffect(() => {
      const loadComponent = async () => {
        try {
          setLoadState({ component: Component, error: null, isLoading: false });
        } catch (error) {
          setLoadState({ 
            component: null, 
            error: error instanceof Error ? error : new Error('Unknown error'), 
            isLoading: false 
          });
        }
      };

      loadComponent();
    }, []);

    if (loadState.isLoading) {
      return <LoadingComponent />;
    }

    if (loadState.error || !loadState.component) {
      return (
        <ErrorComponent 
          error={loadState.error || new Error('Component failed to load')} 
          retry={() => setLoadState(prev => ({ ...prev, isLoading: true }))}
        />
      );
    }

    const LoadedComponent = loadState.component;
    return <LoadedComponent {...props} />;
  });
};

export const componentStatus = {
  log: (componentName: string, status: 'loading' | 'loaded' | 'error', details?: any) => {
    const timestamp = new Date().toISOString();
    const emoji = status === 'loaded' ? '✓' : status === 'loading' ? '⏳' : '❌';
    
    console.log(`${emoji} [${timestamp}] ${componentName}: ${status}`, details);
  },

  checkDependencies: async (dependencies: string[]) => {
    const results: { [key: string]: boolean } = {};
    
    for (const dep of dependencies) {
      try {
        await import(dep);
        results[dep] = true;
        componentStatus.log(`Dependency ${dep}`, 'loaded');
      } catch (error) {
        results[dep] = false;
        componentStatus.log(`Dependency ${dep}`, 'error', error);
      }
    }
    
    return results;
  }
};