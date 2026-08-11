# Veya — Mobile

App Android (React Native 0.86, bare workflow) para [Veya](../VEYA.md): buscar películas/series/anime, guardar en una lista personal, trackear progreso y recibir recomendaciones.

## Stack

- React Native 0.86 + TypeScript
- `@react-navigation` (bottom-tabs + native-stack)
- Zustand (estado global) + `@tanstack/react-query` (datos del servidor)
- `react-native-toast-message`, `react-native-safe-area-context`
- pnpm (con `node-linker=hoisted` — ver nota abajo)

## Arquitectura

```text
src/
├── screens/        # Splash, Login, Home, Buscar, Detalle, MiLista, Perfil
├── components/      # ContentCard, HorizontalContentList, StatusBadge, StarRating, Screen
├── navigation/       # RootNavigator (stack) + MainTabNavigator (tabs)
├── services/         # api.ts (axios + refresh automático) + auth/catalog/tracking
├── stores/           # authStore (persistido), preferencesStore
├── hooks/            # useAuth + hooks/queries (React Query)
├── types/            # Content, UserContent, Auth — reflejan la API del backend
├── utils/            # formatters
└── theme/            # paleta, spacing, tipografía (oscuro por defecto)
```

## Setup

1. **Backend corriendo**: por defecto apunta a `http://10.0.2.2:3000` (emulador Android) o `http://localhost:3000` (iOS). Para dispositivo físico o producción, editá `src/config.ts`.

2. **Instalar**:
   ```bash
   pnpm install
   ```

   > **Nota pnpm**: el proyecto fija `node-linker=hoisted` en `.npmrc`. El layout simlinkeado por defecto de pnpm rompe la resolución de Metro/Jest en React Native (paquetes nativos con autolinking, `transformIgnorePatterns` de Jest, etc.); "hoisted" deja un `node_modules` plano como npm/yarn y evita esos problemas.

3. **Android**:
   ```bash
   pnpm android
   # o: npx react-native run-android
   ```
   Necesitás un emulador corriendo o un dispositivo con USB debugging habilitado.

4. **Metro** (si no arrancó solo):
   ```bash
   pnpm start
   ```

## Notas de implementación

- **Refresh automático**: el interceptor de `services/api.ts` reintenta una vez con `/auth/refresh` ante un 401 y reintenta la request original; si el refresh también falla, limpia la sesión (vuelve a Login).
- **Sesión persistida**: `authStore` (Zustand + `AsyncStorage`) guarda `user`/`accessToken`/`refreshToken`; `RootNavigator` espera la hidratación (`hasHydrated`) antes de decidir Login vs Main para no "flashear" el login en cada arranque.
- **Home** arma sus 4 secciones (Continuar viendo, Para ti, Agregados recientemente, Favoritos) a partir de una sola query de `/tracking` + una de `/catalog/recommendations`, filtrando/ordenando en cliente en vez de pedirle 4 endpoints distintos al backend.
- **Sin librería de íconos nativa**: los tabs usan emoji en vez de `react-native-vector-icons` para no sumar otro paso de linking nativo en el setup inicial; es un cambio trivial si después se quiere algo más prolijo.
