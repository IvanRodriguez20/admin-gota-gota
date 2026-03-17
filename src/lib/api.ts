const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-gota-gota-final-production.up.railway.app'

function headers(tenantId?: string) {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (tenantId) h['x-tenant-id'] = tenantId
  return h
}

export async function getColaboradorByUserId(userId: string, tenantId?: string) {
  const res = await fetch(`${API_URL}/colaboradores`, { headers: headers(tenantId) })
  const data = await res.json()
  return data.find((c: any) => c.user_id === userId) || null
}

export async function getClientesByColaborador(colaboradorId: string, tenantId?: string) {
  const res = await fetch(`${API_URL}/clientes/colaborador/${colaboradorId}`, { headers: headers(tenantId) })
  return res.json()
}

export async function getCreditosByColaborador(colaboradorId: string, tenantId?: string) {
  const res = await fetch(`${API_URL}/creditos/colaborador/${colaboradorId}`, { headers: headers(tenantId) })
  return res.json()
}

export async function getCreditosByCliente(clienteId: string, tenantId?: string) {
  const res = await fetch(`${API_URL}/creditos/cliente/${clienteId}`, { headers: headers(tenantId) })
  return res.json()
}

export async function getClienteById(id: string) {
  const res = await fetch(`${API_URL}/clientes/${id}`)
  return res.json()
}

export async function getCreditoById(id: string) {
  const res = await fetch(`${API_URL}/creditos/${id}`)
  return res.json()
}

export async function pagarCredito(id: string) {
  const res = await fetch(`${API_URL}/creditos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado: 'pagado', fecha_pago: new Date().toISOString().split('T')[0] }),
  })
  return res.json()
}

export async function crearCliente(body: any, tenantId?: string) {
  const res = await fetch(`${API_URL}/clientes`, {
    method: 'POST', headers: headers(tenantId),
    body: JSON.stringify({ ...body, tenant_id: tenantId }),
  })
  return res.json()
}

export async function crearCredito(body: any, tenantId?: string) {
  const res = await fetch(`${API_URL}/creditos`, {
    method: 'POST', headers: headers(tenantId),
    body: JSON.stringify({ ...body, tenant_id: tenantId }),
  })
  return res.json()
}
