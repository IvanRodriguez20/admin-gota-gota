'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useTenant } from '../../layout'

export default function NuevoClienteAdminPage() {
  const router = useRouter()
  const [cobradores, setCobradores] = useState<any[]>([])
  const [form, setForm] = useState({ nombre: '', cedula: '', celular: '', direccion: '', colaborador_id: '' })
  const tenantId = useTenant()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getColaboradores(tenantId).then(data => {
      const activos = data.filter((c: any) => c.activo !== false)
      setCobradores(activos)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.colaborador_id) { setError('Selecciona un cobrador'); return }
    setSaving(true)
    setError('')
    const res = await api.createCliente(form, tenantId)
    if (res?.statusCode >= 400) {
      setError(res?.message || 'Error al crear el cliente')
      setSaving(false)
      return
    }
    router.push('/dashboard/clientes')
  }

  const cobradorSeleccionado = cobradores.find(c => c.id === form.colaborador_id)

  return (
    <div className="animate-fade-in max-w-lg">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--brand)' }}>
        ← Volver
      </button>
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold">Nuevo cliente</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Registra un cliente y asígnalo a un cobrador</p>
      </div>

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

        {/* Cobrador selector */}
        <div className="card p-5">
          <label className="block text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>COBRADOR ASIGNADO *</label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {cobradores.map(c => (
              <div key={c.id}
                onClick={() => setForm({ ...form, colaborador_id: c.id })}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                style={{
                  background: form.colaborador_id === c.id ? 'rgba(0,229,160,0.08)' : 'var(--surface-3)',
                  border: form.colaborador_id === c.id ? '1px solid rgba(0,229,160,0.25)' : '1px solid var(--border)',
                }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: 'var(--surface-4)', color: 'var(--brand)' }}>
                  {c.nombre.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.nombre}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>CC {c.cedula}</p>
                </div>
                {form.colaborador_id === c.id && (
                  <span className="text-sm" style={{ color: 'var(--brand)' }}>✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-xs px-4 py-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full py-3.5 text-sm">
          {saving ? 'Creando cliente...' : '👤 Crear cliente'}
        </button>
      </form>
    </div>
  )
}
