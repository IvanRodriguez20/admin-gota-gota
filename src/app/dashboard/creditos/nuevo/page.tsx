'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getColaboradorByUserId, getClientesByColaborador, crearCredito } from '@/lib/api'
import { useTenant } from '@/lib/tenant-context'

export default function NuevoCreditoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clienteIdParam = searchParams.get('cliente_id')
  const tenantId = useTenant()
  const [colaborador, setColaborador] = useState<any>(null)
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    cliente_id: clienteIdParam || '',
    monto_prestado: '',
    monto_total: '',
    fecha_origen: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const col = await getColaboradorByUserId(session.user.id, tenantId)
      setColaborador(col)
      if (col) {
        const data = await getClientesByColaborador(col.id, tenantId)
        setClientes(data)
      }
      setLoading(false)
    }
    load()
  }, [tenantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.cliente_id) { setError('Selecciona un cliente'); return }
    setSaving(true); setError('')
    const res = await crearCredito({
      cliente_id: form.cliente_id,
      colaborador_id: colaborador.id,
      monto_prestado: Number(form.monto_prestado),
      monto_total: Number(form.monto_total),
      fecha_origen: form.fecha_origen,
    }, tenantId)
    if (res?.statusCode >= 400) { setError(res?.message || 'Error al crear'); setSaving(false); return }
    router.push(`/dashboard/creditos/${res.id}`)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} /></div>

  const clienteSeleccionado = clientes.find(c => c.id === form.cliente_id)

  return (
    <div className="animate-fade-in max-w-lg">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--brand)' }}>← Volver</button>
      <h1 className="text-xl lg:text-2xl font-bold mb-1">Nuevo crédito</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Registra un nuevo crédito para un cliente</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card p-5">
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>CLIENTE *</label>
          {clienteIdParam && clienteSeleccionado ? (
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--surface-3)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: 'var(--surface-4)', color: 'var(--brand)' }}>{clienteSeleccionado.nombre.charAt(0)}</div>
              <div>
                <p className="font-medium text-sm">{clienteSeleccionado.nombre}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>CC {clienteSeleccionado.cedula}</p>
              </div>
            </div>
          ) : (
            <select value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })}
              required className="input-field w-full px-4 py-3 text-sm">
              <option value="">Selecciona un cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} — CC {c.cedula}</option>)}
            </select>
          )}
        </div>
        <div className="card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>MONTO PRESTADO *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>$</span>
                <input type="number" value={form.monto_prestado} onChange={e => setForm({ ...form, monto_prestado: e.target.value })}
                  placeholder="0" required min="1" className="input-field w-full pl-8 pr-4 py-3 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>MONTO TOTAL *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>$</span>
                <input type="number" value={form.monto_total} onChange={e => setForm({ ...form, monto_total: e.target.value })}
                  placeholder="0" required min="1" className="input-field w-full pl-8 pr-4 py-3 text-sm" />
              </div>
            </div>
          </div>
          {form.monto_prestado && form.monto_total && Number(form.monto_total) > Number(form.monto_prestado) && (
            <div className="flex items-center justify-between px-4 py-3 rounded-lg"
              style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.15)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Ganancia estimada</span>
              <span className="text-sm font-bold" style={{ color: 'var(--brand)' }}>
                ${(Number(form.monto_total) - Number(form.monto_prestado)).toLocaleString('es-CO')}
              </span>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>FECHA DE ORIGEN *</label>
            <input type="date" value={form.fecha_origen} onChange={e => setForm({ ...form, fecha_origen: e.target.value })}
              required className="input-field w-full px-4 py-3 text-sm" />
          </div>
        </div>
        {error && <div className="text-xs px-4 py-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>{error}</div>}
        <button type="submit" disabled={saving} className="btn-primary w-full py-3.5 text-sm">
          {saving ? 'Creando crédito...' : '💰 Crear crédito'}
        </button>
      </form>
    </div>
  )
}
