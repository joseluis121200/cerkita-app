# AGENTS.md — Cerca

Reglas obligatorias para cualquier agente de IA (y para los dos socios) que toque este repositorio. Léelas enteras antes de escribir código. Si una tarea choca con alguna regla, **para y pregunta**: no improvises excepciones.

La especificación completa (producto, alcance, modelo de datos, calendario) está en `CONTEXT.md`, el Blueprint Maestro v2.0 con las decisiones cerradas. Es la fuente única de verdad. Si este archivo y `CONTEXT.md` se contradicen, manda `CONTEXT.md` y se corrige este archivo en el mismo PR.

---

## 1. Qué es Cerca (y qué NO es)

Red privada de conexión familiar diaria. Cada mañana el mayor ve una foto de su familia y pulsa «Dar los buenos días ☀️». Si no da señal dentro de su ventana horaria, la app le recuerda con cariño y, si sigue sin responder, avisa a los hijos administradores (push prioritario + email) para que le llamen.

- **No es un producto sanitario ni un servicio de emergencias.** Prohibida en toda la app, las notificaciones y las fichas de tienda la terminología clínica: «diagnóstico», «monitorización médica», «teleasistencia», «paciente». Nunca prometer detección de caídas ni sustituir al 112.
- **Vocabulario prohibido en la interfaz del mayor:** «vigilancia», «control», «monitorizar», «alerta», «alarma», «emergencia», «SOS», «anciano».
- **Idioma:** interfaz en español de España, tuteo, tono cálido. Código, tablas, variables, ramas y commits en inglés. Comentarios en español cuando expliquen el _porqué_.

## 2. Alcance del MVP v1.0 (cerrado)

Dentro: vinculación del mayor por QR / código de 6 dígitos, configuración remota de hasta 4 mayores por familia, fotos con pie de foto (máx. 140 caracteres), recuerdo aleatorio del álbum cuando no hay foto nueva, protocolo escalonado de tranquilidad, trial de 14 días sin tarjeta, freemium y suscripción familiar.

**Fuera (prohibido implementarlo antes de publicar la v1.0, aunque parezca fácil):**

- Vídeos y audios de cualquier tipo. La v1.0 es **solo foto + texto**.
- Recordatorios de pastillas con voz y SMS de respaldo (v1.1).
- Widgets de pantalla de inicio y notas de voz (v1.2).
- Detección de caídas, GPS en segundo plano, videollamadas, smartwatch.

## 3. Stack cerrado

No añadas, cambies ni actualices dependencias sin aprobación explícita en la tarea. Instala siempre con `npx expo install <paquete>`.

| Capa                 | Herramienta                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------- |
| App                  | Expo (SDK actual) + React Native + Expo Router + TypeScript strict                          |
| Builds               | EAS Cloud Build + EAS Update (desarrollamos en Windows, sin Mac)                            |
| Estilos              | NativeWind v4 con tokens separados `ui-elder` y `ui-family`                                 |
| Estado de servidor   | TanStack Query v5 persistido en `react-native-mmkv`                                         |
| Estado de UI efímero | Zustand mínimo (nunca datos del servidor)                                                   |
| Backend              | Supabase `eu-central-1` (Frankfurt): Postgres + RLS, Auth, Storage, Edge Functions, pg_cron |
| Login familiar       | Sign in with Apple, Google Sign-In y Email OTP. Sin contraseñas                             |
| Emails de aviso      | Resend, llamado solo desde Edge Functions                                                   |
| Pagos                | RevenueCat (`react-native-purchases`)                                                       |
| Observabilidad       | Sentry (`@sentry/react-native`) + PostHog EU                                                |

**Restricción Windows + EAS:** prohibido escribir código nativo manual (Swift/Objective-C/Kotlin) o añadir librerías que exijan abrir Xcode. Todo debe funcionar con development builds compilados en EAS. Expo Go no sirve (MMKV y RevenueCat lo impiden).

## 4. Estructura de carpetas

