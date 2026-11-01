# Guía de publicación en App Store y Google Play (desde Windows)

Todo se hace desde Windows: Expo (EAS) compila la app de iPhone en sus servidores, así que **no necesitáis un Mac**. Seguid las fases en orden; cada una termina con una casilla de comprobación.

> ⚠️ **Antes de la primera compilación decidid el nombre final y el identificador.** En `app.json` está `es.cercaapp.circulo` como `bundleIdentifier` (iOS) y `package` (Android). Una vez publicada la app **no se puede cambiar**. Si el nombre comercial cambia, cambiadlo ahora.

---

## Fase 1 · Abrir las cuentas (empezad hoy: tardan días en verificarse)

| Cuenta | Coste | Notas |
|---|---|---|
| **Expo** (expo.dev) | Gratis | Una cuenta de equipo para los dos socios. El plan gratuito de EAS incluye compilaciones suficientes para empezar. |
| **Apple Developer Program** (developer.apple.com) | 99 €/año | Necesitáis un Apple ID con verificación en dos pasos. Como **persona física**, en la tienda saldrá vuestro nombre. Como **empresa** (SL), hace falta un número D-U-N-S (gratuito, tarda días). |
| **Google Play Console** (play.google.com/console) | 25 $ una vez | Verificación de identidad con DNI. ⚠️ Las cuentas **personales** nuevas deben pasar una **prueba cerrada con al menos 12 testers durante 14 días seguidos** antes de publicar (fase 5). Las cuentas de **organización** (con D-U-N-S) no tienen ese requisito. |

- [ ] Las tres cuentas creadas y verificadas.

## Fase 2 · Publicar la web legal (10 minutos, gratis)

Apple y Google exigen URLs públicas de privacidad y de eliminación de cuenta. Ya están en la carpeta `legal-web/`.

1. Abrid los 3 HTML legales y rellenad lo marcado en amarillo: nombre o razón social, NIF, dirección y email de contacto.
2. Publicadla. La opción más rápida es **Netlify Drop**:
   - Entrad en https://app.netlify.com/drop y arrastrad la carpeta `legal-web` a la página.
   - Os da una URL del tipo `https://nombre.netlify.app`. Podéis cambiar el nombre en *Site settings*.
3. Alternativa con **GitHub Pages**: cread un repo **público** nuevo (por ejemplo `cerca-legal`), subid los archivos de `legal-web/` a la raíz y activad *Settings → Pages → Deploy from branch → main / (root)*. El repo de la app es privado, y Pages en repos privados requiere plan de pago.
4. Apuntad estas tres URLs, las vais a pegar en las tiendas:
   - Privacidad: `https://TU-WEB/privacidad.html`
   - Condiciones: `https://TU-WEB/terminos.html`
   - Eliminar cuenta: `https://TU-WEB/eliminar-cuenta.html`

- [ ] Web legal publicada y con vuestros datos.

## Fase 3 · Conectar el proyecto con EAS

En la terminal de VS Code, dentro de `C:\dev\cerca-app`, un comando cada vez:

```bash
npm install -g eas-cli
eas login
eas init
```

`eas init` crea el proyecto en expo.dev y añade su `projectId` a `app.json`. Haced commit de ese cambio.

**Primera compilación de Android para probar en vuestros móviles (APK):**

```bash
eas build -p android --profile preview
```

La primera vez pregunta si genera una **keystore** de Android: responded **Yes**. EAS la guarda por vosotros; nunca la perdáis, porque sin ella no se puede actualizar la app. Al terminar os da un enlace/QR para instalar el APK.

> Cuando activemos las notificaciones push reales y RevenueCat necesitaremos un *development build*: `npx expo install expo-dev-client` y después `eas build -p android --profile development`. Lo haremos juntos en su bloque.

- [ ] APK de prueba instalado en un Android.

## Fase 4 · Configurar las compras de Círculo Plus (antes de publicar)

1. **App Store Connect → Acuerdos, impuestos y banca:** firmad el acuerdo de *Apps de pago* y añadid cuenta bancaria y datos fiscales. Sin esto, las suscripciones no funcionan.
2. **App Store Connect → vuestra app → Suscripciones:** cread el grupo «Círculo Plus» con dos productos: mensual (4,99 €) y anual (39,99 €), con nombre y descripción en español.
3. **Google Play Console → Monetizar → Suscripciones:** los mismos dos productos. Necesitáis un perfil de pagos (comerciante) activo.
4. **RevenueCat:** cread el proyecto, conectad ambas tiendas y configurad el webhook hacia la Edge Function `revenuecat-webhook`, con la cabecera `Authorization` igual a `REVENUECAT_WEBHOOK_AUTH`.

- [ ] Productos creados en ambas tiendas y en RevenueCat.

## Fase 5 · Google Play (Android)

