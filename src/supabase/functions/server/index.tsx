import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Hono } from 'https://deno.land/x/hono@v3.12.11/mod.ts'
import { cors } from 'https://deno.land/x/hono@v3.12.11/middleware.ts'
import { logger } from 'https://deno.land/x/hono@v3.12.11/middleware.ts'

console.log("🚀 Helpdesk API Server starting...")

// Get Supabase credentials from environment
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.log('SUPABASE_URL:', supabaseUrl ? 'configured' : 'missing')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'configured' : 'missing')
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key'
)

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', logger(console.log))

// Health check
app.get('/make-server-577f6020/health', async (c) => {
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: {
      url: supabaseUrl ? 'configured' : 'missing',
      service_key: supabaseServiceKey ? 'configured' : 'missing',
      anon_key: supabaseAnonKey ? 'configured' : 'missing'
    }
  }
  
  // Test database connection
  try {
    const { data, error } = await supabase.from('user_profiles').select('id').limit(1)
    status.database = error ? 'error' : 'connected'
  } catch (err) {
    status.database = 'connection_failed'
  }
  
  return c.json(status)
})

// Initialize database tables
app.post('/make-server-577f6020/init', async (c) => {
  try {
    console.log('🔧 Initializing database tables...')

    // Create user_profiles table
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          nome VARCHAR(255) NOT NULL,
          telefone VARCHAR(20),
          departamento VARCHAR(100),
          cargo VARCHAR(100),
          tipo VARCHAR(20) DEFAULT 'usuario' CHECK (tipo IN ('usuario', 'tecnico', 'administrador')),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `
    })

    // Create chamados table
    const { error: chamadosError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS chamados (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          numero VARCHAR(20) UNIQUE NOT NULL,
          solicitante_id UUID REFERENCES auth.users(id),
          problema VARCHAR(500) NOT NULL,
          descricao TEXT,
          prioridade VARCHAR(20) DEFAULT 'Média' CHECK (prioridade IN ('Baixa', 'Média', 'Alta', 'Urgente')),
          status VARCHAR(20) DEFAULT 'Aberto' CHECK (status IN ('Aberto', 'Em Andamento', 'Pendente', 'Resolvido', 'Fechado')),
          tecnico_id UUID REFERENCES auth.users(id),
          solucao_aplicada TEXT,
          tempo_gasto INTEGER DEFAULT 0,
          satisfacao INTEGER CHECK (satisfacao >= 1 AND satisfacao <= 5),
          observacoes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          data_fechamento TIMESTAMP
        );
      `
    })

    // Create mensagens table
    const { error: mensagensError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS chamado_mensagens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          chamado_id UUID REFERENCES chamados(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id),
          mensagem TEXT NOT NULL,
          tipo VARCHAR(20) DEFAULT 'comentario' CHECK (tipo IN ('comentario', 'solucao', 'observacao')),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    })

    // Create departamentos table
    const { error: deptError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS departamentos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nome VARCHAR(100) NOT NULL UNIQUE,
          descricao TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    })

    // Insert default departments if not exist
    const { data: existingDepts } = await supabase
      .from('departamentos')
      .select('id')
      .limit(1)

    if (!existingDepts || existingDepts.length === 0) {
      await supabase
        .from('departamentos')
        .insert([
          { nome: 'TI', descricao: 'Tecnologia da Informação' },
          { nome: 'RH', descricao: 'Recursos Humanos' },
          { nome: 'Financeiro', descricao: 'Departamento Financeiro' },
          { nome: 'Vendas', descricao: 'Departamento de Vendas' },
          { nome: 'Marketing', descricao: 'Departamento de Marketing' },
        ])
    }

    // Create demo users if not exist
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    
    if (!existingUsers.users || existingUsers.users.length === 0) {
      console.log('🔧 Creating demo users...')
      
      // Create admin user
      const { data: adminUser } = await supabase.auth.admin.createUser({
        email: 'admin@helpdesk.com',
        password: '123456',
        email_confirm: true,
        user_metadata: { name: 'João Admin' }
      })

      if (adminUser.user) {
        await supabase.from('user_profiles').insert({
          user_id: adminUser.user.id,
          nome: 'João Admin',
          telefone: '(11) 99999-0001',
          departamento: 'TI',
          cargo: 'Administrador de Sistemas',
          tipo: 'administrador'
        })
      }

      // Create tecnico user
      const { data: tecnicoUser } = await supabase.auth.admin.createUser({
        email: 'tecnico@helpdesk.com',
        password: '123456',
        email_confirm: true,
        user_metadata: { name: 'Maria Técnica' }
      })

      if (tecnicoUser.user) {
        await supabase.from('user_profiles').insert({
          user_id: tecnicoUser.user.id,
          nome: 'Maria Técnica',
          telefone: '(11) 99999-0002',
          departamento: 'TI',
          cargo: 'Técnica de Suporte',
          tipo: 'tecnico'
        })
      }

      // Create client user
      const { data: clientUser } = await supabase.auth.admin.createUser({
        email: 'cliente@helpdesk.com',
        password: '123456',
        email_confirm: true,
        user_metadata: { name: 'Pedro Cliente' }
      })

      if (clientUser.user) {
        await supabase.from('user_profiles').insert({
          user_id: clientUser.user.id,
          nome: 'Pedro Cliente',
          telefone: '(11) 99999-0003',
          departamento: 'Vendas',
          cargo: 'Analista de Vendas',
          tipo: 'usuario'
        })
      }
    }

    console.log('✅ Database initialized successfully')
    return c.json({ 
      success: true, 
      message: 'Database initialized successfully',
      errors: {
        profiles: profilesError?.message,
        chamados: chamadosError?.message,
        mensagens: mensagensError?.message,
        departamentos: deptError?.message
      }
    })

  } catch (error) {
    console.error("❌ Error initializing database:", error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Register new user
app.post('/make-server-577f6020/auth/register', async (c) => {
  try {
    const { email, password, userData } = await c.req.json()
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      return c.json({ error: authError.message }, 400)
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        ...userData
      })

    if (profileError) {
      return c.json({ error: profileError.message }, 400)
    }

    return c.json({ user: authData.user })
  } catch (error) {
    console.error('Register error:', error)
    return c.json({ error: 'Erro interno do servidor' }, 500)
  }
})

