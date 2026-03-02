'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function CobradoresPage() {
  const router = useRouter()
  const [cobradores, setCobradores] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = async () => {
    const data = await api.getColaboradores()
    setCobradores(data)
    setFiltered(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(cobradores.filter(c =>
      c.nombre.toLowerCase().includes(q) || c.cedula.includes(q) || c.celular.includes(q)
    ))
  }, [search, cobradores])

  const handleToggle = async (cobrador: any) => {
    setToggling(cobrador.id)
    await api.updateColaborador(cobrador.id, { activo: cobrador.activo === false ? true : false })
    await load()
    setToggling(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
    </div>
  )

  const activos = cobradores.filter(c => c.activo !== false).length

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold">Cobradores</h1>
          <p className="text-xs lg:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {activos} activos · {cobradores.length - activos} inactivos
          </p>
        </div>
        <button onClick={() => router.push('/dashboard/cobradores/nuevo')}
          className="btn-primary px-4 py-2 text-xs lg:text-sm">
          + Nuevo cobrador
        </button>
      </div>

      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>🔍</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, cédula o celular..."
          className="input-field w-full pl-10 pr-4 py-3 text-sm" />
      </div>

      {/* MOBILE */}
      <div className="lg:hidden space-y-3">
        {filtered.map(c => (
          <div key={c.id} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  style={{ background: 'var(--surface-4)', color: 'var(--brand)' }}>
                  {c.nombre.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{c.nombre}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>CC {c.cedula}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.activo === false ? 'badge-inactivo' : 'badge-activo'}`}>
                {c.activo === false ? 'inactivo' : 'activo'}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleToggle(c)} disabled={toggling === c.id}
                className={`flex-1 text-xs py-2 px-3 rounded-lg font-medium transition-all ${c.activo === false ? 'btn-primary' : 'btn-danger'}`}>
                {toggling === c.id ? '...' : c.activo === false ? 'Habilitar' : 'Deshabilitar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:block card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Cobrador', 'Cédula', 'Celular', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left px-5 py-4 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'var(--surface-4)', color: 'var(--brand)' }}>
                      {c.nombre.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{c.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{c.cedula}</td>
                <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>{c.celular}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.activo === false ? 'badge-inactivo' : 'badge-activo'}`}>
                    {c.activo === false ? 'inactivo' : 'activo'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => handleToggle(c)} disabled={toggling === c.id}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${c.activo === false ? 'btn-primary' : 'btn-danger'}`}>
                    {toggling === c.id ? '...' : c.activo === false ? 'Habilitar' : 'Deshabilitar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
