import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Usuario, Chamado, DashboardStats } from '../types/helpdesk';
import { mockUsers, mockChamados, mockStats } from '../constants/mockData';
import { supabaseConnection } from '../utils/supabase-connection';

// Types
interface HelpdeskState {
  currentUser: Usuario | null;
  users: Usuario[];
  chamados: Chamado[];
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  isOnlineMode: boolean;
  connectionStatus: 'connecting' | 'connected' | 'offline';
}

type HelpdeskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTION_STATUS'; payload: 'connecting' | 'connected' | 'offline' }
  | { type: 'SET_ONLINE_MODE'; payload: boolean }
  | { type: 'SET_CURRENT_USER'; payload: Usuario | null }
  | { type: 'SET_USERS'; payload: Usuario[] }
  | { type: 'SET_CHAMADOS'; payload: Chamado[] }
  | { type: 'SET_STATS'; payload: DashboardStats }
  | { type: 'ADD_CHAMADO'; payload: Chamado }
  | { type: 'UPDATE_CHAMADO'; payload: { id: string; updates: Partial<Chamado> } }
  | { type: 'DELETE_CHAMADO'; payload: string }
  | { type: 'ADD_USER'; payload: Usuario }
  | { type: 'UPDATE_USER'; payload: { id: string; updates: Partial<Usuario> } }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'INITIALIZE_OFFLINE' };

// Initial State
const initialState: HelpdeskState = {
  currentUser: null,
  users: [],
  chamados: [],
  stats: {
    totalChamados: 0,
    chamadosAbertos: 0,
    chamadosEmAndamento: 0,
    chamadosResolvidos: 0,
    tempoMedioResolucao: 0,
    satisfacaoMedia: 0,
    chamadosHoje: 0,
    produtividadeTecnicos: 0
  },
  loading: true,
  error: null,
  isOnlineMode: false,
  connectionStatus: 'connecting'
};

// Reducer
function helpdeskReducer(state: HelpdeskState, action: HelpdeskAction): HelpdeskState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    
    case 'SET_ONLINE_MODE':
      return { ...state, isOnlineMode: action.payload };
    
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    
    case 'SET_USERS':
      return { ...state, users: action.payload };
    
    case 'SET_CHAMADOS':
      return { ...state, chamados: action.payload };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    case 'ADD_CHAMADO':
      return { 
        ...state, 
        chamados: [...state.chamados, action.payload],
        stats: {
          ...state.stats,
          totalChamados: state.stats.totalChamados + 1,
          chamadosAbertos: action.payload.status === 'aberto' ? state.stats.chamadosAbertos + 1 : state.stats.chamadosAbertos
        }
      };
    
    case 'UPDATE_CHAMADO':
      return {
        ...state,
        chamados: state.chamados.map(chamado =>
          chamado.id === action.payload.id
            ? { ...chamado, ...action.payload.updates }
            : chamado
        )
      };
    
    case 'DELETE_CHAMADO':
      return {
        ...state,
        chamados: state.chamados.filter(chamado => chamado.id !== action.payload)
      };
    
    case 'ADD_USER':
      return { 
        ...state, 
        users: [...state.users, action.payload] 
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id
            ? { ...user, ...action.payload.updates }
            : user
        ),
        currentUser: state.currentUser?.id === action.payload.id
          ? { ...state.currentUser, ...action.payload.updates }
          : state.currentUser
      };
    
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    
    case 'INITIALIZE_OFFLINE':
      return {
        ...state,
        users: mockUsers,
        chamados: mockChamados,
        stats: mockStats,
        loading: false,
        error: null,
        isOnlineMode: false,
        connectionStatus: 'offline'
      };
    
    default:
      return state;
  }
}

