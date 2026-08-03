# Rifa a beneficio de Dayana Huerta

App web para gestionar una rifa de 10,000 números (0000–9999) a $5 USD cada uno,
con vista pública en tiempo real y panel de administración para **Thaidis** y **Daniela**.

- **Vista pública:** cuadrícula con los 10,000 números, buscador, barra de avance en vivo,
  reserva de número + generación de ticket.
- **Vista de administración:** login protegido, métricas (% vendido, recaudado, pendiente),
  tabla de participantes con filtros, marcar pagado / liberar / registrar venta manual,
  exportar CSV. Todo en tiempo real (Supabase Realtime).

## 1. Requisitos

- [Node.js](https://nodejs.org) 18 o superior.
- Una cuenta gratuita de [Supabase](https://supabase.com).
- (Para publicar en línea) Una cuenta gratuita de [Vercel](https://vercel.com) o [Netlify](https://netlify.com).

## 2. Crear el proyecto de Supabase

1. Entra a [supabase.com](https://supabase.com) → **Start your project** → crea una cuenta (gratis).
2. Clic en **New project**. Elige nombre (ej. `rifa-dayana-huerta`), una contraseña de base de
   datos (guárdala) y la región más cercana.
3. Cuando el proyecto esté listo, ve a **Project Settings → API**. Copia:
   - **Project URL** → será tu `VITE_SUPABASE_URL`.
   - **anon public key** → será tu `VITE_SUPABASE_ANON_KEY`.

## 3. Cargar el esquema de la base de datos

1. En el panel de Supabase, ve a **SQL Editor → New query**.
2. Abre el archivo [`supabase/schema.sql`](supabase/schema.sql) de este proyecto, copia **todo** su
   contenido y pégalo en el editor.
3. Clic en **Run**. Esto crea las tablas `numeros` y `admins`, siembra los 10,000 números,
   configura la seguridad (RLS) y crea las funciones para reservar, marcar pagado, liberar y
   registrar ventas manuales.
4. Ve a **Database → Replication** (o **Database → Publications**) y confirma que la tabla
   `numeros` esté incluida en la publicación `supabase_realtime` (el script ya intenta agregarla
   automáticamente; si no aparece, actívala manualmente ahí).

## 4. Crear las cuentas de Thaidis y Daniela

1. En Supabase, ve a **Authentication → Users → Add user → Create new user**.
2. Crea un usuario para **Thaidis** con su correo y una contraseña temporal. Repite para **Daniela**.
3. Ve a **SQL Editor** y, por cada una, ejecuta (reemplazando el correo):
   ```sql
   insert into admins (user_id, nombre)
   select id, 'Thaidis' from auth.users where email = 'correo-de-thaidis@ejemplo.com';

   insert into admins (user_id, nombre)
   select id, 'Daniela' from auth.users where email = 'correo-de-daniela@ejemplo.com';
   ```
4. Con esto, solo esas dos cuentas podrán entrar al panel de administración
   (`/admin/login`) y ejecutar acciones administrativas.

## 5. Configurar el proyecto localmente

```bash
npm install
cp .env.example .env
```

Edita `.env` y coloca tus valores:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Corre en desarrollo:

```bash
npm run dev
```

Abre `http://localhost:5173`.

## 6. Desplegar gratis en línea (Vercel)

1. Sube este proyecto a un repositorio de GitHub (o GitLab/Bitbucket).
2. Entra a [vercel.com](https://vercel.com), inicia sesión con tu cuenta de GitHub y
   **Add New… → Project**, selecciona el repositorio.
3. Vercel detecta Vite automáticamente. En **Environment Variables**, agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Clic en **Deploy**. En unos minutos tendrás una URL pública (ej. `https://rifa-dayana-huerta.vercel.app`).

(Alternativa: [Netlify](https://netlify.com) funciona igual — "Add new site → Import from Git",
mismo build command `npm run build`, carpeta de salida `dist`, mismas variables de entorno.)

## 7. Links finales

- **Vista pública (para compartir con todos):** `https://tu-dominio/` — cuadrícula de números,
  reservar, ver ticket y avance en vivo.
- **Vista de administración (solo Thaidis y Daniela):** `https://tu-dominio/admin/login` —
  dashboard, participantes, marcar pagado/liberar/editar, exportar CSV.

## Notas de diseño

- **Concurrencia:** reservar un número usa una función SQL atómica (`reservar_numero`) con
  `UPDATE ... WHERE estado = 'disponible'`. Si dos personas eligen el mismo número al mismo
  tiempo, solo una lo consigue; la otra recibe el aviso "Justo alguien más tomó este número".
- **Tiempo real:** tanto la vista pública como el panel usan Supabase Realtime (`postgres_changes`)
  para reflejar cambios al instante en todos los dispositivos conectados, sin recargar la página.
- **Seguridad:** marcar pagado, liberar números, editar/registrar manualmente y exportar solo
  funcionan si hay una sesión válida que además exista en la tabla `admins`. La vista pública
  nunca puede modificar esos estados directamente.