```text
AGENTS.md                 Este archivo
CONTEXT.md                Blueprint Maestro v2.0 (fuente única de verdad)
app/                      Expo Router: SOLO rutas y layouts finos
  (public)/               Bienvenida, login Apple/Google/OTP, código del mayor
  (elder)/                Pantalla única del mayor
  (family)/               Tabs: Tranquilidad, Subir foto, Álbum, Ajustes de mayores
src/
  features/
    auth-pairing/         Login familiar + generación y canje del código/QR del mayor
    checkin-engine/       Botón «Buenos días», estado de cada mayor, «Ya hablé con ella ✅»
    moments/              Compresión, subida, foto del día y recuerdo de respaldo
    elder-config/         Horarios, vacaciones y teléfono de hasta 4 mayores
    subscription/         Trial, freemium y paywall con RevenueCat
  shared/
    api/                  Cliente Supabase + database.types.ts (generado, no editar)
    ui-elder/             Componentes accesibles del mayor
    ui-family/            Componentes de hijos y nietos
    utils/                Fechas y zonas horarias, compresión de imagen, Sentry
supabase/
  migrations/             ÚNICA vía para cambiar el esquema
  functions/
    redeem-pairing-code/  Canjea el código y deja al móvil del mayor con sesión duradera
    evaluate-checkins/    Cron cada 5 min: recordatorios al mayor y avisos a admins
    cleanup-expired-media/ Cron diario: borra fotos > 30 días de familias gratuitas
    revenuecat-webhook/   Sincroniza el plan de la familia
```

### Anatomía de una feature

```text
src/features/<feature>/
  api.ts          Único archivo con llamadas a Supabase (select, insert, rpc, storage)
  hooks.ts        Hooks de TanStack Query que envuelven api.ts
  query-keys.ts   Claves de caché de la feature
  schemas.ts      Esquemas Zod y tipos derivados
  components/     Componentes de la feature
  index.ts        API pública: lo único que el resto del proyecto puede importar
```

### Reglas de dependencia

- `app/` importa de `src/features/<x>` (solo su `index.ts`) y de `src/shared/`. Las rutas componen pantallas; no contienen lógica de negocio.
- Una feature importa de `src/shared/` y del `index.ts` de otra feature. Nunca de sus archivos internos.
- `src/shared/` nunca importa de `src/features/` ni de `app/`.

## 5. Reglas de oro

1. **Migraciones o nada.** Ningún cambio de tablas, índices, funciones o políticas RLS desde el panel web. Siempre `npx supabase migration new <nombre>` + `npm run db:types`, y ambos archivos en el mismo commit. Nunca se edita una migración ya aplicada en remoto: se crea otra nueva.
2. **UI separada de datos.** Prohibido `supabase.from()` o importar el cliente de Supabase en cualquier `.tsx`. Las consultas viven en `api.ts` y se consumen con los hooks de `hooks.ts`.
3. **Máximo 250 líneas por archivo `.ts`/`.tsx`.** Si se supera, divide en subcomponentes o funciones puras antes de seguir. Excluidos: migraciones SQL y `database.types.ts`.
4. **Modo Mayor accesible** (sección 6).
5. **Avisos idempotentes.** `evaluate-checkins` cambia de estado con `update ... where status = '<estado previo>' returning *` y solo envía push/email por las filas que devuelve. Dos ejecuciones del cron jamás duplican un aviso.
6. **Zonas horarias explícitas.** En servidor todo es `timestamptz` (UTC). Los horarios de cada mayor se evalúan con su zona (`Europe/Madrid` o `Atlantic/Canary`). La hora del dispositivo nunca decide si se avisa a la familia: lo decide el servidor.
7. **Validación con Zod** de todo payload que entra en una Edge Function, antes de cualquier lógica.
8. **Multimedia privada.** Prohibido crear buckets públicos. Rutas siempre `{family_id}/{uuid}.webp` y acceso solo con URLs firmadas temporales.

## 6. Modo Mayor: accesibilidad obligatoria

Aplica a `app/(elder)/**` y `src/shared/ui-elder/**`:

- Texto de cuerpo **mínimo 22 pt**, títulos mínimo 28 pt. Nunca `allowFontScaling={false}`; el diseño no puede romperse con la fuente del sistema al máximo.
- Áreas táctiles **mínimo 64 × 64 dp**, con al menos 12 dp de separación.
- Contraste WCAG AAA (7:1 en texto normal).
- Pantalla única con una sola acción principal: foto del día, su texto y el botón «Dar los buenos días ☀️». El mayor entra desde la notificación y sale con normalidad; la app no bloquea su móvil ni sustituye su menú.
- Ajustes ocultos: todo se configura en remoto desde el móvil del hijo. Sin cierre de sesión visible.
- Sin gestos obligatorios: nada de deslizar, doble toque, pulsación larga ni pellizcar.
- Iconos siempre acompañados de texto. Todo elemento táctil lleva `accessibilityRole` y `accessibilityLabel`.
- Respuesta inmediata a cada toque (visual + háptica). Sin conexión, el saludo se encola y se envía después.
- Prohibidos los modales, los mensajes importantes que desaparecen solos y cualquier temporizador que exija rapidez.

