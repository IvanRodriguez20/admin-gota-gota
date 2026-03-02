'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Correo o contraseña incorrectos'); setLoading(false); return }

    // Check admin role in user metadata
    const role = data.user?.user_metadata?.role
    if (role !== 'admin' && role !== 'superadmin') {
      await supabase.auth.signOut()
      setError('No tienes permisos de administrador')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--surface)' }}>
      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '50px 50px', opacity: 0.25,
      }} />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
      }} />

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--brand))' }}>
              <span className="text-white font-bold">⚡</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-lg leading-none">Gota Gota</p>
              <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>ADMIN</p>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Panel de administración</p>
        </div>

        <div className="card p-7">
          <h1 className="text-lg font-bold mb-5">Acceso administrativo</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>CORREO</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@gotagota.com" required
                className="input-field w-full px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>CONTRASEÑA</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="input-field w-full px-4 py-3 text-sm" />
            </div>
            {error && (
              <div className="text-xs px-4 py-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm mt-1">
              {loading ? 'Verificando...' : 'Ingresar al panel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
