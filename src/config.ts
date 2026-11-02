import { Platform } from 'react-native';

/**
 * Base URL de la API.
 *
 * El APK de release siempre usa Railway. En modo dev (Metro), `DEV_API`
 * elige a qué backend apunta:
 *
 * - 'railway'  → el backend de producción (no hace falta correr nada local).
 * - 'local'    → tu backend corriendo en la laptop (`npm run start:dev` en
 *                veya_backend, puerto 3000). La IP depende de dónde corra la app:
 *                  · Waydroid: 192.168.240.1 (IP del host en la red de Waydroid)
 *                  · Emulador de Android Studio: 10.0.2.2
 *                  · Simulador iOS: localhost
 *                  · Celular físico: la IP LAN de tu laptop (192.168.x.x)
 *
 * Nota: `*.railway.internal` es la red privada de Railway; desde el celular
 * no resuelve, siempre hay que usar el dominio público.
 */
// `as` evita que TS reduzca el tipo al literal y marque la comparación de abajo.
const DEV_API = 'railway' as 'railway' | 'local';

const LOCAL_API_URL = Platform.select({
  android: 'http://192.168.240.1:3000',
  default: 'http://localhost:3000',
});

const PROD_API_URL = 'https://veyabackend-production.up.railway.app';

export const API_BASE_URL = __DEV__ && DEV_API === 'local' ? LOCAL_API_URL : PROD_API_URL;
