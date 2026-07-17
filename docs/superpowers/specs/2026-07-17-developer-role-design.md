# Design: Rol DEVELOPER + gestión de administradores

**Fecha:** 2026-07-17  
**Estado:** Aprobado por el usuario  
**Enfoque:** A — Rol `DEVELOPER` por encima de `ADMIN`

## Problema

Hoy el rol más alto es `ADMIN`. El dueño técnico (seed) es admin y no puede crear otros administradores desde la web; tendría que hacerlo desde DB/Cursor. Se necesita un rol superior y una UI para gestionar admins.

## Jerarquía

```
DEVELOPER → ADMIN → REALTOR → CLIENT
```

## Permisos

| Capacidad | DEVELOPER | ADMIN |
|-----------|:---------:|:-----:|
| Moderación de negocio (propiedades, asesores, consultas, cierres, listado usuarios) | ✓ | ✓ |
| Crear / editar / desactivar admins | ✓ | ✗ |
| Resetear contraseña de un admin | ✓ | ✗ |
| Cambiar rol de usuario privilegiado (ADMIN ↔ CLIENT/REALTOR) | ✓ | ✗ |
| Crear otro DEVELOPER desde la UI | ✗ | ✗ |
| Degradarse a sí mismo / eliminar el último DEVELOPER | ✗ | — |

Reglas:
- Solo seed/DB puede crear o cambiar un `DEVELOPER`.
- Un DEVELOPER no puede degradarse a sí mismo.
- Debe quedar al menos un DEVELOPER activo en el sistema.
- Usuarios con `isActive === false` no pueden iniciar sesión.

## Modelo de datos

- `UserRole`: añadir `DEVELOPER`.
- `User.isActive Boolean @default(true)`.
- Seed (`SEED_ADMIN_*`): rol `DEVELOPER` (no `ADMIN`).

## Auth / guards

- `isStaff(role)` = `DEVELOPER | ADMIN`.
- `isDeveloper(role)` = `DEVELOPER`.
- Todo lo que hoy exige solo `ADMIN` debe aceptar también `DEVELOPER`.
- Acciones de gestión de admins: solo `DEVELOPER`.
- Login rechaza `isActive === false` con mensaje claro.

## UI (solo DEVELOPER)

Ruta: `/dashboard/admins`  
Nav: “Administradores”.

1. Listado: nombre, email, WhatsApp, activo/inactivo, fecha de alta.
2. Crear admin: nombre, email, teléfono/WhatsApp, contraseña temporal.
3. Editar: nombre, teléfono, WhatsApp, activo/inactivo.
4. Reset password: nueva contraseña definida por el developer.
5. Cambiar rol: bajar a `CLIENT` o `REALTOR` (default `PENDING` si realtor).

La página `/dashboard/users` sigue siendo el listado general; sin botones de crear admin.

## Email

Al crear un admin: email Resend con contraseña temporal (una vez) + enlace a login.

## Fuera de alcance

- UI para crear/editar developers.
- Multi-rol por usuario.
- Soft-delete completo / auditoría avanzada.
