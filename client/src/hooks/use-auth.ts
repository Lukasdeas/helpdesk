import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: 'user' | 'technician' | 'admin';
}

/**
 * Hook de autenticação usando sessões seguras (httpOnly cookies)
 * Não armazena dados sensíveis no localStorage
 * Busca dados da sessão diretamente do servidor
 */
export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<User>({
    queryKey: ["/api/auth/session"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include',
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao fazer logout");
      window.location.href = "/";
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    logout,
    refetch,
  };
}
