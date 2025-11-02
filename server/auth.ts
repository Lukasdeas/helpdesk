import { createHash, randomBytes, pbkdf2Sync } from 'crypto';

/**
 * Cria hash de senha usando PBKDF2 (mais seguro que MD5/SHA1)
 * Compatível com Vite, não requer dependências externas
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifica se a senha fornecida corresponde ao hash armazenado
 * SEGURANÇA: Não loga dados sensíveis (hashes, senhas, etc.)
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    // Verificar se é uma senha em texto plano (compatibilidade)
    if (!storedHash.includes(':')) {
      return password === storedHash;
    }
    
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) {
      return false;
    }
    
    const verifyHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch (error) {
    // SEGURANÇA: Log genérico sem expor detalhes
    console.error('Erro na verificação de credenciais');
    return false;
  }
}

/**
 * Migra senha de texto plano para hash
 * Usado durante o login para atualizar senhas antigas
 */
export function needsPasswordUpdate(storedHash: string): boolean {
  return !storedHash.includes(':');
}