# Desarrollo local — ambiente de pruebas con Waydroid

Flujo para probar la app en la laptop (Linux + Waydroid) sin instalar Android Studio.

## Dos caminos de APK

| | `release.yml` | `debug-apk.yml` |
|---|---|---|
| Para qué | Actualizar la app en el celular | Probar en Waydroid mientras se desarrolla |
| Cuándo corre | Al pushear un tag `v*` (`git tag v1.2.0 && git push origin v1.2.0`) | A mano: Actions → debug-apk → Run workflow, o `gh workflow run debug-apk.yml` |
| Qué genera | APK release firmado → GitHub Release → la app ofrece actualizar (`src/services/updates.ts`) | APK debug como artefacto (14 días) |
| ¿Trae el JS? | Sí, funciona solo | No, lo carga desde Metro en la laptop |

Pushear a `main` **no** actualiza el celular; solo un tag `v*` lo hace.

El APK debug solo hay que recompilarlo al agregar/actualizar librerías nativas.
Los cambios de JS/TS llegan por Metro con recarga en vivo.

## Primera vez (APK debug en Waydroid)

```bash
# 1. Descargar el APK del último run del workflow
gh run download -R Hector0122/veya_frontend -n veya-debug-apk -D ~/Descargas/veya-debug

# 2. Waydroid + adb (sudo en una terminal normal: el `!` de Claude Code no puede pedir contraseña)
sudo apt install adb
waydroid session start                 # o abrir Waydroid desde el menú
waydroid status                        # anotar la IP (ej. 192.168.240.112)
waydroid app install ~/Descargas/veya-debug/app-debug.apk
waydroid show-full-ui                  # para ver el diálogo de autorización
adb connect <IP-de-waydroid>:5555
```

Si `adb devices` muestra `offline`, acepta en Waydroid el diálogo
"¿Permitir depuración USB?" (marcar "Permitir siempre") y vuelve a hacer `adb connect`.

## Cada sesión de desarrollo

```bash
adb connect <IP-de-waydroid>:5555
adb reverse tcp:8081 tcp:8081          # para que la app encuentre Metro
npx react-native start                 # en veya_frontend
```

Abrir Veya en Waydroid (o `adb shell am start -n com.mobile/.MainActivity`;
`adb shell monkey ...` no funciona en Waydroid). Al guardar un archivo la app se recarga sola.
Menú de desarrollo: `adb shell input keyevent 82`.

## ¿A qué backend apunta?

Lo decide `DEV_API` en `src/config.ts` (solo afecta modo dev; release siempre usa Railway):

- `'railway'` (por defecto) → `https://veyabackend-production.up.railway.app`.
  Ojo: es la base de datos real; lo que se marque en pruebas se ve en el celular.
- `'local'` → `http://192.168.240.1:3000` (la laptop vista desde Waydroid).

Cambiar el valor y guardar basta; Metro recarga sin recompilar el APK.

`*.railway.internal` es la red privada de Railway: no funciona desde la app,
siempre se usa el dominio público.

## Backend local (pendiente)

Para probar cambios del backend sin tocar producción. Variables (ver `veya_backend/.env.example`):

- `DATABASE_URL` → Postgres local (pendiente decidir: Docker, que serviría para todas las apps).
- `JWT_*_SECRET` → cualquier texto.
- `TMDB_API_KEY` → copiar de Railway (servicio → Variables) o crear una en themoviedb.org.
- `GROQ_API_KEY` / `GEMINI_API_KEY` → opcionales (sin ellas, recomendaciones por géneros).
- Luego: `npx prisma migrate dev` y `npm run start:dev`, y poner `DEV_API = 'local'`.
