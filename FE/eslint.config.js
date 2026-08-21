import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      // 'configs.flat' namespace: eslint-plugin-react-hooks 7 kept the old
      // configs.['recommended-latest'] as an eslintrc-style object, which flat
      // config rejects outright. The flat equivalent lives under configs.flat.
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      // Debug logging has leaked secrets here before: a console.log in the sign-in flow
      // printed the web token, and another printed it on every app load. warn/error stay
      // allowed — HomePageStore's catch blocks use console.error deliberately, and
      // silencing those would turn handled failures into invisible ones.
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // stores/RootStore.tsx exports the RootStore MST model alongside the
      // RootStoreProvider component. react-refresh flags that because a file mixing
      // components with other values cannot be hot-updated reliably. RootStore is a
      // model definition rather than React state, and every other module imports it
      // with `import type`, so the only real cost is that editing this one
      // composition-root file triggers a full reload instead of HMR.
      //
      // Two specific names are allowed rather than the rule being switched off, so the
      // exemption stays scoped to the case that was actually reviewed.
      //
      // Worth knowing: this rule does not recognise `observer()`-wrapped components as
      // components, so every file in src/pages/ is already outside its reach. That is a
      // pre-existing interaction between the rule and MobX, not a consequence of this
      // config — do not read a clean lint run as proof that pages have no mixed exports.
      'react-refresh/only-export-components': [
        'error',
        { allowExportNames: ['RootStore', 'PopupVariant'] },
      ],
    },
  },
  {
    // Test files and test-only helpers are never part of the Fast Refresh graph, so
    // react-refresh's rules cannot apply to them. src/test/renderWithProviders.tsx
    // legitimately exports a render helper and a test-id constant alongside a small
    // probe component, which the rule reads as a mixed-export component module.
    files: ['**/*.{test,spec}.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
