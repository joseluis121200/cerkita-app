# Guía de Ejecución Paso a Paso con IA: De `create-expo-app` a Producción

> [!IMPORTANT]
> **Cómo usar esta guía en VS Code:** Guarda este archivo en la raíz de tu repositorio como `ROADMAP.md` (junto a `CONTEXT.md` —tu blueprint— y `AGENTS.md`). **Nunca le pidas a la IA «hazme toda la app» de golpe.** Avanza **una sola fase cada vez**: copia el prompt de la fase correspondiente, verifica el checklist en tu móvil/consola, haz `git commit` y solo entonces pasa a la siguiente fase.

---

## Regla de Oro del Flujo de Trabajo entre los 2 Socios

Para cada una de las 10 fases siguientes, aplicad siempre este ciclo estricto de 4 pasos:

1. **Crear rama corta:** `git checkout -b feat/fase-X-nombre`
2. **Pegar el Prompt de la Fase a la IA** exigiéndole que primero enumere los archivos que va a crear/tocar antes de editar.
3. **Pasar el Filtro de Calidad obligatorio antes de hacer commit:**
   - Ejecutar `npx tsc --noEmit` (debe dar **0 errores de TypeScript**).
   - Comprobar que ningún archivo nuevo supera las **250 líneas** definidas en `AGENTS.md`.
   - Probar la validación funcional indicada al final de cada fase.
4. **Merge limpio a `main`** y `git pull` del otro socio antes de abrir la siguiente rama.

---

## Fase 1: Limpieza del Boilerplate de Expo, Arquitectura de Carpetas y Sistema UI Dual

_(Ejecutar juntos antes de dividir trabajo — Compatible 100% con Expo Go para ir rápido las primeras 48h)_

> [!TIP]
> **Trampa evitada en Windows:** No instaléis módulos nativos puros (como `react-native-mmkv`, RevenueCat o Apple/Google Sign-In nativo) hasta la **Fase 6**, para poder probar las Fases 1 a 5 al instante escaneando el QR con **Expo Go** en vuestros móviles sin esperar compilaciones en la nube. Usaremos `AsyncStorage` envuelto en un adaptador limpio `src/shared/utils/storage.ts`.

### Prompt para la IA (Fase 1):

```text
Lee CONTEXT.md y AGENTS.md. Acabamos de inicializar el proyecto con create-expo-app en Windows.
Ejecuta únicamente la FASE 1 siguiendo estas reglas estrictas:
1. Elimina las pantallas y componentes de ejemplo que trae la plantilla de Expo (explore, ParallaxScrollView, HelloWave, etc.).
2. Configura TypeScript en modo estricto ("strict": true) y el alias "@/*" apuntando a "./src/*" en tsconfig.json.
3. Instala usando exclusivamente "npx expo install" las dependencias base compatibles con Expo Go: nativewind, tailwindcss, react-native-reanimated, react-native-safe-area-context, @tanstack/react-query, zustand, @react-native-async-storage/async-storage, lucide-react-native y zod.
4. Crea toda la estructura de directorios vacía definida en la Sección 6 de CONTEXT.md: app/(public), app/(elder), app/(family), src/features/*, src/shared/api, src/shared/ui-elder, src/shared/ui-family y src/shared/utils.
5. En src/shared/ui-elder crea los componentes base accesibles (ElderScreen, GiantButton con altura mínima 68dp y feedback táctil claro, ElderTitle >=26px y ElderBody >=22px con alto contraste).
6. Crea una pantalla temporal de previsualización en app/index.tsx que nos permita alternar y ver en Expo Go el diseño base de ui-elder y ui-family.
7. Verifica al terminar que "npx tsc --noEmit" devuelve 0 errores y ningún archivo supera 250 líneas.
```

- **Verificación para pasar a Fase 2:** Ejecutar `npx expo start`, escanear con vuestro móvil en Expo Go, ver los botones gigantes del Modo Mayor funcionando sin errores rojos y hacer el primer `git commit` en `main`.

---

## Fase 2: Proyecto Supabase (UE), Esquema SQL Multi-Mayor, RLS y Tipos Autogenerados

_(Lidera: Socio A — Backend)_

### Preparación manual previa (5 minutos):

