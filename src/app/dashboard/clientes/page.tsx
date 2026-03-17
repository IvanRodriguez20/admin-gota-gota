'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getColaboradorByUserId, getClientesByColaborador } from '@/lib/api'
import { useTenant } from '@/lib/tenant-context'

export default function ClientesPage() {
  const router = useRouter()
  const tenantId = useTenant()
  const [clientes, setClientes] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const col = await getColaboradorByUserId(session.user.id, tenantId)
      if (!col) { setLoading(false); return }
      const data = await getClientesByColaborador(col.id, tenantId)
      setClientes(data); setFiltered(data); setLoading(false)
    }
    load()
  }, [tenantId])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(clientes.filter(c =>
      c.nombre.toLowerCase().includes(q) || c.cedula.includes(q) || c.celular.includes(q)
    ))
  }, [search, clientes])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold">Clientes</h1>
          <p className="text-xs lg:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{clientes.length} clientes registrados</p>
        </div>
        <button onClick={() => router.push('/dashboard/clientes/nuevo')} className="btn-primary px-4 py-2 text-xs lg:text-sm">
          + Nuevo cliente
        </button>
      </div>

      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>🔍</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, cédula o celular..."
          className="input-field w-full pl-10 pr-4 py-3 text-sm" />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center"><p style={{ color: 'var(--text-muted)' }}>No se encontraron clientes</p></div>
      ) : (
        <>
          {/* MOBILE */}
          <div className="lg:hidden space-y-3">
            {filtered.map(c => (
              <div key={c.id} className="card p-4 cursor-pointer" onClick={() => router.push(`/dashboard/clientes/${c.id}`)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                      style={{ background: 'var(--surface-4)', color: 'var(--brand)' }}>
                      {c.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{c.nombre}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>CC {c.cedula} · {c.celular}</p>
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>›</span>
                </div>
              </div>
            ))}
          </div>
          {/* DESKTOP */}
          <div className="hidden lg:block card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Nombre', 'Cédula', 'Celular', 'Dirección', 'Registro', ''].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'var(--surface-4)', color: 'var(--brand)' }}>{c.nombre.charAt(0)}</div>
                        <span className="text-sm font-medium">{c.nombre}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{c.cedula}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>{c.celular}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>{c.direccion || '—'}</td>
                    <td className="px-5 py-4 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleDateString('es-CO')}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => router.push(`/dashboard/clientes/${c.id}`)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium"
                        style={{ background: 'var(--surface-4)', color: 'var(--brand)', border: '1px solid var(--border)' }}>
                        Ver info
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
