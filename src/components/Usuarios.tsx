import React, { useState } from 'react';
import { useHelpdesk } from '../contexts/HelpdeskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Plus, 
  Search, 
  Users as UsersIcon, 
  Mail, 
  Phone, 
  Building, 
  Briefcase,
  Calendar,
  Shield,
  User,
  Crown,
} from 'lucide-react';
import { MOCK_USERS } from '../constants/mockData';

export const Usuarios: React.FC = () => {
  const { currentUser } = useHelpdesk();
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [departamentoFilter, setDepartamentoFilter] = useState('todos');
  const [showNovoUsuario, setShowNovoUsuario] = useState(false);

  // Use mock users for now since we don't have users in the context
  const users = MOCK_USERS;
  const departamentos = [
    { id: '1', nome: 'TI' },
    { id: '2', nome: 'RH' },
    { id: '3', nome: 'Financeiro' },
    { id: '4', nome: 'Vendas' },
    { id: '5', nome: 'Marketing' },
  ];

  // Form state
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    telefone: '',
    departamento: '',
    cargo: '',
    tipo: 'usuario' as 'usuario' | 'tecnico' | 'administrador',
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = tipoFilter === 'todos' || user.tipo === tipoFilter;
    const matchesDepartamento = departamentoFilter === 'todos' || user.departamento === departamentoFilter;
    
    return matchesSearch && matchesTipo && matchesDepartamento;
  });

  const handleNovoUsuario = () => {
    if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.telefone || 
        !novoUsuario.departamento || !novoUsuario.cargo) return;

    // In a real implementation, this would call a context method
    console.log('Creating new user:', novoUsuario);

    setNovoUsuario({
      nome: '',
      email: '',
      telefone: '',
      departamento: '',
      cargo: '',
      tipo: 'usuario',
    });
    setShowNovoUsuario(false);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'administrador': return <Crown className="h-4 w-4" />;
      case 'tecnico': return <Shield className="h-4 w-4" />;
      case 'usuario': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'administrador': return 'destructive';
      case 'tecnico': return 'default';
      case 'usuario': return 'secondary';
      default: return 'secondary';
    }
  };

  const estatisticas = {
    total: users.length,
    administradores: users.filter(u => u.tipo === 'administrador').length,
    tecnicos: users.filter(u => u.tipo === 'tecnico').length,
    usuarios: users.filter(u => u.tipo === 'usuario').length,
  };

  // Verificar se o usuário atual é administrador
  const isAdmin = currentUser?.tipo === 'administrador';

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3>Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Apenas administradores podem gerenciar usuários.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, técnicos e administradores do sistema
          </p>
        </div>
        
        <Dialog open={showNovoUsuario} onOpenChange={setShowNovoUsuario}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Novo Usuário</DialogTitle>
              <DialogDescription>
                Cadastre um novo usuário no sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome completo do usuário"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={novoUsuario.email}
                  onChange={(e) => setNovoUsuario(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@empresa.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={novoUsuario.telefone}
                  onChange={(e) => setNovoUsuario(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Select 
                  value={novoUsuario.departamento} 
                  onValueChange={(value) => setNovoUsuario(prev => ({ ...prev, departamento: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map((dept) => (
                      <SelectItem key={dept.id} value={dept.nome}>
                        {dept.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo/Função</Label>
                <Input
                  id="cargo"
                  value={novoUsuario.cargo}
                  onChange={(e) => setNovoUsuario(prev => ({ ...prev, cargo: e.target.value }))}
                  placeholder="Cargo ou função"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Usuário</Label>
                <Select 
                  value={novoUsuario.tipo} 
                  onValueChange={(value: any) => setNovoUsuario(prev => ({ ...prev, tipo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">Usuário</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowNovoUsuario(false)}>
                Cancelar
              </Button>
              <Button onClick={handleNovoUsuario}>
                Cadastrar Usuário
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total de Usuários</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{estatisticas.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Administradores</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{estatisticas.administradores}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Técnicos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{estatisticas.tecnicos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Usuários</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{estatisticas.usuarios}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="usuario">Usuário</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="administrador">Administrador</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={departamentoFilter} onValueChange={setDepartamentoFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {departamentos.map((dept) => (
                  <SelectItem key={dept.id} value={dept.nome}>
                    {dept.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {filteredUsers.length} usuário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.nome}`} />
                          <AvatarFallback>
                            {user.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{user.nome}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {user.telefone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        {user.departamento}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                        {user.cargo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTipoColor(user.tipo)} className="capitalize">
                        <div className="flex items-center space-x-1">
                          {getTipoIcon(user.tipo)}
                          <span>{user.tipo}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3>Nenhum usuário encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || tipoFilter !== 'todos' || departamentoFilter !== 'todos' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece cadastrando um novo usuário.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};