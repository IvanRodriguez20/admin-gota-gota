'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function ClientesAdminPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<any[]>([])
  const [cobradores, setCobradores] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filtroCobrador, setFiltroCobrador] = useState('todos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getClientes(), api.getColaboradores()]).then(([c, cols]) => {
      setClientes(c); setCobradores(cols); setFiltered(c); setLoading(false)
    })
  }, [])

  useEffect(() => {
    let result = clientes
    if (filtroCobrador !== 'todos') result = result.filter(c => c.colaborador_id === filtroCobrador)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.nombre.toLowerCase().includes(q) || c.cedula.includes(q) || c.celular.includes(q)
      )
    }
    setFiltered(result)
  }, [search, filtroCobrador, clientes])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
    </div>
  )

  const getCobrador = (id: string) => cobradores.find(c => c.id === id)

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold">Clientes</h1>
          <p className="text-xs lg:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{clientes.length} clientes en total</p>
        </div>
        <button onClick={() => router.push('/dashboard/clientes/nuevo')}
          className="btn-primary px-4 py-2 text-xs lg:text-sm">
          + Nuevo cliente
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, cédula o celular..."
            className="input-field w-full pl-10 pr-4 py-3 text-sm" />
        </div>
        <select value={filtroCobrador} onChange={e => setFiltroCobrador(e.target.value)}
          className="input-field px-4 py-3 text-sm" style={{ minWidth: '180px' }}>
          <option value="todos">Todos los cobradores</option>
          {cobradores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      {/* MOBILE */}
      <div className="lg:hidden space-y-3">
        {filtered.map(c => {
          const cobrador = getCobrador(c.colaborador_id)
          return (
            <div key={c.id} className="card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ background: 'var(--surface-4)', color: '#60a5fa' }}>
                  {c.nombre.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{c.nombre}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>CC {c.cedula} · {c.celular}</p>
                </div>
              </div>
              {cobrador && (
                <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Cobrador:</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--brand)' }}>{cobrador.nombre}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:block card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Cliente', 'Cédula', 'Celular', 'Dirección', 'Cobrador asignado'].map(h => (
                <th key={h} className="text-left px-5 py-4 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const cobrador = getCobrador(c.colaborador_id)
              return (
                <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'var(--surface-4)', color: '#60a5fa' }}>
                        {c.nombre.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{c.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{c.cedula}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>{c.celular}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>{c.direccion || '—'}</td>
                  <td className="px-5 py-4">
                    {cobrador ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'var(--surface-4)', color: 'var(--brand)' }}>
                          {cobrador.nombre.charAt(0)}
                        </div>
                        <span className="text-sm">{cobrador.nombre}</span>
                      </div>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
