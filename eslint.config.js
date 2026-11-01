// ESLint de Cerca: hace cumplir automáticamente las reglas de AGENTS.md.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'supabase/functions/*', 'src/shared/api/database.types.ts'],
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      // Regla 3: máximo 250 líneas por archivo.
      'max-lines': ['error', { max: 250, skipBlankLines: false, skipComments: false }],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-empty': ['error', { allowEmptyCatch: false }],
    },
  },
  {
    // Regla 2: ninguna pantalla ni componente toca Supabase directamente.
    files: ['src/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: '@supabase/supabase-js', message: 'Las llamadas a Supabase van en api.ts de la feature.' },
            { name: '@/shared/api/supabase', message: 'Las llamadas a Supabase van en api.ts de la feature.' },
          ],
          patterns: [
            {
              group: ['@/features/*/*', '!@/features/*/index'],
              message: 'Importa otras features solo desde su index.ts.',
            },
          ],
        },
      ],
    },
  },
]);