1. Crear proyecto gratuito en [supabase.com](https://supabase.com) eligiendo **Región: Central EU (Frankfurt)**.
2. Copiar `Project URL` y `anon public key` en un archivo `.env` local (`EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`) y asegurarse de que `.env` está en `.gitignore`.

### Prompt para la IA (Fase 2):

```text
Lee CONTEXT.md (Sección 5: Modelo de Datos) y AGENTS.md. Vamos a ejecutar la FASE 2: Base de Datos, RLS y Cliente Tipado.
1. Instala "@supabase/supabase-js" y "react-native-url-polyfill" con "npx expo install".
2. Inicializa la carpeta "supabase/migrations/" y crea "0001_initial_schema.sql" con todas las tablas de la Sección 5 de CONTEXT.md: profiles, families, family_members, elder_monitors, daily_checkins, moments, pairing_codes y device_push_tokens.
3. Incluye un trigger automático que cree la fila en "profiles" cuando se registre un usuario en auth.users.
4. CRÍTICO (Evitar recursión infinita en RLS): Crea funciones auxiliares SQL "SECURITY DEFINER" (como get_my_family_ids() y is_family_admin(target_family_id)) y úsalas para escribir las políticas Row Level Security (RLS) en TODAS las tablas y en el bucket privado de Storage "family-moments". Ningún usuario autenticado debe poder leer ni escribir filas de otra familia.
5. Crea el cliente tipado en "src/shared/api/supabase.ts" persistiendo la sesión con nuestro adaptador AsyncStorage de "src/shared/utils/storage.ts" y con autoRefreshToken activado.
6. Dime los comandos exactos de Supabase CLI para aplicar esta migración a nuestro proyecto en la nube y autogenerar "src/shared/api/database.types.ts".
```

- **Verificación para pasar a Fase 3:** Migración aplicada sin errores en Supabase, RLS en verde en todas las tablas, bucket privado `family-moments` creado y `database.types.ts` generado con `npx tsc --noEmit` limpio.

---

## Fase 3: Login Sin Contraseña (Email OTP) + Enrutado por Rol + Creación de Familia

_(En paralelo: Socio A hace API/Hooks de Auth y Socio B hace pantallas de bienvenida y alta)_

### Configuración manual previa en Supabase (2 minutos):

- En _Supabase Dashboard -> Authentication -> Providers -> Email_: activar Email y configurar la plantilla _Magic Link / OTP_ usando `{{ .Token }}` para que envíe el **código numérico de 6 dígitos** al correo en lugar de un enlace web incómodo en el móvil.

### Prompt para la IA (Fase 3):

```text
Lee CONTEXT.md y AGENTS.md. Vamos a ejecutar la FASE 3: Autenticación de familiares por código OTP de 6 dígitos, creación del círculo familiar y guardia de navegación por rol.
Recuerda: CERO llamadas a supabase dentro de archivos .tsx; toda consulta va en src/features/auth-pairing/api.ts + hooks de TanStack Query.
1. En "src/features/auth-pairing", implementa el envío de código OTP al email (signInWithOtp) y su verificación de 6 dígitos (verifyOtp), además de la creación inicial de familia (insertando en "families" con plan_status='trialing' y trial_ends_at = +14 días, y añadiendo al creador en "family_members" con role='admin').
2. En "app/_layout.tsx", implementa la guardia reactiva de sesión y rol:
   - Sin sesión -> redirige a "app/(public)/welcome".
   - Con sesión pero sin familia -> pantalla de "Crear mi familia" o "Tengo un código de invitación".
   - Con sesión y role === 'elder' -> bloquea la navegación dentro de "app/(elder)" impidiendo volver atrás.
   - Con sesión y role === 'admin' o 'member' -> redirige a "app/(family)".
3. Deja visibles pero marcados como "Próximamente en compilación nativa" los botones de Apple y Google (los conectaremos en la Fase 6 al pasar a EAS Development Build).
```

- **Verificación para pasar a Fase 4:** Registrarte con tu correo real desde el móvil, meter los 6 dígitos recibidos, crear tu primera familia, cerrar la app del todo, volver a abrirla y comprobar que entra directo a `(family)`.

---

## Fase 4: Vinculación del Mayor por QR / 6 Dígitos y Configuración Remota Multi-Mayor

_(Socio A: Edge Function `redeem-pairing-code` | Socio B: Pantallas de alta de mayor y teclado gigante)_

### Prompt para la IA (Fase 4):

```text
Lee CONTEXT.md (Secciones 3 y 5) y AGENTS.md. Vamos a ejecutar la FASE 4: Alta remota de mayores (hasta 4 por familia) y vinculación sin contraseña del móvil del mayor.
1. En "src/features/elder-config", permite a un usuario 'admin' dar de alta el perfil de un mayor (nombre, teléfono directo para llamadas, zona horaria por defecto Europe/Madrid, horarios de ventana matutina/avisos y modo vacaciones/acompañado) respetando el límite: hasta 4 mayores en 'trialing'/'active_paid' y 1 en 'free_limited'.
2. Permite al 'admin' generar un código temporal de 6 dígitos en "pairing_codes" (caducidad 30 minutos) mostrándolo tanto en números gigantes como en código QR.
3. Crea la Supabase Edge Function "supabase/functions/redeem-pairing-code/index.ts" validada con Zod:
   - Verifica de forma atómica que el código de 6 dígitos existe, no se ha usado y no ha expirado.
   - Crea o recupera el usuario Auth gestionado del mayor (con Service Role Key en el servidor), lo vincula en "family_members" con role='elder' y "is_managed_elder = true", marca el código como usado y devuelve una sesión válida de Supabase para que el móvil del mayor inicie sesión permanentemente.
4. En "app/(public)/pair-elder.tsx", construye usando "ui-elder" una pantalla con teclado numérico gigante (botones >=64dp) y lector QR opcional con expo-camera para vincular el teléfono del mayor en 10 segundos.
```

- **Verificación para pasar a Fase 5:** Generar código en el Móvil 1 (Hijo), escribir los 6 números en el Móvil 2 (Abuelo) y ver cómo el Móvil 2 queda dentro de `app/(elder)` conectado a esa familia.

---

## Fase 5: Fotos Comprimidas (`<= 180 KB`), Modo Marco del Mayor y Bucle "Anti-Días Vacíos"

_(Lidera: Socio B con apoyo de Socio A en Realtime)_

### Prompt para la IA (Fase 5):

```text
Lee CONTEXT.md (Sección 3.2 puntos 2 y 3) y AGENTS.md. Vamos a ejecutar la FASE 5: El corazón emocional de la app.
1. Instala "expo-image-picker", "expo-image-manipulator" y "expo-image" usando "npx expo install".
2. En "src/features/moments", crea el compresor obligatorio en "src/shared/utils/imageCompressor.ts" para redimensionar toda imagen elegida a máximo 1280px de lado mayor y comprimirla (calidad ~0.78) garantizando un peso <= 180 KB antes de subirla a "family-moments/{family_id}/{uuid}.jpg". Usa siempre Signed URLs cacheadas en TanStack Query (nunca URLs públicas).
3. Construye el Feed en "app/(family)" para subir la foto cotidiana con su pie de foto (máx. 140 caracteres) y ver en tiempo real el estado de cada mayor hoy.
4. Construye la pantalla única "app/(elder)/index.tsx" siguiendo estrictamente las reglas de accesibilidad de AGENTS.md:
   - Muestra la última foto subida hoy con letra grande (>=22px).
   - Lógica Anti-Días Vacíos: si hoy aún nadie ha subido foto, muestra automáticamente una foto aleatoria anterior del álbum familiar etiquetada con cariño como «Recuerdo familiar 💛».
   - Botón gigante «Dar los buenos días ☀️»: al pulsarlo (o al visualizar una foto nueva durante la ventana matutina), registra "status = 'ok'" en "daily_checkins" para la fecha local del mayor y actualiza instantáneamente las pantallas de los hijos mediante Supabase Realtime.
```

- **Verificación para pasar a Fase 6:** Subir una foto desde el móvil del hijo, comprobar en Supabase Storage que pesa menos de `180 KB`, verla aparecer en el móvil del mayor, pulsar «Buenos días ☀️» y ver cómo el móvil del hijo se pone en verde al instante. _(En este punto ya podéis enseñársela a 5 abuelos reales en Granada para validar tamaños y contraste)._

---

## Fase 6: Paso a EAS Cloud Build desde Windows + Notificaciones Push + Apple/Google Login

_(Ejecutar juntos — Hito de transición de Expo Go a vuestra propia App instalada)_

### Preparación manual previa:

- Tener activas vuestras cuentas de **Google Play Console (25 €)** y **Apple Developer (99 €)** y haber hecho `npm install -g eas-cli && eas login`.

### Prompt para la IA (Fase 6):

```text
Lee CONTEXT.md (Sección 4) y AGENTS.md. Vamos a ejecutar la FASE 6: Compilación nativa en la nube desde Windows con EAS, Notificaciones Push reales y Login con Apple/Google.
1. Instala con "npx expo install": expo-notifications, expo-device, expo-constants, expo-apple-authentication y @react-native-google-signin/google-signin (o el flujo OAuth nativo de Expo/Supabase compatible con EAS Managed).
2. Configura "app.json" / "app.config.ts" y genera "eas.json" con tres perfiles claros para Windows: "development" (con expo-dev-client), "preview" (APK/TestFlight interno) y "production".
3. Implementa el módulo de registro y actualización de Expo Push Tokens en la tabla "device_push_tokens", configurando en Android dos canales diferenciados: "morning-warm" (sonido amable para el mayor y saludos) y "critical-family-alert" (importancia MAX y vibración fuerte para alertas a hijos).
4. Conecta el evento de «Buenos días ☀️» del mayor (mediante Database Webhook o Edge Function ligera) para enviar un Push alegre a todos los 'admin' y 'member' de su familia: «¡[Nombre] os acaba de dar los buenos días ☀️! ¿Le subes una foto rápida?».
5. Activa los botones reales de "Iniciar sesión con Apple" (obligatorio en iOS) y "Continuar con Google" en la pantalla de bienvenida.
```

- **Verificación para pasar a Fase 7:** Lanzar `eas build --profile development --platform all` desde vuestra terminal de Windows, instalar vuestra propia app en vuestros móviles y comprobar que llega la notificación Push con la pantalla bloqueada.

---

## Fase 7: Motor de Tranquilidad (`pg_cron` cada 5 min) + Resend Email + Hito Google Play

_(Lidera: Socio A — Fiabilidad crítica)_

### Preparación manual previa:

- Crear cuenta gratuita en [resend.com](https://resend.com), verificar vuestro dominio y guardar `RESEND_API_KEY` en los secretos de Supabase (`npx supabase secrets set RESEND_API_KEY=...`).

### Prompt para la IA (Fase 7):

```text
Lee CONTEXT.md (Sección 3.2 punto 4 y Regla 5 de AGENTS.md). Vamos a ejecutar la FASE 7: El Motor Escalonado de Tranquilidad sin falsas alarmas ni duplicados.
1. Crea la Edge Function "supabase/functions/evaluate-checkins/index.ts":
   - Debe ejecutarse protegida por un token secreto interno invocada desde pg_cron cada 5 minutos.
   - Filtra únicamente mayores activos cuyos grupos familiares estén en 'trialing', 'active_paid' o 'grace_period' (ignora 'free_limited'), donde hoy sea un día activo en "active_days_mask" y "paused_until" sea nulo o pasado.
   - Calcula la fecha y hora local exacta de cada mayor usando "Intl.DateTimeFormat" con su "timezone" ('Europe/Madrid' o 'Atlantic/Canary').
   - Aplica transiciones ATÓMICAS e IDEMPOTENTES ("UPDATE ... WHERE status = ... RETURNING *") para garantizar cero envíos duplicados:
     a) Si hora >= reminder_1_at y no existe fila 'ok' -> pasa a 'reminded_1' y envía Push cálido 1 al mayor.
     b) Si hora >= reminder_2_at y status == 'reminded_1' -> pasa a 'reminded_2' y envía Push sonoro 2 al mayor.
     c) Si hora >= admin_alert_at y status in ('pending','reminded_1','reminded_2') -> pasa a 'alerted_admins' y envía Push de máxima prioridad + Email inmediato vía Resend API a todos los 'admin' de esa familia.
2. Crea la migración SQL "0002_setup_cron.sql" configurando pg_cron + pg_net cada 5 minutos.
3. En "src/features/checkin-engine" (Modo Familia), muestra una tarjeta destacada cuando un mayor esté en 'alerted_admins' con dos botones grandes: «Llamar a [Nombre]» (abre marcador telefónico directo) y «Ya hablé con él/ella, todo bien ✅» (cambia a 'resolved_by_admin' y envía Push tranquilizador al resto de hermanos).
```

- **Verificación + HITO OBLIGATORIO DE TIENDAS:**
  1. Probar el ciclo completo poniendo los avisos a +5, +10 y +15 minutos de vuestra hora actual y comprobar que llegan los Push y el Email de Resend.
  2. **¡CRÍTICO EN ESTA MISMA FASE!** Generar build con `eas build --profile production --platform android`, subirla a ** Prueba Cerrada en Google Play Console** y meter a **12–15 amigos/familiares con Android** para que empiecen a contar desde ya los **14 días obligatorios de Google Play** mientras vosotros hacéis las Fases 8, 9 y 10.

---

## Fase 8: Multiplicador Viral de WhatsApp (Invitación de Hermanos y Nietos)

_(Lidera: Socio B — Crecimiento)_

### Prompt para la IA (Fase 8):

```text
Lee CONTEXT.md (Sección 8.1) y AGENTS.md. Vamos a ejecutar la FASE 8: El bucle de invitación familiar por WhatsApp.
1. Añade en "app/(family)" y justo al terminar el onboarding del primer mayor una tarjeta clara: «Invita gratis a tus hermanos e hijos al círculo de [Nombre del Mayor]».
2. Genera códigos/enlaces de invitación familiar seguros (permitiendo elegir si entran como 'admin' que recibe alertas o como 'member'/nieto que sube fotos) y abre el menú nativo de compartir orientado a WhatsApp con un mensaje cercano pre-redactado.
3. Implementa la pantalla y lógica de unión rápida para que el familiar invitado entre al grupo en menos de 30 segundos tras iniciar sesión.
```

- **Verificación:** Mandar invitación por WhatsApp al segundo socio/hermano, unirse como `member` y comprobar que un `member` puede subir fotos pero NO tocar los horarios críticos de alertas reservado a `admin`.

---

## Fase 9: Freemium Ético del Día 15, RevenueCat y Purga de Medios (> 30 días)

_(Socio A: Webhook + Cron de limpieza | Socio B: Pantalla de Paywall en móvil)_

### Prompt para la IA (Fase 9):

```text
Lee CONTEXT.md (Sección 3.2 punto 5 y Sección 6) y AGENTS.md. Vamos a ejecutar la FASE 9: Suscripciones familiares con RevenueCat y control de costes en cuentas gratuitas.
1. Instala "react-native-purchases" con "npx expo install" y crea el módulo aislado "src/features/subscription" inicializando RevenueCat con el "family_id" como identificador o vinculándolo a la familia para que UNA sola compra desbloquee a todos los miembros del círculo.
2. Construye el Paywall cálido del Plan Familiar (4,99 €/mes y 39,99 €/año destacado con ahorro del 33%), incluyendo botón obligatorio "Restaurar compras" y enlaces legales.
3. Crea la Edge Function "supabase/functions/revenuecat-webhook/index.ts" (validada con header de autorización y Zod) que actualice "families.plan_status" ('active_paid', 'grace_period' o 'free_limited') y "paid_until", además de quitar la fecha de caducidad de las fotos existentes cuando pasan a pago.
4. Crea la Edge Function + pg_cron diario nocturno "cleanup-expired-media": pasa a 'free_limited' las familias cuyo 'trial_ends_at' haya vencido sin pago y elimina del Storage y de la tabla "moments" las fotos de más de 30 días de antigüedad SOLO de las familias en 'free_limited'. Verifica que el Modo Mayor jamás queda bloqueado en 'free_limited'.
```

- **Verificación:** Hacer una compra de prueba en entorno Sandbox (TestFlight / Google License Testers), ver cómo `plan_status` pasa a `active_paid` en Supabase y comprobar que en modo `free_limited` el abuelo sigue pudiendo ver la foto del día y saludar.

---

## Fase 10: Blindaje de Aprobación Apple/Google, Analítica y Lanzamiento v1.0

_(Ejecutar juntos)_

> [!CAUTION]
> **Motivo nº 1 de rechazo en revisión de Apple App Store:** Olvidar el botón de **Eliminar cuenta** dentro de la app (Guideline 5.1.1v) o no aclarar que no es un servicio médico de urgencias. Esta fase lo deja blindado a la primera.

### Prompt para la IA (Fase 10):

```text
Lee CONTEXT.md y AGENTS.md. Vamos a ejecutar la FASE 10 final antes de enviar a revisión de Apple App Store y Google Play Producción:
1. Implementa en Ajustes de Familia y Perfil el flujo obligatorio de «Eliminar mi cuenta y mis datos» (con confirmación clara) conectado a una Edge Function segura "delete-account" que limpie los archivos de Storage correspondientes y elimine el usuario de auth.users. Si es el único 'admin' de una familia con suscripción activa, recuérdale antes cómo gestionar su suscripción en Apple/Google.
2. Integra "@sentry/react-native" para captura de errores en producción y "posthog-react-native" apuntando a la instancia europea (eu.i.posthog.com) registrando únicamente los 6 eventos clave del embudo: account_created, family_created, elder_paired, family_member_invited, morning_checkin_completed y subscription_started.
3. Añade el aviso claro y amable en el onboarding y ajustes de que la aplicación es una herramienta de comunicación familiar cotidiana y no sustituye al 112 ni a servicios médicos.
4. Haz una auditoría final ejecutando "npx tsc --noEmit", revisando que ningún archivo viole el límite de 250 líneas de AGENTS.md y comprobando que no quede ningún console.log con datos sensibles.
```

- **Verificación Final:**
  - Cumplidos los 14 días de los 12 testers en Google Play -> pulsar **Solicitar acceso a Producción** en Google Play Console.
  - Ejecutar `eas build --profile production --platform all` y `eas submit --platform all`.
  - ¡Salir a grabar los primeros vídeos reales en Granada rumbo a las primeras 2.200 familias (10.000 usuarios)!
