# Estado de avance — Cerca

Última actualización: 1 de noviembre de 2026 · Fase: prototipo completo en Expo Go + preparación de tiendas.

## 1. Qué ha cambiado en esta entrega

### Bugs corregidos
- **«Añadir ser querido» no funcionaba.** Causa: la ficha, el paywall e invitar vivían *dentro* de las pestañas, que no saben hacer «reemplazar pantalla», así que al guardar fallaba la navegación. Ahora se abren en un Stack **encima** de las pestañas.
  - Hay un único botón reutilizable que resuelve los dos casos:
    - **Con cupo:** abre el alta completa (nombre, relación, teléfono, horario). Al guardar aparece **al instante** en *Seres queridos* y *Hoy* y se genera solo su **código de 6 cifras / QR**.
    - **Plan gratuito con 1 ya creado:** abre una hoja que explica el límite, con acceso a Círculo Plus. Si `SHOW_PLUS_UPSELL = false`, la hoja solo informa.
- **Nombres aplastados en «Personas del círculo».** Cada fila es ahora avatar con anillo de color + nombre en una línea + un único botón **⋯** (solo acompañantes). El ⋯ abre una hoja con *Nombrar acompañante / Pasar a miembro*, *Editar relación* y *Quitar del círculo* (con confirmación).

### Nueva regla freemium: 1 postal gratis al día **por persona**
- Acompañantes y miembros (por ejemplo Lucía, la nieta) suben postales con los mismos permisos.
- En el plan gratuito, cada persona tiene su postal diaria. Al intentar la 2.ª: «¡Ya has enviado tu postal gratuita de hoy! Mañana a las 00:00 tienes otra gratis, o desbloquea postales ilimitadas para todo el círculo con Círculo Plus».
- Lo aplica la base de datos (migración nueva `0004_per_user_daily_postal.sql`) y el modo prueba lo imita.
- **Persona acompañada:** si hoy hay 2 o más postales, ve «2 postales nuevas hoy · 1 de 2» con dos botones grandes «◀ Anterior / Siguiente ▶». Su botón principal no cambia.

### Revolución visual y social (solo acompañantes y miembros)
- **Color con fuerza:**
  - Tarjeta Hero en **Tinta Noche** con la racha 🔥 en Ámbar Oro.
  - Tarjetas en degradado Coral → Mandarina y el Guiño del Día en Violeta → Coral.
  - Barra de pestañas oscura, esmeralda para «todo bien» y un **color de anillo propio para cada persona**.
- **Burbujas del Círculo** arriba en *Hoy*:
  - Tu burbuja con «+ Tu postal» si aún no has mandado la tuya.
  - Anillo de colores en quien ya ha subido (al tocarlo saltas a su postal).
  - «Animar 👋» en quien falta.
  - Tu ser querido con «☀️ Saludó» o «⏳ Pendiente».
- **Carrusel de postales del día estilo Polaroid:**
  - Etiqueta con el color del autor y hora tipo carrete.
  - Reacciones que rebotan, con «Reaccionaron Lucía, Marta y 2 más».
  - **Mini-comentarios** de hasta 100 caracteres.
- **«El Guiño del Día»:** 45 ideas de foto que rotan cada día, en *Hoy* y en *Postal*, con «Subir mi respuesta 📸».
- **«Pulso de la semana»** en *Recuerdos*: los últimos 7 días y la **Estrella del Círculo 🏆**.

### Acceso para revisores de Apple y Google (bloqueante cerrado)
- El email `revisor@cercaapp.es` entra con un **código fijo** que vive en el secreto `REVIEW_OTP_CODE` de la nueva Edge Function `review-login`. No se envía ningún email a esa cuenta.
- El texto exacto para App Store Connect y Play Console está en `GUIA_PUBLICACION_TIENDAS.md`, fase 7.

## 2. Verificaciones hechas antes de entregar

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 errores |
| `npm run lint` (250 líneas, sin Supabase en `.tsx`, sin `any`) | 0 errores |
| `npx expo export --platform android` (bundle completo de Metro) | Compila: 4.021 módulos, sin avisos |
| `deno check` de las 6 Edge Functions | 0 errores |
| Migraciones 0001 → 0004 en un Postgres que imita Supabase | OK |
| Pruebas nuevas | 2.ª postal del mismo autor bloqueada ✅ · otra persona sí puede ✅ · el miembro sube su postal ✅ · comentarios > 100 caracteres rechazados ✅ · un toque por persona y día ✅ · solo los acompañantes gestionan miembros ✅ · intruso ve 0 ✅ |