1. **Crear la app:** *Play Console → Crear aplicación* → nombre «Cerca», idioma español (España), App, Gratuita.
2. **Primera subida manual (obligatoria):** compilad el paquete de producción y subidlo a mano a *Pruebas → Prueba interna*.
   ```bash
   eas build -p android --profile production
   ```
   Descargad el `.aab` desde expo.dev y subidlo en *Prueba interna → Crear versión*. Google exige que la primera subida sea manual. Las siguientes se podrán hacer con `eas submit -p android`, cuando configuremos una *cuenta de servicio* de Google Cloud.
3. **Prueba cerrada de 12 testers × 14 días** (cuentas personales):
   - Cread un Grupo de Google (por ejemplo `cerca-testers@googlegroups.com`) y añadid a vuestros testers.
   - *Pruebas → Prueba cerrada → Crear canal*, subid la versión y añadid el grupo como testers.
   - Pasad el **enlace de participación**: cada tester debe abrirlo, pulsar «Convertirme en tester» e instalar la app desde Play Store.
   - Necesitáis **al menos 12 personas apuntadas durante 14 días seguidos**. Apuntad a 15–20 por si alguien se da de baja (familia, amigos, el grupo de WhatsApp del barrio…). Pedidles que abran la app varias veces.
   - Pasados los 14 días: *Panel → Solicitar acceso a producción* y responded el cuestionario sobre la prueba.
4. **Ficha de Play Store:** textos e imágenes de `FICHA_TIENDAS_ASO.md` (icono de 512 px: `assets/images/icon.png` reducido; gráfico de funciones de 1024 × 500).
5. **Contenido de la aplicación**, casilla por casilla:
   - **Política de privacidad:** URL de `privacidad.html`.
   - **Acceso a la app:** «Todas o algunas funciones están restringidas» → *Añadir instrucciones* y pegad el texto de la fase 7 (*Acceso para revisores*): nombre «Cuenta de revisión», usuario `revisor@cercaapp.es`, contraseña: el código fijo.
   - **Anuncios:** No.
   - **Clasificación de contenido** (cuestionario IARC): categoría *Social o comunicación*. Violencia, sexo, lenguaje, drogas y apuestas: **No**. «¿Los usuarios pueden interactuar o intercambiar contenido?»: **Sí** (solo entre personas invitadas a un círculo privado). «¿Comparte la ubicación del usuario?»: **No**. «¿Compras digitales?»: **Sí** (suscripción). Resultado esperado: PEGI 3 con avisos de *Interacción entre usuarios* y *Compras en la app*.
   - **Público objetivo:** marcad **16-17 y 18 o más**. No marquéis menores de 13, porque activaría la política de Familias.
   - **Seguridad de los datos (Data safety):**

     | Pregunta | Respuesta |
     |---|---|
     | ¿Recopila o comparte datos? | Sí, recopila. **No comparte** con terceros. |
     | Cifrado en tránsito | Sí |
     | ¿Pueden pedir la eliminación? | Sí. URL: `eliminar-cuenta.html` |
     | Información personal | **Nombre** y **Dirección de correo** → Funcionalidad de la app, Gestión de la cuenta |
     | Fotos y vídeos | **Fotos** → Funcionalidad de la app |
     | Actividad en la app | **Otro contenido generado por el usuario** (pies de foto, reacciones) e **Interacciones con la app** (hora del saludo) → Funcionalidad |
     | Información financiera | **Historial de compras** → Funcionalidad (estado de Círculo Plus) |
     | ID de dispositivo u otros | **Sí** (token de notificaciones) → Funcionalidad |
     | Ubicación, contactos, salud, mensajes SMS | **No** |

   - **Apps de salud:** Cerca no tiene funciones de salud. Si Play pregunta, responded que es una app de comunicación y no marquéis ninguna función sanitaria.
6. **Publicar:** cuando os den acceso a producción, promocionad la versión al canal de *Producción*.

- [ ] Prueba cerrada completada y app en producción.

## Fase 6 · App Store (iPhone) sin Mac

1. **Compilar para iOS:**
   ```bash
   eas build -p ios --profile production
   ```
   EAS os pedirá iniciar sesión con vuestro Apple ID (con verificación en dos pasos) y **creará solo los certificados y perfiles**. Aceptad las opciones por defecto.
2. **Subir a App Store Connect / TestFlight:**
   ```bash
   eas submit -p ios --latest
   ```
   Si la app aún no existe en App Store Connect, `eas submit` os guía para crearla con el bundle `es.cercaapp.circulo`.
3. **TestFlight:**
   - **Testers internos** (hasta 100 miembros de vuestro equipo de App Store Connect): prueban en cuanto la compilación termina de procesarse, sin revisión.
   - **Testers externos** (familiares y amigos, hasta 10.000 por enlace público): requieren una revisión beta rápida de Apple.
   - Ellos instalan la app **TestFlight** desde la App Store y abren vuestro enlace.
