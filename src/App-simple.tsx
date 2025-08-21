import React, { useState } from 'react';

// Ultra-simple fallback app in case everything fails
const SimpleApp: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState<any>(null);

  const handleLogin = (email: string) => {
    // Simple mock login
    if (email.includes('admin')) {
      setUser({ nome: 'Admin Demo', tipo: 'administrador', email });
    } else if (email.includes('tecnico')) {
      setUser({ nome: 'Técnico Demo', tipo: 'tecnico', email });
    } else {
      setUser({ nome: 'Cliente Demo', tipo: 'usuario', email });
    }
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowLogin(true);
  };

  if (showLogin) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ 
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h1 style={{ textAlign: 'center', marginBottom: '24px', color: '#1f2937' }}>
            Sistema Helpdesk
          </h1>
          <p style={{ textAlign: 'center', marginBottom: '24px', color: '#6b7280' }}>
            Modo de emergência - Clique em uma das opções para acessar:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => handleLogin('admin@helpdesk.com')}
              style={{
                padding: '12px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Acessar como Administrador
            </button>
            <button
              onClick={() => handleLogin('tecnico@helpdesk.com')}
              style={{
                padding: '12px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Acessar como Técnico
            </button>
            <button
              onClick={() => handleLogin('cliente@helpdesk.com')}
              style={{
                padding: '12px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Acessar como Cliente
            </button>
          </div>
          <div style={{ 
            marginTop: '24px', 
            padding: '12px', 
            backgroundColor: '#fef3c7', 
            borderRadius: '4px',
            fontSize: '12px',
            color: '#92400e'
          }}>
            ⚠️ Sistema em modo de emergência. Funcionalidades limitadas.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#1f2937' }}>Sistema Helpdesk</h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            Modo de emergência
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>
            {user?.nome} ({user?.tipo})
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ padding: '24px' }}>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0, color: '#1f2937' }}>
            Dashboard {user?.tipo === 'administrador' ? 'Administrativo' : 
                      user?.tipo === 'tecnico' ? 'do Técnico' : 'do Cliente'}
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px',
            marginTop: '24px'
          }}>
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '6px',
              backgroundColor: '#f8fafc'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>Status do Sistema</h3>
              <p style={{ margin: 0, color: '#10b981', fontSize: '14px' }}>
                ✓ Operacional (Modo Emergência)
              </p>
            </div>

            <div style={{ 
              padding: '16px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '6px',
              backgroundColor: '#f8fafc'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>Seu Perfil</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                {user?.email}
              </p>
            </div>

            <div style={{ 
              padding: '16px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '6px',
              backgroundColor: '#f8fafc'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>Modo de Operação</h3>
              <p style={{ margin: 0, color: '#f59e0b', fontSize: '14px' }}>
                🚨 Emergência - Funcionalidades Limitadas
              </p>
            </div>

            {user?.tipo === 'administrador' && (
              <div style={{ 
                padding: '16px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px',
                backgroundColor: '#f8fafc'
              }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>Ações Admin</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                  Aguardando sistema completo...
                </p>
              </div>
            )}
          </div>

          <div style={{ 
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '6px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>
              ⚠️ Sistema em Modo de Emergência
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
              O sistema está funcionando com funcionalidades limitadas. 
              Algumas features podem estar temporariamente indisponíveis. 
              Recarregue a página para tentar acessar o sistema completo.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                backgroundColor: '#d97706',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Recarregar Sistema Completo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimpleApp;