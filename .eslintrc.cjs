const APP_LAYER_PATTERNS = ['@/app/**', '@/frontend/page-domains/**']
const BACKEND_PATTERNS = ['@/payload/**', '@/app/api/**', '@/lib/server/**']
const FRONTEND_LAYOUT_PATTERNS = ['@/frontend/layout/**']
const FEATURE_FOLDERS = ['carousel', 'cart', 'forms', 'heroes', 'sections', 'theme']
const { createIndependentModules } = require('eslint-plugin-project-structure')

const featureIsolationOverride = (feature) => {
  const otherFeatures = FEATURE_FOLDERS.filter((folder) => folder !== feature)
  const otherFeaturesPattern = `@/frontend/components/{${otherFeatures.join(',')}}/**`

  return {
    files: [`src/frontend/components/${feature}/**/*.{js,jsx,ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [otherFeaturesPattern],
              message: `Layer violation: feature \`${feature}\` cannot import other features.`,
            },
            {
              group: APP_LAYER_PATTERNS,
              message: 'Layer violation: features cannot import app layer.',
            },
            {
              group: FRONTEND_LAYOUT_PATTERNS,
              message: 'Layer violation: features cannot import layout layer.',
            },
            {
              group: BACKEND_PATTERNS,
              message: 'Layer violation: frontend layer cannot import backend code.',
            },
          ],
        },
      ],
    },
  }
}

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['next/core-web-vitals'],
  plugins: ['@typescript-eslint', 'project-structure'],
  ignorePatterns: ['.next/', '.nx/', 'media/', 'node_modules/', 'dist/', 'build/'],
  overrides: [
    {
      // Layer: UI (lowest)
      files: ['src/frontend/components/ui/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/frontend/components/!(ui|shared)/**'],
                message: 'Layer violation: `ui` can import only from `ui/shared` (or neutral libs).',
              },
              {
                group: APP_LAYER_PATTERNS,
                message: 'Layer violation: `ui` must not depend on app layer.',
              },
              {
                group: FRONTEND_LAYOUT_PATTERNS,
                message: 'Layer violation: `ui` must not depend on layout layer.',
              },
              {
                group: BACKEND_PATTERNS,
                message: 'Layer violation: `ui` must not depend on backend code.',
              },
            ],
          },
        ],
      },
    },
    {
      // Layer: Shared (globally importable, but isolated from app/backend/features)
      files: ['src/frontend/components/shared/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/frontend/components/{carousel,cart,forms,heroes,sections,theme}/**'],
                message: 'Layer violation: `shared` cannot import feature modules.',
              },
              {
                group: APP_LAYER_PATTERNS,
                message: 'Layer violation: `shared` cannot import app layer.',
              },
              {
                group: FRONTEND_LAYOUT_PATTERNS,
                message: 'Layer violation: `shared` cannot import layout layer.',
              },
              {
                group: BACKEND_PATTERNS,
                message: 'Layer violation: `shared` cannot import backend code.',
              },
            ],
          },
        ],
      },
    },
    ...FEATURE_FOLDERS.map(featureIsolationOverride),
    {
      // Server adapters under frontend components are allowed to use backend/server modules.
      files: ['src/frontend/components/**/server/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
  ],
  rules: {
    'project-structure/independent-modules': [
      'warn',
      createIndependentModules({
        debugMode: false,
        modules: [
          {
            name: 'frontend-components-ui',
            pattern: 'src/frontend/components/ui/**',
            allowExternalImports: true,
            allowImportsFrom: [
              'src/frontend/components/ui/**',
              'src/frontend/components/shared/**',
              'src/frontend/components/theme/**',
              'src/frontend/lib/**',
              'src/frontend/utils/**',
              'src/lib/**',
            ],
          },
          {
            name: 'frontend-components-shared',
            pattern: 'src/frontend/components/shared/**',
            allowExternalImports: true,
            allowImportsFrom: [
              'src/frontend/components/shared/**',
              'src/frontend/components/ui/**',
              'src/frontend/components/theme/**',
              'src/frontend/lib/**',
              'src/frontend/utils/**',
              'src/lib/**',
            ],
          },
          {
            name: 'frontend-components-feature',
            pattern: FEATURE_FOLDERS.map((feature) => `src/frontend/components/${feature}/**`),
            allowExternalImports: true,
            allowImportsFrom: [
              '{family_4}/**',
              'src/frontend/components/ui/**',
              'src/frontend/components/shared/**',
              'src/frontend/components/theme/**',
              'src/frontend/lib/**',
              'src/frontend/utils/**',
              'src/lib/**',
            ],
          },
        ],
      }),
    ],
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-empty-object-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: false,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^(_|ignore)',
      },
    ],
    '@next/next/no-html-link-for-pages': 'off',
  },
}
