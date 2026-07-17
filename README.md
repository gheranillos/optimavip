# OPTIMA VIP — Plataforma web inmobiliaria

Plataforma inmobiliaria para **OPTIMA VIP** (Lechería y El Tigre, Venezuela) con
alcance global. Construida para desplegarse en **Vercel** (serverless).

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **React 19**
- **Tailwind CSS v4** + **shadcn/ui** (base radix) — tema de marca azul/plateado
- **PostgreSQL** (Neon / Vercel Postgres) + **Prisma 7** (query compiler + driver adapter `@prisma/adapter-pg`)
- **NextAuth v5 (Auth.js)** — credenciales + JWT, 3 roles (`ADMIN`, `REALTOR`, `CLIENT`)
- **next-intl v4** — i18n con rutas `/es` y `/en` (arquitectura lista para más idiomas)
- **React Hook Form + Zod** — formularios y validación
- **Resend** (email), **Telegram Bot API** (webhook serverless), notificaciones in-app (tabla en DB)
- **Vercel Blob** (imágenes/video), **Leaflet + OpenStreetMap** (mapas sin API key de pago)

## Requisitos

- Node.js 20.9+ (recomendado 22/24)
- Una base de datos PostgreSQL (local o Neon/Vercel Postgres)

## Puesta en marcha (local)

```bash
# 1. Instalar dependencias (ejecuta `prisma generate` automáticamente)
npm install

# 2. Variables de entorno
cp .env.example .env
#   - Configura DATABASE_URL (Postgres)
#   - Genera AUTH_SECRET:  npx auth secret

# 3. Crear el esquema en la base de datos
npm run db:migrate      # crea y aplica la primera migración
#   (o `npm run db:push` para prototipar sin migraciones)

# 4. Sembrar catálogos + usuario admin
#   Configura SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD en .env
npm run db:seed

# 5. Levantar el servidor de desarrollo
npm run dev
```

App disponible en `http://localhost:3000` (redirige a `/es`).

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción |
| `npm run start` | Servir el build |
| `npm run db:generate` | Regenerar Prisma Client (`src/generated/prisma`) |
| `npm run db:migrate` | Crear/aplicar migraciones (dev) |
| `npm run db:deploy` | Aplicar migraciones (producción / CI) |
| `npm run db:push` | Sincronizar schema sin migración |
| `npm run db:seed` | Sembrar zonas, amenidades y admin |
| `npm run db:studio` | Prisma Studio |

## Estructura

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (marketing)/      # sitio público (home, propiedades, mapa, etc.)
│   │   ├── (auth)/           # login, registro
│   │   ├── dashboard/        # panel protegido por rol
│   │   ├── layout.tsx        # layout raíz (html) + NextIntlClientProvider
│   │   └── not-found.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/   # handlers NextAuth
│   │   ├── blob/upload/          # subida a Vercel Blob (autenticada)
│   │   ├── cron/search-alerts/   # Vercel Cron (alertas de búsqueda)
│   │   └── telegram/webhook/     # webhook del bot (serverless)
│   └── globals.css           # tema de marca (azul/plateado)
├── auth.ts                   # configuración NextAuth v5
├── proxy.ts                  # (Next 16) middleware next-intl
├── i18n/                     # routing / navigation / request de next-intl
├── components/               # ui (shadcn), layout, auth, dashboard, brand
├── lib/                      # db, auth-guard, email, telegram, notifications, actions, validations
└── generated/prisma/         # Prisma Client generado (git-ignored)
messages/                     # es.json, en.json
prisma/                       # schema.prisma, seed.ts
prisma.config.ts              # config CLI de Prisma 7 (datasource / seed)
vercel.json                   # regiones + cron jobs
```

## Roles y permisos

- **ADMIN**: acceso total — aprueba realtors y propiedades, gestiona usuarios,
  reportes de cierre y estadísticas.
- **REALTOR**: publica propiedades (quedan en `PENDING_REVIEW`), gestiona sus
  consultas y reporta cierres. Requiere aprobación manual del admin
  (`PENDING → APPROVED/REJECTED`).
- **CLIENT**: registro libre, favoritos, contacto y alertas de búsqueda.

La protección de rutas se aplica en los layouts/páginas del servidor mediante los
guards de `src/lib/auth-guard.ts` (`requireUser`, `requireRole`, `requireAdmin`,
`requireApprovedRealtor`). El `proxy.ts` se encarga del enrutamiento de idioma.

## Modelo de datos

Ver `prisma/schema.prisma`. Entidades principales: `User`, `Property`,
`PropertyImage`, `Zone` (catálogo editable), `Amenity` (catálogo editable),
`Favorite`, `ContactInquiry`, `SavedSearch`, `ClosureReport`, `Notification` +
modelos de NextAuth (`Account`, `Session`, `VerificationToken`).

Notas:
- `Property.modes` es un array de enums (`ListingMode[]`): una propiedad puede
  estar en venta y alquiler a la vez.
- `Property.status` (`AVAILABLE` público; `RESERVED/SOLD/RENTED` solo admin).
- `Property.approvalStatus` controla la moderación de publicaciones.
- `Property.isOpportunityPrice` para destacar/ordenar primero.

## Despliegue en Vercel

1. Importa el repo en Vercel.
2. Configura las variables de entorno (ver `.env.example`): `DATABASE_URL`
   (usa la cadena **pooled** de Neon), `AUTH_SECRET`, `RESEND_API_KEY`,
   `EMAIL_FROM`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`,
   `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`. Los mapas usan Leaflet/OSM (sin
   API key de Google).
3. `vercel.json` ya define el cron diario para `/api/cron/search-alerts` y la
   región `iad1`.
4. El comando de build ejecuta `prisma generate` (via `postinstall`). Aplica las
   migraciones en producción con `npm run db:deploy` (por ejemplo en un paso de
   build o manualmente).

## Estado (MVP)

Completado:

- [x] Proyecto Next.js + TS + Tailwind + shadcn/ui (tema azul/plateado)
- [x] Prisma schema completo + cliente + seed (zonas, amenidades, admin)
- [x] NextAuth v5, 3 roles, registro (cliente libre / realtor con aprobación)
- [x] Guards de protección por rol + estructura App Router `/es` `/en`
- [x] Listado público + ficha + contacto (DB + WhatsApp) + mapa Leaflet/OSM
- [x] CRUD de propiedades + hasta 20 fotos (Vercel Blob) + aprobación admin
- [x] Aprobar/rechazar asesores (admin)
- [x] Bandeja de consultas/leads
- [x] Favoritos del cliente
- [x] Búsquedas guardadas + alertas por email (cron)
- [x] Reportes de cierre + testimonios / casos de éxito
- [x] Emails transaccionales (Resend)
- [x] Notificaciones in-app + configuración de perfil
- [x] Listado de usuarios (admin)
- [x] `vercel.json` + `.env.example`

Pendiente / fase 2:

- [ ] Bot de Telegram (webhook)
- [ ] Tour 360° enriquecido / clustering avanzado en mapa
```
