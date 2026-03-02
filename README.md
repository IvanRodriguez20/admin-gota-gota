# Admin Gota Gota

## Setup

```bash
npm install
npm run dev
```

Abre http://localhost:3002

## Crear el primer Super Admin

Ve a Supabase → Authentication → Users → Add user y crea:
- Email: superadmin@gotagota.com
- Password: (la que quieras)

Luego en SQL Editor ejecuta:
```sql
UPDATE auth.users
SET raw_user_meta_data = '{"role": "superadmin"}'
WHERE email = 'superadmin@gotagota.com';
```

## Secciones

- **Dashboard** — Estadísticas generales
- **Cobradores** — Crear, habilitar/deshabilitar cobradores
- **Clientes** — Ver y crear clientes con cobrador asignado
- **Créditos** — Ver todos los créditos con filtros
- **Administradores** — Crear nuevos admins (solo superadmin)

## Deploy en Vercel

1. Sube a GitHub como repo separado
2. Importa en Vercel
3. Agrega las 3 variables de entorno
4. Deploy
