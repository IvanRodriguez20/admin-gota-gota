'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/api'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      router.replace(session ? '/dashboard' : '/login')
    })
  }, [])
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
    </div>
  )
}
