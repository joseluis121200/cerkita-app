# AGENTS.md — Cerca

Reglas obligatorias para cualquier agente de IA (y para los dos socios) que toque este repositorio. Léelas enteras antes de escribir código. Si una tarea choca con alguna regla, **para y pregunta**: no improvises excepciones.

La especificación de producto está en `CONTEXT.md` (Blueprint Maestro v2.0). **Las decisiones de la sección 2 de este archivo son posteriores y prevalecen sobre `CONTEXT.md`.** En todo lo demás, si este archivo y `CONTEXT.md` se contradicen, manda `CONTEXT.md` y se corrige este archivo en el mismo PR.

---

## 1. Qué es Cerca (y qué NO es)

App de comunicación diaria entre seres queridos. Un **círculo** de personas manda cada día una **postal** (foto + texto) a su **ser querido**, que responde con un solo toque: «Mandar los buenos días al círculo». Si no saluda a su hora límite, el círculo lo sabe para llamarle.

- **No es un producto sanitario ni un servicio de emergencias.** Prohibida en toda la app, las notificaciones y las fichas de tienda la terminología clínica: «diagnóstico», «monitorización», «teleasistencia», «paciente». Nunca prometer detección de caídas ni sustituir al 112.
- **Idioma:** español de España, tuteo, tono cálido. Código, tablas, variables, ramas y commits en inglés. Comentarios en español cuando expliquen el *porqué*.

### Vocabulario visible (obligatorio en el 100 % de la interfaz)

| En la interfaz se dice | Nunca | En código / base de datos (no renombrar) |
|---|---|---|
| **Tu Círculo**, el círculo | familia | `families`, `familyId` |
| **Seres queridos** / **Persona acompañada** | mayor, anciano, abuelo (salvo como etiqueta elegida) | `elder_monitors`, `elder` |
| **Acompañantes** (administradores) | hijos, administrador a secas | rol `admin` |
| **Miembros del círculo** | nietos, familiares | rol `member` |
| **Postal** / postal del día | foto subida, momento | `moments` |
| **Aviso** | alarma, alerta, emergencia, SOS, vigilancia, control | `alerted_admins` |

La relación con el ser querido es una etiqueta abierta que elige el usuario (Madre, Abuela, Vecina especial, Madrina…) y se guarda en `elder_monitors.relationship_label`.

## 2. Decisiones posteriores a CONTEXT.md v2.0 (prevalecen)

1. **Concepto «Tu Círculo / Seres queridos»** en lugar de «familia» (sección 1).
2. **Freemium permanente desde el día 1** (sin prueba de 14 días):

   | Gratis para siempre | Círculo Plus (4,99 €/mes · 39,99 €/año, todo el círculo) |
   |---|---|
   | 1 postal al día **por persona** (acompañante o miembro; día natural de Madrid) | Postales ilimitadas para todo el círculo |
   | 1 ser querido | Hasta 4 seres queridos |
   | Saludo diario + aviso **solo dentro de la app** | Doble recordatorio + aviso push prioritario y email a todos los acompañantes |
   | Recuerdos de los últimos 14 días (los antiguos quedan bloqueados, no se borran) | Todos los recuerdos + modo vacaciones |

   El servidor aplica los límites (migraciones `0003` y `0004`: `private.family_has_plus`, triggers y RLS). La app solo los muestra.
3. **Interruptor de promoción:** `FEATURE_FLAGS.SHOW_PLUS_UPSELL` en `src/shared/config/featureFlags.ts`. Con `false` se oculta toda invitación a Plus; los límites siguen activos.
4. **Identidad visual Coral Cereza + Marfil** (sección 6).
5. **Capa social:** reacciones ❤️ 🥰 ☀️ 👏 (`moment_reactions`), mini-comentarios de 100 caracteres (`moment_comments`), «Animar 👋» (`member_nudges`), Burbujas del Círculo, carrusel de postales del día, «El Guiño del Día» (45 ideas en `daily-wink.ts`), Racha del Círculo y «Pulso de la semana» con la Estrella del Círculo 🏆.
7. **Cuenta de revisión** para Apple y Google: `revisor@cercaapp.es` + código fijo en el secreto `REVIEW_OTP_CODE` (Edge Function `review-login`).
6. **Fase actual en Expo Go** (sección 3).

**Fuera del MVP (no implementar aunque parezca fácil):** vídeos y audios, recordatorios con voz, SMS, widgets, detección de caídas, GPS, videollamadas, smartwatch.

## 3. Stack cerrado

No añadas, cambies ni actualices dependencias sin aprobación explícita en la tarea. Instala siempre con `npx expo install <paquete>`.

| Capa | Herramienta |
|---|---|
| App | Expo SDK 58 + React Native + Expo Router (rutas en `src/app/`) + TypeScript strict |
| Builds | Fase actual: **Expo Go**. Después: EAS Cloud Build + EAS Submit (`eas.json`), desde Windows y sin Mac |
| Estilos | `StyleSheet` con tokens de diseño (`ui-family/theme.ts`, `ui-elder/theme.ts`) |
| Estado de servidor | TanStack Query v5 persistido en AsyncStorage (MMKV al pasar a development build) |
| Estado de UI efímero | Zustand mínimo (`src/shared/stores`), nunca datos del servidor |
| Backend | Supabase `eu-central-1` (Frankfurt): Postgres + RLS, Auth, Storage, Edge Functions, pg_cron |
| Login | Email OTP (funciona). Apple y Google: botones preparados para el development build |
| Emails de aviso | Resend, solo desde Edge Functions |
| Pagos | RevenueCat, detrás del adaptador `src/features/subscription/purchases.ts` |
| Observabilidad | Sentry y PostHog EU, detrás de `src/shared/utils/logger.ts` (pendientes) |

**Fase Expo Go:** la app debe arrancar en Expo Go sin pantallas rojas. Todo módulo que necesite build nativo (push remotas, RevenueCat, Sentry, MMKV) va detrás de un adaptador que no lanza errores. Prohibido código nativo manual (Swift/Kotlin) o librerías que exijan abrir Xcode.

**Modo prueba:** sin `.env`, la app usa el motor local `src/shared/demo` («El círculo de Carmen»). Cada función de `api.ts` tiene su rama `isDemoMode` con la versión de prueba en `demo.ts` / `*.demo.ts`, que debe aplicar **los mismos límites que el servidor**. La píldora «🧪 Prueba» solo aparece en `__DEV__` y en modo prueba.

## 4. Estructura de carpetas

```text
AGENTS.md · CONTEXT.md · ESTADO_AVANCE.md
GUIA_PUBLICACION_TIENDAS.md · FICHA_TIENDAS_ASO.md
app.json · eas.json           Configuración de tiendas (bundle es.cercaapp.circulo)
legal-web/                    Web estática: landing, privacidad, condiciones, eliminar cuenta
scripts/generate-icons.py     Regenera iconos y splash con la marca
src/
  app/                        Expo Router: SOLO rutas y layouts finos
    (public)/                 welcome, login, verify, onboarding, pair-elder, join
    (elder)/                  elder (pantalla única) + elder-settings (ajustes ocultos)
    (family)/                 Stack: (tabs) + elder/[id], invite, paywall (se abren ENCIMA de las pestañas)
      (tabs)/                 home (Hoy), upload (Postal), album (Recuerdos), elders (Seres queridos), settings
  features/
    auth-pairing/             Acceso, círculo, invitaciones, unión del móvil del ser querido
    checkin-engine/           Saludo diario, estados, avisos, rachas
    moments/                  Postales, compresión, reacciones, recuerdos
    elder-config/             Ficha y horarios de cada ser querido
    subscription/             Plan gratuito, Círculo Plus, paywall
  shared/
    api/ config/ demo/ dev/ stores/ ui-elder/ ui-family/ utils/
supabase/
  config.toml · templates/ · migrations/ (0001 a 0004 y después timestamps)
  functions/                  redeem-pairing-code, evaluate-checkins, cleanup-expired-media,
                              revenuecat-webhook, delete-account, review-login, _shared
```

