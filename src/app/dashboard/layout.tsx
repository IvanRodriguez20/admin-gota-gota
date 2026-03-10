'use client'
import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/api'

export const TenantContext = createContext<string | undefined>(undefined)
export const useTenant = () => useContext(TenantContext)

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/dashboard/cobradores', label: 'Cobradores', icon: '👥' },
  { href: '/dashboard/clientes', label: 'Clientes', icon: '👤' },
  { href: '/dashboard/creditos', label: 'Créditos', icon: '💳' },
  { href: '/dashboard/admins', label: 'Administradores', icon: '⚡' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [tenantId, setTenantId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const role = session.user.user_metadata?.role
      if (role !== 'admin' && role !== 'superadmin') { router.push('/login'); return }
      setUser(session.user)
      setTenantId(session.user.user_metadata?.tenant_id)
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

  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href)

  return (
    <TenantContext.Provider value={tenantId}>
      <div className="min-h-screen" style={{ background: 'var(--surface)' }}>

        {/* MOBILE HEADER */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3"
          style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--brand))' }}>
              <span className="text-white text-xs font-bold">⚡</span>
            </div>
            <div>
              <span className="font-bold text-sm">Gota Gota</span>
              <span className="text-xs ml-1.5 font-semibold" style={{ color: 'var(--accent)' }}>ADMIN</span>
            </div>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded-lg"
            style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
            <span className="w-4 h-0.5 rounded" style={{ background: menuOpen ? 'var(--brand)' : 'var(--text-muted)' }} />
            <span className="w-4 h-0.5 rounded" style={{ background: menuOpen ? 'var(--brand)' : 'var(--text-muted)' }} />
            <span className="w-4 h-0.5 rounded" style={{ background: menuOpen ? 'var(--brand)' : 'var(--text-muted)' }} />
          </button>
        </header>

        {menuOpen && (
          <div className="lg:hidden fixed top-14 left-0 right-0 z-20 p-4 space-y-1.5"
            style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  background: isActive(item.href, item.exact) ? 'rgba(0,229,160,0.1)' : 'var(--surface-3)',
                  color: isActive(item.href, item.exact) ? 'var(--brand)' : 'var(--text-muted)',
                  border: isActive(item.href, item.exact) ? '1px solid rgba(0,229,160,0.2)' : '1px solid var(--border)',
                }}>
                <span>{item.icon}</span>{item.label}
              </Link>
            ))}
            <button onClick={handleLogout}
              className="w-full text-left text-sm px-4 py-3 rounded-xl mt-1"
              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
              🚪 Cerrar sesión
            </button>
          </div>
        )}

        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-64 flex-col fixed h-full z-10"
          style={{ background: 'var(--surface-1)', borderRight: '1px solid var(--border)' }}>
          <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--brand))' }}>
                <span className="text-white font-bold">⚡</span>
              </div>
              <div>
                <p className="font-bold leading-none">Gota Gota</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--accent)' }}>ADMIN PANEL</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isActive(item.href, item.exact) ? 'rgba(0,229,160,0.1)' : 'transparent',
                  color: isActive(item.href, item.exact) ? 'var(--brand)' : 'var(--text-muted)',
                  border: isActive(item.href, item.exact) ? '1px solid rgba(0,229,160,0.15)' : '1px solid transparent',
                }}>
                <span>{item.icon}</span>{item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--brand))', color: 'white' }}>
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{user?.email}</p>
                <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                  {user?.user_metadata?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-danger w-full text-xs py-2 px-3 text-left">
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="lg:ml-64 pt-16 lg:pt-0 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </TenantContext.Provider>
  )
}