// Context
const HelpdeskContext = createContext<{
  state: HelpdeskState;
  dispatch: React.Dispatch<HelpdeskAction>;
  // Auth functions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  // Data functions
  refreshData: () => Promise<void>;
  addChamado: (chamado: Omit<Chamado, 'id' | 'numero' | 'dataAbertura'>) => Promise<void>;
  updateChamado: (id: string, updates: Partial<Chamado>) => Promise<void>;
  deleteChamado: (id: string) => Promise<void>;
  addUser: (user: Omit<Usuario, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<Usuario>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
} | null>(null);

// Provider Component
export const HelpdeskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(helpdeskReducer, initialState);

  // Initialize connection
  useEffect(() => {
    let mounted = true;

    const initializeConnection = async () => {
      try {
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' });
        
        const isConnected = await supabaseConnection.testConnection();
        
        if (!mounted) return;

        if (isConnected) {
          dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
          dispatch({ type: 'SET_ONLINE_MODE', payload: true });
          await refreshData();
        } else {
          throw new Error('Connection failed');
        }
      } catch (error) {
        console.warn('Failed to connect to Supabase, using offline mode:', error);
        
        if (!mounted) return;
        
        dispatch({ type: 'INITIALIZE_OFFLINE' });
      }
    };

    // Try to get saved user from localStorage
    try {
      const savedUser = localStorage.getItem('helpdesk_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'SET_CURRENT_USER', payload: user });
      }
    } catch (error) {
      console.warn('Failed to load saved user:', error);
    }

    initializeConnection();

    return () => {
      mounted = false;
    };
  }, []);

  // Helper functions
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      let user: Usuario | null = null;

      if (state.isOnlineMode) {
        // Try online login
        try {
          user = await supabaseConnection.login(email, password);
        } catch (error) {
          console.warn('Online login failed, trying offline:', error);
        }
      }

      // Fallback to mock login
      if (!user) {
        user = mockUsers.find(u => u.email === email && u.senha === password) || null;
      }

      if (user) {
        dispatch({ type: 'SET_CURRENT_USER', payload: user });
        localStorage.setItem('helpdesk_user', JSON.stringify(user));
        dispatch({ type: 'SET_LOADING', payload: false });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Credenciais inválidas' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Erro ao fazer login' });
      return false;
    }
  };

  const logout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    localStorage.removeItem('helpdesk_user');
  };

  const refreshData = async () => {
    try {
      if (state.isOnlineMode) {
        const [users, chamados, stats] = await Promise.allSettled([
          supabaseConnection.getUsers(),
          supabaseConnection.getChamados(),
          supabaseConnection.getStats()
        ]);

        if (users.status === 'fulfilled') dispatch({ type: 'SET_USERS', payload: users.value });
        if (chamados.status === 'fulfilled') dispatch({ type: 'SET_CHAMADOS', payload: chamados.value });
        if (stats.status === 'fulfilled') dispatch({ type: 'SET_STATS', payload: stats.value });
      } else {
        // Use mock data
        dispatch({ type: 'SET_USERS', payload: mockUsers });
        dispatch({ type: 'SET_CHAMADOS', payload: mockChamados });
        dispatch({ type: 'SET_STATS', payload: mockStats });
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar dados' });
    }
  };

  const addChamado = async (chamadoData: Omit<Chamado, 'id' | 'numero' | 'dataAbertura'>) => {
    try {
      const newChamado: Chamado = {
        ...chamadoData,
        id: Date.now().toString(),
        numero: `#${Date.now()}`,
        dataAbertura: new Date().toISOString(),
      };

      if (state.isOnlineMode) {
        await supabaseConnection.addChamado(newChamado);
      }

      dispatch({ type: 'ADD_CHAMADO', payload: newChamado });
    } catch (error) {
      console.error('Error adding chamado:', error);
      throw error;
    }
  };

  const updateChamado = async (id: string, updates: Partial<Chamado>) => {
    try {
      if (state.isOnlineMode) {
        await supabaseConnection.updateChamado(id, updates);
      }

      dispatch({ type: 'UPDATE_CHAMADO', payload: { id, updates } });
    } catch (error) {
      console.error('Error updating chamado:', error);
      throw error;
    }
  };

  const deleteChamado = async (id: string) => {
    try {
      if (state.isOnlineMode) {
        await supabaseConnection.deleteChamado(id);
      }

      dispatch({ type: 'DELETE_CHAMADO', payload: id });
    } catch (error) {
      console.error('Error deleting chamado:', error);
      throw error;
    }
  };

  const addUser = async (userData: Omit<Usuario, 'id'>) => {
    try {
      const newUser: Usuario = {
        ...userData,
        id: Date.now().toString(),
      };

      if (state.isOnlineMode) {
        await supabaseConnection.addUser(newUser);
      }

      dispatch({ type: 'ADD_USER', payload: newUser });
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, updates: Partial<Usuario>) => {
    try {
      if (state.isOnlineMode) {
        await supabaseConnection.updateUser(id, updates);
      }

      dispatch({ type: 'UPDATE_USER', payload: { id, updates } });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      if (state.isOnlineMode) {
        await supabaseConnection.deleteUser(id);
      }

      dispatch({ type: 'DELETE_USER', payload: id });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const contextValue = {
    state,
    dispatch,
    login,
    logout,
    refreshData,
    addChamado,
    updateChamado,
    deleteChamado,
    addUser,
    updateUser,
    deleteUser,
  };

  return (
    <HelpdeskContext.Provider value={contextValue}>
      {children}
    </HelpdeskContext.Provider>
  );
};

// Hook to use the context
export const useHelpdesk = () => {
  const context = useContext(HelpdeskContext);
  if (!context) {
    throw new Error('useHelpdesk must be used within a HelpdeskProvider');
  }

  return {
    ...context.state,
    login: context.login,
    logout: context.logout,
    refreshData: context.refreshData,
    addChamado: context.addChamado,
    updateChamado: context.updateChamado,
    deleteChamado: context.deleteChamado,
    addUser: context.addUser,
    updateUser: context.updateUser,
    deleteUser: context.deleteUser,
  };
};