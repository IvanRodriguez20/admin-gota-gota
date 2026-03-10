import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const API = process.env.NEXT_PUBLIC_API_URL || 'https://backend-gota-gota-final-production.up.railway.app'

// Todas las peticiones admin llevan x-tenant-id
function headers(tenantId?: string) {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (tenantId) h['x-tenant-id'] = tenantId
  return h
}

export const api = {
  async getStats(tenantId?: string) {
    const [cols, clientes, creditos] = await Promise.all([
      fetch(`${API}/colaboradores`, { headers: headers(tenantId) }).then(r => r.json()),
      fetch(`${API}/clientes`, { headers: headers(tenantId) }).then(r => r.json()),
      fetch(`${API}/creditos`, { headers: headers(tenantId) }).then(r => r.json()),
    ])
    return { colaboradores: cols, clientes, creditos }
  },

  async getColaboradores(tenantId?: string) {
    return fetch(`${API}/colaboradores`, { headers: headers(tenantId) }).then(r => r.json())
  },
  async createColaborador(data: any) {
    return fetch(`${API}/colaboradores`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json())
  },
  async updateColaborador(id: string, data: any) {
    return fetch(`${API}/colaboradores/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json())
  },

  async getClientes(tenantId?: string) {
    return fetch(`${API}/clientes`, { headers: headers(tenantId) }).then(r => r.json())
  },
  async createCliente(data: any, tenantId?: string) {
    return fetch(`${API}/clientes`, {
      method: 'POST', headers: headers(tenantId),
      body: JSON.stringify({ ...data, tenant_id: tenantId }),
    }).then(r => r.json())
  },

  async getCreditos(tenantId?: string) {
    return fetch(`${API}/creditos`, { headers: headers(tenantId) }).then(r => r.json())
  },
}