### Anatomía de una feature

```text
src/features/<feature>/
  api.ts / *.api.ts   Llamadas a Supabase (select, insert, rpc, storage)
  demo.ts / *.demo.ts Implementación del modo prueba
  hooks.ts            Hooks de TanStack Query (si crece: *-hooks.ts)
  query-keys.ts       Claves de caché
  schemas.ts          Zod, tipos del dominio y textos derivados
  components/         Componentes de la feature
  index.ts            API pública: lo único que el resto del proyecto puede importar
```

**Dependencias:** `src/app/` importa de `src/features/<x>` (solo su `index.ts`) y de `src/shared/`. Una feature importa de `src/shared/` y del `index.ts` de otra feature. `src/shared/` nunca importa de `src/features/` ni de `src/app/`.

## 5. Reglas de oro

1. **Migraciones o nada.** Ningún cambio de esquema desde el panel web. Siempre `npx supabase migration new <nombre>` + `npm run db:types`, en el mismo commit. Nunca se edita una migración ya aplicada en remoto.
2. **UI separada de datos.** Prohibido importar el cliente de Supabase en cualquier `.tsx` (ESLint lo bloquea). Para saber si estás en modo prueba: `isDemoMode` de `@/shared/api/mode`.
3. **Máximo 250 líneas por archivo `.ts`/`.tsx`** (ESLint lo bloquea). Excluidos: migraciones SQL y `database.types.ts`.
4. **Persona acompañada accesible** (sección 7).
5. **Avisos idempotentes.** `evaluate-checkins` cambia de estado con `update ... where status in (<previos>) returning` y solo notifica por las filas devueltas.
6. **Zonas horarias explícitas.** Servidor en `timestamptz` (UTC); horarios del ser querido con su zona (`Europe/Madrid` o `Atlantic/Canary`). La postal gratis diaria se cuenta por el día natural de Madrid.
7. **Validación con Zod** de todo payload que entra en una Edge Function, antes de cualquier lógica.
8. **Multimedia privada.** Bucket privado `family-moments`, rutas `{family_id}/{uuid}.webp`, solo URLs firmadas.
9. **Límites del plan en servidor.** Cualquier límite nuevo de Círculo Plus se implementa primero en SQL/Edge Function y después se refleja en la interfaz y en el modo prueba.

## 6. Identidad visual

**Acompañantes y miembros (`ui-family`): con fuerza y sin tibieza.**
- Base marfil `#F6F4F0` y tinta `#16161A`, marca **Coral Cereza** `#E11D48` (botones, 4,7:1 con blanco).
- **Bloques de impacto:** tarjetas Hero en **Tinta Noche / Índigo** (`#181826` → `#272343`) con texto blanco y destellos **Ámbar Oro** `#FFB800`; tarjetas de acción en degradado **Coral → Mandarina**; barra de pestañas en Tinta Noche.
- **Paleta secundaria con significado:** Ámbar `#F59E0B` = rachas y logros · Violeta `#7C3AED` = Guiño del Día · Esmeralda `#10B981` = bienestar confirmado. Cada persona tiene su **color de anillo** (`colorForPerson`).
- **Postales «Polaroid táctil»:** marco blanco con sombra cálida, hora estilo carrete, etiqueta con el color del autor y rebote al reaccionar.

**Persona acompañada (`ui-elder`): serena, sin cambios de estilo.** Marfil, tinta, un solo botón Coral Cereza. Nada de degradados ni de colores vivos en su pantalla.

