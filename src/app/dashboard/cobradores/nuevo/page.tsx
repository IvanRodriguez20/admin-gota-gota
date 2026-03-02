'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, api } from '@/lib/api'

export default function NuevoCobradorPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nombre: '', cedula: '', celular: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      // 1. Crear usuario en Supabase Auth con rol colaborador
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { role: 'colaborador', nombre: form.nombre } }
      })
      if (authError) throw new Error(authError.message)

      // 2. Crear colaborador en backend
      const colaborador = await api.createColaborador({
        nombre: form.nombre, cedula: form.cedula, celular: form.celular,
      })

      // 3. Vincular user_id
      if (data.user?.id) {
        await api.updateColaborador(colaborador.id, { user_id: data.user.id })
      }

      router.push('/dashboard/cobradores')
    } catch (err: any) {
      setError(err.message || 'Error al crear el cobrador')
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--brand)' }}>
        ← Volver
      </button>
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold">Nuevo cobrador</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Crea el cobrador y su acceso al sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card p-5 space-y-4">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>DATOS PERSONALES</p>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>NOMBRE COMPLETO *</label>
            <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Juan Pérez" required className="input-field w-full px-4 py-3 text-sm" />
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
        </div>

        <div className="card p-5 space-y-4">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>ACCESO AL SISTEMA</p>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>CORREO *</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="cobrador@email.com" required className="input-field w-full px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>CONTRASEÑA *</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 6 caracteres" required minLength={6} className="input-field w-full px-4 py-3 text-sm" />
          </div>
        </div>

        {error && (
          <div className="text-xs px-4 py-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full py-3.5 text-sm">
          {saving ? 'Creando cobrador...' : '👥 Crear cobrador'}
        </button>
      </form>
    </div>
  )
}
