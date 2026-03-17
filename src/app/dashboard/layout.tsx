'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getColaboradorByUserId } from '@/lib/api'
import { TenantContext } from '@/lib/tenant-context'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [colaborador, setColaborador] = useState<any>(null)
  const [tenantId, setTenantId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const tid = session.user.user_metadata?.tenant_id
      setTenantId(tid)
      const col = await getColaboradorByUserId(session.user.id, tid)
      setColaborador(col)
      setLoading(false)
    }
    init()
  }, [router])

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
    </div>
  )

  const navItems = [
    { href: '/dashboard/clientes', label: 'Clientes', icon: '👤' },
    { href: '/dashboard/creditos', label: 'Créditos', icon: '💳' },
  ]

  return (
    <TenantContext.Provider value={tenantId}>
      <div className="min-h-screen" style={{ background: 'var(--surface)' }}>

        {/* MOBILE HEADER */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3"
          style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--brand)' }}>
              <span className="text-black font-bold text-xs">G</span>
            </div>
            <span className="font-bold text-sm">Gota Gota</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{colaborador?.nombre?.split(' ')[0]}</span>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded-lg"
              style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
              <span className="w-4 h-0.5 rounded" style={{ background: menuOpen ? 'var(--brand)' : 'var(--text-muted)' }} />
              <span className="w-4 h-0.5 rounded" style={{ background: menuOpen ? 'var(--brand)' : 'var(--text-muted)' }} />
              <span className="w-4 h-0.5 rounded" style={{ background: menuOpen ? 'var(--brand)' : 'var(--text-muted)' }} />
            </button>
          </div>
        </header>

        {menuOpen && (
          <div className="lg:hidden fixed top-14 left-0 right-0 z-20 p-4 space-y-2"
            style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  background: pathname.startsWith(item.href) ? 'rgba(0,229,160,0.1)' : 'var(--surface-3)',
                  color: pathname.startsWith(item.href) ? 'var(--brand)' : 'var(--text-muted)',
                  border: pathname.startsWith(item.href) ? '1px solid rgba(0,229,160,0.2)' : '1px solid var(--border)',
                }}>
                <span>{item.icon}</span>{item.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="w-full text-left text-sm px-4 py-3 rounded-xl"
              style={{ color: 'var(--text-muted)', background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
              🚪 Cerrar sesión
            </button>
          </div>
        )}

        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-60 flex-col fixed h-full z-10"
          style={{ background: 'var(--surface-1)', borderRight: '1px solid var(--border)' }}>
          <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--brand)' }}>
                <span className="text-black font-bold text-xs">G</span>
              </div>
              <span className="font-bold tracking-tight">Gota Gota</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: pathname.startsWith(item.href) ? 'rgba(0,229,160,0.1)' : 'transparent',
                  color: pathname.startsWith(item.href) ? 'var(--brand)' : 'var(--text-muted)',
                  border: pathname.startsWith(item.href) ? '1px solid rgba(0,229,160,0.2)' : '1px solid transparent',
                }}>
                <span>{item.icon}</span>{item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--surface-4)', color: 'var(--brand)' }}>
                {colaborador?.nombre?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{colaborador?.nombre || 'Usuario'}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Colaborador</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full text-left text-xs px-3 py-2 rounded-lg"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="lg:ml-60 pt-16 lg:pt-0 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </TenantContext.Provider>
  )
}
