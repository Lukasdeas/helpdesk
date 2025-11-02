// Carregar variáveis de ambiente PRIMEIRO
async function loadEnvironment() {
  const isReplit = process.env.REPL_ID || process.env.REPLIT_DEPLOYMENT;
  
  if (isReplit) {
    // Ambiente Replit - usar variáveis de ambiente/secrets do Replit
    console.log('🔵 Ambiente Replit detectado - usando Replit Secrets');
    console.log('💡 Configure secrets na ferramenta "Secrets" do Replit');
  } else {
    // Servidor Linux tradicional - tentar carregar arquivo .env
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Verificar se arquivo .env existe
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const { config } = await import('dotenv');
        const result = config({ path: '.env' });
        
        if (result.error) {
          console.log('⚠️ Erro ao carregar .env:', result.error.message);
        } else {
          console.log('✅ Arquivo .env carregado com sucesso');
          console.log(`📁 Localização: ${envPath}`);
        }
      } else {
        console.log('⚠️ Arquivo .env não encontrado');
        console.log('💡 Crie um arquivo .env baseado no .env.example');
        console.log('💡 Ou configure as variáveis de ambiente do sistema');
      }
    } catch (error) {
      console.log('⚠️ Erro ao processar .env:', error);
    }
  }
}

// Função principal que aguarda o dotenv carregar
async function startServer() {
  // 1. PRIMEIRO: Carregar variáveis de ambiente
  await loadEnvironment();
  
  // 2. DEPOIS: Importar e inicializar tudo
  const express = (await import("express")).default;
  const session = (await import("express-session")).default;
  const cookieParser = (await import("cookie-parser")).default;
  const { registerRoutes } = await import("./routes");
  const { setupVite, serveStatic, log } = await import("./vite");
  const { securityHeaders } = await import("./middleware/security");

  const app = express();
  
  // Verificar ambiente (produção ou desenvolvimento)
  const isProduction = process.env.NODE_ENV === 'production';
  
  // SEGURANÇA: Configurar trust proxy APENAS para ambientes com proxy reverso
  // Em desenvolvimento local (localhost), NÃO usar trust proxy
  // Isso evita problemas com detecção de protocolo seguro e cookies de sessão
  if (isProduction) {
    // Produção: assume 1 proxy reverso na frente (Nginx/Apache)
    app.set('trust proxy', 1);
  } else {
    // Desenvolvimento: sem proxy, não confiar em headers X-Forwarded-*
    app.set('trust proxy', false);
  }
  
  // SEGURANÇA: Headers de segurança
  app.use(securityHeaders);
  
  // Cookie parser (para sessões)
  app.use(cookieParser());
  
  // SEGURANÇA: Configuração de sessão segura com httpOnly cookies
  // Usar SQLite session store para funcionar com PM2 cluster mode
  let sessionStore;
  
  if (isProduction) {
    // Produção com SQLite - compatível com PM2 cluster mode
    console.log('🔒 Usando SQLite session store para produção');
    const SqliteStore = (await import('better-sqlite3-session-store')).default;
    const BetterSqlite3 = (await import('better-sqlite3')).default;
    const fs = await import('fs');
    const path = await import('path');
    
    // Usar banco de dados SQLite para sessões (compartilhado entre todos os workers do PM2)
    const dbPath = process.env.DATABASE_PATH || './data/helpdesk.db';
    
    // Criar diretório se não existir
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`📁 Diretório criado: ${dbDir}`);
    }
    
    const sqliteDb = new BetterSqlite3(dbPath);
    
    const SessionStore = SqliteStore(session);
    sessionStore = new SessionStore({
      client: sqliteDb,
      expired: {
        clear: true,
        intervalMs: 900000 // Limpar sessões expiradas a cada 15 minutos
      }
    });
  } else {
    // Desenvolvimento - usar MemoryStore (apenas para testes locais)
    console.log('⚠️ Usando MemoryStore - apenas para desenvolvimento');
  }
  
  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    name: 'sessionId', // Nome personalizado do cookie (não usar o padrão)
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // Protege contra XSS - não acessível via JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
      sameSite: isProduction ? 'strict' : 'lax', // strict em produção, lax em dev para compatibilidade
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  }));
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // SEGURANÇA: Logging seguro - não loga payloads completos com dados sensíveis
  app.use((req: any, res: any, next: any) => {
    const start = Date.now();
    const path = req.path;

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        // Log apenas método, path, status e duração (sem payloads)
        const logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        log(logLine);
      }
    });

    next();
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
}

// Iniciar servidor
startServer().catch(console.error);
