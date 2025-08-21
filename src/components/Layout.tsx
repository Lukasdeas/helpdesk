import React, { useState } from 'react';
import { useHelpdesk } from '../contexts/HelpdeskContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Home,
  Users,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  HelpCircle,
  Shield,
  Crown,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { cn } from './ui/utils';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { currentUser, signOut, darkMode, toggleDarkMode, chamados, isOnlineMode } = useHelpdesk();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chamadosAbertos = chamados.filter(c => ['Aberto', 'Em Andamento', 'Pendente'].includes(c.status)).length;
  const meusChamados = currentUser?.tipo === 'tecnico' 
    ? chamados.filter(c => c.tecnico_id === currentUser.user_id && ['Aberto', 'Em Andamento', 'Pendente'].includes(c.status)).length
    : 0;

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      badge: null,
      access: ['usuario', 'tecnico', 'administrador']
    },
    { 
      id: 'chamados', 
      label: currentUser?.tipo === 'tecnico' ? 'Chamados' : 'Meus Chamados', 
      icon: Ticket, 
      badge: currentUser?.tipo === 'tecnico' ? meusChamados > 0 ? meusChamados : null : chamadosAbertos > 0 ? chamadosAbertos : null,
      access: ['usuario', 'tecnico', 'administrador']
    },
    { 
      id: 'usuarios', 
      label: 'Usuários', 
      icon: Users, 
      badge: null,
      access: ['administrador']
    },
    { 
      id: 'relatorios', 
      label: 'Relatórios', 
      icon: BarChart3, 
      badge: null,
      access: ['tecnico', 'administrador']
    },
    { 
      id: 'config', 
      label: 'Configurações', 
      icon: Settings, 
      badge: !isOnlineMode ? 'Offline' : null,
      access: ['administrador']
    },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    return item.access.includes(currentUser?.tipo || '');
  });

  const handleLogout = () => {
    signOut();
  };

  const getTipoIcon = () => {
    switch (currentUser?.tipo) {
      case 'administrador': return <Crown className="h-4 w-4 text-red-500" />;
      case 'tecnico': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'usuario': return <User className="h-4 w-4 text-green-500" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getTipoBadgeColor = () => {
    switch (currentUser?.tipo) {
      case 'administrador': return 'destructive';
      case 'tecnico': return 'default';
      case 'usuario': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary rounded-lg">
              <HelpCircle className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Helpdesk</h1>
              <div className="flex items-center space-x-1">
                <p className="text-xs text-muted-foreground">Sistema de Suporte</p>
                {isOnlineMode ? (
                  <Wifi className="h-3 w-3 text-green-500" title="Conectado" />
                ) : (
                  <WifiOff className="h-3 w-3 text-orange-500" title="Modo Demo" />
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {filteredMenuItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                onPageChange(item.id);
                setSidebarOpen(false);
              }}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
              {item.badge && (
                <Badge variant="destructive" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          {/* Status da Conexão */}
          <div className="mb-3 p-2 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Status:</span>
              <div className="flex items-center space-x-1">
                {isOnlineMode ? (
                  <>
                    <Wifi className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-orange-500" />
                    <span className="text-orange-600">Demo</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-3">
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.nome}`} />
              <AvatarFallback>
                {currentUser?.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.nome}</p>
              <div className="flex items-center space-x-1">
                {getTipoIcon()}
                <Badge variant={getTipoBadgeColor()} className="text-xs capitalize">
                  {currentUser?.tipo}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Estatísticas rápidas para técnicos */}
          {currentUser?.tipo === 'tecnico' && (
            <div className="mb-3 p-2 bg-secondary rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-primary">{meusChamados}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{
                    chamados.filter(c => c.tecnico_id === currentUser.user_id && c.status === 'Resolvido').length
                  }</p>
                  <p className="text-xs text-muted-foreground">Resolvidos</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="flex-1"
              title={darkMode ? "Modo Claro" : "Modo Escuro"}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="flex-1"
              title="Sair do Sistema"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 flex items-center justify-between lg:justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-4">
            {/* Status Badge */}
            <Badge variant={isOnlineMode ? "secondary" : "outline"} className="hidden sm:flex">
              {isOnlineMode ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Demonstração
                </>
              )}
            </Badge>

            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{currentUser?.nome}</p>
              <p className="text-xs text-muted-foreground">{currentUser?.departamento} - {currentUser?.cargo}</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.nome}`} />
                    <AvatarFallback>
                      {currentUser?.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1">
                    {getTipoIcon()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">{currentUser?.nome}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser?.email}
                    </p>
                    <Badge variant={getTipoBadgeColor()} className="w-fit mt-1 capitalize">
                      <div className="flex items-center space-x-1">
                        {getTipoIcon()}
                        <span>{currentUser?.tipo}</span>
                      </div>
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Connection Status */}
                <DropdownMenuItem disabled className="text-xs">
                  <div className="flex justify-between w-full">
                    <span>Status da Conexão</span>
                    <div className="flex items-center space-x-1">
                      {isOnlineMode ? (
                        <>
                          <Wifi className="h-3 w-3 text-green-500" />
                          <span className="text-green-600">Online</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-3 w-3 text-orange-500" />
                          <span className="text-orange-600">Demo</span>
                        </>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
                
                {currentUser?.tipo === 'tecnico' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled className="text-xs">
                      <div className="flex justify-between w-full">
                        <span>Chamados Pendentes</span>
                        <Badge variant="secondary">{meusChamados}</Badge>
                      </div>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};