**No probado desde mi entorno:** el móvil real, Supabase real y los envíos de push y email.

## 3. Qué hacer cuando vuelvas

1. Para Expo (`Ctrl + C`) y cierra VS Code.
2. **Borra la carpeta `src`** de `C:\dev\cerca-app` (clic derecho → Eliminar). Es imprescindible: varias pantallas se han movido a `src\app\(family)\(tabs)\`, y el zip no puede borrar las antiguas. Si se quedan duplicadas, Expo Router dará error de rutas repetidas. El zip trae la carpeta `src` completa, así que no pierdes nada.
3. Clic derecho en `cerca-app.zip` → **Extraer todo…** → escribe exactamente **`C:\dev\cerca-app`** → **Reemplazar los archivos en el destino**. Si dentro aparece una carpeta `cerca-app` de más, bórrala.
4. Un comando cada vez:
   ```bash
   npm install
   ```
   ```bash
   npx expo start -c
   ```
5. En la píldora 🧪 pulsa **«♻️ Reiniciar datos de prueba»** la primera vez, para cargar el nuevo círculo de ejemplo.
6. Guárdalo en una rama y abre la PR:
   ```bash
   git checkout -b feat/social-circle-per-user-postcards
   git add -A
   git commit -m "feat: per-user daily postcard, social circle features and bug fixes"
   git push -u origin feat/social-circle-per-user-postcards
   ```
   `git add -A` registra también los archivos movidos a `(tabs)`.

## 4. Cómo probar cada mejora con la píldora «🧪 Prueba»

| Qué probar | Cómo |
|---|---|
| Círculo vivo nada más entrar | Vista Rubén → *Hoy*: burbujas, racha en la tarjeta oscura, 2 postales de hoy (Rubén y Lucía) con reacciones y comentarios |
| Saltar a una postal | Toca la burbuja de Lucía (anillo de colores) |
| Animar a alguien | «Animar 👋» bajo Marta, Ana o Pablo → mensaje de confirmación |
| Comentar y reaccionar | En la postal: toca ❤️ (rebota) y escribe un comentario |
| Postal por persona | Vista Rubén → *Postal*: ya usó la suya (1/1). Vista **Lucía** → igual. **«📸 Liberar mi postal de hoy»** para volver a subir una |
| Guiño del Día | *Hoy* o *Postal* → «Subir mi respuesta 📸» |
| Bug 1, caso A | **«0️⃣ Empezar con 0 seres queridos»** → *Seres queridos* → «Añadir a tu primer ser querido» → guardar: aparece su código QR al instante |
| Bug 1, caso B | Con 1 ser querido en el plan gratuito → «Añadir ser querido» → hoja «Acompañad a más seres queridos» |
| Crear 2.º, 3.º y 4.º | **«⭐ Alternar Círculo Plus»** y repite el alta; con 4, aviso de máximo |
| Bug 2 | Vista Rubén → *Ajustes* → Personas del círculo: filas limpias y ⋯ con las acciones |
| Varias postales para Carmen | **«👵 Vista Carmen»** → «2 postales nuevas hoy» con ◀ / ▶ y su botón coral |
| Pulso de la semana | *Recuerdos* → tarjeta oscura con los 7 días y la Estrella 🏆 |

## 5. Base de datos y publicación

- **Supabase local:** `npx supabase start` aplica ahora las 4 migraciones. Después `npm run db:types`.
- **Acceso de revisores:** `npx supabase secrets set REVIEW_OTP_CODE=123456 REVIEW_EMAIL=revisor@cercaapp.es` y `npx supabase functions deploy review-login --no-verify-jwt` (detalles en la guía, fase 7).
- **Publicación:** sigue `GUIA_PUBLICACION_TIENDAS.md`. Lo que sigue pendiente de vuestra parte: los datos legales en `legal-web/` y confirmar el identificador `es.cercaapp.circulo`.

## 6. Pendiente

1. Probar en tu móvil y ajustar detalles visuales.
2. Development build con EAS: push reales (incluidos los «Animar 👋», que ya envía `evaluate-checkins`), RevenueCat, Apple/Google, Sentry y PostHog.
3. Supabase local y en la nube con los flujos reales.
4. Regenerar `database.types.ts` con `npm run db:types`.
5. Tests automatizados de la lógica pura (racha, pulso semanal, límites del plan).
