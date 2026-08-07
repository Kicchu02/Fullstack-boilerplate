# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server on port 3000
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — ESLint (flat config)
- `npm run preview` — preview production build

No test framework/script is configured. This frontend talks to the WS backend at `http://localhost:8080` (see `src/constants.ts`'s `BASE_URL`) — see `../WS/CLAUDE.md` to run it.

## Architecture

State management is **MobX-State-Tree (MST)**, not Redux/Zustand/Context-alone:
- `src/stores/RootStore.tsx` composes one MST submodel per page (`signInPageStore`, `signUpPageStore`, `homePageStore`, `networkingStore`) plus global snackbar/popup state. Created once in `RootStoreProvider` (mounted in `main.tsx`).
- `src/stores/RootStoreContext.tsx` + `src/stores/hooks.ts` expose `useRootStore()` and one selector hook per submodel (`useSignInPageStore()`, etc.) — always consume state through these hooks, not by drilling props.
- Every page store follows the same template: model fields, `.volatile(initialState)` snapshot captured in an `afterCreate` action, a `reset()` action that restores that snapshot (called on navigation away from a page), `flow()` generators for async API calls, `.views()` for derived booleans. When adding a new page/store, copy this pattern (see `src/stores/SignInPageStore.ts`) rather than inventing a new one.
- `src/stores/NetworkingStore.ts` is the global error channel: it installs an `axios.interceptors.response` handler and exposes `isUnauthorized` (401) / `isAPIErrored` (500) views. `App.tsx` watches these to force a sign-in redirect or navigate to the error page — new API-calling code doesn't need its own global error handling, just let axios errors propagate and this store catches them.
- `src/stores/NetworkingStore.ts` also owns the `Endpoints` const map (all backend routes) — add new backend routes there, not inline in components/stores.
- `src/helpers.ts` provides `getAPI`/`postAPI`/`putAPI`/`deleteAPI` axios wrappers (always `withCredentials: true`) and `showPopup`/`showFeatureInDevPopup` (reach the MST root via `getRoot()` from within a store action). Use these instead of calling `axios` directly.
- Routing: `src/router.tsx` defines one `createBrowserRouter` with `App` as the layout route (renders global snackbars + `<Outlet/>`) and pages as children. Route path strings live in `src/RoutesHelper.ts`'s `Routes` map; navigate via the `useNavigateHelper()` hook (typed `navigateToX()` functions), not raw `useNavigate()`/string paths.
- Auth token is stored in `localStorage` under `WEB_TOKEN_COOKIE_NAME` ("WebToken"), but actual authentication with the backend is cookie/session-based (`withCredentials: true`); the localStorage token is only used client-side to decide whether to redirect to sign-in on load.
- Pages (`src/pages/*.tsx`) are MobX `observer()`-wrapped function components using MUI (Material UI v7 + Emotion) directly via props/`sx` — no Tailwind, no CSS modules, no separate form library (controlled `TextField`s bound straight to store fields).
- No path aliases are configured; imports are relative.
