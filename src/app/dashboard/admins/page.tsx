'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/api'

export default function AdminsPage() {
  const [form, setForm] = useState({ email: '', password: '', nombre: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setCurrentUser(data.user))
  }, [])

  const isSuperAdmin = currentUser?.user_metadata?.role === 'superadmin'

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSuperAdmin) { setError('Solo el super admin puede crear administradores'); return }
    setSaving(true)
    setError('')
    setSuccess('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { role: 'admin', nombre: form.nombre } }
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(`Admin ${form.email} creado correctamente`)
      setForm({ email: '', password: '', nombre: '' })
    }
    setSaving(false)
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold">Administradores</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Crea accesos de administrador al panel</p>
      </div>

      {/* Role info */}
      <div className="card p-4 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--brand))', color: 'white' }}>
          {currentUser?.email?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium">{currentUser?.email}</p>
          <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            {isSuperAdmin ? '⚡ Super Admin — puede crear administradores' : '🔒 Admin — no puede crear administradores'}
          </p>
        </div>
      </div>

      {!isSuperAdmin ? (
        <div className="card p-6 text-center">
          <p className="text-4xl mb-3">🔒</p>
          <p className="font-semibold">Acceso restringido</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Solo el Super Admin puede crear nuevos administradores.
          </p>
        </div>
      ) : (
        <form onSubmit={handleCreate} className="card p-5 space-y-4">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>NUEVO ADMINISTRADOR</p>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>NOMBRE</label>
            <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre del admin" required className="input-field w-full px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>CORREO</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="admin@gotagota.com" required className="input-field w-full px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>CONTRASEÑA</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 6 caracteres" required minLength={6} className="input-field w-full px-4 py-3 text-sm" />
          </div>

          {error && (
            <div className="text-xs px-4 py-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="text-xs px-4 py-3 rounded-lg" style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', color: 'var(--brand)' }}>
              {success}
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-sm">
            {saving ? 'Creando...' : '⚡ Crear administrador'}
          </button>
        </form>
      )}
    </div>
  )
}
