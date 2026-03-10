'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useTenant } from './layout'

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const tenantId = useTenant()
  useEffect(() => {
    api.getStats(tenantId).then(d => { setData(d); setLoading(false) })
  }, [tenantId])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
    </div>
  )

  const totalPrestado = data.creditos.reduce((a: number, c: any) => a + Number(c.monto_prestado), 0)
  const totalPendiente = data.creditos.filter((c: any) => c.estado === 'pendiente').reduce((a: number, c: any) => a + Number(c.monto_total), 0)
  const pagados = data.creditos.filter((c: any) => c.estado === 'pagado').length
  const pendientes = data.creditos.filter((c: any) => c.estado === 'pendiente').length
  const pctPagado = data.creditos.length ? Math.round((pagados / data.creditos.length) * 100) : 0

  const stats = [
    { label: 'Cobradores', value: data.colaboradores.length, icon: '👥', color: 'var(--brand)' },
    { label: 'Clientes', value: data.clientes.length, icon: '👤', color: '#60a5fa' },
    { label: 'Créditos totales', value: data.creditos.length, icon: '💳', color: '#a78bfa' },
    { label: 'Total prestado', value: `$${totalPrestado.toLocaleString('es-CO')}`, icon: '💰', color: 'var(--brand)' },
    { label: 'Pendiente por cobrar', value: `$${totalPendiente.toLocaleString('es-CO')}`, icon: '⏳', color: '#FFA500' },
    { label: 'Tasa de pago', value: `${pctPagado}%`, icon: '✅', color: 'var(--brand)' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Resumen general del sistema</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Creditos chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pagados vs Pendientes */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Créditos pagados vs pendientes</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: 'var(--brand)' }}>Pagados ({pagados})</span>
                <span style={{ color: 'var(--text-muted)' }}>{pctPagado}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-4)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pctPagado}%`, background: 'var(--brand)' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: '#FFA500' }}>Pendientes ({pendientes})</span>
                <span style={{ color: 'var(--text-muted)' }}>{100 - pctPagado}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-4)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${100 - pctPagado}%`, background: '#FFA500' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Cobradores activos */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Cobradores activos</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.colaboradores.slice(0, 6).map((col: any) => (
              <div key={col.id} className="flex items-center justify-between py-2 px-3 rounded-lg"
                style={{ background: 'var(--surface-3)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--surface-4)', color: 'var(--brand)' }}>
                    {col.nombre.charAt(0)}
                  </div>
                  <span className="text-sm font-medium">{col.nombre}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.activo === false ? 'badge-inactivo' : 'badge-activo'}`}>
                  {col.activo === false ? 'inactivo' : 'activo'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