// Get user profile
app.get('/make-server-577f6020/auth/profile', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return c.json({ user: { ...user, profile } })
  } catch (error) {
    console.error('Profile error:', error)
    return c.json({ error: 'Erro interno do servidor' }, 500)
  }
})

// List chamados
app.get('/make-server-577f6020/chamados', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Get user profile to determine access level
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tipo')
      .eq('user_id', user.id)
      .single()

    let query = supabase
      .from('chamados')
      .select(`
        *,
        solicitante:user_profiles!chamados_solicitante_id_fkey(*),
        tecnico:user_profiles!chamados_tecnico_id_fkey(*)
      `)

    // Filter based on user type
    const filter = c.req.query('filter')
    if (profile?.tipo === 'usuario') {
      query = query.eq('solicitante_id', user.id)
    } else if (profile?.tipo === 'tecnico') {
      if (filter === 'meus') {
        query = query.eq('tecnico_id', user.id)
      } else if (filter === 'disponiveis') {
        query = query.is('tecnico_id', null).eq('status', 'Aberto')
      }
    }

    const { data: chamados, error: chamadosError } = await query
      .order('created_at', { ascending: false })

    if (chamadosError) {
      return c.json({ error: chamadosError.message }, 400)
    }

    return c.json(chamados)
  } catch (error) {
    console.error('List chamados error:', error)
    return c.json({ error: 'Erro interno do servidor' }, 500)
  }
})

// Create chamado
app.post('/make-server-577f6020/chamados', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const chamadoData = await c.req.json()

    // Generate ticket number
    const { count } = await supabase
      .from('chamados')
      .select('*', { count: 'exact' })

    const numero = `HD-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(3, '0')}`

    const { data: chamado, error: chamadoError } = await supabase
      .from('chamados')
      .insert({
        numero,
        solicitante_id: user.id,
        ...chamadoData
      })
      .select(`
        *,
        solicitante:user_profiles!chamados_solicitante_id_fkey(*),
        tecnico:user_profiles!chamados_tecnico_id_fkey(*)
      `)
      .single()

    if (chamadoError) {
      return c.json({ error: chamadoError.message }, 400)
    }

    return c.json(chamado)
  } catch (error) {
    console.error('Create chamado error:', error)
    return c.json({ error: 'Erro interno do servidor' }, 500)
  }
})

// Update chamado
app.patch('/make-server-577f6020/chamados/:id', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const chamadoId = c.req.param('id')
    const updates = await c.req.json()

    // Add timestamp for resolution
    if (updates.status === 'Resolvido' || updates.status === 'Fechado') {
      updates.data_fechamento = new Date().toISOString()
    }

    const { data: chamado, error: updateError } = await supabase
      .from('chamados')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', chamadoId)
      .select(`
        *,
        solicitante:user_profiles!chamados_solicitante_id_fkey(*),
        tecnico:user_profiles!chamados_tecnico_id_fkey(*)
      `)
      .single()

    if (updateError) {
      return c.json({ error: updateError.message }, 400)
    }

    return c.json(chamado)
  } catch (error) {
    console.error('Update chamado error:', error)
    return c.json({ error: 'Erro interno do servidor' }, 500)
  }
})

