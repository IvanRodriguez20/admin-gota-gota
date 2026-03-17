'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getClienteById, getCreditosByCliente } from '@/lib/api'
import { useTenant } from '@/lib/tenant-context'

export default function ClienteDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const tenantId = useTenant()
  const [cliente, setCliente] = useState<any>(null)
  const [creditos, setCreditos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [c, cr] = await Promise.all([getClienteById(id), getCreditosByCliente(id, tenantId)])
      setCliente(c); setCreditos(cr); setLoading(false)
    }
    load()
  }, [id, tenantId])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} /></div>
  if (!cliente) return <div className="card p-8 text-center"><p style={{ color: 'var(--text-muted)' }}>Cliente no encontrado</p></div>

  const pendientes = creditos.filter(c => c.estado === 'pendiente')
  const pagados = creditos.filter(c => c.estado === 'pagado')
  const totalPendiente = pendientes.reduce((a, c) => a + Number(c.monto_total), 0)

  return (
    <div className="animate-fade-in max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--brand)' }}>← Volver</button>

      <div className="card p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: 'var(--surface-4)', color: 'var(--brand)' }}>
            {cliente.nombre.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{cliente.nombre}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>CC {cliente.cedula} · {cliente.celular}</p>
            {cliente.direccion && <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{cliente.direccion}</p>}
          </div>
          <button onClick={() => router.push(`/dashboard/creditos/nuevo?cliente_id=${cliente.id}`)}
            className="btn-primary px-4 py-2 text-xs lg:text-sm whitespace-nowrap">
            + Nuevo crédito
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total créditos', value: creditos.length, color: 'var(--text)' },
          { label: 'Pendientes', value: pendientes.length, color: '#FFA500' },
          { label: 'Por cobrar', value: `$${totalPendiente.toLocaleString('es-CO')}`, color: '#FFA500' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold">Historial de créditos</h2>
        </div>
        {creditos.length === 0 ? (
          <div className="p-8 text-center"><p style={{ color: 'var(--text-muted)' }}>Sin créditos registrados</p></div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {creditos.map(cr => (
              <div key={cr.id} className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-[var(--surface-3)]"
                onClick={() => router.push(`/dashboard/creditos/${cr.id}`)}>
                <div>
                  <p className="text-sm font-medium">${Number(cr.monto_total).toLocaleString('es-CO')}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Prestado: ${Number(cr.monto_prestado).toLocaleString('es-CO')} · {new Date(cr.fecha_origen).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${cr.estado === 'pagado' ? 'badge-pagado' : 'badge-pendiente'}`}>{cr.estado}</span>
                  <span style={{ color: 'var(--text-muted)' }}>›</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
