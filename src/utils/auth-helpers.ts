interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  nome: string;
  telefone: string;
  departamento: string;
  cargo: string;
  tipo: 'usuario' | 'tecnico' | 'administrador';
}

export const validateLoginForm = (form: LoginForm): string | null => {
  if (!form.email || !form.password) {
    return 'Por favor, preencha todos os campos';
  }
  return null;
};

export const validateRegisterForm = (form: RegisterForm): string | null => {
  if (!form.email || !form.password || !form.nome || 
      !form.telefone || !form.departamento || !form.cargo) {
    return 'Por favor, preencha todos os campos obrigatórios';
  }

  if (form.password !== form.confirmPassword) {
    return 'As senhas não coincidem';
  }

  if (form.password.length < 6) {
    return 'A senha deve ter pelo menos 6 caracteres';
  }

  return null;
};

export const getTipoIcon = (tipo: string) => {
  switch (tipo) {
    case 'administrador': return 'Crown';
    case 'tecnico': return 'Shield';
    case 'usuario': return 'User';
    default: return 'User';
  }
};

export const getTipoColor = (tipo: string) => {
  switch (tipo) {
    case 'administrador': return 'red';
    case 'tecnico': return 'blue';
    case 'usuario': return 'green';
    default: return 'gray';
  }
};