'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getColaboradorByUserId, getCreditosByColaborador } from '@/lib/api'
import { useTenant } from '@/lib/tenant-context'

export default function CreditosPage() {
  const router = useRouter()
  const tenantId = useTenant()
  const [creditos, setCreditos] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const col = await getColaboradorByUserId(session.user.id, tenantId)
      if (!col) { setLoading(false); return }
      const data = await getCreditosByColaborador(col.id, tenantId)
      setCreditos(data); setFiltered(data); setLoading(false)
    }
    load()
  }, [tenantId])

  useEffect(() => {
    let result = creditos
    if (filtroEstado !== 'todos') result = result.filter(c => c.estado === filtroEstado)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c => c.clientes?.nombre?.toLowerCase().includes(q) || c.clientes?.cedula?.includes(q))
    }
    setFiltered(result)
  }, [search, filtroEstado, creditos])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} /></div>

  const pendientes = creditos.filter(c => c.estado === 'pendiente').length
  const pagados = creditos.filter(c => c.estado === 'pagado').length

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold">Créditos</h1>
          <p className="text-xs lg:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{creditos.length} créditos en total</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={() => router.push('/dashboard/creditos/nuevo')} className="btn-primary px-4 py-2 text-xs lg:text-sm">
            + Nuevo crédito
          </button>
          <div className="flex gap-2">
            <div className="card px-3 py-2 text-center">
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Pendientes</p>
              <p className="font-bold text-sm" style={{ color: '#FFA500' }}>{pendientes}</p>
            </div>
            <div className="card px-3 py-2 text-center">
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Pagados</p>
              <p className="font-bold text-sm" style={{ color: 'var(--brand)' }}>{pagados}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mb-3">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>🔍</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por cliente..." className="input-field w-full pl-10 pr-4 py-3 text-sm" />
      </div>
      <div className="flex gap-2 mb-4">
        {['todos', 'pendiente', 'pagado'].map(estado => (
          <button key={estado} onClick={() => setFiltroEstado(estado)}
            className="flex-1 lg:flex-none px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium capitalize transition-all"
            style={{
              background: filtroEstado === estado ? 'rgba(0,229,160,0.1)' : 'var(--surface-2)',
              color: filtroEstado === estado ? 'var(--brand)' : 'var(--text-muted)',
              border: filtroEstado === estado ? '1px solid rgba(0,229,160,0.2)' : '1px solid var(--border)',
            }}>{estado}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center"><p style={{ color: 'var(--text-muted)' }}>No se encontraron créditos</p></div>
      ) : (
        <>
          <div className="lg:hidden space-y-3">
            {filtered.map(cr => (
              <div key={cr.id} className="card p-4 cursor-pointer" onClick={() => router.push(`/dashboard/creditos/${cr.id}`)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{cr.clientes?.nombre || '—'}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${cr.estado === 'pagado' ? 'badge-pagado' : 'badge-pendiente'}`}>{cr.estado}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>Prestado: <strong style={{ color: 'var(--text)' }}>${Number(cr.monto_prestado).toLocaleString('es-CO')}</strong></span>
                  <span>Total: <strong style={{ color: 'var(--brand)' }}>${Number(cr.monto_total).toLocaleString('es-CO')}</strong></span>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:block card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Cliente', 'Fecha', 'Prestado', 'Total', 'Estado', ''].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((cr, i) => (
                  <tr key={cr.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td className="px-5 py-4 text-sm font-medium">{cr.clientes?.nombre || '—'}</td>
                    <td className="px-5 py-4 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{new Date(cr.fecha_origen).toLocaleDateString('es-CO')}</td>
                    <td className="px-5 py-4 text-sm">${Number(cr.monto_prestado).toLocaleString('es-CO')}</td>
                    <td className="px-5 py-4 text-sm font-medium">${Number(cr.monto_total).toLocaleString('es-CO')}</td>
                    <td className="px-5 py-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${cr.estado === 'pagado' ? 'badge-pagado' : 'badge-pendiente'}`}>{cr.estado}</span></td>
                    <td className="px-5 py-4">
                      <button onClick={() => router.push(`/dashboard/creditos/${cr.id}`)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium"
                        style={{ background: 'var(--surface-4)', color: 'var(--brand)', border: '1px solid var(--border)' }}>Detalle</button>
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
