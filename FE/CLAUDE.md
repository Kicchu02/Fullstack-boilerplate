# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server on port 3000
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — ESLint (flat config)
- `npm run preview` — preview production build

- `npm test` — Vitest, single run; `npm run test:watch` — watch mode

Tests are Vitest + React Testing Library in a `jsdom` environment, configured in the
`test` block of `vite.config.ts` (note `defineConfig` is imported from `vitest/config`,
not `vite`, or `tsc -b` rejects that block). `globals: false`, so `describe`/`it`/`expect`
are imported explicitly — which also means Testing Library's automatic cleanup does not
register itself and is wired up by hand in `src/test/setup.ts`. Drop that `afterEach(cleanup)`
and every render accumulates in the same document, and queries start failing with "found
multiple elements". `src/test/renderWithProviders.tsx` wraps a component in
`RootStoreProvider` plus a `MemoryRouter`; pages need both, since they reach state through
`useRootStore()` and navigate through `useNavigateHelper()`.

This frontend talks to the WS backend at `http://localhost:8080` (see `src/constants.ts`'s `BASE_URL`) — see `../WS/CLAUDE.md` to run it. The tests do not need it running.

## Deliberate version ceilings

One dependency is intentionally **not** on its latest published version. It was verified
against the registry, and bumping it breaks the build — so check here before "helpfully"
upgrading it.

(The mobx 6.x ceiling that used to be listed here is gone: mobx, mobx-react-lite and
mobx-state-tree were removed when state management moved to Zustand.)

- **TypeScript stays on 6.0.x.** `typescript-eslint@8.67.0` is the latest release (there is
  no 9.x) and declares `typescript: ">=4.8.4 <6.1.0"`. TypeScript 7 (the Go port) is
  published, but `npm run lint` is what pins this. Lifting it means waiting for
  typescript-eslint to support TS 7, or replacing typescript-eslint.

## Architecture

State management is **Zustand**, not Redux/MobX/Context-alone. There is **no store provider**: every store is a module singleton, imported directly where it is used.

- **One store per concern, not one root store.** `src/stores/` holds `SignInPageStore.ts`, `SignUpPageStore.ts`, `HomePageStore.ts`, `NetworkingStore.ts` and `UiStore.ts`, each created with `create<State & Actions>()`. This is Zustand's own recommendation, and it means a page only subscribes to the store it actually uses. Do not reintroduce a single composed root store.
- Every page store follows the same template: a `State` type, an `Actions` type, an `initialState` const declared separately, `create<State & Actions>()((set, get) => ({ ...initialState, ...actions }))`, and a `reset: () => set(initialState)`. Copy `src/stores/SignInPageStore.ts` when adding a page rather than inventing a new shape. The separate `initialState` const is what makes `reset()` a one-liner.
- **Derived values are exported selectors, not stored state.** `selectIsButtonDisabled`, `selectIsAPIErrored`, `selectIsUnauthorized` are plain `(state) => boolean` functions exported alongside the store. Each returns a primitive, so `useStore(selectX)` re-renders only when that boolean flips. Never store a value you can derive.
- **Subscribe with one selector per value**: `const email = useSignInPageStore((s) => s.email)`. Do not select whole objects without `useShallow` — that re-renders on every unrelated change. Actions have a stable identity for the store's lifetime, so `useEffect` may depend on them safely (see `HomePage.tsx`); depending on the *store object* instead would loop.
- To read state outside a render — e.g. checking `selectIsAPIErrored` right after awaiting an action — use `useStore.getState()`. Do not read the value captured by the current render; it is stale.
- `src/stores/NetworkingStore.ts` is the global error channel: it installs an `axios.interceptors.response` handler **at module scope** (once, on first import) and exports `selectIsUnauthorized` (401) / `selectIsAPIErrored` (500). `App.tsx` watches these to force a sign-in redirect or navigate to the error page — new API-calling code doesn't need its own global error handling, just let axios errors propagate and this store catches them.
- `src/stores/NetworkingStore.ts` also owns the `Endpoints` const map (all backend routes) — add new backend routes there, not inline in components/stores.
- `src/stores/UiStore.ts` owns the global snackbar/popup state and exports `showPopup(message, variant)` and `showFeatureInDevPopup()`. These take no store argument: they reach the store via `useUiStore.getState()`, so they are callable from anywhere including outside React.
- `src/stores/resetAllStores.ts` restores every store to its initial state. It exists for the tests — see the import-order warning in `src/test/setup.ts`.
- `src/helpers.ts` provides `getAPI`/`postAPI`/`putAPI`/`deleteAPI` axios wrappers (always `withCredentials: true`). Use these instead of calling `axios` directly.
- Routing: `src/router.tsx` defines one `createBrowserRouter` with `App` as the layout route (renders global snackbars + `<Outlet/>`) and pages as children. Route path strings live in `src/RoutesHelper.ts`'s `Routes` map; navigate via the `useNavigateHelper()` hook (typed `navigateToX()` functions), not raw `useNavigate()`/string paths.
- Auth token is stored in `localStorage` under `WEB_TOKEN_COOKIE_NAME` ("WebToken"), but actual authentication with the backend is cookie/session-based (`withCredentials: true`); the localStorage token is only used client-side to decide whether to redirect to sign-in on load.
- Pages (`src/pages/*.tsx`) are plain function components — **no `observer()` wrapper**, since Zustand re-renders through its own hook subscriptions — using MUI (Material UI v9 + Emotion) — no Tailwind, no CSS modules, no separate form library (controlled `TextField`s bound straight to store fields). **Layout goes through `sx`, not top-level props.** MUI 9 removed the system-props shorthand, so `<Stack height="100%" gap={2}>` no longer type-checks; write `<Stack sx={{ height: "100%", gap: 2 }}>`. `direction`, `spacing`, `divider` and `useFlexGap` remain real `Stack` props.
- No path aliases are configured; imports are relative.