// Add message to chamado
app.post('/make-server-577f6020/chamados/:id/mensagens', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const chamadoId = c.req.param('id')
    const { mensagem, tipo = 'comentario' } = await c.req.json()

    const { data: novaMensagem, error: mensagemError } = await supabase
      .from('chamado_mensagens')
      .insert({
        chamado_id: chamadoId,
        user_id: user.id,
        mensagem,
        tipo
      })
      .select(`
        *,
        user:user_profiles!chamado_mensagens_user_id_fkey(*)
      `)
      .single()

    if (mensagemError) {
      return c.json({ error: mensagemError.message }, 400)
    }

    return c.json(novaMensagem)
  } catch (error) {
    console.error('Add message error:', error)
    return c.json({ error: 'Erro interno do servidor' }, 500)
  }
})

// Get messages for chamado
app.get('/make-server-577f6020/chamados/:id/mensagens', async (c) => {
  try {
    const chamadoId = c.req.param('id')

    const { data: mensagens, error: mensagensError } = await supabase
      .from('chamado_mensagens')
      .select(`
        *,
        user:user_profiles!chamado_mensagens_user_id_fkey(*)
      `)
      .eq('chamado_id', chamadoId)
      .order('created_at', { ascending: true })

    if (mensagensError) {
      return c.json({ error: mensagensError.message }, 400)
    }

    return c.json(mensagens)
  } catch (error) {
    console.error('Get messages error:', error)
    return c.json({ error: 'Erro interno do servidor' }, 500)
  }
})

// Get dashboard metrics
app.get('/make-server-577f6020/dashboard/metricas', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tipo')
      .eq('user_id', user.id)
      .single()

    // General metrics
    const { count: totalChamados } = await supabase
      .from('chamados')
      .select('*', { count: 'exact' })

    const { count: chamadosAbertos } = await supabase
      .from('chamados')
      .select('*', { count: 'exact' })
      .in('status', ['Aberto', 'Em Andamento', 'Pendente'])

    const { count: chamadosResolvidosHoje } = await supabase
      .from('chamados')
      .select('*', { count: 'exact' })
      .eq('status', 'Resolvido')
      .gte('data_fechamento', new Date().toISOString().split('T')[0])

    // Technician specific metrics
    let meusChamados = 0
    let meusChamadosAbertos = 0
    let minhasSatisfacoes = []

    if (profile?.tipo === 'tecnico') {
      const { count } = await supabase
        .from('chamados')
        .select('*', { count: 'exact' })
        .eq('tecnico_id', user.id)
      meusChamados = count || 0

      const { count: abertos } = await supabase
        .from('chamados')
        .select('*', { count: 'exact' })
        .eq('tecnico_id', user.id)
        .in('status', ['Aberto', 'Em Andamento', 'Pendente'])
      meusChamadosAbertos = abertos || 0

      const { data: satisfacoes } = await supabase
        .from('chamados')
        .select('satisfacao')
        .eq('tecnico_id', user.id)
        .not('satisfacao', 'is', null)
      
      minhasSatisfacoes = satisfacoes?.map(s => s.satisfacao) || []
    }

    const metricas = {
      totalChamados: totalChamados || 0,
      chamadosAbertos: chamadosAbertos || 0,
      chamadosResolvidosHoje: chamadosResolvidosHoje || 0,
      tempoMedioResolucao: 42, // Calculate from real data
      satisfacaoMedia: 4.2, // Calculate from real data
      meusChamados,
      meusChamadosAbertos,
      minhaSatisfacaoMedia: minhasSatisfacoes.length > 0 
        ? minhasSatisfacoes.reduce((a, b) => a + b, 0) / minhasSatisfacoes.length 
        : 0
    }

    return c.json(metricas)
  } catch (error) {
    console.error('Metrics error:', error)
    return c.json({ error: 'Erro interno do servidor' }, 500)
  }
})

// List users (admin only)
app.get('/make-server-577f6020/users', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tipo')
      .eq('user_id', user.id)
      .single()

    if (profile?.tipo !== 'administrador') {
      return c.json({ error: 'Forbidden' }, 403)
    }

    const { data: users } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    return c.json(users)
  } catch (error) {
    console.error('List users error:', error)
    return c.json({ error: 'Erro interno do servidor' }, 500)
  }
})

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err)
  return c.json({ error: err.message }, 500)
})

console.log('✅ Server routes configured')
serve(app.fetch)