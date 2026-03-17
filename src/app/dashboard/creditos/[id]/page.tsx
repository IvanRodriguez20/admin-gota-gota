'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCreditoById, pagarCredito } from '@/lib/api'

export default function CreditoDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [credito, setCredito] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    getCreditoById(id).then(data => { setCredito(data); setLoading(false) })
  }, [id])

  const handlePagar = async () => {
    if (!confirm('¿Marcar este crédito como pagado?')) return
    setPaying(true)
    const data = await pagarCredito(id)
    setCredito(data); setPaying(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} /></div>
  if (!credito) return <div className="card p-8 text-center"><p style={{ color: 'var(--text-muted)' }}>Crédito no encontrado</p></div>

  const ganancia = Number(credito.monto_total) - Number(credito.monto_prestado)

  return (
    <div className="animate-fade-in max-w-lg">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--brand)' }}>← Volver</button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl lg:text-2xl font-bold">Detalle del crédito</h1>
        <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${credito.estado === 'pagado' ? 'badge-pagado' : 'badge-pendiente'}`}>
          {credito.estado}
        </span>
      </div>

      <div className="card p-5 mb-4">
        <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold"
            style={{ background: 'var(--surface-4)', color: '#60a5fa' }}>
            {credito.clientes?.nombre?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{credito.clientes?.nombre}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>CC {credito.clientes?.cedula} · {credito.clientes?.celular}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Monto prestado', value: `$${Number(credito.monto_prestado).toLocaleString('es-CO')}`, color: 'var(--text)' },
            { label: 'Monto total', value: `$${Number(credito.monto_total).toLocaleString('es-CO')}`, color: 'var(--brand)' },
            { label: 'Ganancia', value: `$${ganancia.toLocaleString('es-CO')}`, color: 'var(--brand)' },
            { label: 'Fecha origen', value: new Date(credito.fecha_origen).toLocaleDateString('es-CO'), color: 'var(--text)' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
              <p className="font-bold" style={{ color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>
        {credito.fecha_pago && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fecha de pago</p>
            <p className="font-medium mt-1">{new Date(credito.fecha_pago).toLocaleDateString('es-CO')}</p>
          </div>
        )}
      </div>

      {credito.estado === 'pendiente' && (
        <button onClick={handlePagar} disabled={paying} className="btn-primary w-full py-3.5 text-sm">
          {paying ? 'Procesando...' : '✅ Marcar como pagado'}
        </button>
      )}
    </div>
  )
}
