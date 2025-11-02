import nodemailer from 'nodemailer';
import type { Ticket, User } from '@shared/schema';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'suporte@empresa.com';
    this.initializeTransporter();
  }

  // Função para escapar HTML e prevenir injeção
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  private initializeTransporter() {
    try {
      // Debug: Mostrar quais variáveis estão disponíveis (sem expor senhas)
      console.log('🔧 Inicializando EmailService...');
      console.log('📧 EMAIL_FROM:', process.env.EMAIL_FROM || 'NÃO CONFIGURADO');
      console.log('🌐 SMTP_HOST:', process.env.SMTP_HOST || 'NÃO CONFIGURADO');
      console.log('🔌 SMTP_PORT:', process.env.SMTP_PORT || 'NÃO CONFIGURADO');
      console.log('🔒 SMTP_SECURE:', process.env.SMTP_SECURE || 'NÃO CONFIGURADO');
      console.log('👤 SMTP_USER:', process.env.SMTP_USER || 'NÃO CONFIGURADO');
      console.log('🔑 SMTP_PASS:', process.env.SMTP_PASS ? '***CONFIGURADO***' : 'NÃO CONFIGURADO');

      // Configuração usando variáveis de ambiente
      const config: EmailConfig = {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      };

      // Se não tiver configuração SMTP, criar um transporter de teste
      if (!process.env.SMTP_HOST) {
        console.log('⚠️ Nenhuma configuração SMTP encontrada. Usando modo de teste (emails não serão enviados).');
        console.log('💡 Para configurar emails, adicione as variáveis SMTP_HOST, SMTP_USER, SMTP_PASS no .env');
        this.transporter = nodemailer.createTransport({
          streamTransport: true,
          newline: 'unix',
          buffer: true
        });
      } else {
        console.log('✅ Configuração SMTP encontrada. Inicializando transporter real...');
        console.log(`📬 Servidor: ${config.host}:${config.port} (Secure: ${config.secure})`);
        this.transporter = nodemailer.createTransport(config);
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar transporter de email:', error);
      // Criar um transporter de teste em caso de erro
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    }
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.transporter) {
      console.error('Transporter de email não inicializado');
      return false;
    }

    try {
      const mailOptions = {
        from: this.fromEmail,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Email enviado:', info.messageId);
        console.log('Preview:', nodemailer.getTestMessageUrl(info) || 'N/A');
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return false;
    }
  }

  // Notificação de criação de ticket para o usuário
  async sendTicketCreatedNotification(ticket: Ticket): Promise<boolean> {
    const priorityLabels: Record<string, string> = { 'low': 'Baixa', 'medium': 'Média', 'high': 'Alta' };
    const statusLabels: Record<string, string> = { 'waiting': 'Aguardando', 'open': 'Aberto', 'in_progress': 'Em Andamento', 'resolved': 'Resolvido' };
    
    const subject = `✅ Chamado #${ticket.ticketNumber} criado com sucesso`;
    
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ Chamado Criado</h1>
          <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 16px;">Sistema de Helpdesk</p>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb;">
          <p style="font-size: 16px; color: #1f2937; margin: 0 0 20px 0;">
            Olá <strong style="color: #2563eb;">${this.escapeHtml(ticket.requesterName)}</strong>,
          </p>
          
          <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
            Seu chamado foi registrado com sucesso em nosso sistema! Nossa equipe técnica foi notificada e em breve um técnico irá atender sua solicitação.
          </p>
          
          <div style="background-color: #ffffff; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px;">📋 Detalhes do Chamado</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px; width: 40%;">Número:</td>
                <td style="padding: 10px 0; color: #1f2937; font-weight: bold; font-size: 16px;">#${ticket.ticketNumber}</td>
              </tr>
              <tr style="background-color: #f9fafb;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Título:</td>
                <td style="padding: 10px 0; color: #1f2937; font-weight: 600;">${this.escapeHtml(ticket.title)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Setor:</td>
                <td style="padding: 10px 0; color: #1f2937;"><span style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 500;">${this.escapeHtml(ticket.sector)}</span></td>
              </tr>
              <tr style="background-color: #f9fafb;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Tipo:</td>
                <td style="padding: 10px 0; color: #1f2937;">${this.escapeHtml(ticket.problemType)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Prioridade:</td>
                <td style="padding: 10px 0;"><span style="background-color: ${ticket.priority === 'high' ? '#fecaca' : ticket.priority === 'medium' ? '#fed7aa' : '#fef3c7'}; color: ${ticket.priority === 'high' ? '#991b1b' : ticket.priority === 'medium' ? '#92400e' : '#78350f'}; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">${priorityLabels[ticket.priority] || ticket.priority}</span></td>
              </tr>
              <tr style="background-color: #f9fafb;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Status:</td>
                <td style="padding: 10px 0;"><span style="background-color: #fef3c7; color: #78350f; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">${statusLabels[ticket.status] || ticket.status}</span></td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bfdbfe;">
            <h4 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">📬 Você receberá notificações quando:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
              <li style="margin: 8px 0;">Um técnico aceitar e assumir seu chamado</li>
              <li style="margin: 8px 0;">Houver novos comentários ou atualizações</li>
              <li style="margin: 8px 0;">O status do chamado for alterado</li>
              <li style="margin: 8px 0;">Seu chamado for resolvido</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0 20px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">Obrigado por utilizar nosso sistema de suporte!</p>
          </div>
        </div>
        
        <div style="background-color: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Esta é uma mensagem automática do Sistema de Helpdesk.<br>
            Por favor, não responda diretamente a este email.
          </p>
        </div>
      </div>
    `;
    
    return await this.sendEmail(ticket.userEmail, subject, html);
  }

  // Notificação de novo chamado para técnicos e administradores
  async sendNewTicketToStaffNotification(ticket: Ticket, staffEmails: string[]): Promise<boolean> {
    if (staffEmails.length === 0) {
      console.log('Nenhum email de staff para notificar');
      return false;
    }

    const priorityLabels: Record<string, string> = { 'low': 'Baixa', 'medium': 'Média', 'high': 'Alta' };
    const priorityColors: Record<string, string> = { 'low': '#10b981', 'medium': '#f59e0b', 'high': '#ef4444' };
    const priorityColor = priorityColors[ticket.priority] || '#6b7280';
    
    const subject = `🔔 Novo Chamado #${ticket.ticketNumber} - ${ticket.sector}`;
    
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔔 Novo Chamado Aberto</h1>
          <p style="color: #bbf7d0; margin: 10px 0 0 0; font-size: 16px;">Ação necessária da equipe técnica</p>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb;">
          <div style="background-color: ${ticket.priority === 'high' ? '#fee2e2' : '#eff6ff'}; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 5px solid ${priorityColor};">
            <p style="margin: 0; color: #1f2937; font-size: 15px;">
              <strong>Um novo chamado foi aberto e precisa de atenção!</strong>
              ${ticket.priority === 'high' ? '<br><span style="color: #dc2626; font-weight: bold;">⚠️ PRIORIDADE ALTA</span>' : ''}
            </p>
          </div>
          
          <div style="background-color: #ffffff; padding: 25px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">📋 Informações do Chamado</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px; width: 35%;">Número:</td>
                <td style="padding: 12px 0; color: #1f2937; font-weight: bold; font-size: 18px;">#${ticket.ticketNumber}</td>
              </tr>
              <tr style="background-color: #f9fafb;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Solicitante:</td>
                <td style="padding: 12px 0; color: #1f2937; font-weight: 600;">${this.escapeHtml(ticket.requesterName)}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Email:</td>
                <td style="padding: 12px 0; color: #2563eb;">${this.escapeHtml(ticket.userEmail)}</td>
              </tr>
              <tr style="background-color: #f9fafb;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Setor:</td>
                <td style="padding: 12px 0;"><span style="background-color: #dbeafe; color: #1e40af; padding: 5px 15px; border-radius: 12px; font-size: 14px; font-weight: 600;">${this.escapeHtml(ticket.sector)}</span></td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Tipo de Problema:</td>
                <td style="padding: 12px 0; color: #1f2937; font-weight: 500;">${this.escapeHtml(ticket.problemType)}</td>
              </tr>
              <tr style="background-color: #f9fafb;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Prioridade:</td>
                <td style="padding: 12px 0;"><span style="background-color: ${ticket.priority === 'high' ? '#fecaca' : ticket.priority === 'medium' ? '#fed7aa' : '#fef3c7'}; color: ${ticket.priority === 'high' ? '#991b1b' : ticket.priority === 'medium' ? '#92400e' : '#78350f'}; padding: 5px 15px; border-radius: 12px; font-size: 14px; font-weight: bold;">${priorityLabels[ticket.priority] || ticket.priority}</span></td>
              </tr>
            </table>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #e5e7eb;">
            <h4 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px;">📝 Título do Chamado:</h4>
            <p style="color: #1f2937; font-size: 15px; font-weight: 600; margin: 0 0 15px 0;">${this.escapeHtml(ticket.title)}</p>
            
            <h4 style="color: #1f2937; margin: 15px 0 12px 0; font-size: 16px;">📄 Descrição:</h4>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${this.escapeHtml(ticket.description)}</p>
          </div>
          
          <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #86efac;">
            <h4 style="color: #15803d; margin: 0 0 12px 0; font-size: 16px;">👉 Próximos Passos:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #166534;">
              <li style="margin: 8px 0;">Acesse o sistema de helpdesk para visualizar todos os detalhes</li>
              <li style="margin: 8px 0;">Aceite o chamado para iniciar o atendimento</li>
              <li style="margin: 8px 0;">Mantenha o solicitante informado através de comentários</li>
              <li style="margin: 8px 0;">Atualize o status conforme o progresso</li>
            </ul>
          </div>
        </div>
        
        <div style="background-color: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Notificação automática do Sistema de Helpdesk<br>
            Acesse o sistema para gerenciar este chamado
          </p>
        </div>
      </div>
    `;
    
    // Enviar para todos os emails de staff
    const sendPromises = staffEmails.map(email => this.sendEmail(email, subject, html));
    const results = await Promise.allSettled(sendPromises);
    
    // Verificar se pelo menos um email foi enviado com sucesso
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    console.log(`Emails enviados para equipe técnica: ${successCount}/${staffEmails.length}`);
    
    return successCount > 0;
  }

  // Notificação de atribuição de ticket
  async sendTicketAssignedNotification(ticket: Ticket, technician: User): Promise<boolean> {
    const subject = `Chamado #${ticket.ticketNumber} foi aceito por um técnico`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Chamado Aceito!</h2>
        
        <p>Olá <strong>${this.escapeHtml(ticket.requesterName)}</strong>,</p>
        
        <p>Ótimas notícias! Seu chamado foi aceito por um técnico e já está sendo trabalhado.</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h3>Informações do Chamado</h3>
          <p><strong>Número:</strong> #${ticket.ticketNumber}</p>
          <p><strong>Título:</strong> ${this.escapeHtml(ticket.title)}</p>
          <p><strong>Técnico Responsável:</strong> ${this.escapeHtml(technician.name)}</p>
          <p><strong>Status:</strong> Em andamento</p>
        </div>
        
        <h3>Próximos passos:</h3>
        <ul>
          <li>O técnico <strong>${this.escapeHtml(technician.name)}</strong> irá trabalhar na resolução do seu problema</li>
          <li>Você pode acompanhar o progresso na aba de "Comentários" do sistema</li>
          <li>Receberá notificações por email sobre atualizações importantes</li>
        </ul>
        
        <p>Se tiver alguma dúvida adicional, você pode adicionar comentários no sistema de tickets.</p>
        
        <p>Obrigado pela sua paciência!</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          Esta é uma mensagem automática. Por favor, não responda diretamente a este email.
        </p>
      </div>
    `;
    
    return await this.sendEmail(ticket.userEmail, subject, html);
  }

  // Notificação de novo comentário
  async sendCommentAddedNotification(ticket: Ticket, authorName: string): Promise<boolean> {
    const subject = `Nova atualização no chamado #${ticket.ticketNumber}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Nova Atualização no Seu Chamado</h2>
        
        <p>Olá <strong>${this.escapeHtml(ticket.requesterName)}</strong>,</p>
        
        <p>Houve uma nova atualização no seu chamado. Confira os detalhes abaixo:</p>
        
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <h3>Chamado Atualizado</h3>
          <p><strong>Número:</strong> #${ticket.ticketNumber}</p>
          <p><strong>Título:</strong> ${this.escapeHtml(ticket.title)}</p>
          <p><strong>Atualizado por:</strong> ${this.escapeHtml(authorName)}</p>
          <p><strong>Status atual:</strong> ${this.escapeHtml(ticket.status)}</p>
        </div>
        
        <h3>Como verificar a atualização:</h3>
        <ol>
          <li>Acesse o sistema de tickets</li>
          <li>Encontre seu chamado #${ticket.ticketNumber}</li>
          <li>Vá até a aba de "Comentários"</li>
          <li>Confira a nova mensagem ou atualização</li>
        </ol>
        
        <p>É importante acompanhar as atualizações para estar sempre informado sobre o progresso da resolução do seu problema.</p>
        
        <p>Obrigado por utilizar nosso sistema de suporte!</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          Esta é uma mensagem automática. Por favor, não responda diretamente a este email.
        </p>
      </div>
    `;
    
    return await this.sendEmail(ticket.userEmail, subject, html);
  }

  // Notificação de mudança de prioridade
  async sendPriorityChangedNotification(ticket: Ticket, newPriority: string, updatedBy: string): Promise<boolean> {
    const priorityLabels: Record<string, string> = {
      'low': 'Baixa',
      'medium': 'Média', 
      'high': 'Alta'
    };

    const priorityColors: Record<string, string> = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444'
    };

    // Proteção contra valores desconhecidos
    const safeLabel = priorityLabels[newPriority] || 'Não definida';
    const safeColor = priorityColors[newPriority] || '#6b7280';

    const subject = `Prioridade do chamado #${ticket.ticketNumber} foi alterada`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${safeColor};">Prioridade Alterada</h2>
        
        <p>Olá <strong>${this.escapeHtml(ticket.requesterName)}</strong>,</p>
        
        <p>A prioridade do seu chamado foi alterada por nossa equipe técnica.</p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${safeColor};">
          <h3>Detalhes da Alteração</h3>
          <p><strong>Número do Chamado:</strong> #${ticket.ticketNumber}</p>
          <p><strong>Título:</strong> ${this.escapeHtml(ticket.title)}</p>
          <p><strong>Nova Prioridade:</strong> <span style="color: ${safeColor}; font-weight: bold;">${safeLabel}</span></p>
          <p><strong>Alterado por:</strong> ${this.escapeHtml(updatedBy)}</p>
        </div>
        
        <h3>O que isso significa:</h3>
        <ul>
          ${newPriority === 'high' ? 
            '<li style="color: #ef4444;"><strong>Alta Prioridade:</strong> Seu chamado será tratado com urgência pela nossa equipe</li>' :
            newPriority === 'medium' ?
            '<li style="color: #f59e0b;"><strong>Prioridade Média:</strong> Seu chamado será tratado dentro do prazo normal</li>' :
            newPriority === 'low' ?
            '<li style="color: #10b981;"><strong>Baixa Prioridade:</strong> Seu chamado será tratado conforme disponibilidade da equipe</li>' :
            '<li style="color: #6b7280;"><strong>Prioridade Personalizada:</strong> Seu chamado será tratado conforme definido pela equipe</li>'
          }
          <li>Você continuará recebendo atualizações sobre o progresso</li>
          <li>A mudança de prioridade não afeta a qualidade do atendimento</li>
        </ul>
        
        <p>Continue acompanhando seu chamado através da aba de comentários no sistema.</p>
        
        <p>Obrigado por utilizar nosso sistema de suporte!</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          Esta é uma mensagem automática. Por favor, não responda diretamente a este email.
        </p>
      </div>
    `;
    
    return await this.sendEmail(ticket.userEmail, subject, html);
  }

  // Notificação de finalização de chamado  
  async sendTicketResolvedNotification(ticket: Ticket, resolvedBy: string): Promise<boolean> {
    const subject = `Chamado #${ticket.ticketNumber} foi finalizado`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">🎉 Chamado Finalizado!</h2>
        
        <p>Olá <strong>${this.escapeHtml(ticket.requesterName)}</strong>,</p>
        
        <p>Temos uma ótima notícia! Seu chamado foi finalizado com sucesso pela nossa equipe técnica.</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h3>Chamado Resolvido ✅</h3>
          <p><strong>Número:</strong> #${ticket.ticketNumber}</p>
          <p><strong>Título:</strong> ${this.escapeHtml(ticket.title)}</p>
          <p><strong>Finalizado por:</strong> ${this.escapeHtml(resolvedBy)}</p>
          <p><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">Resolvido</span></p>
        </div>
        
        <h3>Próximos passos:</h3>
        <ul>
          <li>✅ Verifique se o problema foi totalmente solucionado</li>
          <li>📋 Acesse o sistema para ver os detalhes da resolução</li>
          <li>💬 Confira os comentários finais da equipe técnica</li>
          <li>📞 Entre em contato conosco se ainda houver algum problema</li>
        </ul>
        
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #2563eb;">Avaliação do Atendimento</h4>
          <p>Sua opinião é muito importante para nós! Se possível, avalie nosso atendimento através do sistema.</p>
        </div>
        
        <p>Obrigado por utilizar nosso sistema de suporte. Estamos sempre aqui para ajudá-lo!</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          Esta é uma mensagem automática. Por favor, não responda diretamente a este email.
        </p>
      </div>
    `;
    
    return await this.sendEmail(ticket.userEmail, subject, html);
  }

  // Verificar se o serviço de email está configurado
  isConfigured(): boolean {
    return !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;
  }

  // Testar conexão de email
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Erro na verificação do email:', error);
      return false;
    }
  }
}

// Instância singleton do serviço de email
export const emailService = new EmailService();