## 7. Backend: dónde vive cada lógica

- **RLS activado en el 100 % de las tablas.** Políticas siempre `to authenticated`; el rol `anon` no lee nada. Cada tabla nueva: `enable row level security` + `revoke all ... from anon` + privilegios por columna si la app puede escribir en ella.
- **Funciones auxiliares de RLS** en el esquema `private` (no expuesto a la API), con `security definer`, `set search_path = ''` y nombres totalmente cualificados (`public.tabla`).
- **Lógica transaccional pura de base de datos** (crear familia, unirse con el enlace de invitación, registrar el saludo, marcar «Ya hablé con ella») → función SQL (RPC) dentro de una migración.
- **Lógica que necesita secretos, servicios externos o la service role** (canjear el código del mayor, cron de avisos, Resend, Expo Push, webhook de RevenueCat, limpieza de fotos, borrado de cuenta) → Edge Function.
- **Escrituras sensibles** (membresías, check-ins, plan de la familia) nunca con `insert`/`update` directo desde la app: solo vía RPC o Edge Function.
- **Reglas del plan gratuito en servidor:** con `free_limited` solo 1 mayor activo, sin avisos automáticos a admins y fotos que caducan a los 30 días. La app solo muestra; el servidor decide.
- **La service role key y las claves de Resend jamás llegan a la app.** En el cliente solo existen `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

## 8. Datos en el cliente

- Datos del servidor solo en TanStack Query. Zustand únicamente para estado de interfaz efímero.
- El saludo del mayor es offline-first: se encola, se reintenta y envía la hora real del toque.
- Comprimir siempre antes de subir: lado mayor 1280 px, WebP (o JPEG), **≤ 180 KB**.

## 9. TypeScript y estilo

- `strict` + `noUncheckedIndexedAccess`. Prohibidos `any`, `@ts-ignore` y el operador `!` salvo con un comentario que lo justifique.
- Named exports. Default export solo donde Expo Router lo exige (archivos de `app/`).
- Código explícito y fácil de leer: `if/else` claros antes que encadenamientos ingeniosos, bucles simples antes que `reduce` complejos.
- Nunca un `catch` vacío: reporta a Sentry con contexto.
- Ningún dato personal (nombres, fotos, teléfonos, emails) en logs, Sentry ni PostHog. Solo ids.

## 10. Flujo de trabajo

- `main` protegida. Ramas cortas (`feat/…`, `fix/…`, `chore/…`) de 1–2 días como máximo.
- PRs pequeñas y centradas en una sola cosa, con descripción breve que se pueda pegar en el WhatsApp del equipo. Siempre las revisa el otro socio.
- Commits en formato Conventional Commits (`feat(moments): compress photos before upload`).
- Antes de dar una tarea por terminada: `npm run typecheck`, `npm run lint` y `npm test` en verde. Si tocaste la base de datos: migración nueva + tipos regenerados en el mismo commit.
- Al entregar código, el agente indica qué archivos ha creado o modificado y qué ha quedado pendiente.

## 11. Comandos

| Comando                               | Para qué                                               |
| ------------------------------------- | ------------------------------------------------------ |
| `npx supabase start`                  | Levanta Supabase local (requiere Docker Desktop)       |
| `npx supabase migration new <nombre>` | Crea una migración vacía                               |
| `npx supabase db reset`               | Recrea la BD local aplicando todas las migraciones     |
| `npm run db:types`                    | Regenera `src/shared/api/database.types.ts`            |
| `npm run typecheck`                   | `tsc --noEmit`                                         |
| `npm run lint`                        | ESLint (incluye límite de líneas e imports prohibidos) |
| `npm test`                            | Tests                                                  |
| `npx expo start --dev-client`         | Arranca la app en un development build                 |
