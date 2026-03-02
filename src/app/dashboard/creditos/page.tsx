'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function CreditosAdminPage() {
  const [creditos, setCreditos] = useState<any[]>([])
  const [cobradores, setCobradores] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filtroCobrador, setFiltroCobrador] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getCreditos(), api.getColaboradores(), api.getClientes()]).then(([cr, cols, cl]) => {
      setCreditos(cr); setCobradores(cols); setClientes(cl); setFiltered(cr); setLoading(false)
    })
  }, [])

  useEffect(() => {
    let result = creditos
    if (filtroEstado !== 'todos') result = result.filter(c => c.estado === filtroEstado)
    if (filtroCobrador !== 'todos') result = result.filter(c => c.colaborador_id === filtroCobrador)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.clientes?.nombre?.toLowerCase().includes(q) ||
        c.clientes?.cedula?.includes(q)
      )
    }
    setFiltered(result)
  }, [search, filtroEstado, filtroCobrador, creditos])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
    </div>
  )

  const totalPrestado = filtered.reduce((a, c) => a + Number(c.monto_prestado), 0)
  const totalPendiente = filtered.filter(c => c.estado === 'pendiente').reduce((a, c) => a + Number(c.monto_total), 0)

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold">Créditos</h1>
        <p className="text-xs lg:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{creditos.length} créditos en total</p>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Mostrando', value: filtered.length, color: 'var(--text)' },
          { label: 'Pendientes', value: filtered.filter(c => c.estado === 'pendiente').length, color: '#FFA500' },
          { label: 'Total prestado', value: `$${totalPrestado.toLocaleString('es-CO')}`, color: 'var(--brand)' },
          { label: 'Por cobrar', value: `$${totalPendiente.toLocaleString('es-CO')}`, color: '#FFA500' },
        ].map(s => (
          <div key={s.label} className="card p-3">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente o cédula..."
            className="input-field w-full pl-10 pr-4 py-3 text-sm" />
        </div>
        <select value={filtroCobrador} onChange={e => setFiltroCobrador(e.target.value)}
          className="input-field px-4 py-3 text-sm">
          <option value="todos">Todos los cobradores</option>
          {cobradores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <div className="flex gap-2">
          {['todos', 'pendiente', 'pagado'].map(e => (
            <button key={e} onClick={() => setFiltroEstado(e)}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all"
              style={{
                background: filtroEstado === e ? 'rgba(0,229,160,0.1)' : 'var(--surface-2)',
                color: filtroEstado === e ? 'var(--brand)' : 'var(--text-muted)',
                border: filtroEstado === e ? '1px solid rgba(0,229,160,0.2)' : '1px solid var(--border)',
              }}>{e}</button>
          ))}
        </div>
      </div>

      {/* MOBILE */}
      <div className="lg:hidden space-y-3">
        {filtered.map(cr => (
          <div key={cr.id} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">{cr.clientes?.nombre || '—'}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cr.estado === 'pagado' ? 'badge-pagado' : 'badge-pendiente'}`}>
                {cr.estado}
              </span>
            </div>
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Prestado: <strong style={{ color: 'var(--text)' }}>${Number(cr.monto_prestado).toLocaleString('es-CO')}</strong></span>
              <span>Total: <strong style={{ color: 'var(--brand)' }}>${Number(cr.monto_total).toLocaleString('es-CO')}</strong></span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Cobrador: {cobradores.find(c => c.id === cr.colaborador_id)?.nombre || '—'}
            </p>
          </div>
        ))}
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:block card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Cliente', 'Cobrador', 'Fecha', 'Prestado', 'Total', 'Estado'].map(h => (
                <th key={h} className="text-left px-5 py-4 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((cr, i) => (
              <tr key={cr.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td className="px-5 py-4 text-sm font-medium">{cr.clientes?.nombre || '—'}</td>
                <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {cobradores.find(c => c.id === cr.colaborador_id)?.nombre || '—'}
                </td>
                <td className="px-5 py-4 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                  {new Date(cr.fecha_origen).toLocaleDateString('es-CO')}
                </td>
                <td className="px-5 py-4 text-sm">${Number(cr.monto_prestado).toLocaleString('es-CO')}</td>
                <td className="px-5 py-4 text-sm font-medium">${Number(cr.monto_total).toLocaleString('es-CO')}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${cr.estado === 'pagado' ? 'badge-pagado' : 'badge-pendiente'}`}>
                    {cr.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
