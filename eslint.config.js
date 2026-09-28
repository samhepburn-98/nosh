import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Every web feature folder. Add a new one here, so the import rules below cover it.
const webFeatures = ['kitchen', 'plan', 'preferences', 'recipes', 'shopping-list'];

const noAppImports = { group: ['@/app/*'], message: 'Only app/ combines features.' };

// ESLint's recommended sets, plus one rule that keeps web imports flowing one way (docs/plan.md §5):
// shared code → features → app, and features never import each other.
export default defineConfig([
  globalIgnores(['**/dist', 'data', 'apps/web/src/components/ui']),
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['eslint.config.js'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  { files: ['**/*.js'], extends: [tseslint.configs.disableTypeChecked] },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, jsxA11y.flatConfigs.recommended],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['apps/web/src/{components,config,hooks,lib,utils}/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            noAppImports,
            { group: ['@/features/*'], message: 'Shared code never imports a feature.' },
          ],
        },
      ],
    },
  },
  ...webFeatures.map((feature) => ({
    files: [`apps/web/src/features/${feature}/**`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            noAppImports,
            {
              group: ['@/features/*', `!@/features/${feature}`],
              message: 'Features never import each other. Combine them in app/routes.',
            },
          ],
        },
      ],
    },
  })),
  prettier,
]);
