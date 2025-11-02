import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTicketSchema, insertUserSchema, insertCommentSchema, tickets, users } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { hashPassword, verifyPassword, needsPasswordUpdate } from "./auth";
import { emailService } from "./emailService";
import { 
  requireAuth, 
  requireRole, 
  sanitizeHTML 
} from "./middleware/security";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Endpoint de autenticação
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        // SEGURANÇA: Mensagem genérica para não revelar se o usuário existe
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!verifyPassword(password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Migrar senha em texto plano para hash se necessário
      if (needsPasswordUpdate(user.password)) {
        const hashedPassword = hashPassword(password);
        await db.update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, user.id));
      }

      // SEGURANÇA: Armazenar dados do usuário na sessão segura (httpOnly cookie)
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.name = user.name;
      req.session.email = user.email || undefined;
      req.session.role = user.role as 'user' | 'technician' | 'admin';

      // Retornar apenas dados não sensíveis
      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        message: 'Login successful'
      });
    } catch (error) {
      console.error("Login error");
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SEGURANÇA: Endpoint de logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao fazer logout" });
      }
      res.clearCookie('sessionId');
      res.json({ message: 'Logout successful' });
    });
  });

  // Endpoint para verificar sessão atual
  app.get("/api/auth/session", requireAuth, (req: Request, res: Response) => {
    res.json({
      id: req.session.userId,
      username: req.session.username,
      name: req.session.name,
      email: req.session.email,
      role: req.session.role
    });
  });

  // Ticket routes
  app.post("/api/tickets", async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      
      // SEGURANÇA: Sanitizar HTML para prevenir XSS
      const sanitizedData = {
        ...ticketData,
        title: sanitizeHTML(ticketData.title),
        description: sanitizeHTML(ticketData.description),
        requesterName: sanitizeHTML(ticketData.requesterName),
        sector: sanitizeHTML(ticketData.sector),
        problemType: sanitizeHTML(ticketData.problemType),
      };
      
      // Definir status padrão como 'waiting' e prioridade como 'medium'
      const ticketWithDefaults = {
        ...sanitizedData,
        status: "waiting" as const,
        priority: sanitizedData.priority || "medium" as const,
        attachments: sanitizedData.attachments || []
      };
      const ticket = await storage.createTicket(ticketWithDefaults);
      
      // Enviar notificações por email
      try {
        // Notificar o usuário que criou o ticket
        await emailService.sendTicketCreatedNotification(ticket);
        console.log(`✅ Email de confirmação enviado para: ${ticket.userEmail}`);
        
        // Buscar todos os técnicos e administradores para notificar
        const allTechnicians = await storage.getAllTechnicians();
        const staffEmails = allTechnicians
          .filter(user => user.email && user.email.trim() !== '')
          .map(user => user.email!);
        
        if (staffEmails.length > 0) {
          // Notificar toda a equipe técnica sobre o novo chamado
          await emailService.sendNewTicketToStaffNotification(ticket, staffEmails);
          console.log(`🔔 Notificação de novo chamado enviada para ${staffEmails.length} técnico(s)/admin(s)`);
        } else {
          console.log('⚠️ Nenhum técnico/admin com email cadastrado para notificar');
        }
      } catch (emailError) {
        console.error("Erro ao enviar emails:", emailError);
        // Não falhar a criação do ticket se o email falhar
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Create ticket error:", error);
      res.status(400).json({ error: "Invalid ticket data" });
    }
  });

  // SEGURANÇA: Rotas protegidas - requerem autenticação
  app.get("/api/tickets", async (req, res) => {
    try {
      const { status, technicianId } = req.query;
      let tickets;
      
      if (technicianId && typeof technicianId === 'string') {
        tickets = await storage.getTicketsForTechnician(technicianId);
      } else if (status && typeof status === 'string') {
        tickets = await storage.getTicketsByStatus(status);
      } else {
        tickets = await storage.getAllTickets();
      }
      
      res.json(tickets);
    } catch (error) {
      console.error("Get tickets error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      console.error("Get ticket error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SEGURANÇA: Apenas técnicos e admins podem alterar prioridade
  app.patch("/api/tickets/:id/priority", requireRole('technician', 'admin'), async (req, res) => {
    try {
      const { priority, updatedBy } = req.body;
      
      // Sanitizar entrada do usuário
      const safePriority = typeof priority === 'string' ? priority.trim() : '';
      const safeUpdatedBy = typeof updatedBy === 'string' ? updatedBy.trim().substring(0, 100) : 'Sistema';
      if (!['low', 'medium', 'high'].includes(safePriority)) {
        return res.status(400).json({ error: "Invalid priority" });
      }
      
      // Buscar ticket antes da atualização para enviar notificação
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      await storage.updateTicketPriority(req.params.id, safePriority);
      
      // Enviar notificação por email se a prioridade mudou
      if (ticket.priority !== safePriority) {
        try {
          await emailService.sendPriorityChangedNotification(ticket, safePriority, safeUpdatedBy);
          console.log(`Email de mudança de prioridade enviado para: ${ticket.userEmail}`);
        } catch (emailError) {
          console.error("Erro ao enviar email de prioridade:", emailError);
          // Não falhar a atualização se o email falhar
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Update priority error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SEGURANÇA: Apenas técnicos e admins podem alterar status
  app.patch("/api/tickets/:id/status", requireRole('technician', 'admin'), async (req, res) => {
    try {
      const { status, resolvedBy } = req.body;
      
      // Sanitizar entrada do usuário
      const safeStatus = typeof status === 'string' ? status.trim() : '';
      const safeResolvedBy = typeof resolvedBy === 'string' ? resolvedBy.trim().substring(0, 100) : 'Equipe Técnica';
      if (!['waiting', 'open', 'in_progress', 'resolved'].includes(safeStatus)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      // Buscar ticket antes da atualização para enviar notificação
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      await storage.updateTicketStatus(req.params.id, safeStatus);
      
      // Enviar notificação por email se o ticket foi finalizado
      if (safeStatus === 'resolved' && ticket.status !== 'resolved') {
        try {
          await emailService.sendTicketResolvedNotification(ticket, safeResolvedBy);
          console.log(`Email de finalização enviado para: ${ticket.userEmail}`);
        } catch (emailError) {
          console.error("Erro ao enviar email de finalização:", emailError);
          // Não falhar a atualização se o email falhar
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Update status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SEGURANÇA: Apenas técnicos e admins podem assumir tickets
  app.patch("/api/tickets/:id/assign", requireRole('technician', 'admin'), async (req, res) => {
    try {
      const { technicianId } = req.body;
      if (!technicianId) {
        return res.status(400).json({ error: "Technician ID is required" });
      }
      
      // Buscar dados do ticket e técnico antes da atribuição
      const ticket = await storage.getTicket(req.params.id);
      const technician = await storage.getUser(technicianId);
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      if (!technician) {
        return res.status(404).json({ error: "Technician not found" });
      }
      
      await storage.assignTicket(req.params.id, technicianId);
      
      // Enviar notificação por email
      try {
        await emailService.sendTicketAssignedNotification(ticket, technician);
        console.log(`Email de atribuição enviado para: ${ticket.userEmail}`);
      } catch (emailError) {
        console.error("Erro ao enviar email de atribuição:", emailError);
        // Não falhar a atribuição se o email falhar
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Assign ticket error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SEGURANÇA: Apenas admins podem desatribuir tickets
  app.patch("/api/tickets/:id/unassign", requireRole('admin'), async (req, res) => {
    try {
      await db
        .update(tickets)
        .set({ 
          assignedToId: null, 
          status: 'open',
          acceptedAt: null,
          updatedAt: sql`datetime('now', '-3 hours')` 
        })
        .where(eq(tickets.id, req.params.id));
      
      res.json({ success: true });
    } catch (error) {
      console.error("Unassign ticket error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Comment routes
  app.post("/api/comments", async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      
      // SEGURANÇA: Sanitizar HTML para prevenir XSS
      const sanitizedCommentData = {
        ...commentData,
        content: sanitizeHTML(commentData.content),
        authorName: sanitizeHTML(commentData.authorName),
      };
      
      // Get ticket details to validate comment permissions
      const ticket = await storage.getTicket(sanitizedCommentData.ticketId);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      // Validate user comment permissions
      if (sanitizedCommentData.authorType === 'user') {
        // Users can only comment if ticket is not assigned to any technician
        if (ticket.assignedToId) {
          return res.status(403).json({ error: "Users cannot comment after ticket is assigned to a technician" });
        }
        
        // Users can only comment on waiting or open tickets
        if (ticket.status !== 'waiting' && ticket.status !== 'open') {
          return res.status(403).json({ error: "Users cannot comment on tickets that are not waiting or open" });
        }
      } else if (sanitizedCommentData.authorType === 'technician') {
        // Technicians cannot comment on resolved tickets unless they are admin
        if (ticket.status === 'resolved') {
          return res.status(403).json({ error: "Only admins can comment on resolved tickets" });
        }
      }
      
      const comment = await storage.addComment(sanitizedCommentData);
      
      // Enviar notificação por email apenas se for comentário de técnico
      if (sanitizedCommentData.authorType === 'technician') {
        try {
          await emailService.sendCommentAddedNotification(ticket, sanitizedCommentData.authorName);
        } catch (emailError) {
          console.error("Erro ao enviar email");
        }
      }
      
      res.json(comment);
    } catch (error) {
      console.error("Add comment error:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        console.error("Validation details:", (error as any).errors);
      }
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  // User management routes - SEGURANÇA: Apenas admins e técnicos
  app.get("/api/users/technicians", requireRole('technician', 'admin'), async (req, res) => {
    try {
      const technicians = await storage.getAllTechnicians();
      res.json(technicians);
    } catch (error) {
      console.error("Get technicians error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SEGURANÇA: Apenas admins podem criar usuários
  app.post("/api/users", requireRole('admin'), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Hash da senha antes de salvar
      const hashedPassword = hashPassword(userData.password);
      const userDataWithHashedPassword = {
        ...userData,
        password: hashedPassword
      };
      
      const user = await storage.createUser(userDataWithHashedPassword);
      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // SEGURANÇA: Apenas admins podem deletar usuários
  app.delete("/api/users/:id", requireRole('admin'), async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Statistics route - SEGURANÇA: Apenas técnicos e admins
  app.get("/api/stats", requireRole('technician', 'admin'), async (req, res) => {
    try {
      const stats = await storage.getTicketStats();
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Technician performance route - SEGURANÇA: Apenas técnicos e admins
  app.get("/api/technician-performance", requireRole('technician', 'admin'), async (req, res) => {
    try {
      const performance = await storage.getTechnicianPerformance();
      res.json(performance);
    } catch (error) {
      console.error("Get technician performance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Configuração do multer para upload de arquivos
  const storage_config = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = 'uploads/';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Gerar nome único mantendo a extensão original
      const uniqueName = `ticket_${randomUUID()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });

  // SEGURANÇA: Configuração rigorosa de upload de arquivos
  const upload = multer({ 
    storage: storage_config,
    limits: { 
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 1 // Apenas 1 arquivo por vez
    },
    fileFilter: (req, file, cb) => {
      // SEGURANÇA: Lista restrita de extensões permitidas
      const allowedExtensions = /\.(jpeg|jpg|png|gif|bmp|webp|tiff|pdf|doc|docx|txt|zip|rar|7z|csv|xls|xlsx|ppt|pptx|mp4|avi|mov|mp3|wav)$/i;
      const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
      
      // SEGURANÇA: Lista estrita de MIME types permitidos
      const allowedMimeTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff',
        'application/pdf',
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 
        'text/csv',
        'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
        'video/mp4', 'video/x-msvideo', 'video/quicktime',
        'audio/mpeg', 'audio/wav'
      ];
      
      const mimetype = allowedMimeTypes.includes(file.mimetype);
      
      // SEGURANÇA: Validar nome do arquivo (sem caracteres especiais perigosos)
      const safeFilename = /^[a-zA-Z0-9\s\-_\.]+$/.test(file.originalname);
      
      if (extname && mimetype && safeFilename) {
        return cb(null, true);
      } else {
        cb(new Error('Tipo de arquivo não permitido ou nome de arquivo inválido'));
      }
    }
  });

  // Endpoint de download de arquivos - SEGURANÇA: Protegido
  app.get("/api/files/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      
      // SEGURANÇA: Validar nome do arquivo para prevenir path traversal
      if (!/^[a-zA-Z0-9_\-\.]+$/.test(filename)) {
        return res.status(400).json({ error: "Nome de arquivo inválido" });
      }
      
      const filePath = path.join(process.cwd(), 'uploads', filename);
      
      // SEGURANÇA: Verificar se o arquivo existe e está dentro do diretório uploads
      if (!fs.existsSync(filePath) || !filePath.startsWith(path.join(process.cwd(), 'uploads'))) {
        return res.status(404).json({ error: "Arquivo não encontrado" });
      }
      
      res.sendFile(filePath);
    } catch (error) {
      console.error("Erro ao baixar arquivo");
      res.status(500).json({ error: "Erro ao baixar arquivo" });
    }
  });

  // Endpoint de upload - SEGURANÇA: Requer autenticação
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      const fileExtension = path.extname(req.file.originalname);
      
      // Determinar tipo de arquivo baseado na extensão
      const getFileType = (mimeType: string, extension: string) => {
        const ext = extension.toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) return 'image';
        if (['.pdf'].includes(ext)) return 'pdf';
        if (['.doc', '.docx'].includes(ext)) return 'document';
        if (['.txt'].includes(ext)) return 'text';
        if (['.zip', '.rar', '.7z'].includes(ext)) return 'archive';
        if (['.mp4', '.avi', '.mov', '.wmv'].includes(ext)) return 'video';
        if (['.mp3', '.wav', '.ogg'].includes(ext)) return 'audio';
        return 'unknown';
      };

      // Retornar informações do arquivo
      res.json({
        url: `/api/files/${req.file.filename}`,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        fileType: getFileType(req.file.mimetype, fileExtension),
        extension: fileExtension
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para upload com ticket number
  app.post("/api/upload/:ticketNumber", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      const ticketNumber = req.params.ticketNumber;
      const fileExtension = path.extname(req.file.originalname);
      const newFilename = `ticket_${ticketNumber}_${randomUUID()}${fileExtension}`;
      
      // Verificar se o arquivo foi salvo corretamente pelo multer
      if (!fs.existsSync(req.file.path)) {
        return res.status(500).json({ error: "Erro ao salvar arquivo" });
      }

      try {
        // Mover o arquivo para incluir o número do chamado no nome
        const oldPath = req.file.path;
        const newPath = path.join('uploads', newFilename);
        
        // Copiar o arquivo em vez de apenas renomear para garantir integridade
        fs.copyFileSync(oldPath, newPath);
        
        // Remover o arquivo original apenas após confirmar que a cópia foi bem-sucedida
        if (fs.existsSync(newPath) && fs.statSync(newPath).size > 0) {
          fs.unlinkSync(oldPath);
        } else {
          throw new Error('Falha ao copiar arquivo');
        }
      } catch (moveError) {
        console.error("Erro ao mover anexos:", moveError);
        return res.status(500).json({ error: "Erro ao mover anexos" });
      }

      // Determinar tipo de arquivo baseado na extensão
      const getFileType = (mimeType: string, extension: string) => {
        const ext = extension.toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) return 'image';
        if (['.pdf'].includes(ext)) return 'pdf';
        if (['.doc', '.docx'].includes(ext)) return 'document';
        if (['.txt'].includes(ext)) return 'text';
        if (['.zip', '.rar', '.7z'].includes(ext)) return 'archive';
        if (['.mp4', '.avi', '.mov', '.wmv'].includes(ext)) return 'video';
        if (['.mp3', '.wav', '.ogg'].includes(ext)) return 'audio';
        return 'unknown';
      };

      // Retornar informações do arquivo
      res.json({
        url: `/api/files/${newFilename}`,
        filename: newFilename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        fileType: getFileType(req.file.mimetype, fileExtension),
        extension: fileExtension,
        ticketNumber: ticketNumber
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para buscar anexos de um ticket específico
  app.get("/api/tickets/:ticketNumber/attachments", async (req, res) => {
    try {
      const ticketNumber = req.params.ticketNumber;
      const uploadDir = 'uploads/';
      
      if (!fs.existsSync(uploadDir)) {
        return res.json([]);
      }

      // Buscar arquivos que começam com "ticket_{ticketNumber}_"
      const files = fs.readdirSync(uploadDir);
      const ticketFiles = files.filter(file => 
        file.startsWith(`ticket_${ticketNumber}_`)
      );

      // Função para determinar tipo de arquivo baseado na extensão
      const getFileType = (filename: string) => {
        const ext = path.extname(filename).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) return 'image';
        if (['.pdf'].includes(ext)) return 'pdf';
        if (['.doc', '.docx'].includes(ext)) return 'document';
        if (['.txt'].includes(ext)) return 'text';
        if (['.zip', '.rar', '.7z'].includes(ext)) return 'archive';
        if (['.mp4', '.avi', '.mov', '.wmv'].includes(ext)) return 'video';
        if (['.mp3', '.wav', '.ogg'].includes(ext)) return 'audio';
        return 'unknown';
      };

      const attachments = ticketFiles.map(filename => {
        const filepath = path.join(uploadDir, filename);
        const stats = fs.statSync(filepath);
        const extension = path.extname(filename);
        
        // Extrair nome original removendo prefixo do ticket e UUID, mas mantendo extensão
        const baseNameWithoutPrefix = filename.replace(new RegExp(`^ticket_${ticketNumber}_[a-f0-9-]+`), '');
        const originalName = baseNameWithoutPrefix || `arquivo${extension}`;
        
        return {
          filename,
          url: `/api/files/${filename}`,
          size: stats.size,
          uploadedAt: stats.mtime,
          originalName,
          extension,
          fileType: getFileType(filename),
          mimeType: getMimeTypeFromExtension(extension)
        };
      });

      res.json(attachments);
    } catch (error) {
      console.error("Erro ao buscar anexos:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Função auxiliar para determinar MIME type baseado na extensão
  const getMimeTypeFromExtension = (extension: string) => {
    const ext = extension.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.7z': 'application/x-7z-compressed'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  };

  // Endpoint para download de arquivos (apenas para técnicos e admins)
  app.get("/api/files/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filepath = path.join('uploads', filename);

      // Verificar se o arquivo existe e tem conteúdo
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: "Arquivo não encontrado" });
      }

      const stats = fs.statSync(filepath);
      if (stats.size === 0) {
        return res.status(404).json({ error: "Arquivo vazio" });
      }

      // Verificar permissões (role-based) - permitir usuários para anexos de comentários
      const userRole = req.headers['x-user-role'];
      if (!userRole || !['technician', 'admin', 'user'].includes(userRole as string)) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      // Extrair informações do arquivo
      const extension = path.extname(filename);
      const ticketNumberMatch = filename.match(/^ticket_(\d+)_/);
      const ticketNumber = ticketNumberMatch ? ticketNumberMatch[1] : '';
      
      // Criar nome original baseado no padrão do arquivo
      let originalName = filename.replace(new RegExp(`^ticket_${ticketNumber}_[a-f0-9-]+`), '');
      if (!originalName || originalName === extension) {
        originalName = `anexo-chamado-${ticketNumber}${extension}`;
      }

      // Determinar MIME type correto baseado na extensão
      const getMimeType = (ext: string) => {
        const mimeTypes: { [key: string]: string } = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.bmp': 'image/bmp',
          '.webp': 'image/webp',
          '.tiff': 'image/tiff',
          '.pdf': 'application/pdf',
          '.doc': 'application/msword',
          '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          '.xls': 'application/vnd.ms-excel',
          '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          '.ppt': 'application/vnd.ms-powerpoint',
          '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          '.txt': 'text/plain',
          '.csv': 'text/csv',
          '.zip': 'application/zip',
          '.rar': 'application/x-rar-compressed',
          '.7z': 'application/x-7z-compressed',
          '.mp4': 'video/mp4',
          '.avi': 'video/x-msvideo',
          '.mov': 'video/quicktime',
          '.mp3': 'audio/mpeg',
          '.wav': 'audio/wav'
        };
        return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
      };

      const mimeType = getMimeType(extension);

      // Configurar headers para download
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalName)}"`);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', stats.size.toString());
      res.setHeader('Accept-Ranges', 'bytes');

      // Criar stream de leitura e pipe para response
      const readStream = fs.createReadStream(filepath);
      
      readStream.on('error', (streamError) => {
        console.error("Erro ao ler arquivo:", streamError);
        if (!res.headersSent) {
          res.status(500).json({ error: "Erro ao ler arquivo" });
        }
      });

      readStream.pipe(res);
      
    } catch (error) {
      console.error("Erro no download:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Erro interno do servidor" });
      }
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
