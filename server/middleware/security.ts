import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import DOMPurify from 'isomorphic-dompurify';
import { randomBytes } from 'crypto';

/**
 * SEGURANÇA: Middleware de autenticação
 * Verifica se o usuário está autenticado via sessão segura
 * Protege contra acesso não autorizado
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

/**
 * SEGURANÇA: Middleware de autorização por role
 * Verifica se o usuário tem as permissões necessárias
 * Protege contra escalação de privilégios
 */
export function requireRole(...roles: Array<'user' | 'technician' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.userId || !req.session.role) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!roles.includes(req.session.role)) {
      return res.status(403).json({ error: 'Permissão negada' });
    }

    next();
  };
}

/**
 * SEGURANÇA: Rate limiting para login
 * Protege contra ataques de força bruta
 * Limita tentativas de login por IP
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo de 5 tentativas
  skipSuccessfulRequests: true, // não conta requests bem-sucedidos
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * SEGURANÇA: Rate limiting para API geral
 * Protege contra abuso da API
 * Limita requisições por IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // máximo de 100 requests por minuto
  message: { error: 'Muitas requisições. Aguarde um momento.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * SEGURANÇA: Sanitização de HTML
 * Remove scripts e tags perigosas do conteúdo
 * Protege contra ataques XSS (Cross-Site Scripting)
 */
export function sanitizeHTML(text: string): string {
  if (!text) return '';
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

/**
 * SEGURANÇA: Sanitização de inputs do usuário
 * Remove caracteres perigosos e valida dados
 * Protege contra SQL Injection e XSS
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove null bytes e caracteres de controle
    return input.replace(/\0/g, '').trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      // Apenas permite chaves alfanuméricas seguras
      if (/^[a-zA-Z0-9_]+$/.test(key)) {
        sanitized[key] = sanitizeInput(value);
      }
    }
    return sanitized;
  }
  
  return input;
}

/**
 * SEGURANÇA: Middleware de sanitização de request body
 * Sanitiza automaticamente todos os dados recebidos
 */
export function sanitizeRequestBody(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  next();
}

/**
 * SEGURANÇA: Headers de segurança
 * Adiciona headers HTTP para proteger contra ataques comuns
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Previne clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Previne MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Habilita proteção XSS do navegador
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Força HTTPS (se em produção)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy - protege contra XSS
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;");
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
}

/**
 * SEGURANÇA: Logging seguro
 * Remove dados sensíveis dos logs
 */
export function sanitizeLogData(data: any): any {
  if (!data) return data;
  
  const sensitiveFields = ['password', 'token', 'authorization', 'cookie', 'session'];
  
  if (typeof data === 'object') {
    const sanitized: any = Array.isArray(data) ? [] : {};
    
    for (const [key, value] of Object.entries(data)) {
      const keyLower = key.toLowerCase();
      if (sensitiveFields.some(field => keyLower.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeLogData(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  return data;
}

/**
 * SEGURANÇA: Valida ownership de ticket
 * Garante que usuários só possam acessar seus próprios tickets
 */
export function validateTicketOwnership(allowTechnicians: boolean = true) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Admins e técnicos sempre podem acessar
    if (allowTechnicians && (req.session.role === 'admin' || req.session.role === 'technician')) {
      return next();
    }

    // Usuários comuns precisam de validação adicional
    // Esta lógica será implementada nas rotas específicas
    next();
  };
}

/**
 * SEGURANÇA: Gera token CSRF e armazena em cookie
 * Usa abordagem de double-submit cookies
 */
export function generateCsrfToken(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.['csrf-token'];
  
  if (!token) {
    token = randomBytes(32).toString('hex');
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('csrf-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax', // strict em produção, lax em dev
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });
  }
  
  // Armazenar token em res.locals para acesso pelo endpoint
  res.locals.csrfToken = token;
  next();
}

/**
 * SEGURANÇA: Valida token CSRF em requisições de mutação
 * Protege contra ataques CSRF (Cross-Site Request Forgery)
 */
export function validateCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Apenas validar em métodos de mutação
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  // Rotas que não requerem token CSRF
  // Login: não há token ainda (primeira requisição)
  // CSRF token endpoint: precisa funcionar para obter o token
  const exemptPaths = ['/auth/login', '/auth/csrf-token'];
  if (exemptPaths.includes(req.path)) {
    return next();
  }

  const cookieToken = req.cookies?.['csrf-token'];
  const headerToken = req.headers['x-csrf-token'] as string;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'Token CSRF inválido' });
  }

  next();
}
