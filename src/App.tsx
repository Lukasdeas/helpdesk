import React, { useState, useEffect } from 'react';
import { Usuario } from './types/helpdesk';
import { LoginForm } from './components/auth/LoginForm';
import { ChamadosManager } from './components/chamados/ChamadosManager';

// Simple Loading Component
const SimpleLoading: React.FC<{ message?: string }> = ({ 
  message = "Carregando..." 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Simple Layout Component
const SimpleLayout: React.FC<{ 
  children: React.ReactNode; 
  currentPage: string; 
  onPageChange: (page: string) => void;
  onLogout: () => void;
  user: Usuario;
}> = ({ children, currentPage, onPageChange, onLogout, user }) => {
  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'chamados', label: 'Chamados', icon: '🎫' }
    ];

    if (user.tipo === 'administrador') {
      return [
        ...baseItems,
        { id: 'usuarios', label: 'Usuários', icon: '👥' },
        { id: 'relatorios', label: 'Relatórios', icon: '📈' },
        { id: 'config', label: 'Configurações', icon: '⚙️' }
      ];
    } else if (user.tipo === 'tecnico') {
      return [
        ...baseItems,
        { id: 'relatorios', label: 'Relatórios', icon: '📈' }
      ];
    } else {
      return baseItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <h1>Sistema Helpdesk</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-medium">{user.nome}</div>
              <div className="text-sm text-muted-foreground">
                {user.tipo === 'administrador' && 'Administrador'}
                {user.tipo === 'tecnico' && 'Técnico'}
                {user.tipo === 'usuario' && 'Cliente'}
                {' • '}
                {user.departamento}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:opacity-90"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card min-h-[calc(100vh-73px)]">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      currentPage === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

// Simple Dashboard Component
const SimpleDashboard: React.FC<{ user: Usuario }> = ({ user }) => {
  const stats = [
    { label: 'Total de Chamados', value: '156', icon: '🎫' },
    { label: 'Chamados Abertos', value: '23', icon: '🟡' },
    { label: 'Em Andamento', value: '45', icon: '🔄' },
    { label: 'Resolvidos', value: '88', icon: '✅' }
  ];

  const recentTickets = [
    { id: '#2024001', title: 'Problema no sistema de email', status: 'Aberto', priority: 'Alta' },
    { id: '#2024002', title: 'Solicitação de acesso', status: 'Em andamento', priority: 'Média' },
    { id: '#2024003', title: 'Backup de dados', status: 'Resolvido', priority: 'Baixa' }
  ];

  const getDashboardTitle = () => {
    switch (user.tipo) {
      case 'administrador':
        return 'Dashboard Administrativo';
      case 'tecnico':
        return 'Dashboard do Técnico';
      case 'usuario':
        return 'Dashboard do Cliente';
      default:
        return 'Dashboard';
    }
  };

  const getDashboardDescription = () => {
    switch (user.tipo) {
      case 'administrador':
        return 'Visão geral completa do sistema de chamados';
      case 'tecnico':
        return 'Chamados atribuídos e disponíveis para atendimento';
      case 'usuario':
        return 'Seus chamados e solicitações de suporte';
      default:
        return 'Bem-vindo ao sistema';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2>{getDashboardTitle()}</h2>
        <p className="text-muted-foreground">
          Bem-vindo, {user.nome}. {getDashboardDescription()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="p-6 border border-border rounded-lg bg-card">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-medium">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tickets */}
      <div className="border border-border rounded-lg bg-card">
        <div className="p-6 border-b border-border">
          <h3>Chamados Recentes</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentTickets.map((ticket, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{ticket.id}</span>
                  <span>{ticket.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ticket.status === 'Resolvido' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : ticket.status === 'Em andamento'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {ticket.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ticket.priority === 'Alta'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : ticket.priority === 'Média'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions specific to user type */}
      {user.tipo === 'usuario' && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="mb-2">Precisa de ajuda?</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Abra um novo chamado para receber suporte técnico rapidamente.
          </p>
          <button 
            onClick={() => {}} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90"
          >
            Abrir Novo Chamado
          </button>
        </div>
      )}

      {user.tipo === 'tecnico' && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="mb-2">Área do Técnico</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Gerencie chamados atribuídos e disponíveis para atendimento.
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90">
              Ver Chamados Pendentes
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:opacity-90">
              Relatório de Atendimentos
            </button>
          </div>
        </div>
      )}

      {user.tipo === 'administrador' && (
        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="mb-2">Painel Administrativo</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Gerencie usuários, visualize relatórios e configure o sistema.
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90">
              Gerenciar Usuários
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:opacity-90">
              Ver Relatórios
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:opacity-90">
              Configurações
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Page Components
const SimpleUsuarios: React.FC = () => (
  <div className="p-6">
    <h2 className="mb-4">Gerenciar Usuários</h2>
    <div className="border border-border rounded-lg bg-card p-6">
      <p className="text-muted-foreground">
        Módulo de gerenciamento de usuários em desenvolvimento.
      </p>
    </div>
  </div>
);

const SimpleRelatorios: React.FC = () => (
  <div className="p-6">
    <h2 className="mb-4">Relatórios</h2>
    <div className="border border-border rounded-lg bg-card p-6">
      <p className="text-muted-foreground">
        Módulo de relatórios em desenvolvimento.
      </p>
    </div>
  </div>
);

const SimpleConfig: React.FC = () => (
  <div className="p-6">
    <h2 className="mb-4">Configurações</h2>
    <div className="border border-border rounded-lg bg-card p-6">
      <p className="text-muted-foreground">
        Módulo de configurações em desenvolvimento.
      </p>
    </div>
  </div>
);

// Main App Component
export default function App() {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user on app start
    try {
      const savedUser = localStorage.getItem('helpdesk_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      }
    } catch (error) {
      console.warn('Failed to load saved user:', error);
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (user: Usuario) => {
    setCurrentUser(user);
    localStorage.setItem('helpdesk_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('helpdesk_user');
    setCurrentPage('dashboard');
  };

  if (loading) {
    return <SimpleLoading message="Inicializando sistema..." />;
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <SimpleDashboard user={currentUser} />;
      case 'chamados':
        return <ChamadosManager currentUser={currentUser} />;
      case 'usuarios':
        return <SimpleUsuarios />;
      case 'relatorios':
        return <SimpleRelatorios />;
      case 'config':
        return <SimpleConfig />;
      default:
        return <SimpleDashboard user={currentUser} />;
    }
  };

  return (
    <SimpleLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onLogout={handleLogout}
      user={currentUser}
    >
      {renderPage()}
    </SimpleLayout>
  );
}