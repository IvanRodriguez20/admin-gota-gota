'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getColaboradorByUserId, crearCliente } from '@/lib/api'
import { useTenant } from '@/lib/tenant-context'

export default function NuevoClientePage() {
  const router = useRouter()
  const tenantId = useTenant()
  const [colaborador, setColaborador] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nombre: '', cedula: '', celular: '', direccion: '' })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const col = await getColaboradorByUserId(session.user.id, tenantId)
      setColaborador(col); setLoading(false)
    }
    load()
  }, [tenantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    const res = await crearCliente({ ...form, colaborador_id: colaborador.id }, tenantId)
    if (res?.statusCode >= 400) { setError(res?.message || 'Error al crear'); setSaving(false); return }
    router.push(`/dashboard/clientes/${res.id}`)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} /></div>

  return (
    <div className="animate-fade-in max-w-lg">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--brand)' }}>← Volver</button>
      <h1 className="text-xl lg:text-2xl font-bold mb-1">Nuevo cliente</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Asignado a <strong style={{ color: 'var(--brand)' }}>{colaborador?.nombre}</strong></p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>NOMBRE COMPLETO *</label>
            <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="María García" required className="input-field w-full px-4 py-3 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>CÉDULA *</label>
              <input type="text" value={form.cedula} onChange={e => setForm({ ...form, cedula: e.target.value })}
                placeholder="1234567890" required className="input-field w-full px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>CELULAR *</label>
              <input type="text" value={form.celular} onChange={e => setForm({ ...form, celular: e.target.value })}
                placeholder="3001234567" required className="input-field w-full px-4 py-3 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>DIRECCIÓN</label>
            <input type="text" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })}
              placeholder="Calle 123 # 45-67" className="input-field w-full px-4 py-3 text-sm" />
          </div>
        </div>
        {error && <div className="text-xs px-4 py-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>{error}</div>}
        <button type="submit" disabled={saving} className="btn-primary w-full py-3.5 text-sm">
          {saving ? 'Creando...' : '👤 Crear cliente'}
        </button>
      </form>
    </div>
  )
}
