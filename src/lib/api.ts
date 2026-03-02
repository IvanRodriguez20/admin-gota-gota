import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const API = process.env.NEXT_PUBLIC_API_URL || 'https://backend-gota-gota-final-production.up.railway.app'

export const api = {
  // Stats
  async getStats() {
    const [cols, clientes, creditos] = await Promise.all([
      fetch(`${API}/colaboradores`).then(r => r.json()),
      fetch(`${API}/clientes`).then(r => r.json()),
      fetch(`${API}/creditos`).then(r => r.json()),
    ])
    return { colaboradores: cols, clientes, creditos }
  },

  // Colaboradores
  async getColaboradores() {
    return fetch(`${API}/colaboradores`).then(r => r.json())
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

  // Clientes
  async getClientes() {
    return fetch(`${API}/clientes`).then(r => r.json())
  },
  async getClientesByColaborador(id: string) {
    return fetch(`${API}/clientes/colaborador/${id}`).then(r => r.json())
  },
  async createCliente(data: any) {
    return fetch(`${API}/clientes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json())
  },

  // Creditos
  async getCreditos() {
    return fetch(`${API}/creditos`).then(r => r.json())
  },
  async getCreditosByCliente(id: string) {
    return fetch(`${API}/creditos/cliente/${id}`).then(r => r.json())
  },
  async getCreditosByColaborador(id: string) {
    return fetch(`${API}/creditos/colaborador/${id}`).then(r => r.json())
  },
}