4. **Privacidad de la app** (*App Store Connect → Privacidad de la app*). Para cada dato: vinculado al usuario **Sí**, usado para rastreo **No**, finalidad **Funcionalidad de la app**.
   - **Información de contacto:** Nombre, Correo electrónico.
   - **Contenido del usuario:** Fotos o vídeos; Otro contenido del usuario.
   - **Identificadores:** ID del dispositivo (token de notificaciones).
   - **Compras:** Historial de compras.
   - Cuando añadamos analítica (PostHog) y errores (Sentry): **Datos de uso → Interacción con el producto** y **Diagnóstico → Datos de fallos y de rendimiento**.
5. **Clasificación por edades:** responded **No / Ninguno** a violencia, contenido sexual, drogas, apuestas e información médica o de tratamientos. Si preguntan por contenido generado por usuarios o mensajería, indicad que se comparte **solo en círculos privados por invitación, sin perfiles públicos ni desconocidos**. Lo esperable es una clasificación baja (4+ o 9+); si sale más alta por la parte de mensajería, es normal y no impide publicar.
6. **Ficha:** textos de `FICHA_TIENDAS_ASO.md`, capturas de 6,9″, URL de privacidad y de soporte. Precio: Gratis (con compras dentro de la app).
7. **App Review Information:** marcad *Sign-in required* y rellenad **User name** `revisor@cercaapp.es` y **Password** con el código fijo (por ejemplo `123456`). En **Notes**, pegad el texto de la fase 7.
8. **Enviar a revisión.** La primera revisión suele tardar entre 1 y 3 días.

- [ ] App aprobada en App Store.

## Fase 7 · Requisitos que suelen provocar rechazos (revisadlos antes de enviar)

- [x] **Acceso para revisores (hecho).** Apple y Google no pueden recibir el código por email, así que el email `revisor@cercaapp.es` entra con un **código fijo** guardado como secreto. Antes de enviar a revisión:
  1. Elegid el código (6 cifras) y guardadlo en Supabase: `npx supabase secrets set REVIEW_OTP_CODE=123456 REVIEW_EMAIL=revisor@cercaapp.es`.
  2. Desplegad la función: `npx supabase functions deploy review-login --no-verify-jwt`.
  3. Entrad vosotros con esa cuenta en la app y preparad un círculo de ejemplo: nombre «El círculo de Carmen», añadid a «Carmen» (Abuela) y subid una postal. Así el revisor ve la app con contenido.
  4. Pegad este texto en *App Review Information → Notes* (Apple) y en *Acceso a la app* (Google):

     > Cerca es una app de comunicación diaria entre seres queridos. No es un servicio médico ni de emergencias.
     > Acceso: en la pantalla de inicio pulse «Crear o unirme a un círculo», escriba el email revisor@cercaapp.es, pulse «Enviarme el código» y escriba el código 123456 (no se envía ningún email a esta cuenta).
     > Para ver la pantalla de la persona acompañada: en «Seres queridos → Carmen» pulse «Generar código para su móvil». En otro dispositivo (o tras cerrar sesión en Ajustes), pulse «Tengo un código» en el inicio y escriba los 6 números.
     > Círculo Plus es una suscripción opcional; la app funciona gratis sin ella.
- [ ] **Sign in with Apple:** si activamos «Continuar con Google», Apple exige ofrecer también «Continuar con Apple» (ya están los dos botones preparados).
- [ ] **Borrado de cuenta dentro de la app:** ✅ hecho (Ajustes → Eliminar mi cuenta y mis datos) y URL pública ✅.
- [ ] **Permisos:** solo cámara y fotos, con textos en español claro ✅. Micrófono, ubicación y contactos bloqueados ✅.
- [ ] **Cifrado:** `ITSAppUsesNonExemptEncryption = false` ✅ (solo usamos HTTPS estándar, exento).
- [ ] **Sin promesas médicas:** ni en la ficha, ni en las capturas, ni en la app ✅. Nada de «alarma», «emergencia» o «monitorización».
- [ ] **Manifiesto de privacidad de iOS:** si Apple envía un email «ITMS-91053 Missing API declaration» tras subir, se añade `ios.privacyManifests` en `app.json` y se vuelve a compilar.
- [ ] **Capturas reales:** las de la tienda deben mostrar la app de verdad (las del modo prueba valen).

## Fase 8 · Actualizaciones después del lanzamiento

- Cada versión nueva: `eas build -p all --profile production` y después `eas submit -p ios --latest` y `eas submit -p android --latest`. El número de compilación se incrementa solo (`autoIncrement`).
- Cambios pequeños de JavaScript sin pasar revisión: configuraremos **EAS Update** en su momento.