Los colores salen **siempre** de los tokens de `theme.ts` (`familyColors`, `familyGradients`). Nada de hexadecimales sueltos en componentes (excepción: la píldora de desarrollo).

## 7. Modo Persona Acompañada: accesibilidad obligatoria

Aplica a `src/app/(elder)/**` y `src/shared/ui-elder/**`:

- Marco fotográfico de revista: la postal protagonista arriba, texto editorial grande y **un único botón píldora Coral Cereza de ≥ 70 dp** abajo («Mandar los buenos días al círculo»), o el estado confirmado sereno.
- Si hoy hay 2 o más postales: «N postales nuevas hoy» y dos botones grandes «◀ Anterior» / «Siguiente ▶» (nunca deslizar).
- Texto de cuerpo **≥ 23 pt**, títulos ≥ 31 pt. Nunca `allowFontScaling={false}`.
- Áreas táctiles ≥ 72 dp, separadas ≥ 12 dp. Contraste AAA (texto normal ≥ 7:1; texto grande ≥ 4,5:1).
- Sin menús ni gestos obligatorios. La única excepción: los ajustes del móvil se abren manteniendo pulsado 4 s un icono discreto, pensado para quien acompaña.
- Respuesta háptica a cada toque, protección contra dobles toques y saludo offline-first (cola local).
- Prohibidos los modales, los mensajes importantes que desaparecen solos y los temporizadores.

## 8. Backend: dónde vive cada lógica

- **RLS en el 100 % de las tablas**, políticas `to authenticated`, `revoke all ... from anon` y privilegios por columna.
- **Funciones auxiliares** en el esquema `private`, con `security definer`, `set search_path = ''` y nombres cualificados.
- **Lógica transaccional de base de datos** (crear círculo, unirse, saludo, «Ya hablé con…», límites del plan) → SQL en una migración.
- **Lógica con secretos o servicios externos** (canje de código, cron de avisos, Resend, Expo Push, RevenueCat, limpieza, borrado de cuenta) → Edge Function.
- **La service role key y las claves de Resend jamás llegan a la app.** En el cliente solo `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

## 9. Tiendas

- Configuración en `app.json`: orientación vertical, `supportsTablet: false`, `ITSAppUsesNonExemptEncryption: false`, textos de permisos en español y permisos de Android mínimos (micrófono, ubicación y contactos bloqueados). No añadas permisos sin aprobación.
- Cualquier cambio en datos recogidos obliga a actualizar `legal-web/privacidad.html` y las respuestas de privacidad de `GUIA_PUBLICACION_TIENDAS.md`.

## 10. TypeScript, estilo y flujo de trabajo

- `strict` + `noUncheckedIndexedAccess`. Prohibidos `any`, `@ts-ignore` y el operador `!` sin justificar. Named exports (default solo en `src/app/`). `if/else` claros antes que encadenamientos ingeniosos. Nunca un `catch` vacío: usa `logError`. Ningún dato personal en logs: solo ids.
- `main` protegida, ramas cortas (`feat/…`, `fix/…`), PRs pequeñas con descripción para WhatsApp, Conventional Commits.
- Antes de dar algo por terminado: `npm run typecheck`, `npm run lint` y `npx expo export --platform android --output-dir .expo-verify` (y borrar la carpeta) en verde.

## 11. Comandos

| Comando | Para qué |
|---|---|
| `npx expo start` | Arranca la app para Expo Go (añade `-c` para limpiar la caché) |
| `npm run typecheck` / `npm run lint` | TypeScript y ESLint |
| `npx supabase start` / `npx supabase db reset` | Supabase local (Docker) / recrear la BD con todas las migraciones |
| `npm run db:types` | Regenera `src/shared/api/database.types.ts` |
| `python scripts/generate-icons.py` | Regenera iconos y splash |
| `eas build -p android --profile preview` | APK de prueba |
| `eas build -p all --profile production` + `eas submit` | Compilación y envío a tiendas |
